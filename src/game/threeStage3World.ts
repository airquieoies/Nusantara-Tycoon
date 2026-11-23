import * as THREE from 'three';
import { CollectibleRarity } from './stage1Data';
import {
  STAGE3_ACTIVITY_STATIONS,
  STAGE3_COLLECTIBLES,
  STAGE3_DELIVERY_SPOTS,
  STAGE3_ELEVATOR_PADS,
  STAGE3_ENTERABLE_BUILDINGS,
  STAGE3_WARDROBE_MIRROR_SPOT,
  STAGE3_WORLD_PICKUPS,
  Stage3EnterableBuildingDef,
} from './stage3Data';
import {
  getStage3CrowdPatrols,
  getStage3Landmarks,
  getStage3SceneryBuildings,
  STAGE3_MONORAIL_X,
  STAGE3_SHORELINE_X,
  stage3GroundHeightAt,
} from './stage3Physics';
import { Stage1OverhaulWorldHandle } from './threeStage1OverhaulWorld';
import {
  createCrowdCitizenRig,
  createFloatingLabelSprite,
  CrowdCitizenRig,
  WorldTextures,
} from './threeWorldBuilder';
import {
  CrowdPatrolDef,
  SceneryBuildingDef,
  StageLandmarkDef,
} from './world3dPhysics';

interface CrowdRuntime3 {
  def: CrowdPatrolDef;
  rig: CrowdCitizenRig;
  wpIndex: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pauseTimer: number;
  walkCycle: number;
}

const RARITY_COLOR: Record<CollectibleRarity, number> = {
  Common: 0x94a3b8,
  Uncommon: 0x22c55e,
  Rare: 0x38bdf8,
  Epic: 0xa855f7,
  Legendary: 0xf59e0b,
};

function createNeonBillboard(
  title: string,
  subtitle: string,
  bgHex: string,
  accentHex: string,
  disposables: (() => void)[]
): THREE.Group {
  const g = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.65 });
  for (const sx of [-1.45, 1.45]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.2, 8), postMat);
    post.position.set(sx, 1.6, 0);
    g.add(post);
  }
  const c = document.createElement('canvas');
  c.width = 480;
  c.height = 140;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 480, 140);
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 468, 128);
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'center';
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(title, 240, 58);
  ctx.fillStyle = accentHex;
  ctx.font = '600 18px system-ui, -apple-system, sans-serif';
  ctx.fillText(subtitle, 240, 98);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const faceMat = new THREE.MeshStandardMaterial({
    map: tex,
    emissive: 0xffffff,
    emissiveMap: tex,
    emissiveIntensity: 0.35,
    roughness: 0.35,
  });
  const backMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.4 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.05, 0.14), [
    backMat,
    backMat,
    backMat,
    backMat,
    faceMat,
    faceMat,
  ]);
  board.position.set(0, 2.75, 0);
  g.add(board);

  disposables.push(() => {
    tex.dispose();
    faceMat.dispose();
    backMat.dispose();
    postMat.dispose();
  });
  return g;
}

