import * as THREE from 'three';
import { CollectibleRarity } from './stage1Data';
import {
  STAGE2_COLLECTIBLES,
  STAGE2_DELIVERY_SPOTS,
  STAGE2_ENTERABLE_BUILDINGS,
  STAGE2_FACTORY_STATIONS,
  STAGE2_WARDROBE_MIRROR_SPOT,
  STAGE2_WORLD_PICKUPS,
  Stage2EnterableBuildingDef,
} from './stage2Data';
import {
  getStage2CrowdPatrols,
  getStage2Landmarks,
  getStage2SceneryBuildings,
  STAGE2_RAIL_X,
  STAGE2_SHIP_DECKS,
  STAGE2_SHORELINE_X,
  stage2GroundHeightAt,
} from './stage2Physics';
import { Stage1OverhaulWorldHandle } from './threeStage1OverhaulWorld';
import {
  createCrowdCitizenRig,
  createFloatingLabelSprite,
  CrowdCitizenRig,
  WorldTextures,
} from './threeWorldBuilder';
import {
  CrowdPatrolDef,
  PIER_HEIGHT,
  SceneryBuildingDef,
  StageLandmarkDef,
} from './world3dPhysics';

interface CrowdRuntime {
  def: CrowdPatrolDef;
  rig: CrowdCitizenRig;
  wpIndex: number;
  x: number;
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

function createIndustrialSignboard(
  title: string,
  subtitle: string,
  bgHex: string,
  borderHex: string,
  disposables: (() => void)[]
): THREE.Group {
  const g = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.35 });
  for (const sx of [-1.25, 1.25]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.8, 7), postMat);
    post.position.set(sx, 1.4, 0);
    g.add(post);
  }
  const c = document.createElement('canvas');
  c.width = 440;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 440, 128);
  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 428, 116);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(title, 220, 56);
  ctx.fillStyle = borderHex;
  ctx.font = '600 18px system-ui, -apple-system, sans-serif';
  ctx.fillText(subtitle, 220, 92);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const boardMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });
  const backMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.92, 0.14), [
    backMat,
    backMat,
    backMat,
    backMat,
    boardMat,
    boardMat,
  ]);
  board.position.set(0, 2.4, 0);
  g.add(board);

  disposables.push(() => {
    tex.dispose();
    boardMat.dispose();
    backMat.dispose();
    postMat.dispose();
  });
  return g;
}