function buildStage3EnterableMesh(
  b: Stage3EnterableBuildingDef,
  disposables: (() => void)[]
): { group: THREE.Group; roofGroup: THREE.Group; spinning: THREE.Object3D[] } {
  const group = new THREE.Group();
  group.position.set(b.x, 0, b.z);
  const spinning: THREE.Object3D[] = [];

  const wallMat = new THREE.MeshStandardMaterial({ color: b.wallColor, roughness: 0.48, metalness: 0.25 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.6 });
  const roofMat = new THREE.MeshStandardMaterial({ color: b.roofColor, roughness: 0.35, metalness: 0.4 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.55 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    roughness: 0.14,
    metalness: 0.6,
  });
  const neonMat = new THREE.MeshStandardMaterial({
    color: b.roofColor,
    emissive: b.roofColor,
    emissiveIntensity: 0.8,
  });

  const w = b.halfW * 2;
  const d = b.halfD * 2;
  const t = 0.38;
  const h = b.wallHeight;

  const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), floorMat);
  floor.position.y = 0.11;
  group.add(floor);

  const step = new THREE.Mesh(new THREE.BoxGeometry(b.doorHalfWidth * 2.2, 0.18, 1.2), neonMat);
  if (b.doorSide === 'south') step.position.set(0, 0.09, b.halfD + 0.5);
  if (b.doorSide === 'north') step.position.set(0, 0.09, -b.halfD - 0.5);
  if (b.doorSide === 'east') {
    step.rotation.y = Math.PI / 2;
    step.position.set(b.halfW + 0.5, 0.09, 0);
  }
  if (b.doorSide === 'west') {
    step.rotation.y = Math.PI / 2;
    step.position.set(-b.halfW - 0.5, 0.09, 0);
  }
  group.add(step);

  const addWall = (wx: number, wz: number, sx: number, sz: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, h, sz), wallMat);
    m.position.set(wx, h / 2 + 0.1, wz);
    const band = new THREE.Mesh(new THREE.BoxGeometry(sx + 0.04, 0.22, sz + 0.04), neonMat);
    band.position.set(wx, h - 0.55, wz);
    group.add(m, band);
  };

  if (b.doorSide === 'north') {
    const sideLen = b.halfW - b.doorHalfWidth;
    addWall(-b.halfW + sideLen / 2, -b.halfD + t / 2, sideLen, t);
    addWall(b.halfW - sideLen / 2, -b.halfD + t / 2, sideLen, t);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(b.doorHalfWidth * 2, 1.0, t), frameMat);
    lintel.position.set(0, h - 0.4, -b.halfD + t / 2);
    group.add(lintel);
  } else {
    addWall(0, -b.halfD + t / 2, w, t);
  }

  if (b.doorSide === 'south') {
    const sideLen = b.halfW - b.doorHalfWidth;
    addWall(-b.halfW + sideLen / 2, b.halfD - t / 2, sideLen, t);
    addWall(b.halfW - sideLen / 2, b.halfD - t / 2, sideLen, t);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(b.doorHalfWidth * 2, 1.0, t), frameMat);
    lintel.position.set(0, h - 0.4, b.halfD - t / 2);
    group.add(lintel);
  } else {
    addWall(0, b.halfD - t / 2, w, t);
  }

  if (b.doorSide === 'west') {
    const sideLen = b.halfD - b.doorHalfWidth;
    addWall(-b.halfW + t / 2, -b.halfD + sideLen / 2, t, sideLen);
    addWall(-b.halfW + t / 2, b.halfD - sideLen / 2, t, sideLen);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(t, 1.0, b.doorHalfWidth * 2), frameMat);
    lintel.position.set(-b.halfW + t / 2, h - 0.4, 0);
    group.add(lintel);
  } else {
    addWall(-b.halfW + t / 2, 0, t, d);
  }

  if (b.doorSide === 'east') {
    const sideLen = b.halfD - b.doorHalfWidth;
    addWall(b.halfW - t / 2, -b.halfD + sideLen / 2, t, sideLen);
    addWall(b.halfW - t / 2, b.halfD - sideLen / 2, t, sideLen);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(t, 1.0, b.doorHalfWidth * 2), frameMat);
    lintel.position.set(b.halfW - t / 2, h - 0.4, 0);
    group.add(lintel);
  } else {
    addWall(b.halfW - t / 2, 0, t, d);
  }

  // Theme Interior Furnishings
  if (b.floorTheme === 'smart_admin') {
    const holoTable = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.85, 14), frameMat);
    holoTable.position.set(0, 0.62, 0);
    const globe = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 1), neonMat);
    globe.position.set(0, 1.65, 0);
    spinning.push(globe);
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 1.0), roofMat);
    desk.position.set(0, 0.65, -3.2);
    group.add(holoTable, globe, desk);
  } else if (b.floorTheme === 'mall') {
    for (const px of [-3.5, 3.5]) {
      const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.2, 12), glassMat);
      pod.position.set(px, 1.3, -2.5);
      group.add(pod);
    }
    const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.6, 0.22), roofMat);
    mirrorFrame.position.set(0, 1.5, -3.0);
    const mirrorGlass = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.26), glassMat);
    mirrorGlass.position.set(0, 1.5, -3.0);
    group.add(mirrorFrame, mirrorGlass);
  } else if (b.floorTheme === 'robotics') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.6, 12), frameMat);
    base.position.set(0, 0.5, 0);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.4, 0.35), neonMat);
    arm.position.set(0, 1.8, 0);
    arm.rotation.z = 0.28;
    spinning.push(arm);
    for (const rx of [-3.6, 3.6]) {
      const rack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.8, 3.6), frameMat);
      rack.position.set(rx, 1.6, -1.0);
      group.add(rack);
    }
    group.add(base, arm);
  } else if (b.floorTheme === 'museum') {
    for (const mx of [-3.2, 0, 3.2]) {
      const ped = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.2), frameMat);
      ped.position.set(mx, 0.72, -1.5);
      const artifact = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), neonMat);
      artifact.position.set(mx, 1.65, -1.5);
      spinning.push(artifact);
      group.add(ped, artifact);
    }
  } else if (b.floorTheme === 'cafe') {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.0, 1.1), roofMat);
    bar.position.set(0, 0.72, -2.6);
    group.add(bar);
    for (const [tx, tz] of [[-2.6, 1.2], [2.6, 1.2]]) {
      const tbl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.45, 0.85, 12), glassMat);
      tbl.position.set(tx, 0.64, tz);
      group.add(tbl);
    }
  } else if (b.floorTheme === 'arcade') {
    for (let i = -3; i <= 3; i += 2) {
      const cab = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.2, 0.9), frameMat);
      cab.position.set(i, 1.3, -3.4);
      const scr = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 0.1), neonMat);
      scr.position.set(i, 1.65, -2.92);
      group.add(cab, scr);
    }
  } else if (b.floorTheme === 'ecodome') {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.85, 3.8, 10),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
    );
    trunk.position.set(0, 2.0, 0);
    const canopy = new THREE.Mesh(
      new THREE.DodecahedronGeometry(2.6, 1),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 })
    );
    canopy.position.set(0, 4.4, 0);
    group.add(trunk, canopy);
  } else if (b.floorTheme === 'station') {
    for (const gx of [-4.2, 0, 4.2]) {
      const gate = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 0.35), frameMat);
      gate.position.set(gx, 1.2, -1.8);
      const strip = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.4), neonMat);
      strip.position.set(gx, 2.0, -1.8);
      group.add(gate, strip);
    }
  }

  // Removable Roof Group
  const roofGroup = new THREE.Group();
  if (b.floorTheme === 'ecodome') {
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(b.halfW, b.halfD) * 0.96, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.48),
      new THREE.MeshStandardMaterial({
        color: 0x6ee7b7,
        transparent: true,
        opacity: 0.42,
        roughness: 0.15,
      })
    );
    dome.position.y = h - 0.5;
    const gardenDeck = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.5, 0.32, d - 0.5),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.85 })
    );
    gardenDeck.position.y = 10.35;
    roofGroup.add(dome, gardenDeck);
  } else {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.36, d + 0.6), roofMat);
    slab.position.y = h + 0.25;
    const crown = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, 0.65, d * 0.72), glassMat);
    crown.position.y = h + 0.75;
    roofGroup.add(slab, crown);
  }
  group.add(roofGroup);

  const lbl = createFloatingLabelSprite(b.label, 'Masuk Lewat Pintu', '#38bdf8');
  lbl.sprite.position.set(0, h + 2.8, 0);
  lbl.sprite.scale.set(4.8, 0.98, 1);
  group.add(lbl.sprite);

  disposables.push(() => {
    wallMat.dispose();
    frameMat.dispose();
    roofMat.dispose();
    floorMat.dispose();
    glassMat.dispose();
    neonMat.dispose();
    lbl.dispose();
  });

  return { group, roofGroup, spinning };
}

function buildStage3SceneryMesh(
  sc: SceneryBuildingDef,
  neonGlowMats: THREE.MeshStandardMaterial[],
  disposables: (() => void)[]
): { group: THREE.Group; spinning: THREE.Object3D[] } {
  const group = new THREE.Group();
  group.position.set(sc.x, 0, sc.z);
  group.rotation.y = sc.yaw;
  const spinning: THREE.Object3D[] = [];

  const w = sc.halfW * 2;
  const d = sc.halfD * 2;
  const h = sc.height;

  const whiteSteelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.45 });
  const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.6 });
  const glassColors = [0x0ea5e9, 0x06b6d4, 0x6366f1];
  const glassMat = new THREE.MeshStandardMaterial({
    color: glassColors[sc.variant % glassColors.length],
    roughness: 0.14,
    metalness: 0.68,
  });
  const accentHex =
    sc.kind === 'concert_arena'
      ? 0xec4899
      : sc.kind === 'quantum_lab'
        ? 0xa855f7
        : sc.kind === 'fintech_bank'
          ? 0xf59e0b
          : sc.kind === 'eco_dome' || sc.kind === 'eco_skyscraper'
            ? 0x10b981
            : 0x22d3ee;

  const neonMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    emissive: accentHex,
    emissiveIntensity: 0.72,
    roughness: 0.25,
  });
  neonGlowMats.push(neonMat);

  if (sc.kind === 'menara_nusantara') {
    // Iconic Menara Nusantara Masa Depan with walkable Observation Deck at y = 14.2m + 42m Twin Spire!
    const podium = new THREE.Mesh(new THREE.BoxGeometry(w, 2.2, d), darkSteelMat);
    podium.position.y = 1.1;
    const shaftL = new THREE.Mesh(new THREE.BoxGeometry(w * 0.34, 12.2, d * 0.68), glassMat);
    shaftL.position.set(-w * 0.24, 7.6, 0);
    const shaftR = new THREE.Mesh(new THREE.BoxGeometry(w * 0.34, 12.2, d * 0.68), glassMat);
    shaftR.position.set(w * 0.24, 7.6, 0);

    // Walkable Observation Deck Slab at y = 14.2m!
    const obsDeck = new THREE.Mesh(new THREE.BoxGeometry(20, 0.5, 12), whiteSteelMat);
    obsDeck.position.set(0, 13.95, 0);
    const obsRim = new THREE.Mesh(new THREE.BoxGeometry(20.4, 0.25, 12.4), neonMat);
    obsRim.position.set(0, 14.05, 0);

    // Upper Skyscraper Crown & Hologram Spire rising from Observation Deck
    const upperTower = new THREE.Mesh(new THREE.BoxGeometry(5.6, 22, 5.2), glassMat);
    upperTower.position.set(0, 25.2, -3.2);
    const skyCrown = new THREE.Mesh(new THREE.ConeGeometry(4.2, 6.5, 4), whiteSteelMat);
    skyCrown.rotation.y = Math.PI / 4;
    skyCrown.position.set(0, 39.4, -3.2);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.22, 10, 28), neonMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, 34.0, -3.2);
    spinning.push(halo);

    group.add(podium, shaftL, shaftR, obsDeck, obsRim, upperTower, skyCrown, halo);
  } else if (sc.kind === 'concert_arena') {
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.45, w * 0.52, h * 0.65, 20), darkSteelMat);
    bowl.position.y = h * 0.325;
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(w * 0.45, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.42),
      glassMat
    );
    dome.position.y = h * 0.64;
    const neonRing = new THREE.Mesh(new THREE.TorusGeometry(w * 0.46, 0.28, 10, 28), neonMat);
    neonRing.rotation.x = Math.PI / 2;
    neonRing.position.y = h * 0.65;
    group.add(bowl, dome, neonRing);
  } else if (sc.kind === 'quantum_lab') {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.72, d), darkSteelMat);
    cube.position.y = h * 0.36;
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(2.2, 0), neonMat);
    core.position.y = h * 0.88;
    spinning.push(core);
    group.add(cube, core);
  } else if (sc.kind === 'fintech_bank') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.3, d), whiteSteelMat);
    base.position.y = h * 0.15;
    const vault = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, h * 0.68, d * 0.85), glassMat);
    vault.position.y = h * 0.64;
    const goldBand = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.45, d * 0.9), neonMat);
    goldBand.position.y = h * 0.92;
    group.add(base, vault, goldBand);
  } else {
    // High-Tech Cyber / Eco Skyscraper Tower with Tiered Podium, Neon Window Ribbons & Spire
    const podium = new THREE.Mesh(new THREE.BoxGeometry(w, 2.0, d), darkSteelMat);
    podium.position.y = 1.0;
    const lower = new THREE.Mesh(new THREE.BoxGeometry(w * 0.84, h * 0.56, d * 0.84), glassMat);
    lower.position.y = 2.0 + h * 0.28;
    const upper = new THREE.Mesh(new THREE.BoxGeometry(w * 0.64, h * 0.38, d * 0.64), whiteSteelMat);
    upper.position.y = 2.0 + h * 0.56 + h * 0.19;
    group.add(podium, lower, upper);

    // Horizontal Glowing Skyscraper Strips
    for (let yFrac = 0.22; yFrac <= 0.86; yFrac += 0.22) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 0.24, d * 0.86), neonMat);
      strip.position.y = 2.0 + h * yFrac;
      group.add(strip);
    }

    if (sc.kind === 'eco_skyscraper' || sc.kind === 'eco_dome') {
      const garden = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.7, 0.45, d * 0.7),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.85 })
      );
      garden.position.y = 2.0 + h * 0.95;
      group.add(garden);
    } else {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 4.5, 8), whiteSteelMat);
      ant.position.y = 2.0 + h * 0.94 + 2.2;
      group.add(ant);
    }
  }

  disposables.push(() => {
    whiteSteelMat.dispose();
    darkSteelMat.dispose();
    glassMat.dispose();
    neonMat.dispose();
  });

  return { group, spinning };
}