function buildStage2EnterableMesh(
  b: Stage2EnterableBuildingDef,
  textures: WorldTextures,
  disposables: (() => void)[]
): { group: THREE.Group; roofGroup: THREE.Group; spinningParts: THREE.Object3D[] } {
  const group = new THREE.Group();
  group.position.set(b.x, 0, b.z);
  const spinningParts: THREE.Object3D[] = [];

  const wallMat = new THREE.MeshStandardMaterial({ color: b.wallColor, roughness: 0.82 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.45 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.6 });
  const roofMat = new THREE.MeshStandardMaterial({ color: b.roofColor, roughness: 0.65 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.55 });

  const w = b.halfW * 2;
  const d = b.halfD * 2;
  const t = 0.36;
  const h = b.wallHeight;

  const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), floorMat);
  floor.position.y = 0.11;
  group.add(floor);

  const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(b.doorHalfWidth * 2.2, 0.18, 1.1), stoneMat);
  if (b.doorSide === 'south') stepMesh.position.set(0, 0.09, b.halfD + 0.45);
  if (b.doorSide === 'north') stepMesh.position.set(0, 0.09, -b.halfD - 0.45);
  if (b.doorSide === 'east') {
    stepMesh.rotation.y = Math.PI / 2;
    stepMesh.position.set(b.halfW + 0.45, 0.09, 0);
  }
  if (b.doorSide === 'west') {
    stepMesh.rotation.y = Math.PI / 2;
    stepMesh.position.set(-b.halfW - 0.45, 0.09, 0);
  }
  group.add(stepMesh);

  const addWallSeg = (wx: number, wz: number, sx: number, sz: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, h, sz), wallMat);
    m.position.set(wx, h / 2 + 0.1, wz);
    group.add(m);
  };

  if (b.doorSide === 'north') {
    const sideLen = b.halfW - b.doorHalfWidth;
    addWallSeg(-b.halfW + sideLen / 2, -b.halfD + t / 2, sideLen, t);
    addWallSeg(b.halfW - sideLen / 2, -b.halfD + t / 2, sideLen, t);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(b.doorHalfWidth * 2, 0.9, t), steelMat);
    lintel.position.set(0, h - 0.35, -b.halfD + t / 2);
    group.add(lintel);
  } else {
    addWallSeg(0, -b.halfD + t / 2, w, t);
  }

  if (b.doorSide === 'south') {
    const sideLen = b.halfW - b.doorHalfWidth;
    addWallSeg(-b.halfW + sideLen / 2, b.halfD - t / 2, sideLen, t);
    addWallSeg(b.halfW - sideLen / 2, b.halfD - t / 2, sideLen, t);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(b.doorHalfWidth * 2, 0.9, t), steelMat);
    lintel.position.set(0, h - 0.35, b.halfD - t / 2);
    group.add(lintel);
  } else {
    addWallSeg(0, b.halfD - t / 2, w, t);
  }

  if (b.doorSide === 'west') {
    const sideLen = b.halfD - b.doorHalfWidth;
    addWallSeg(-b.halfW + t / 2, -b.halfD + sideLen / 2, t, sideLen);
    addWallSeg(-b.halfW + t / 2, b.halfD - sideLen / 2, t, sideLen);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(t, 0.9, b.doorHalfWidth * 2), steelMat);
    lintel.position.set(-b.halfW + t / 2, h - 0.35, 0);
    group.add(lintel);
  } else {
    addWallSeg(-b.halfW + t / 2, 0, t, d);
  }

  if (b.doorSide === 'east') {
    const sideLen = b.halfD - b.doorHalfWidth;
    addWallSeg(b.halfW - t / 2, -b.halfD + sideLen / 2, t, sideLen);
    addWallSeg(b.halfW - t / 2, b.halfD - sideLen / 2, t, sideLen);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(t, 0.9, b.doorHalfWidth * 2), steelMat);
    lintel.position.set(b.halfW - t / 2, h - 0.35, 0);
    group.add(lintel);
  } else {
    addWallSeg(b.halfW - t / 2, 0, t, d);
  }

  // Interior Furniture by Stage 2 Building Role
  if (b.furnitureKind === 'factory_textile' || b.furnitureKind === 'factory_food') {
    const belt = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.85, 1.4), steelMat);
    belt.position.set(-0.6, 0.65, 0);
    group.add(belt);
    for (let i = -2; i <= 2; i += 2) {
      const tank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 1.9, 12),
        b.furnitureKind === 'factory_food' ? copperMat : roofMat
      );
      tank.position.set(i, 1.18, -2.5);
      group.add(tank);
    }
    const gear = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.14, 8, 12), copperMat);
    gear.position.set(-2.5, 1.45, 0);
    spinningParts.push(gear);
    group.add(gear);
  } else if (b.furnitureKind === 'warehouse') {
    for (const rx of [-3.2, 3.2]) {
      const rack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.5, 4.8), steelMat);
      rack.position.set(rx, 1.45, 0);
      group.add(rack);
    }
    const crate = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1.4), copperMat);
    crate.position.set(0, 0.78, -1.8);
    group.add(crate);
  } else if (b.furnitureKind === 'clinic') {
    for (const bx of [-2.4, 2.4]) {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 1.1), floorMat);
      bed.position.set(bx, 0.5, -1.6);
      group.add(bed);
    }
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.1, 0.15), greenMat);
    crossV.position.set(0, 2.2, -b.halfD + 0.35);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 0.15), greenMat);
    crossH.position.set(0, 2.2, -b.halfD + 0.35);
    group.add(crossV, crossH);
  } else if (b.furnitureKind === 'recycling') {
    for (const tx of [-2.2, 0.4]) {
      const vat = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 2.0, 14), greenMat);
      vat.position.set(tx, 1.2, -1.5);
      group.add(vat);
    }
  } else if (b.furnitureKind === 'boutique') {
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.5, 1.6), copperMat);
    mirror.position.set(b.halfW - 0.8, 1.45, 0);
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2.2, 1.3),
      new THREE.MeshStandardMaterial({ color: 0xbae6fd, metalness: 0.75, roughness: 0.15 })
    );
    glass.position.set(b.halfW - 0.81, 1.45, 0);
    group.add(mirror, glass);
  } else if (b.furnitureKind === 'station') {
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 4.2), copperMat);
    counter.position.set(1.6, 0.7, 0);
    group.add(counter);
  } else {
    const table = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.8, 1.8), copperMat);
    table.position.set(0, 0.62, -0.5);
    group.add(table);
  }

  // Removable Roof Group for Interior Visibility
  const roofGroup = new THREE.Group();
  const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.38, d + 0.6), roofMat);
  roofSlab.position.y = h + 0.25;
  roofGroup.add(roofSlab);

  if (b.furnitureKind === 'factory_textile' || b.furnitureKind === 'factory_food') {
    // Sawtooth industrial roof + tall brick chimney
    const ridge = new THREE.Mesh(new THREE.ConeGeometry(Math.min(w, d) * 0.42, 1.8, 4), roofMat);
    ridge.rotation.y = Math.PI / 4;
    ridge.position.y = h + 1.35;
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 3.8, 10), wallMat);
    chimney.position.set(-b.halfW + 1.4, h + 1.9, -b.halfD + 1.4);
    roofGroup.add(ridge, chimney);
  } else {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 0.78, 0.8, d * 0.78), roofMat);
    cap.position.y = h + 0.75;
    roofGroup.add(cap);
  }
  group.add(roofGroup);

  const lbl = createFloatingLabelSprite(b.label, 'Masuk Lewat Pintu', '#f8fafc');
  lbl.sprite.position.set(0, h + 2.8, 0);
  lbl.sprite.scale.set(4.5, 0.95, 1);
  group.add(lbl.sprite);

  void textures;
  disposables.push(() => {
    wallMat.dispose();
    steelMat.dispose();
    copperMat.dispose();
    roofMat.dispose();
    floorMat.dispose();
    stoneMat.dispose();
    greenMat.dispose();
    lbl.dispose();
  });

  return { group, roofGroup, spinningParts };
}