function buildStage3LandmarkMesh(
  lm: StageLandmarkDef,
  neonGlowMats: THREE.MeshStandardMaterial[],
  disposables: (() => void)[]
): { group: THREE.Group; spinning: THREE.Object3D[] } {
  const g = new THREE.Group();
  g.position.set(lm.x, stage3GroundHeightAt(lm.x, lm.z, 0), lm.z);
  const spinning: THREE.Object3D[] = [];

  if (lm.kind === 'monument') {
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45, metalness: 0.5 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.5,
      metalness: 0.65,
      roughness: 0.25,
    });
    const cyanMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.85,
    });
    neonGlowMats.push(cyanMat);

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.2, 0.8, 16), baseMat);
    plinth.position.y = 0.4;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.9, 5.2, 12), goldMat);
    pillar.position.y = 3.4;
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(1.15, 0), cyanMat);
    core.position.y = 7.4;
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.14, 10, 26), goldMat);
    ring1.position.y = 7.4;
    ring1.rotation.x = 0.4;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.12, 10, 26), cyanMat);
    ring2.position.y = 7.4;
    ring2.rotation.y = 0.8;
    spinning.push(core, ring1, ring2);
    g.add(plinth, pillar, core, ring1, ring2);

    const lbl = createFloatingLabelSprite(lm.label, '[E] Inspeksi Monumen', '#38bdf8');
    lbl.sprite.position.set(0, 10.2, 0);
    lbl.sprite.scale.set(4.8, 1.0, 1);
    g.add(lbl.sprite);
    disposables.push(() => {
      baseMat.dispose();
      goldMat.dispose();
      cyanMat.dispose();
      lbl.dispose();
    });
    return { group: g, spinning };
  }

  if (lm.kind === 'solar_hub') {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.35 });
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.18, metalness: 0.72 });
    const pad = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.3, 4.4), poleMat);
    pad.position.y = 0.15;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.14, 2.8), panelMat);
    panel.position.set(0, 1.65, 0);
    panel.rotation.x = 0.38;
    const lbl = createFloatingLabelSprite(lm.label, '[E] Inspeksi Energi Pesisir', '#34d399');
    lbl.sprite.position.set(0, 3.6, 0);
    lbl.sprite.scale.set(4.5, 0.95, 1);
    g.add(pad, panel, lbl.sprite);
    disposables.push(() => {
      poleMat.dispose();
      panelMat.dispose();
      lbl.dispose();
    });
    return { group: g, spinning };
  }

  // Menara Nusantara interactive plaque beacon at plaza base (top observation tower is sc-s3-menara)
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.85,
  });
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.2, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
  );
  base.position.set(0, 0.6, 6.2);
  const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), beaconMat);
  orb.position.set(0, 1.85, 6.2);
  spinning.push(orb);
  const lbl = createFloatingLabelSprite(lm.label, '[E] Inspeksi Menara Nusantara', '#38bdf8');
  lbl.sprite.position.set(0, 3.4, 6.2);
  lbl.sprite.scale.set(4.8, 1.0, 1);
  g.add(base, orb, lbl.sprite);
  disposables.push(() => {
    beaconMat.dispose();
    lbl.dispose();
  });
  return { group: g, spinning };
}

export function createStage3FutureWorld(
  textures: WorldTextures
): Stage1OverhaulWorldHandle {
  const root = new THREE.Group();
  const interiorRoofs = new Map<string, THREE.Object3D>();
  const pickupMeshes = new Map<string, THREE.Object3D>();
  const collectibleMeshes = new Map<string, THREE.Object3D>();
  const deliveryMeshes = new Map<string, THREE.Object3D>();
  const disposables: (() => void)[] = [];
  const spinningObjects: THREE.Object3D[] = [];
  const neonGlowMats: THREE.MeshStandardMaterial[] = [];
  const windRotors: THREE.Group[] = [];

  // 1. Futuristic City Terrain Slabs + Eco Green Zone + Paved Plaza
  const baseGroundMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
  const westSlab = new THREE.Mesh(new THREE.PlaneGeometry(210, 230), baseGroundMat);
  westSlab.rotation.x = -Math.PI / 2;
  westSlab.position.set(-14, -0.02, -4);
  root.add(westSlab);

  // Green Tech & Botanical Eco District South Zone
  const ecoMat = new THREE.MeshStandardMaterial({
    map: textures.sandEarth,
    color: 0x22c55e,
    roughness: 0.88,
  });
  const ecoPark = new THREE.Mesh(new THREE.PlaneGeometry(66, 78), ecoMat);
  ecoPark.rotation.x = -Math.PI / 2;
  ecoPark.position.set(2, 0.005, 60);
  const centralPlaza = new THREE.Mesh(
    new THREE.PlaneGeometry(46, 48),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 })
  );
  centralPlaza.rotation.x = -Math.PI / 2;
  centralPlaza.position.set(0, 0.008, 0);
  root.add(ecoPark, centralPlaza);

  // 2. Crisp Smart City Autonomous Roads + Glowing Cyan Lane Markings
  const roadMat = new THREE.MeshStandardMaterial({
    map: textures.asphaltRoad,
    color: 0x1e293b,
    roughness: 0.72,
  });
  const laneGlowMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.6,
  });
  neonGlowMats.push(laneGlowMat);

  const roadSpecs: [number, number, number, number][] = [
    [-2, 0, 176, 8.8],     // Main EW z = 0
    [0, 6, 8.8, 166],      // Main NS x = 0
    [-2, -34, 174, 7.2],   // North Loop z = -34
    [-2, 32, 174, 7.2],    // South Loop z = 32
    [0, -72, 168, 7.6],    // Transit Hub Ave z = -72
    [28, 6, 7.2, 158],     // East Ave x = 28
    [-28, 6, 7.2, 158],    // West Ave x = -28
  ];
  for (const [rx, rz, sw, sd] of roadSpecs) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(sw, sd), roadMat);
    r.rotation.x = -Math.PI / 2;
    r.position.set(rx, 0.015, rz);
    root.add(r);
  }

  // Twin Digital Water Fountains at Smart City Plaza
  const waterTex = textures.waterWave.clone();
  waterTex.needsUpdate = true;
  const fountainWaterMat = new THREE.MeshStandardMaterial({
    map: waterTex,
    color: 0x38bdf8,
    roughness: 0.14,
    metalness: 0.25,
  });
  for (const [fx, fz] of [[-12, 10], [12, 10]]) {
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 3.0, 0.45, 20),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
    );
    rim.position.set(fx, 0.22, fz);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(2.55, 20), fountainWaterMat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(fx, 0.46, fz);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.5, 10), laneGlowMat);
    spire.position.set(fx, 1.0, fz);
    spinningObjects.push(spire);
    root.add(rim, pool, spire);
  }

  // 3. East Shoreline Ocean + Wind & Solar Pier + Spinning Offshore Wind Turbines
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(110, 240), fountainWaterMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(STAGE3_SHORELINE_X + 52, -0.45, 0);
  root.add(ocean);

  const pierMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 });
  const coastalPier = new THREE.Mesh(new THREE.BoxGeometry(21, 0.85, 12), pierMat);
  coastalPier.position.set(93.5, 0, 56);
  root.add(coastalPier);

  const whiteMetalMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28, metalness: 0.45 });
  for (let i = 0; i < 5; i++) {
    const tx = 104 + (i % 2) * 8;
    const tz = -38 + i * 24;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.68, 15.5, 12), whiteMetalMat);
    mast.position.set(tx, 7.3, tz);
    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.65, 10, 8), whiteMetalMat);
    hub.position.set(tx - 0.5, 15.0, tz);
    const rotor = new THREE.Group();
    rotor.position.set(tx - 0.6, 15.0, tz);
    for (let b = 0; b < 3; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.22, 5.2, 0.56), whiteMetalMat);
      blade.position.y = 2.6;
      const bw = new THREE.Group();
      bw.rotation.x = (b * Math.PI * 2) / 3 + i * 0.5;
      bw.add(blade);
      rotor.add(bw);
    }
    windRotors.push(rotor);
    root.add(mast, hub, rotor);
  }

  // 4. Elevated Walkable Glass Skywalk (z: -16..-10, x: -36..36, y = 6.5m) + Ramps
  const skyDeckMat = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.72,
    roughness: 0.14,
    metalness: 0.35,
  });
  const skyDeck = new THREE.Mesh(new THREE.BoxGeometry(72, 0.32, 6.0), skyDeckMat);
  skyDeck.position.set(0, 6.34, -13);
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.65,
  });
  neonGlowMats.push(railMat);
  for (const rz of [-15.9, -10.1]) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(72, 0.85, 0.12), railMat);
    r.position.set(0, 6.9, rz);
    root.add(r);
  }
  // Support columns under Skywalk (spaced away from central plaza paths)
  for (const cx of [-34, -22, 22, 34]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 6.3, 10), whiteMetalMat);
    col.position.set(cx, 3.15, -13);
    root.add(col);
  }
  // Walkable Sloped Ramps on East & West ends of Skywalk (x: -46..-36 and 36..46)
  const rampLen = Math.hypot(10, 6.5);
  const rampAngle = Math.atan2(6.5, 10);
  const westRamp = new THREE.Mesh(new THREE.BoxGeometry(rampLen, 0.28, 6.0), skyDeckMat);
  westRamp.position.set(-41, 3.18, -13);
  westRamp.rotation.z = rampAngle;
  const eastRamp = new THREE.Mesh(new THREE.BoxGeometry(rampLen, 0.28, 6.0), skyDeckMat);
  eastRamp.position.set(41, 3.18, -13);
  eastRamp.rotation.z = -rampAngle;
  root.add(skyDeck, westRamp, eastRamp);

  // 5. Elevated Monorail Track (x = STAGE3_MONORAIL_X = 24) & Animated Sleek Monorail + Maglev HST
  const monoTrack = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 176), whiteMetalMat);
  monoTrack.position.set(STAGE3_MONORAIL_X, 6.4, 0);
  const monoStrip = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.16, 176), railMat);
  monoStrip.position.set(STAGE3_MONORAIL_X, 6.5, 0);
  root.add(monoTrack, monoStrip);
  for (let mz = -72; mz <= 72; mz += 24) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.58, 6.2, 10), whiteMetalMat);
    col.position.set(STAGE3_MONORAIL_X, 3.1, mz);
    root.add(col);
  }

  const monorailTrain = new THREE.Group();
  monorailTrain.position.set(STAGE3_MONORAIL_X, 7.25, 0);
  const carA = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.35, 11.5), whiteMetalMat);
  const winBand = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.58, 10.6), railMat);
  winBand.position.y = 0.12;
  monorailTrain.add(carA, winBand);
  root.add(monorailTrain);

  // High-Speed Maglev Train docked / gliding at North Terminal (z = -95)
  const hstTrack = new THREE.Mesh(new THREE.BoxGeometry(180, 0.65, 2.8), whiteMetalMat);
  hstTrack.position.set(0, 1.2, -95);
  const hstTrain = new THREE.Group();
  hstTrain.position.set(0, 2.2, -95);
  const hstBody = new THREE.Mesh(new THREE.BoxGeometry(22, 1.7, 2.3), whiteMetalMat);
  const hstNoseL = new THREE.Mesh(new THREE.ConeGeometry(1.15, 3.2, 8), railMat);
  hstNoseL.rotation.z = Math.PI / 2;
  hstNoseL.position.x = -12.5;
  const hstNoseR = new THREE.Mesh(new THREE.ConeGeometry(1.15, 3.2, 8), railMat);
  hstNoseR.rotation.z = -Math.PI / 2;
  hstNoseR.position.x = 12.5;
  const hstStripe = new THREE.Mesh(new THREE.BoxGeometry(21.5, 0.45, 2.36), railMat);
  hstTrain.add(hstBody, hstNoseL, hstNoseR, hstStripe);
  root.add(hstTrack, hstTrain);

  // 6. Instanced Smart Trees + Futuristic Glowing Streetlamps across Boulevards
  const dummy = new THREE.Object3D();
  const treeCoords: [number, number][] = [];
  for (let tz = -64; tz <= 68; tz += 16) {
    treeCoords.push([-22, tz], [22, tz], [-36, tz], [36, tz]);
  }
  for (let tx = -64; tx <= 64; tx += 16) {
    if (Math.abs(tx) > 8) {
      treeCoords.push([tx, 24], [tx, -26], [tx, 64]);
    }
  }
  const tTrunkGeo = new THREE.CylinderGeometry(0.16, 0.24, 2.4, 7);
  const tCrownGeo = new THREE.DodecahedronGeometry(1.25, 1);
  const tTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const tCrownMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.82 });
  const trunksInst = new THREE.InstancedMesh(tTrunkGeo, tTrunkMat, treeCoords.length);
  const crownsInst = new THREE.InstancedMesh(tCrownGeo, tCrownMat, treeCoords.length);
  treeCoords.forEach(([tx, tz], idx) => {
    dummy.position.set(tx, 1.2, tz);
    dummy.rotation.set(0, idx * 0.4, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    trunksInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(tx, 2.95, tz);
    dummy.updateMatrix();
    crownsInst.setMatrixAt(idx, dummy.matrix);
  });
  trunksInst.frustumCulled = false;
  crownsInst.frustumCulled = false;
  root.add(trunksInst, crownsInst);

  const lampCoords: [number, number][] = [];
  for (let x = -72; x <= 72; x += 18) {
    lampCoords.push([x, -5.2], [x, 5.2], [x, -38.5], [x, 36.5]);
  }
  for (let z = -64; z <= 76; z += 18) {
    lampCoords.push([-5.2, z], [5.2, z]);
  }
  const lampPoleGeo = new THREE.CylinderGeometry(0.08, 0.12, 4.4, 7);
  const lampHeadGeo = new THREE.BoxGeometry(0.65, 0.22, 0.35);
  const lampPoleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.4 });
  const lampHeadMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.95,
  });
  neonGlowMats.push(lampHeadMat);
  const polesInst = new THREE.InstancedMesh(lampPoleGeo, lampPoleMat, lampCoords.length);
  const headsInst = new THREE.InstancedMesh(lampHeadGeo, lampHeadMat, lampCoords.length);
  lampCoords.forEach(([lx, lz], i) => {
    dummy.position.set(lx, 2.2, lz);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    polesInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lx, 4.4, lz);
    dummy.updateMatrix();
    headsInst.setMatrixAt(i, dummy.matrix);
  });
  polesInst.frustumCulled = false;
  headsInst.frustumCulled = false;
  root.add(polesInst, headsInst);

  // 7. Instanced Autonomous Road Cars gliding smoothly along avenues
  const ambientEvCount = 12;
  const evBodyGeo = new THREE.BoxGeometry(1.5, 0.65, 3.0);
  const evGlassGeo = new THREE.BoxGeometry(1.25, 0.42, 1.55);
  const evBodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.28, metalness: 0.45 });
  const evGlassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.55 });
  const evBodies = new THREE.InstancedMesh(evBodyGeo, evBodyMat, ambientEvCount);
  const evGlasses = new THREE.InstancedMesh(evGlassGeo, evGlassMat, ambientEvCount);
  const evColors = [0x0ea5e9, 0x10b981, 0xf59e0b, 0xec4899, 0x6366f1];
  const colorTmp = new THREE.Color();
  for (let i = 0; i < ambientEvCount; i++) {
    colorTmp.setHex(evColors[i % evColors.length]);
    evBodies.setColorAt(i, colorTmp);
  }
  evBodies.frustumCulled = false;
  evGlasses.frustumCulled = false;
  root.add(evBodies, evGlasses);

  // 8. Scenery Towers, Landmarks, Enterable Buildings & District Billboards
  for (const sc of getStage3SceneryBuildings()) {
    const built = buildStage3SceneryMesh(sc, neonGlowMats, disposables);
    root.add(built.group);
    spinningObjects.push(...built.spinning);
  }
  for (const lm of getStage3Landmarks()) {
    if (lm.id === 'lm-s3-stage2-terminal') continue;
    const built = buildStage3LandmarkMesh(lm, neonGlowMats, disposables);
    root.add(built.group);
    spinningObjects.push(...built.spinning);
  }
  for (const eb of STAGE3_ENTERABLE_BUILDINGS) {
    const built = buildStage3EnterableMesh(eb, disposables);
    root.add(built.group);
    interiorRoofs.set(eb.id, built.roofGroup);
    spinningObjects.push(...built.spinning);
  }

  const mirrorSpot = STAGE3_WARDROBE_MIRROR_SPOT;
  const mirrorRing = new THREE.Mesh(
    new THREE.RingGeometry(0.75, 1.05, 22),
    new THREE.MeshBasicMaterial({ color: 0xf472b6, side: THREE.DoubleSide })
  );
  mirrorRing.rotation.x = -Math.PI / 2;
  mirrorRing.position.set(mirrorSpot.x, mirrorSpot.yOffset + 0.05, mirrorSpot.z);
  root.add(mirrorRing);

  const billboards: [string, string, number, number, string, string][] = [
    ['SMART CITY CENTER', 'Tata Kelola & Layanan Digital', -14, 14, '#0f172a', '#38bdf8'],
    ['DIGITAL BUSINESS', 'Fintech · Mal E-Commerce', 34, -18, '#1e1b4b', '#fbbf24'],
    ['RISET & INOVASI', 'Lab Robotika & Kuantum', -34, -18, '#1e1b4b', '#c084fc'],
    ['PERMUKIMAN EKO', 'Apartemen Hijau & Komunitas', -34, 24, '#064e3b', '#34d399'],
    ['DISTRIK HIBURAN', 'Arkade Neon & Sinema 4D', 34, 24, '#3b0764', '#f472b6'],
    ['TEKNOLOGI HIJAU', 'Eco Dome & Energi Terbarukan', 14, 42, '#064e3b', '#10b981'],
    ['KERETA CEPAT HST', 'Akses Cepat Stage 2 <-> Stage 3', -12, -70, '#0c4a6e', '#22d3ee'],
  ];
  for (const [t, sub, bx, bz, bg, ac] of billboards) {
    const bb = createNeonBillboard(t, sub, bg, ac, disposables);
    bb.position.set(bx, 0, bz);
    root.add(bb);
  }

  // 9. Elevator Pads (8 bidirectional pads)
  for (const pad of STAGE3_ELEVATOR_PADS) {
    const g = new THREE.Group();
    g.position.set(pad.x, pad.fromY, pad.z);
    const padColor = parseInt(pad.accentHex.replace('#', ''), 16) || 0x38bdf8;
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.5, 0.2, 20),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    base.position.y = 0.1;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.05, 1.38, 24),
      new THREE.MeshBasicMaterial({ color: padColor, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.22;
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.15, 2.4, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: padColor,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    beam.position.y = 1.4;
    const lbl = createFloatingLabelSprite(pad.label, `[E] ${pad.targetLabel}`, pad.accentHex);
    lbl.sprite.position.set(0, 3.0, 0);
    lbl.sprite.scale.set(4.0, 0.85, 1);
    disposables.push(lbl.dispose);
    g.add(base, ring, beam, lbl.sprite);
    root.add(g);
  }

  // 10. Activity Consoles (5 Interactive Future Systems)
  for (const st of STAGE3_ACTIVITY_STATIONS) {
    const g = new THREE.Group();
    g.position.set(st.x, st.y, st.z);
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 1.15, 0.85),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35 })
    );
    desk.position.y = 0.58;
    const holo = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.6, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 0.95 })
    );
    holo.position.set(0, 1.4, 0);
    holo.rotation.x = -0.35;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.1, 1.4, 24),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    const lbl = createFloatingLabelSprite(st.name, `[E] ${st.actionLabel}`, '#22d3ee');
    lbl.sprite.position.set(0, 2.4, 0);
    lbl.sprite.scale.set(4.2, 0.9, 1);
    disposables.push(lbl.dispose);
    g.add(desk, holo, ring, lbl.sprite);
    root.add(g);
  }

  // 11. Pickups, Collectibles, Delivery Spots, Quest Beacon
  for (const pk of STAGE3_WORLD_PICKUPS) {
    const g = new THREE.Group();
    g.position.set(pk.x, pk.yOffset ?? stage3GroundHeightAt(pk.x, pk.z, 0), pk.z);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.8, 18),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.58, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0284c7, emissiveIntensity: 0.55 })
    );
    box.position.y = 0.6;
    box.name = 'floating-node';
    const lbl = createFloatingLabelSprite(pk.label, '[E] Ambil Komponen', '#38bdf8');
    lbl.sprite.position.set(0, 1.65, 0);
    lbl.sprite.scale.set(3.5, 0.78, 1);
    disposables.push(lbl.dispose);
    g.add(ring, box, lbl.sprite);
    root.add(g);
    pickupMeshes.set(pk.id, g);
  }

  for (const col of STAGE3_COLLECTIBLES) {
    const g = new THREE.Group();
    const gy = col.yOffset ?? stage3GroundHeightAt(col.x, col.z, 0);
    g.position.set(col.x, gy, col.z);
    const rColor = RARITY_COLOR[col.rarity];
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.58, 0.25, 14),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    );
    pedestal.position.y = 0.125;
    const relic = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.42, 0),
      new THREE.MeshStandardMaterial({ color: rColor, emissive: rColor, emissiveIntensity: 0.88 })
    );
    relic.position.y = 0.88;
    relic.name = 'floating-node';
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.65, 0.88, 22),
      new THREE.MeshBasicMaterial({ color: rColor, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    const lbl = createFloatingLabelSprite(col.name, `${col.rarity} · [E] Koleksi`, '#f8fafc');
    lbl.sprite.position.set(0, 1.95, 0);
    lbl.sprite.scale.set(3.6, 0.8, 1);
    disposables.push(lbl.dispose);
    g.add(pedestal, relic, ring, lbl.sprite);
    root.add(g);
    collectibleMeshes.set(col.id, g);
  }

  for (const del of STAGE3_DELIVERY_SPOTS) {
    const g = new THREE.Group();
    g.position.set(del.x, del.yOffset ?? stage3GroundHeightAt(del.x, del.z, 0), del.z);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.9, 1.25, 22),
      new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    const marker = new THREE.Mesh(
      new THREE.ConeGeometry(0.38, 0.78, 4),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.8 })
    );
    marker.rotation.x = Math.PI;
    marker.position.y = 1.28;
    marker.name = 'floating-node';
    const lbl = createFloatingLabelSprite(del.label, '[E] Serahkan / Ekspor', '#34d399');
    lbl.sprite.position.set(0, 2.25, 0);
    lbl.sprite.scale.set(3.9, 0.84, 1);
    disposables.push(lbl.dispose);
    g.add(ring, marker, lbl.sprite);
    root.add(g);
    deliveryMeshes.set(del.id, g);
  }

  // Quest Beacon
  const questBeacon = new THREE.Group();
  const qBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.9, 24, 14, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  qBeam.position.y = 12;
  const qDiamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.6, 0),
    new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x06b6d4, emissiveIntensity: 1.0 })
  );
  qDiamond.position.y = 3.8;
  qDiamond.name = 'beacon-diamond';
  questBeacon.add(qBeam, qDiamond);
  root.add(questBeacon);

  // 12. Animated Citizens + Autonomous Robots (Ground & Elevated Skywalk!)
  const crowd: CrowdRuntime3[] = getStage3CrowdPatrols().map((def) => {
    const rig = createCrowdCitizenRig(def);
    const start = def.waypoints[0];
    const startY = start.y ?? stage3GroundHeightAt(start.x, start.z, 0);
    rig.root.position.set(start.x, startY, start.z);
    root.add(rig.root);
    return {
      def,
      rig,
      wpIndex: 1 % def.waypoints.length,
      x: start.x,
      y: startY,
      z: start.z,
      yaw: 0,
      pauseTimer: 0,
      walkCycle: 0,
    };
  });

  disposables.push(() => {
    baseGroundMat.dispose();
    ecoMat.dispose();
    roadMat.dispose();
    waterTex.dispose();
    fountainWaterMat.dispose();
    pierMat.dispose();
    whiteMetalMat.dispose();
    skyDeckMat.dispose();
    tTrunkGeo.dispose();
    tCrownGeo.dispose();
    tTrunkMat.dispose();
    tCrownMat.dispose();
    lampPoleGeo.dispose();
    lampHeadGeo.dispose();
    lampPoleMat.dispose();
    evBodyGeo.dispose();
    evGlassGeo.dispose();
    evBodyMat.dispose();
    evGlassMat.dispose();
  });

  const evDummy = new THREE.Object3D();

  const update = (elapsed: number, dt: number, timeOfDay: number) => {
    waterTex.offset.x = (elapsed * 0.03) % 1;
    waterTex.offset.y = (elapsed * 0.02) % 1;

    // Day/Night reactive neon intensity
    const isNightish = timeOfDay < 0.25 || timeOfDay > 0.72;
    const neonFactor = isNightish ? 1.25 : 0.68;
    for (const m of neonGlowMats) {
      m.emissiveIntensity = neonFactor;
    }

    // Offshore turbines spinning
    for (const rot of windRotors) {
      rot.rotation.x += dt * 1.45;
    }

    // Elevated Monorail Train gliding North-South along x = STAGE3_MONORAIL_X
    monorailTrain.position.z = Math.sin(elapsed * 0.28) * 64;

    // High-Speed Maglev Train pulsing softly at Terminal
    hstTrain.position.x = Math.sin(elapsed * 0.14) * 28;

    // Ambient Autonomous EV Traffic gliding along outer avenues
    for (let i = 0; i < ambientEvCount; i++) {
      const lane = i % 4;
      const t = ((elapsed * (0.045 + (i % 3) * 0.008) + i * 0.19) % 1 + 1) % 1;
      const span = -76 + t * 152;
      let ex = 0;
      let ez = 0;
      let eyaw = 0;
      if (lane === 0) {
        ex = span;
        ez = -2.1;
        eyaw = Math.PI / 2;
      } else if (lane === 1) {
        ex = -span;
        ez = 2.1;
        eyaw = -Math.PI / 2;
      } else if (lane === 2) {
        ex = 28 - 2.0;
        ez = span;
        eyaw = 0;
      } else {
        ex = -28 + 2.0;
        ez = -span;
        eyaw = Math.PI;
      }
      evDummy.position.set(ex, 0.42, ez);
      evDummy.rotation.set(0, eyaw, 0);
      evDummy.scale.setScalar(1);
      evDummy.updateMatrix();
      evBodies.setMatrixAt(i, evDummy.matrix);

      evDummy.position.set(ex, 0.85, ez);
      evDummy.updateMatrix();
      evGlasses.setMatrixAt(i, evDummy.matrix);
    }
    evBodies.instanceMatrix.needsUpdate = true;
    evGlasses.instanceMatrix.needsUpdate = true;

    for (const sp of spinningObjects) {
      sp.rotation.y += dt * 1.3;
    }

    for (const [, m] of pickupMeshes) {
      if (!m.visible) continue;
      const node = m.getObjectByName('floating-node');
      if (node) {
        node.rotation.y += dt * 1.8;
        node.position.y = 0.6 + Math.sin(elapsed * 2.6 + m.position.x) * 0.12;
      }
    }
    for (const [, m] of collectibleMeshes) {
      if (!m.visible) continue;
      const node = m.getObjectByName('floating-node');
      if (node) {
        node.rotation.y += dt * 2.2;
        node.position.y = 0.88 + Math.sin(elapsed * 2.8 + m.position.z) * 0.14;
      }
    }
    for (const [, m] of deliveryMeshes) {
      if (!m.visible) continue;
      const node = m.getObjectByName('floating-node');
      if (node) {
        node.rotation.y += dt * 1.6;
        node.position.y = 1.28 + Math.sin(elapsed * 3.0) * 0.12;
      }
    }

    const bd = questBeacon.getObjectByName('beacon-diamond');
    if (bd && questBeacon.visible) {
      bd.rotation.y += dt * 2.2;
      bd.position.y = 3.8 + Math.sin(elapsed * 2.6) * 0.28;
    }

    for (const agent of crowd) {
      if (agent.pauseTimer > 0) {
        agent.pauseTimer -= dt;
        agent.rig.leftLeg.rotation.x = 0;
        agent.rig.rightLeg.rotation.x = 0;
        agent.rig.leftArm.rotation.x = 0;
        agent.rig.rightArm.rotation.x = 0;
        continue;
      }
      const target = agent.def.waypoints[agent.wpIndex];
      const dx = target.x - agent.x;
      const dz = target.z - agent.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.35) {
        agent.wpIndex = (agent.wpIndex + 1) % agent.def.waypoints.length;
        agent.pauseTimer = agent.def.pauseSeconds;
        continue;
      }
      const step = Math.min(dist, agent.def.speed * dt);
      agent.x += (dx / dist) * step;
      agent.z += (dz / dist) * step;
      agent.yaw = Math.atan2(dx, dz);
      agent.walkCycle += step * 1.95;

      agent.y = target.y ?? stage3GroundHeightAt(agent.x, agent.z, agent.y);
      agent.rig.root.position.set(agent.x, agent.y, agent.z);
      agent.rig.root.rotation.y = agent.yaw;

      const isBot = agent.def.role === 'drone_bot';
      const swing = isBot ? 0 : Math.sin(agent.walkCycle) * 0.55;
      agent.rig.leftLeg.rotation.x = swing;
      agent.rig.rightLeg.rotation.x = -swing;
      agent.rig.leftArm.rotation.x = -swing * 0.7;
      agent.rig.rightArm.rotation.x = swing * 0.7;
    }
  };

  return {
    root,
    interiorRoofs,
    pickupMeshes,
    collectibleMeshes,
    deliveryMeshes,
    questBeacon,
    update,
    dispose: () => {
      for (const fn of disposables) fn();
    },
  };
}