function buildStage2SceneryMesh(
  sc: SceneryBuildingDef,
  disposables: (() => void)[]
): { group: THREE.Group; spinning: THREE.Object3D[] } {
  const group = new THREE.Group();
  group.position.set(sc.x, 0, sc.z);
  group.rotation.y = sc.yaw;
  const spinning: THREE.Object3D[] = [];

  if (sc.kind === 'pocket_park') {
    const lawn = new THREE.Mesh(
      new THREE.BoxGeometry(sc.halfW * 2, 0.14, sc.halfD * 2),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.9 })
    );
    lawn.position.y = 0.07;
    const fountain = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.35, 0.55, 12),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 })
    );
    fountain.position.y = 0.35;
    group.add(lawn, fountain);
    return { group, spinning };
  }

  const w = sc.halfW * 2;
  const d = sc.halfD * 2;
  const h = sc.height;

  const paletteMap: Partial<Record<SceneryBuildingDef['kind'], { wall: number; roof: number }>> = {
    brick_factory: { wall: 0x9a3412, roof: 0x334155 },
    brick_foundry: { wall: 0x7c2d12, roof: 0x475569 },
    cargo_depot: { wall: 0x64748b, roof: 0x1e293b },
    worker_rowhouse: { wall: 0xcbd5e1, roof: 0x991b1b },
    corner_shop: { wall: 0xfef3c7, roof: 0x0f766e },
    clock_tower: { wall: 0xb45309, roof: 0x1e293b },
    joglo_house: { wall: 0xb0804f, roof: 0x7c2d12 },
    stilt_house: { wall: 0x9a7b56, roof: 0x92400e },
    pocket_park: { wall: 0x22c55e, roof: 0x15803d },
  };

  const pal = paletteMap[sc.kind] ?? { wall: 0x64748b, roof: 0x334155 };
  const wallMat = new THREE.MeshStandardMaterial({ color: pal.wall, roughness: 0.85 });
  const roofMat = new THREE.MeshStandardMaterial({ color: pal.roof, roughness: 0.7 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.55 });
  const winMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, emissive: 0x38bdf8, emissiveIntensity: 0.2 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  body.position.y = h / 2;
  group.add(body);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.35, 0.45, d + 0.35), roofMat);
  roof.position.y = h + 0.22;
  group.add(roof);

  // Industrial windows & brass flywheels
  for (let wx = -w * 0.3; wx <= w * 0.3; wx += w * 0.3) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.1, 0.12), winMat);
    win.position.set(wx, h * 0.55, d / 2 + 0.04);
    group.add(win);
  }

  if (sc.kind === 'brick_factory' || sc.kind === 'brick_foundry') {
    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 4.2, 10), roofMat);
    stack.position.set(-w * 0.28, h + 2.1, -d * 0.25);
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.16, 8, 14), brassMat);
    wheel.position.set(w / 2 + 0.12, h * 0.45, 0);
    wheel.rotation.y = Math.PI / 2;
    spinning.push(wheel);
    group.add(stack, wheel);
  }

  if (sc.kind === 'clock_tower') {
    const face = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 0.2, 16),
      new THREE.MeshStandardMaterial({ color: 0xfef9c3, emissive: 0xfde047, emissiveIntensity: 0.35 })
    );
    face.rotation.x = Math.PI / 2;
    face.position.set(0, h - 1.4, d / 2 + 0.08);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.4, 4), brassMat);
    spire.rotation.y = Math.PI / 4;
    spire.position.y = h + 1.4;
    group.add(face, spire);
  }

  disposables.push(() => {
    wallMat.dispose();
    roofMat.dispose();
    brassMat.dispose();
    winMat.dispose();
  });

  return { group, spinning };
}

function buildStage2LandmarkMesh(
  lm: StageLandmarkDef,
  disposables: (() => void)[]
): { group: THREE.Group; spinning: THREE.Object3D[] } {
  const g = new THREE.Group();
  g.position.set(lm.x, stage2GroundHeightAt(lm.x, lm.z), lm.z);
  const spinning: THREE.Object3D[] = [];

  if (lm.kind === 'portal') {
    // Active Stage 3 High-Speed Rail Terminal
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.52,
      roughness: 0.14,
    });
    const gateMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.85,
    });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.45, 10, 24, Math.PI), steelMat);
    arch.position.y = 0.2;
    const dome = new THREE.Mesh(new THREE.BoxGeometry(9.6, 3.8, 5.2), glassMat);
    dome.position.set(0, 1.9, -1.6);
    const gateGlow = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.35, 0.28), gateMat);
    gateGlow.position.set(0, 3.6, 2.2);
    const ring = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), gateMat);
    ring.position.set(0, 4.9, 0);
    spinning.push(ring);
    g.add(arch, dome, gateGlow, ring);

    const lbl = createFloatingLabelSprite(lm.label, '[E] Naik Kereta Cepat -> Stage 3', '#22d3ee');
    lbl.sprite.position.set(0, 6.2, 0);
    lbl.sprite.scale.set(5.4, 1.08, 1);
    g.add(lbl.sprite);
    disposables.push(() => {
      steelMat.dispose();
      glassMat.dispose();
      gateMat.dispose();
      lbl.dispose();
    });
    return { group: g, spinning };
  }

  if (lm.kind === 'generator') {
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.7 });
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.65 });
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.95,
    });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.4, 5.0), baseMat);
    plinth.position.y = 0.7;
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.25, 4.8, 12), copperMat);
    tower.position.y = 3.2;
    const coilRing = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.18, 8, 16), copperMat);
    coilRing.rotation.x = Math.PI / 2;
    coilRing.position.y = 4.9;
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.72, 14, 10), orbMat);
    orb.position.y = 6.1;
    spinning.push(orb);
    g.add(plinth, tower, coilRing, orb);

    const lbl = createFloatingLabelSprite(lm.label, '[E] Inspeksi Energi', '#fbbf24');
    lbl.sprite.position.set(0, 7.6, 0);
    lbl.sprite.scale.set(4.5, 0.95, 1);
    g.add(lbl.sprite);
    disposables.push(() => {
      baseMat.dispose();
      copperMat.dispose();
      orbMat.dispose();
      lbl.dispose();
    });
    return { group: g, spinning };
  }

  if (lm.kind === 'water_monitor') {
    const postMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.5 });
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 0.75,
    });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 2.4, 8), postMat);
    post.position.y = 1.2;
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.95, 0.55), screenMat);
    box.position.y = 2.45;
    g.add(post, box);
    const lbl = createFloatingLabelSprite(lm.label, '[E] Uji Kualitas Air', '#34d399');
    lbl.sprite.position.set(0, 3.8, 0);
    lbl.sprite.scale.set(4.2, 0.9, 1);
    g.add(lbl.sprite);
    disposables.push(() => {
      postMat.dispose();
      screenMat.dispose();
      lbl.dispose();
    });
    return { group: g, spinning };
  }

  // Harbor Cargo Crane (lm-s2-derek-industri)
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.55, metalness: 0.35 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.95, 7.2, 0.95), steelMat);
  mast.position.y = 3.6;
  const boom = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.55, 0.65), steelMat);
  boom.position.set(1.8, 6.9, 0);
  const crate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.4), darkMat);
  crate.position.set(4.2, 4.4, 0);
  g.add(mast, boom, crate);

  const lbl = createFloatingLabelSprite(lm.label, '[E] Inspeksi Derek', '#fb923c');
  lbl.sprite.position.set(0, 8.2, 0);
  lbl.sprite.scale.set(4.4, 0.95, 1);
  g.add(lbl.sprite);
  disposables.push(() => {
    steelMat.dispose();
    darkMat.dispose();
    lbl.dispose();
  });
  return { group: g, spinning };
}

export function createStage2IndustrialWorld(
  textures: WorldTextures
): Stage1OverhaulWorldHandle {
  const root = new THREE.Group();
  const interiorRoofs = new Map<string, THREE.Object3D>();
  const pickupMeshes = new Map<string, THREE.Object3D>();
  const collectibleMeshes = new Map<string, THREE.Object3D>();
  const deliveryMeshes = new Map<string, THREE.Object3D>();
  const disposables: (() => void)[] = [];
  const spinningObjects: THREE.Object3D[] = [];

  // 1. Industrial Terrain Slabs + Roads + Railway
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.95 });
  const westGround = new THREE.Mesh(new THREE.PlaneGeometry(176, 200), groundMat);
  westGround.rotation.x = -Math.PI / 2;
  westGround.position.set(-34, -0.02, 0);
  root.add(westGround);

  // Green Ecological Zone Southwest
  const greenGroundMat = new THREE.MeshStandardMaterial({
    map: textures.sandEarth,
    color: 0x3f8f4e,
    roughness: 0.92,
  });
  const ecoZone = new THREE.Mesh(new THREE.PlaneGeometry(58, 92), greenGroundMat);
  ecoZone.rotation.x = -Math.PI / 2;
  ecoZone.position.set(-85, 0.005, 50);
  root.add(ecoZone);

  // Roads
  const roadMat = new THREE.MeshStandardMaterial({
    map: textures.asphaltRoad,
    color: 0x27272a,
    roughness: 0.9,
  });
  const mainEW = new THREE.Mesh(new THREE.PlaneGeometry(168, 7.6), roadMat);
  mainEW.rotation.x = -Math.PI / 2;
  mainEW.position.set(-28, 0.015, 0);
  const mainNS = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 178), roadMat);
  mainNS.rotation.x = -Math.PI / 2;
  mainNS.position.set(0, 0.015, 0);
  const westLoop = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 160), roadMat);
  westLoop.rotation.x = -Math.PI / 2;
  westLoop.position.set(-36, 0.014, 0);
  const eastLoop = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 152), roadMat);
  eastLoop.rotation.x = -Math.PI / 2;
  eastLoop.position.set(28, 0.014, 0);
  const northLoop = new THREE.Mesh(new THREE.PlaneGeometry(132, 6.2), roadMat);
  northLoop.rotation.x = -Math.PI / 2;
  northLoop.position.set(-16, 0.014, -28);
  const southLoop = new THREE.Mesh(new THREE.PlaneGeometry(132, 6.2), roadMat);
  southLoop.rotation.x = -Math.PI / 2;
  southLoop.position.set(-16, 0.014, 28);
  root.add(mainEW, mainNS, westLoop, eastLoop, northLoop, southLoop);

  // Railway Track at STAGE2_RAIL_X (x = 36) + Stationary Cargo Train Cars
  const railBallastMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.92 });
  const railSteelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.65, roughness: 0.35 });
  const ballast = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.14, 176), railBallastMat);
  ballast.position.set(STAGE2_RAIL_X, 0.07, 0);
  root.add(ballast);
  for (const rx of [-0.75, 0.75]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 176), railSteelMat);
    rail.position.set(STAGE2_RAIL_X + rx, 0.18, 0);
    root.add(rail);
  }
  const sleeperGeo = new THREE.BoxGeometry(2.6, 0.08, 0.28);
  const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
  const sleepers = new THREE.InstancedMesh(sleeperGeo, sleeperMat, 110);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 110; i++) {
    dummy.position.set(STAGE2_RAIL_X, 0.14, -84 + i * 1.55);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    sleepers.setMatrixAt(i, dummy.matrix);
  }
  root.add(sleepers);

  // Freight Train Cars parked at north/south siding
  const trainGroup = new THREE.Group();
  const locoBody = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 2.3, 6.2),
    new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.55 })
  );
  locoBody.position.set(STAGE2_RAIL_X, 1.45, -14);
  const cargoCar = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 2.0, 6.5),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.65 })
  );
  cargoCar.position.set(STAGE2_RAIL_X, 1.3, -21.2);
  trainGroup.add(locoBody, cargoCar);
  root.add(trainGroup);

  // 2. Industrial River + East Harbor Ocean + 2 Arched River Bridges
  const waterTex = textures.waterWave.clone();
  waterTex.needsUpdate = true;
  const waterMat = new THREE.MeshStandardMaterial({
    map: waterTex,
    color: 0x0e7490,
    roughness: 0.22,
    metalness: 0.18,
  });
  const eastOcean = new THREE.Mesh(new THREE.PlaneGeometry(118, 220), waterMat);
  eastOcean.rotation.x = -Math.PI / 2;
  eastOcean.position.set(STAGE2_SHORELINE_X + 58, -0.1, 0);
  const nsRiver = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 66), waterMat);
  nsRiver.rotation.x = -Math.PI / 2;
  nsRiver.position.set(-58, -0.1, 44.5);
  const ewRiver = new THREE.Mesh(new THREE.PlaneGeometry(116, 7.2), waterMat);
  ewRiver.rotation.x = -Math.PI / 2;
  ewRiver.position.set(-3, -0.1, 73.5);
  root.add(eastOcean, nsRiver, ewRiver);

  // 2 Arched Bridges matching stage2GroundHeightAt
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.72 });
  const buildBridge = (cx: number, cz: number, length: number, width: number, alongX: boolean) => {
    const segs = 12;
    for (let i = 0; i < segs; i++) {
      const t = (i + 0.5) / segs;
      const archY = Math.sin(t * Math.PI) * 1.45;
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(alongX ? length / segs + 0.12 : width, 0.24, alongX ? width : length / segs + 0.12),
        bridgeMat
      );
      plank.position.set(
        alongX ? cx - length / 2 + t * length : cx,
        archY - 0.1,
        alongX ? cz : cz - length / 2 + t * length
      );
      root.add(plank);
    }
  };
  buildBridge(-58.0, 28.0, 14.0, 6.8, true);
  buildBridge(10.0, 73.5, 15.0, 7.2, false);

  // 3. Industrial Piers & Boardable Express Return Ship
  const pierMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.78 });
  const mainPier = new THREE.Mesh(new THREE.BoxGeometry(34.5, PIER_HEIGHT + 0.4, 8.8), pierMat);
  mainPier.position.set(68.75, (PIER_HEIGHT - 0.4) / 2, 0);
  const cargoPier = new THREE.Mesh(new THREE.BoxGeometry(24.5, PIER_HEIGHT + 0.4, 7.0), pierMat);
  cargoPier.position.set(63.75, (PIER_HEIGHT - 0.4) / 2, 27.5);
  root.add(mainPier, cargoPier);

  // Boardable Express Passenger Steamship (ship-stage1-return)
  const shipDef = STAGE2_SHIP_DECKS[0];
  const shipGroup = new THREE.Group();
  const shipHullMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });
  const shipDeckMat = new THREE.MeshStandardMaterial({ color: 0x9a6b3e, roughness: 0.75 });
  const shipTrimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
  const hull = new THREE.Mesh(new THREE.BoxGeometry(21, 2.3, 6.8), shipHullMat);
  hull.position.set(74.5, 0.9, 8.85);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(20.6, 0.22, 6.5), shipDeckMat);
  deck.position.set(74.5, shipDef.deckY - 0.11, 8.85);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.1, 4.0), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 }));
  cabin.position.set(78.5, shipDef.deckY + 1.05, 8.85);
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 2.8, 12), shipTrimMat);
  funnel.position.set(78.5, shipDef.deckY + 3.1, 8.85);
  const gangway = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 2.4), shipDeckMat);
  gangway.position.set(73.25, (PIER_HEIGHT + shipDef.deckY) / 2 - 0.08, 4.7);
  gangway.rotation.x = 0.28;
  shipGroup.add(hull, deck, cabin, funnel, gangway);
  const shipLbl = createFloatingLabelSprite('Kapal Ekspres Industri', '[E] Berlayar ke Stage 1', '#38bdf8');
  shipLbl.sprite.position.set(73.2, 5.2, 7.5);
  shipLbl.sprite.scale.set(4.8, 1.0, 1);
  shipGroup.add(shipLbl.sprite);
  root.add(shipGroup);
  disposables.push(() => shipLbl.dispose());

  // 4. Enterable Buildings (8 buildings)
  for (const b of STAGE2_ENTERABLE_BUILDINGS) {
    const built = buildStage2EnterableMesh(b, textures, disposables);
    root.add(built.group);
    interiorRoofs.set(b.id, built.roofGroup);
    spinningObjects.push(...built.spinningParts);
  }

  // Wardrobe mirror ring in Butik Seragam
  const mirrorSpot = STAGE2_WARDROBE_MIRROR_SPOT;
  const mirrorRing = new THREE.Mesh(
    new THREE.RingGeometry(0.65, 0.9, 18),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
  );
  mirrorRing.rotation.x = -Math.PI / 2;
  mirrorRing.position.set(mirrorSpot.x, mirrorSpot.yOffset + 0.05, mirrorSpot.z);
  root.add(mirrorRing);

  // Factory Interactive Station Consoles
  for (const st of STAGE2_FACTORY_STATIONS) {
    const g = new THREE.Group();
    g.position.set(st.x, st.yOffset, st.z);
    const consoleBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.15, 0.75),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    consoleBox.position.y = 0.58;
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.52, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.85 })
    );
    screen.position.set(0, 0.85, 0.38);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.25, 22),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    const lbl = createFloatingLabelSprite(st.label, '[E] Kelola Produksi Pabrik', '#fbbf24');
    lbl.sprite.position.set(0, 2.05, 0);
    lbl.sprite.scale.set(3.8, 0.85, 1);
    disposables.push(lbl.dispose);
    g.add(consoleBox, screen, ring, lbl.sprite);
    root.add(g);
  }

  // 5. Scenery Buildings + Landmarks + Signboards
  for (const sc of getStage2SceneryBuildings()) {
    const built = buildStage2SceneryMesh(sc, disposables);
    root.add(built.group);
    spinningObjects.push(...built.spinning);
  }
  for (const lm of getStage2Landmarks()) {
    if (lm.id === 'lm-s2-ship-return') continue;
    const built = buildStage2LandmarkMesh(lm, disposables);
    root.add(built.group);
    spinningObjects.push(...built.spinning);
  }

  const signDefs: [string, string, number, number, string, string][] = [
    ['KAWASAN INDUSTRI', 'Pabrik & Energi Barat', -38, -14, '#7c2d12', '#fb923c'],
    ['LOGISTIK & GUDANG', 'Rantai Pasok Selatan', -2, 30, '#334155', '#facc15'],
    ['KOMERSIAL & GROSIR', 'Perdagangan & Stage 3 Gate', 2, -30, '#312e81', '#a78bfa'],
    ['PELABUHAN INDUSTRI', 'Kapal Ekspres & Rel', 48, 8, '#0c4a6e', '#38bdf8'],
  ];
  for (const [title, sub, sx, sz, bg, bd] of signDefs) {
    const sg = createIndustrialSignboard(title, sub, bg, bd, disposables);
    sg.position.set(sx, 0, sz);
    root.add(sg);
  }

  // 6. Pickups, Collectibles, Delivery Spots, Quest Beacon
  for (const pk of STAGE2_WORLD_PICKUPS) {
    const g = new THREE.Group();
    g.position.set(pk.x, pk.yOffset ?? stage2GroundHeightAt(pk.x, pk.z), pk.z);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.78, 18),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.64, 0.56, 0.64),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.45 })
    );
    box.position.y = 0.55;
    box.name = 'floating-node';
    const lbl = createFloatingLabelSprite(pk.label, '[E] Ambil Bahan/Paket', '#fbbf24');
    lbl.sprite.position.set(0, 1.65, 0);
    lbl.sprite.scale.set(3.4, 0.76, 1);
    disposables.push(lbl.dispose);
    g.add(ring, box, lbl.sprite);
    root.add(g);
    pickupMeshes.set(pk.id, g);
  }

  for (const col of STAGE2_COLLECTIBLES) {
    const g = new THREE.Group();
    g.position.set(col.x, col.yOffset ?? stage2GroundHeightAt(col.x, col.z), col.z);
    const rColor = RARITY_COLOR[col.rarity];
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.55, 0.25, 12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
    );
    pedestal.position.y = 0.125;
    const relic = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.42, 0),
      new THREE.MeshStandardMaterial({ color: rColor, emissive: rColor, emissiveIntensity: 0.78 })
    );
    relic.position.y = 0.85;
    relic.name = 'floating-node';
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.62, 0.85, 20),
      new THREE.MeshBasicMaterial({ color: rColor, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    const lbl = createFloatingLabelSprite(col.name, `${col.rarity} · [E] Koleksi`, '#38bdf8');
    lbl.sprite.position.set(0, 1.9, 0);
    lbl.sprite.scale.set(3.5, 0.78, 1);
    disposables.push(lbl.dispose);
    g.add(pedestal, relic, ring, lbl.sprite);
    root.add(g);
    collectibleMeshes.set(col.id, g);
  }

  for (const del of STAGE2_DELIVERY_SPOTS) {
    const g = new THREE.Group();
    g.position.set(del.x, del.yOffset ?? stage2GroundHeightAt(del.x, del.z), del.z);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.88, 1.2, 22),
      new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    const marker = new THREE.Mesh(
      new THREE.ConeGeometry(0.36, 0.75, 4),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.75 })
    );
    marker.rotation.x = Math.PI;
    marker.position.y = 1.25;
    marker.name = 'floating-node';
    const lbl = createFloatingLabelSprite(del.label, '[E] Setor / Jual Barang', '#34d399');
    lbl.sprite.position.set(0, 2.2, 0);
    lbl.sprite.scale.set(3.8, 0.82, 1);
    disposables.push(lbl.dispose);
    g.add(ring, marker, lbl.sprite);
    root.add(g);
    deliveryMeshes.set(del.id, g);
  }

  // Quest Beacon
  const questBeacon = new THREE.Group();
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.85, 18, 14, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  beam.position.y = 9.0;
  const beaconDiamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55, 0),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf97316, emissiveIntensity: 1.0 })
  );
  beaconDiamond.position.y = 3.8;
  beaconDiamond.name = 'beacon-diamond';
  questBeacon.add(beam, beaconDiamond);
  root.add(questBeacon);

  // 7. Animated Crowd Patrols
  const crowd: CrowdRuntime[] = getStage2CrowdPatrols().map((def) => {
    const rig = createCrowdCitizenRig(def);
    const start = def.waypoints[0];
    rig.root.position.set(start.x, stage2GroundHeightAt(start.x, start.z), start.z);
    root.add(rig.root);
    return {
      def,
      rig,
      wpIndex: 1 % def.waypoints.length,
      x: start.x,
      z: start.z,
      yaw: 0,
      pauseTimer: 0,
      walkCycle: 0,
    };
  });

  disposables.push(() => {
    groundMat.dispose();
    greenGroundMat.dispose();
    roadMat.dispose();
    railBallastMat.dispose();
    railSteelMat.dispose();
    sleeperGeo.dispose();
    sleeperMat.dispose();
    waterTex.dispose();
    waterMat.dispose();
    bridgeMat.dispose();
    pierMat.dispose();
    shipHullMat.dispose();
    shipDeckMat.dispose();
    shipTrimMat.dispose();
  });

  const update = (elapsed: number, dt: number) => {
    waterTex.offset.x = (elapsed * 0.03) % 1;
    waterTex.offset.y = (elapsed * 0.02) % 1;

    shipGroup.position.y = Math.sin(elapsed * 1.1) * 0.1;

    for (const sp of spinningObjects) {
      sp.rotation.z += dt * 1.6;
      sp.rotation.y += dt * 0.6;
    }

    for (const [, m] of pickupMeshes) {
      if (!m.visible) continue;
      const node = m.getObjectByName('floating-node');
      if (node) {
        node.rotation.y += dt * 1.7;
        node.position.y = 0.55 + Math.sin(elapsed * 2.5 + m.position.x) * 0.12;
      }
    }
    for (const [, m] of collectibleMeshes) {
      if (!m.visible) continue;
      const node = m.getObjectByName('floating-node');
      if (node) {
        node.rotation.y += dt * 2.1;
        node.position.y = 0.85 + Math.sin(elapsed * 2.8 + m.position.z) * 0.14;
      }
    }
    for (const [, m] of deliveryMeshes) {
      if (!m.visible) continue;
      const node = m.getObjectByName('floating-node');
      if (node) {
        node.rotation.y += dt * 1.5;
        node.position.y = 1.2 + Math.sin(elapsed * 3.0) * 0.12;
      }
    }

    const bd = questBeacon.getObjectByName('beacon-diamond');
    if (bd && questBeacon.visible) {
      bd.rotation.y += dt * 2.0;
      bd.position.y = 3.6 + Math.sin(elapsed * 2.6) * 0.25;
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
      agent.walkCycle += step * 1.9;

      const y = stage2GroundHeightAt(agent.x, agent.z);
      agent.rig.root.position.set(agent.x, y, agent.z);
      agent.rig.root.rotation.y = agent.yaw;

      const swing = Math.sin(agent.walkCycle) * 0.55;
      agent.rig.leftLeg.rotation.x = swing;
      agent.rig.rightLeg.rotation.x = -swing;
      agent.rig.leftArm.rotation.x = -swing * 0.75;
      agent.rig.rightArm.rotation.x = swing * 0.75;
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
