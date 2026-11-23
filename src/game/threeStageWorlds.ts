import * as THREE from 'three';
import { StageNumber } from './types';
import {
  CrowdPatrolDef,
  getStageCrowdPatrols,
  getStageLandmarks,
  getStageSceneryBuildings,
  groundHeightAt,
  PIER_HEIGHT,
  SceneryBuildingDef,
  StageLandmarkDef,
} from './world3dPhysics';
import { createCrowdCitizenRig, CrowdCitizenRig, WorldTextures } from './threeWorldBuilder';

export interface StageWorldHandle {
  root: THREE.Group;
  update: (elapsed: number, dt: number) => void;
  dispose: () => void;
}

interface CrowdAgentRuntime {
  def: CrowdPatrolDef;
  rig: CrowdCitizenRig;
  wpIndex: number;
  x: number;
  z: number;
  yaw: number;
  pauseTimer: number;
  walkCycle: number;
}

interface MovingVehicleRuntime {
  group: THREE.Group;
  waypoints: { x: number; z: number }[];
  wpIndex: number;
  speed: number;
  x: number;
  z: number;
  yaw: number;
}

interface AnimRefs {
  gears: THREE.Object3D[];
  smokePuffs: { mesh: THREE.Mesh; baseY: number; phase: number }[];
  ships: { group: THREE.Group; baseY: number; phase: number; rollAmp: number }[];
  rotors: THREE.Group[];
  trainGroup: THREE.Group | null;
  monorailGroup: THREE.Group | null;
  crowd: CrowdAgentRuntime[];
  vehicles: MovingVehicleRuntime[];
  particles: THREE.Points | null;
  particleBaseY: Float32Array | null;
  palmSway: {
    spots: [number, number][];
    frondsA: THREE.InstancedMesh;
    frondsB: THREE.InstancedMesh;
    crowns: THREE.InstancedMesh;
  } | null;
  birds: { group: THREE.Group; wingL: THREE.Object3D; wingR: THREE.Object3D; cx: number; cz: number; rx: number; rz: number; y: number; speed: number; phase: number }[];
  critters: { group: THREE.Group; cx: number; cz: number; r: number; speed: number; phase: number }[];
  banners: { mesh: THREE.Object3D; baseRot: number; phase: number }[];
  craneArms: { arm: THREE.Object3D; crate: THREE.Object3D; phase: number }[];
  surfFoam: THREE.Mesh | null;
  disposables: (() => void)[];
}

const _swayDummy = new THREE.Object3D();

function addContactShadow(parent: THREE.Group, radius: number, y = 0.025) {
  const geo = new THREE.CircleGeometry(radius, 18);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x0b1215,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(geo, mat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = y;
  parent.add(shadow);
}

function createSailingShip(
  textures: WorldTextures,
  scale = 1.0,
  striped = true,
  masts: 1 | 2 = 2,
  hullTint = 0x7c4a26
): THREE.Group {
  const ship = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({
    map: textures.woodPlank,
    color: hullTint,
    roughness: 0.78,
  });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.55 });
  const mastMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.85 });
  const sailMat = new THREE.MeshStandardMaterial({
    ...(striped ? { map: textures.sailStripe } : {}),
    color: striped ? 0xffffff : 0xf5ecd7,
    roughness: 0.92,
    side: THREE.DoubleSide,
  });

  const hull = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.5, 11.2), hullMat);
  hull.position.y = 0.55;
  hull.castShadow = true;
  const bow = new THREE.Mesh(new THREE.ConeGeometry(1.9, 3.5, 4), hullMat);
  bow.rotation.x = Math.PI / 2;
  bow.rotation.y = Math.PI / 4;
  bow.scale.set(1, 1, 0.65);
  bow.position.set(0, 0.8, 7.0);
  const bowsprit = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 4.0, 8), mastMat);
  bowsprit.rotation.x = Math.PI / 2.6;
  bowsprit.position.set(0, 1.85, 7.6);

  const sternCabin = new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.3, 3.0), trimMat);
  sternCabin.position.set(0, 1.75, -3.5);

  const mainMast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 9.2, 8), mastMat);
  mainMast.position.set(0, 5.2, 0.6);
  const mainSail = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 5.0), sailMat);
  mainSail.rotation.y = Math.PI / 2;
  mainSail.position.set(0.3, 5.4, 0.6);

  ship.add(hull, bow, bowsprit, sternCabin, mainMast, mainSail);

  if (masts === 2) {
    const foreMast = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 7.0, 8), mastMat);
    foreMast.position.set(0, 4.3, 4.0);
    const foreSail = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.6), sailMat);
    foreSail.rotation.y = Math.PI / 2;
    foreSail.position.set(0.28, 4.4, 4.0);
    ship.add(foreMast, foreSail);
  }

  const crateMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.85 });
  const crate1 = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.85, 1.05), crateMat);
  crate1.position.set(-0.7, 1.68, -0.7);
  const crate2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.78, 0.9), crateMat);
  crate2.position.set(0.75, 1.62, 2.0);
  ship.add(crate1, crate2);

  ship.scale.setScalar(scale);
  return ship;
}

function createSampanBoat(textures: WorldTextures): THREE.Group {
  const boat = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ map: textures.woodPlank, color: 0x8c552b, roughness: 0.8 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xd6b88d, roughness: 0.9 });
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.65, 4.6), hullMat);
  hull.position.y = 0.25;
  const prow = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.6, 4), hullMat);
  prow.rotation.x = Math.PI / 2;
  prow.rotation.y = Math.PI / 4;
  prow.position.set(0, 0.35, 3.0);
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.8, 8, 1, false, 0, Math.PI), roofMat);
  canopy.rotation.z = Math.PI / 2;
  canopy.rotation.y = Math.PI / 2;
  canopy.position.set(0, 0.58, -0.4);
  boat.add(hull, prow, canopy);
  return boat;
}

function createSteamCargoShip(scale = 1.0, containerColor = 0x9a3412): THREE.Group {
  const ship = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65, metalness: 0.35 });
  const deckMat = new THREE.MeshStandardMaterial({ color: containerColor, roughness: 0.78 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
  const stackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.45 });

  const hull = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.8, 13.5), hullMat);
  hull.position.y = 0.6;
  const bow = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.4, 4), hullMat);
  bow.rotation.x = Math.PI / 2;
  bow.rotation.y = Math.PI / 4;
  bow.scale.set(1, 1, 0.6);
  bow.position.set(0, 0.85, 8.2);
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.4, 3.2), whiteMat);
  bridge.position.set(0, 2.6, -3.5);
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 3.0, 12), stackMat);
  funnel.position.set(0, 4.4, -3.2);
  const containerA = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 4.0), deckMat);
  containerA.position.set(0, 2.2, 2.2);

  ship.add(hull, bow, bridge, funnel, containerA);
  ship.scale.setScalar(scale);
  return ship;
}

function createRoadVehicleMesh(kind: 'truck' | 'ev_car' | 'eco_bus', bodyColor: number): THREE.Group {
  const v = new THREE.Group();
  addContactShadow(v, kind === 'eco_bus' ? 1.8 : 1.35, 0.03);

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.42, metalness: 0.25 });
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, metalness: 0.6 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfacc15,
    emissiveIntensity: 0.85,
  });

  if (kind === 'truck') {
    const cargo = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.3, 2.4), bodyMat);
    cargo.position.set(0, 1.0, -0.55);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.05, 1.15), cabMat);
    cab.position.set(0, 0.88, 1.25);
    const wind = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.45, 0.12), glassMat);
    wind.position.set(0, 1.08, 1.82);
    v.add(cargo, cab, wind);
  } else if (kind === 'eco_bus') {
    const bus = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.6, 4.1), bodyMat);
    bus.position.set(0, 1.1, 0);
    const windowStrip = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.56, 3.6), glassMat);
    windowStrip.position.set(0, 1.35, 0.05);
    const roofTrim = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.16, 3.5), cabMat);
    roofTrim.position.set(0, 1.98, 0);
    v.add(bus, windowStrip, roofTrim);
  } else {
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.62, 2.8), bodyMat);
    chassis.position.set(0, 0.58, 0);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.52, 1.5), glassMat);
    cabin.position.set(0, 1.12, -0.1);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 1.35), cabMat);
    roof.position.set(0, 1.4, -0.1);
    v.add(chassis, cabin, roof);
  }

  for (const wx of [-0.74, 0.74]) {
    for (const wz of kind === 'eco_bus' ? [-1.35, 1.35] : [-0.9, 0.95]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.22, 10), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.28, wz);
      v.add(wheel);
    }
  }
  const frontZ = kind === 'eco_bus' ? 2.06 : kind === 'truck' ? 1.84 : 1.41;
  for (const lx of [-0.46, 0.46]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.08), lampMat);
    hl.position.set(lx, 0.56, frontZ);
    v.add(hl);
  }

  return v;
}

function createAreaSignboardMesh(
  title: string,
  subtitle: string,
  bgHex: string,
  borderHex: string,
  disposables: (() => void)[]
): THREE.Group {
  const g = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.85 });
  for (const sx of [-1.05, 1.05]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.75, 7), postMat);
    post.position.set(sx, 1.375, 0);
    g.add(post);
  }
  const c = document.createElement('canvas');
  c.width = 384;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 384, 128);
  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 372, 116);
  ctx.fillStyle = '#fef3c7';
  ctx.textAlign = 'center';
  ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
  ctx.fillText(title, 192, 56);
  ctx.fillStyle = borderHex;
  ctx.font = '600 20px system-ui, -apple-system, sans-serif';
  ctx.fillText(subtitle, 192, 94);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const boardMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.65 });
  const backMat = new THREE.MeshStandardMaterial({ color: 0x452715, roughness: 0.85 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.88, 0.14), [
    backMat,
    backMat,
    backMat,
    backMat,
    boardMat,
    boardMat,
  ]);
  board.position.set(0, 2.35, 0);
  g.add(board);

  disposables.push(() => {
    tex.dispose();
    boardMat.dispose();
  });
  return g;
}

function createStage1VehicleMesh(
  kind: 'handcart' | 'bicycle' | 'oxcart' | 'fishing_jukung',
  accentColor: number
): THREE.Group {
  const g = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x7c4a26, roughness: 0.82 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x452715, roughness: 0.88 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.55 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.72 });
  const crateMat = new THREE.MeshStandardMaterial({ color: 0xc28a46, roughness: 0.82 });
  const sackMat = new THREE.MeshStandardMaterial({ color: 0xd6b88d, roughness: 0.92 });

  if (kind !== 'fishing_jukung') {
    addContactShadow(g, kind === 'bicycle' ? 0.65 : 1.15, 0.03);
  }

  if (kind === 'handcart') {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.22, 1.8), woodMat);
    bed.position.y = 0.52;
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.1, 1.5), accentMat);
    canopy.position.y = 1.65;
    for (const px of [-0.52, 0.52]) {
      for (const pz of [-0.65, 0.65]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.12, 6), darkWoodMat);
        post.position.set(px, 1.08, pz);
        g.add(post);
      }
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.12, 12), darkWoodMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(px * 1.18, 0.36, -0.1);
      g.add(wheel);
    }
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.46, 0.55), crateMat);
    crate.position.set(-0.22, 0.84, 0.15);
    const sack = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), sackMat);
    sack.scale.set(1.1, 0.85, 1.3);
    sack.position.set(0.26, 0.78, -0.25);
    g.add(bed, canopy, crate, sack);
  } else if (kind === 'bicycle') {
    for (const wz of [-0.55, 0.55]) {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 8, 16), metalMat);
      wheel.rotation.y = Math.PI / 2;
      wheel.position.set(0, 0.34, wz);
      g.add(wheel);
    }
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.15), accentMat);
    frame.position.set(0, 0.62, 0);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.56, 6), metalMat);
    stem.position.set(0, 0.74, 0.38);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.05, 0.05), metalMat);
    handle.position.set(0, 1.02, 0.38);
    const basket = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.24), crateMat);
    basket.position.set(0, 0.85, 0.54);
    // Rider figure
    const riderShirt = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.52, 0.24),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.8 })
    );
    riderShirt.position.set(0, 1.12, -0.1);
    riderShirt.rotation.x = 0.25;
    const riderHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xe3b184, roughness: 0.68 })
    );
    riderHead.position.set(0, 1.54, 0.02);
    const caping = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.14, 10), crateMat);
    caping.position.set(0, 1.72, 0.02);
    g.add(frame, stem, handle, basket, riderShirt, riderHead, caping);
  } else if (kind === 'oxcart') {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.25, 2.3), woodMat);
    bed.position.y = 0.58;
    const archRoof = new THREE.Mesh(
      new THREE.CylinderGeometry(0.76, 0.76, 1.9, 10, 1, false, 0, Math.PI),
      sackMat
    );
    archRoof.rotation.z = Math.PI / 2;
    archRoof.rotation.y = Math.PI / 2;
    archRoof.position.set(0, 1.25, -0.1);
    for (const wx of [-0.82, 0.82]) {
      for (const wz of [-0.75, 0.75]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.12, 12), darkWoodMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.36, wz);
        g.add(wheel);
      }
    }
    const cargo = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.55, 0.9), crateMat);
    cargo.position.set(0, 0.96, 0.45);
    g.add(bed, archRoof, cargo);
  } else {
    // Traditional fishing Jukung outrigger boat
    const hull = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.42, 3.8), woodMat);
    hull.position.y = 0.22;
    const prow = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.3, 4), accentMat);
    prow.rotation.x = Math.PI / 2;
    prow.rotation.y = Math.PI / 4;
    prow.position.set(0, 0.32, 2.4);
    for (const side of [-1, 1]) {
      const boom = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.08), darkWoodMat);
      boom.position.set(side * 0.95, 0.36, 0);
      const floatLog = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.0, 6), sackMat);
      floatLog.rotation.x = Math.PI / 2;
      floatLog.position.set(side * 1.45, 0.14, 0);
      g.add(boom, floatLog);
    }
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.6, 6), darkWoodMat);
    mast.position.set(0, 1.5, 0.2);
    const sail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.5, 1.35), accentMat);
    sail.position.set(0, 1.75, -0.3);
    g.add(hull, prow, mast, sail);
  }

  return g;
}

function createLandmarkMesh(
  lm: StageLandmarkDef,
  textures: WorldTextures,
  animRefs: AnimRefs
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(lm.x, 0, lm.z);
  group.rotation.y = lm.yaw;

  const woodMat = new THREE.MeshStandardMaterial({ map: textures.woodPlank, roughness: 0.82 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe7dcc8, roughness: 0.85 });
  const roofMat = new THREE.MeshStandardMaterial({ map: textures.roofTile, roughness: 0.72 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.55 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 });
  const brickMat = new THREE.MeshStandardMaterial({ map: textures.brickWall, color: 0xffffff, roughness: 0.82 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.6 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.32, metalness: 0.72 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.12,
    metalness: 0.65,
    transparent: true,
    opacity: 0.82,
  });
  const whiteTechMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.45 });
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.2, metalness: 0.65 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.85 });

  addContactShadow(group, Math.max(lm.halfW, lm.halfD) * 1.2);

  if (lm.kind === 'market') {
    const counter = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.0, 2.4), woodMat);
    counter.position.y = 0.5;
    const awningMat = new THREE.MeshStandardMaterial({
      map: textures.sailStripe,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const awning = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.16, 3.0), awningMat);
    awning.position.set(0, 2.85, 0);
    awning.rotation.x = 0.16;
    for (const px of [-1.7, 1.7]) {
      for (const pz of [-1.1, 1.1]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8), woodMat);
        post.position.set(px, 1.4, pz);
        group.add(post);
      }
    }
    const bowlColors = [0xb45309, 0xd97706, 0x15803d, 0x991b1b];
    for (let i = 0; i < 4; i++) {
      const bowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.22, 0.26, 12),
        new THREE.MeshStandardMaterial({ color: bowlColors[i], roughness: 0.6 })
      );
      bowl.position.set(-1.2 + i * 0.8, 1.12, 0.4);
      group.add(bowl);
    }
    // Market sign plaque, hanging warm lantern & spice sacks beside counter
    const signBar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.42, 0.12), goldMat);
    signBar.position.set(0, 2.58, 1.45);
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xf59e0b, emissiveIntensity: 0.9 })
    );
    lantern.position.set(-1.35, 2.25, 1.25);
    const umbrellaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.5, 6), woodMat);
    umbrellaPole.position.set(2.35, 1.25, 0.85);
    const umbrellaTop = new THREE.Mesh(
      new THREE.ConeGeometry(1.15, 0.45, 8),
      new THREE.MeshStandardMaterial({
        color: lm.id === 'lm-pasar-1' ? 0xd97706 : 0xbe123c,
        roughness: 0.78,
      })
    );
    umbrellaTop.position.set(2.35, 2.55, 0.85);
    const sackMat = new THREE.MeshStandardMaterial({ color: 0xd6b88d, roughness: 0.92 });
    const sack = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), sackMat);
    sack.scale.set(1.1, 0.9, 1.25);
    sack.position.set(-2.15, 0.34, 0.6);
    group.add(counter, awning, signBar, lantern, umbrellaPole, umbrellaTop, sack);
  } else if (lm.kind === 'warehouse') {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.45, 4.0), stoneMat);
    plinth.position.y = 0.225;
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.6, 3.6), woodMat);
    body.position.y = 1.75;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.9, 1.8, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 3.9;
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.0, 0.15), stoneMat);
    door.position.set(0, 1.4, 1.82);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.9, 12), woodMat);
    barrel.position.set(2.0, 0.45, 2.1);
    group.add(plinth, body, roof, door, barrel);
  } else if (lm.kind === 'house') {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.4, 4.0), stoneMat);
    plinth.position.y = 0.2;
    const walls = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.1, 3.4), wallMat);
    walls.position.y = 1.45;
    const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.2, 4), roofMat);
    lowerRoof.rotation.y = Math.PI / 4;
    lowerRoof.position.y = 3.0;
    const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.3, 4), roofMat);
    upperRoof.rotation.y = Math.PI / 4;
    upperRoof.position.y = 3.85;
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.6, 0.12), woodMat);
    door.position.set(0, 1.2, 1.72);
    group.add(plinth, walls, lowerRoof, upperRoof, door);
  } else if (lm.kind === 'booth') {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 3.2), woodMat);
    deck.position.y = 0.25;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.0, 2.4), wallMat);
    cabin.position.y = 1.45;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.7, 1.35, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 3.1;
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.35, 12), goldMat);
    bell.position.set(0, 2.2, 1.35);
    group.add(deck, cabin, roof, bell);
  } else if (lm.kind === 'factory') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.5, 5.0), stoneMat);
    base.position.y = 0.25;
    const hall = new THREE.Mesh(new THREE.BoxGeometry(5.8, 3.4, 4.4), brickMat);
    hall.position.y = 2.2;
    hall.castShadow = true;
    const roofCap = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.5, 4.6), ironMat);
    roofCap.position.y = 4.1;
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 4.2, 10), copperMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, 3.2, 2.35);

    const smokeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.72,
      roughness: 0.95,
    });
    for (const sx of [-1.6, 1.6]) {
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.62, 4.6, 12), ironMat);
      stack.position.set(sx, 5.8, -1.2);
      group.add(stack);

      for (let p = 0; p < 2; p++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.55 + p * 0.2, 10, 8), smokeMat);
        puff.position.set(sx, 8.4 + p * 1.4, -1.2);
        group.add(puff);
        animRefs.smokePuffs.push({ mesh: puff, baseY: 8.3, phase: p * 1.8 + sx });
      }
    }
    group.add(base, hall, roofCap, pipe);
  } else if (lm.kind === 'generator') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.5, 4.6), stoneMat);
    base.position.y = 0.25;
    const housing = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.8, 3.6), brickMat);
    housing.position.y = 1.9;
    const coilMast = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.65, 3.2, 12), ironMat);
    coilMast.position.set(-1.1, 4.4, 0);
    const electricOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.68, 14, 12),
      new THREE.MeshStandardMaterial({
        color: 0x7dd3fc,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.9,
        roughness: 0.15,
      })
    );
    electricOrb.position.set(-1.1, 6.2, 0);

    const gearWheel = new THREE.Group();
    gearWheel.position.set(1.2, 3.3, 2.0);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.2, 8, 18), copperMat);
    const spokeA = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.22, 0.22), copperMat);
    const spokeB = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.3, 0.22), copperMat);
    gearWheel.add(rim, spokeA, spokeB);
    animRefs.gears.push(gearWheel);

    group.add(base, housing, coilMast, electricOrb, gearWheel);
  } else if (lm.kind === 'station') {
    const platform = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.45, 4.2), stoneMat);
    platform.position.y = 0.225;
    const depot = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.6, 3.2), brickMat);
    depot.position.y = 1.75;
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.25, 4.2), ironMat);
    canopy.position.y = 3.2;
    const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16), copperMat);
    clock.rotation.x = Math.PI / 2;
    clock.position.set(0, 3.9, 1.6);
    group.add(platform, depot, canopy, clock);
  } else if (lm.kind === 'skyscraper') {
    const podium = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.4, 5.6), whiteTechMat);
    podium.position.y = 0.7;
    const tower = new THREE.Mesh(new THREE.BoxGeometry(4.4, 8.6, 4.4), glassMat);
    tower.position.y = 5.7;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.65, 8.2, 2.0), whiteTechMat);
    frame.position.y = 5.6;
    const skyGarden = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.5, 4.2), leafMat);
    skyGarden.position.y = 10.2;
    const solar = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.16, 2.6), solarMat);
    solar.position.set(0, 10.9, 0);
    solar.rotation.x = 0.22;
    group.add(podium, tower, frame, skyGarden, solar);
  } else if (lm.kind === 'ecodome') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.3, 0.6, 20), whiteTechMat);
    base.position.y = 0.3;
    const innerTree = new THREE.Mesh(new THREE.DodecahedronGeometry(1.7, 1), leafMat);
    innerTree.position.y = 2.0;
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(2.9, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.52),
      glassMat
    );
    dome.position.y = 0.6;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.12, 8, 24), whiteTechMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.6;
    group.add(base, innerTree, dome, ring);
  } else if (lm.kind === 'solar_hub') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.5, 4.4), whiteTechMat);
    base.position.y = 0.25;
    const concourse = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.8, 3.4), glassMat);
    concourse.position.y = 1.9;
    const solarRoof = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.25, 4.4), solarMat);
    solarRoof.position.y = 3.6;
    solarRoof.rotation.x = 0.15;
    group.add(base, concourse, solarRoof);
  } else if (lm.kind === 'park_gazebo') {
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.85, 0.38, 16), whiteTechMat);
    deck.position.y = 0.19;
    const dome = new THREE.Mesh(new THREE.ConeGeometry(1.75, 1.25, 8), glassMat);
    dome.position.y = 2.95;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.15, 8), whiteTechMat);
      col.position.set(Math.cos(a) * 1.18, 1.38, Math.sin(a) * 1.18);
      group.add(col);
    }
    group.add(deck, dome);
  } else if (lm.kind === 'harbor_crane') {
    group.position.y = PIER_HEIGHT;
    const timberBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.32, 1.3), woodMat);
    timberBase.position.y = 0.16;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 3.6, 8), woodMat);
    mast.position.y = 1.95;
    const armPivot = new THREE.Group();
    armPivot.position.set(0, 3.65, 0);
    const jib = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 0.22), woodMat);
    jib.position.set(0.95, 0.25, 0);
    jib.rotation.z = 0.24;
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.65, 6), stoneMat);
    rope.position.set(2.05, -0.45, 0);
    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.68, 0.75),
      new THREE.MeshStandardMaterial({ map: textures.woodPlank, color: 0xe6b87a, roughness: 0.78 })
    );
    crate.position.set(2.05, -1.45, 0);
    armPivot.add(jib, rope, crate);
    group.add(timberBase, mast, armPivot);
    animRefs.craneArms.push({ arm: armPivot, crate, phase: 0.4 });
  } else if (lm.kind === 'ship_dock') {
    group.position.y = PIER_HEIGHT;
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.8), woodMat);
    desk.position.set(0, 0.45, 0);
    const bollardA = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.75, 10), stoneMat);
    bollardA.position.set(-0.65, 0.375, 0.5);
    const bollardB = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.75, 10), stoneMat);
    bollardB.position.set(0.65, 0.375, 0.5);
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xf59e0b, emissiveIntensity: 0.85 })
    );
    lantern.position.set(0, 1.65, 0);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.5, 6), woodMat);
    pole.position.set(0, 0.9, 0);
    group.add(desk, bollardA, bollardB, pole, lantern);
  } else {
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.8, 1.7), stoneMat);
    base.position.y = 0.4;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.6, 1.2), stoneMat);
    shaft.position.y = 2.1;
    const crown = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.3, 4), goldMat);
    crown.rotation.y = Math.PI / 4;
    crown.position.y = 4.05;
    group.add(base, shaft, crown);
  }

  return group;
}

function createSceneryBuildingMesh(
  sc: SceneryBuildingDef,
  textures: WorldTextures,
  animRefs: AnimRefs
): THREE.Group {
  const g = new THREE.Group();
  g.position.set(sc.x, 0, sc.z);
  g.rotation.y = sc.yaw;

  const w = sc.halfW * 2;
  const d = sc.halfD * 2;

  const woodMat = new THREE.MeshStandardMaterial({ map: textures.woodPlank, roughness: 0.82 });
  const roofMat = new THREE.MeshStandardMaterial({ map: textures.roofTile, roughness: 0.72 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 });
  const brickMat = new THREE.MeshStandardMaterial({
    map: textures.brickWall,
    color: sc.variant % 2 === 0 ? 0xffffff : 0xe5d5cb,
    roughness: 0.82,
  });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.42, metalness: 0.55 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.65 });
  const stuccoPal = [0xefe3ce, 0xf3e8d2, 0xe2d5be, 0xf5ebe0];
  const wallMat = new THREE.MeshStandardMaterial({
    color: stuccoPal[sc.variant % stuccoPal.length],
    roughness: 0.86,
  });

  if (sc.kind !== 'pocket_park') {
    addContactShadow(g, Math.max(sc.halfW, sc.halfD) * 1.15);
  }

  switch (sc.kind) {
    case 'joglo_house': {
      const roofPal = [0x9c4327, 0x7c2d12, 0x854d0e, 0xa16207];
      const varRoofMat = new THREE.MeshStandardMaterial({
        map: textures.roofTile,
        color: sc.variant === 0 ? 0xffffff : roofPal[sc.variant % roofPal.length],
        roughness: 0.74,
      });
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.35, d * 0.96), stoneMat);
      plinth.position.y = 0.175;
      const body = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, 1.9, d * 0.78), wallMat);
      body.position.y = 1.3;
      const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.72, 1.05, 4), varRoofMat);
      lowerRoof.rotation.y = Math.PI / 4;
      lowerRoof.position.y = 2.75;
      const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.4, 1.1, 4), varRoofMat);
      upperRoof.rotation.y = Math.PI / 4;
      upperRoof.position.y = 3.55;
      const ridge = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 4), copperMat);
      ridge.position.y = 4.2;
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.38, 0.1), woodMat);
      door.position.set(0, 1.04, d * 0.39 + 0.03);
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xf59e0b, emissiveIntensity: 0.8 })
      );
      lamp.position.set(w * 0.28, 1.95, d * 0.44);
      g.add(plinth, body, lowerRoof, upperRoof, ridge, door, lamp);
      for (const px of [-w * 0.36, w * 0.36]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.9, 6), woodMat);
        post.position.set(px, 1.3, d * 0.44);
        g.add(post);
      }
      break;
    }

    case 'stilt_house': {
      const stiltH = 0.85;
      for (const sx of [-w * 0.34, w * 0.34]) {
        for (const sz of [-d * 0.34, d * 0.34]) {
          const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, stiltH + 0.3, 6), woodMat);
          stilt.position.set(sx, stiltH * 0.5, sz);
          g.add(stilt);
        }
      }
      const deck = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, 0.18, d * 0.94), woodMat);
      deck.position.y = stiltH;
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(w * 0.78, 1.75, d * 0.76), wallMat);
      cabin.position.y = stiltH + 0.96;
      const thatchRoof = new THREE.MeshStandardMaterial({
        map: textures.roofTile,
        color: sc.variant % 2 === 0 ? 0xd4a373 : 0xffffff,
        roughness: 0.85,
      });
      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.7, 1.35, 4), thatchRoof);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = stiltH + 2.45;
      const steps = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.45, 0.55), woodMat);
      steps.position.set(0, 0.42, d * 0.45);
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xf59e0b, emissiveIntensity: 0.75 })
      );
      lamp.position.set(-w * 0.3, stiltH + 1.5, d * 0.42);
      g.add(deck, cabin, roof, steps, lamp);
      break;
    }

    case 'pendopo_hall': {
      const floor = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, 0.42, d * 0.98), stoneMat);
      floor.position.y = 0.21;
      g.add(floor);
      for (const px of [-w * 0.36, -w * 0.12, w * 0.12, w * 0.36]) {
        for (const pz of [-d * 0.36, d * 0.36]) {
          const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.15, 8), woodMat);
          pillar.position.set(px, 1.48, pz);
          g.add(pillar);
        }
      }
      const roofA = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.76, 1.25, 4), roofMat);
      roofA.rotation.y = Math.PI / 4;
      roofA.position.y = 3.1;
      const roofB = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.42, 1.25, 4), roofMat);
      roofB.rotation.y = Math.PI / 4;
      roofB.position.y = 3.95;
      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 6), copperMat);
      finial.position.y = 4.65;
      g.add(roofA, roofB, finial);
      break;
    }

    case 'spice_stall':
    case 'cloth_stall':
    case 'food_stall': {
      const counter = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.92, d * 0.8), woodMat);
      counter.position.y = 0.46;
      const awningColor =
        sc.kind === 'cloth_stall' ? 0xbe123c : sc.kind === 'food_stall' ? 0x15803d : 0xffffff;
      const awningMat = new THREE.MeshStandardMaterial({
        ...(sc.kind === 'spice_stall' ? { map: textures.sailStripe } : {}),
        color: awningColor,
        roughness: 0.85,
        side: THREE.DoubleSide,
      });
      const awning = new THREE.Mesh(new THREE.BoxGeometry(w * 1.0, 0.14, d * 1.1), awningMat);
      awning.position.set(0, 2.45, 0);
      awning.rotation.x = 0.15;
      // Signboard above stall + hanging lantern + colorful umbrella + commodity sack
      const signBoard = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.65, 0.34, 0.09),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 })
      );
      signBoard.position.set(0, 2.75, d * 0.42);
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xf59e0b, emissiveIntensity: 0.85 })
      );
      lantern.position.set(w * 0.36, 2.05, d * 0.42);
      const umbColors = [0xf59e0b, 0x0ea5e9, 0xe11d48];
      const umbPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.15, 6), woodMat);
      umbPole.position.set(-w * 0.56, 1.08, 0.1);
      const umbTop = new THREE.Mesh(
        new THREE.ConeGeometry(0.82, 0.32, 8),
        new THREE.MeshStandardMaterial({ color: umbColors[sc.variant % umbColors.length], roughness: 0.78 })
      );
      umbTop.position.set(-w * 0.56, 2.18, 0.1);
      g.add(counter, awning, signBoard, lantern, umbPole, umbTop);

      for (const px of [-w * 0.42, w * 0.42]) {
        for (const pz of [-d * 0.36, d * 0.36]) {
          const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), woodMat);
          p.position.set(px, 1.2, pz);
          g.add(p);
        }
      }
      if (sc.kind === 'spice_stall') {
        const bowlHex = [0xb45309, 0xd97706, 0x15803d];
        for (let i = 0; i < 3; i++) {
          const b = new THREE.Mesh(
            new THREE.CylinderGeometry(0.26, 0.18, 0.24, 10),
            new THREE.MeshStandardMaterial({ color: bowlHex[i], roughness: 0.65 })
          );
          b.position.set(-0.75 + i * 0.75, 1.04, 0.15);
          g.add(b);
        }
        const sack = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 8, 6),
          new THREE.MeshStandardMaterial({ color: 0xd6b88d, roughness: 0.92 })
        );
        sack.position.set(w * 0.52, 0.28, 0.22);
        g.add(sack);
      } else if (sc.kind === 'cloth_stall') {
        const fabricHex = [0x991b1b, 0x1d4ed8, 0xd97706];
        for (let i = 0; i < 3; i++) {
          const roll = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.14, 0.85, 8),
            new THREE.MeshStandardMaterial({ color: fabricHex[i], roughness: 0.7 })
          );
          roll.rotation.z = Math.PI / 2;
          roll.position.set(-0.7 + i * 0.7, 1.08, 0.1);
          g.add(roll);
        }
        const drape = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.95, 0.06),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.8 })
        );
        drape.position.set(w * 0.45, 1.45, 0.0);
        g.add(drape);
      } else {
        const pot = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 10, 8),
          new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 0.75 })
        );
        pot.position.set(-0.5, 1.05, 0.1);
        const bench = new THREE.Mesh(new THREE.BoxGeometry(w * 0.75, 0.32, 0.35), woodMat);
        bench.position.set(0, 0.16, d * 0.64);
        g.add(pot, bench);
      }
      break;
    }

    case 'wooden_warehouse': {
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.4, d * 0.96), stoneMat);
      plinth.position.y = 0.2;
      const body = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 2.4, d * 0.86), woodMat);
      body.position.y = 1.6;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.74, 1.55, 4), roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 3.55;
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.85, 0.12), stoneMat);
      door.position.set(0, 1.32, d * 0.43 + 0.04);
      g.add(plinth, body, roof, door);
      break;
    }

    case 'brick_factory':
    case 'brick_foundry': {
      const isFoundry = sc.kind === 'brick_foundry';
      const base = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.45, d * 0.96), stoneMat);
      base.position.y = 0.225;
      const hall = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 3.1, d * 0.88), brickMat);
      hall.position.y = 2.0;
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, 0.42, d * 0.92), ironMat);
      roof.position.y = 3.76;
      const chimney = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.48, isFoundry ? 3.5 : 4.1, 10),
        ironMat
      );
      chimney.position.set(w * 0.26, isFoundry ? 5.3 : 5.6, -d * 0.2);
      g.add(base, hall, roof, chimney);

      const smokeMat = new THREE.MeshStandardMaterial({
        color: 0xdbeafe,
        transparent: true,
        opacity: 0.65,
        roughness: 0.95,
      });
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), smokeMat);
      const baseY = isFoundry ? 7.1 : 7.6;
      puff.position.set(w * 0.26, baseY, -d * 0.2);
      g.add(puff);
      animRefs.smokePuffs.push({ mesh: puff, baseY, phase: (sc.x + sc.z) * 0.17 });

      if (isFoundry) {
        const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.8, 10), copperMat);
        boiler.rotation.z = Math.PI / 2;
        boiler.position.set(-w * 0.18, 2.5, d * 0.44);
        const furnaceGlow = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 1.1, 0.14),
          new THREE.MeshStandardMaterial({ color: 0xfb923c, emissive: 0xea580c, emissiveIntensity: 0.85 })
        );
        furnaceGlow.position.set(0, 1.0, d * 0.44 + 0.04);
        g.add(boiler, furnaceGlow);
      } else {
        const sawtooth = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, 0.65, d * 0.45), copperMat);
        sawtooth.position.set(-0.2, 4.2, 0.2);
        g.add(sawtooth);
      }
      break;
    }

    case 'worker_rowhouse': {
      const colors = [0xd6c7b2, 0xcbd5e1, 0xe7d4c0];
      const houseMat = new THREE.MeshStandardMaterial({
        color: colors[sc.variant % colors.length],
        roughness: 0.85,
      });
      const base = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, 0.35, d * 0.92), stoneMat);
      base.position.y = 0.175;
      const body = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, 2.8, d * 0.84), houseMat);
      body.position.y = 1.75;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.68, 1.3, 4), roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 3.8;
      const winBand = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.9, 0.55, d * 0.45),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 })
      );
      winBand.position.y = 2.4;
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.35, 0.1), woodMat);
      door.position.set(0, 1.02, d * 0.42 + 0.04);
      g.add(base, body, roof, winBand, door);
      break;
    }

    case 'corner_shop': {
      const base = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, 0.35, d * 0.92), stoneMat);
      base.position.y = 0.175;
      const lower = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, 1.8, d * 0.84), brickMat);
      lower.position.y = 1.25;
      const upper = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 1.5, d * 0.82), wallMat);
      upper.position.y = 2.9;
      const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, 0.35, d * 0.88), ironMat);
      cap.position.y = 3.82;
      const awning = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.9, 0.14, 0.9),
        new THREE.MeshStandardMaterial({ map: textures.sailStripe, roughness: 0.85 })
      );
      awning.position.set(0, 2.0, d * 0.46);
      awning.rotation.x = 0.25;
      g.add(base, lower, upper, cap, awning);
      break;
    }

    case 'cargo_depot': {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.4, d * 0.96), stoneMat);
      pad.position.y = 0.2;
      const shed = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 2.6, d * 0.86), ironMat);
      shed.position.y = 1.7;
      const vault = new THREE.Mesh(
        new THREE.CylinderGeometry(d * 0.44, d * 0.44, w * 0.9, 10, 1, false, 0, Math.PI),
        copperMat
      );
      vault.rotation.z = Math.PI / 2;
      vault.position.y = 3.0;
      g.add(pad, shed, vault);
      break;
    }

    case 'clock_tower': {
      const base = new THREE.Mesh(new THREE.BoxGeometry(w * 0.95, 1.0, d * 0.95), stoneMat);
      base.position.y = 0.5;
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, 4.6, d * 0.72), brickMat);
      shaft.position.y = 3.3;
      const clock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, d * 0.78, 12),
        new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xfbbf24, emissiveIntensity: 0.35 })
      );
      clock.rotation.x = Math.PI / 2;
      clock.position.y = 4.65;
      const spire = new THREE.Mesh(new THREE.ConeGeometry(w * 0.48, 2.1, 4), ironMat);
      spire.rotation.y = Math.PI / 4;
      spire.position.y = 6.65;
      g.add(base, shaft, clock, spire);
      break;
    }

    case 'eco_skyscraper':
    case 'smart_tower': {
      const isSmart = sc.kind === 'smart_tower';
      const glassHex = [0x0ea5e9, 0x14b8a6, 0x38bdf8][sc.variant % 3];
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.42 });
      const glassMat = new THREE.MeshStandardMaterial({
        color: glassHex,
        roughness: 0.14,
        metalness: 0.65,
      });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.85 });
      const solarMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.2, metalness: 0.65 });

      const towerH = Math.max(8.5, sc.height - 2.0);
      const podium = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 1.4, d * 0.96), whiteMat);
      podium.position.y = 0.7;
      const core = new THREE.Mesh(new THREE.BoxGeometry(w * 0.78, towerH, d * 0.78), glassMat);
      core.position.y = 1.4 + towerH / 2;
      const fins = new THREE.Mesh(new THREE.BoxGeometry(w * 0.84, towerH * 0.95, d * 0.4), whiteMat);
      fins.position.y = 1.4 + towerH / 2;
      const greenRoof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.74, 0.45, d * 0.74), leafMat);
      greenRoof.position.y = 1.4 + towerH + 0.22;
      g.add(podium, core, fins, greenRoof);

      if (isSmart) {
        const band = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.8, 0.35, d * 0.8),
          new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 0.75 })
        );
        band.position.y = 1.4 + towerH * 0.82;
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, 2.2, 8), whiteMat);
        spire.position.y = 1.4 + towerH + 1.4;
        g.add(band, spire);
      } else {
        const solar = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, 0.16, d * 0.55), solarMat);
        solar.position.set(0, 1.4 + towerH + 0.75, 0);
        solar.rotation.x = 0.22;
        const greenWall = new THREE.Mesh(new THREE.BoxGeometry(0.28, towerH * 0.78, d * 0.55), leafMat);
        greenWall.position.set(w * 0.41, 1.4 + towerH * 0.45, 0);
        g.add(solar, greenWall);
      }
      break;
    }

    case 'solar_office':
    case 'modern_mall': {
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
      const glassMat = new THREE.MeshStandardMaterial({
        color: sc.kind === 'modern_mall' ? 0x38bdf8 : 0x0284c7,
        roughness: 0.16,
        metalness: 0.62,
      });
      const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.22, metalness: 0.68 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.85 });

      const bodyH = sc.height * 0.68;
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.45, d * 0.96), whiteMat);
      plinth.position.y = 0.225;
      const body = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, bodyH, d * 0.84), glassMat);
      body.position.y = 0.45 + bodyH / 2;
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, 0.28, d * 0.88), whiteMat);
      roof.position.y = 0.45 + bodyH + 0.14;
      g.add(plinth, body, roof);

      if (sc.kind === 'solar_office') {
        const solar = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.18, d * 0.76), solarMat);
        solar.position.y = 0.45 + bodyH + 0.6;
        solar.rotation.x = 0.18;
        g.add(solar);
      } else {
        const crown = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.5, 0.55, 0.25),
          new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0284c7, emissiveIntensity: 0.65 })
        );
        crown.position.set(0, 0.45 + bodyH + 0.55, d * 0.36);
        const greenCap = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, 0.3, d * 0.65), leafMat);
        greenCap.position.y = 0.45 + bodyH + 0.4;
        g.add(crown, greenCap);
      }
      break;
    }

    case 'pocket_park': {
      const lawn = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.96, 0.1, d * 0.96),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.92 })
      );
      lawn.position.y = 0.05;
      const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.42, 14), stoneMat);
      basin.position.y = 0.26;
      const water = new THREE.Mesh(
        new THREE.CylinderGeometry(0.78, 0.78, 0.08, 14),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.12 })
      );
      water.position.y = 0.46;
      g.add(lawn, basin, water);

      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      const leafColors = [0x16a34a, 0x15803d, 0xf472b6];
      const leafM = new THREE.MeshStandardMaterial({
        color: leafColors[sc.variant % leafColors.length],
        roughness: 0.84,
      });
      for (const [tx, tz] of [
        [-1.15, -1.15],
        [1.15, 1.15],
      ]) {
        const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 1.1, 6), trunkMat);
        tr.position.set(tx, 0.6, tz);
        const top = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 0), leafM);
        top.position.set(tx, 1.45, tz);
        g.add(tr, top);
      }
      break;
    }
  }

  return g;
}

function addSharedBaseGeography(
  root: THREE.Group,
  textures: WorldTextures,
  stage: StageNumber
): { nsRoadTex: THREE.CanvasTexture; ewRingTex: THREE.CanvasTexture } {
  const landColor = stage === 1 ? 0xffffff : stage === 2 ? 0xc2b59b : 0xdbf5d6;
  const landMat = new THREE.MeshStandardMaterial({
    map: textures.sandEarth,
    color: landColor,
    roughness: 0.92,
  });
  const landMesh = new THREE.Mesh(new THREE.BoxGeometry(240, 2.0, 260), landMat);
  landMesh.position.set(-96.0, -1.0, 0);
  landMesh.receiveShadow = true;
  root.add(landMesh);

  const beachMat = new THREE.MeshStandardMaterial({
    color: stage === 2 ? 0x948979 : 0xd9c28c,
    roughness: 0.9,
  });
  const beachStrip = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.85, 260), beachMat);
  beachStrip.position.set(24.9, -1.05, 0);
  beachStrip.rotation.z = -0.14;
  beachStrip.receiveShadow = true;
  root.add(beachStrip);

  // Era-matched Avenues & Secondary Urban Boulevard Loop (zero Z-fighting via staggered Y offsets)
  const useAsphalt = stage === 3;
  const baseRoadTex = useAsphalt ? textures.asphaltRoad : textures.cobbleRoad;
  const roadTint = stage === 1 ? 0xffffff : stage === 2 ? 0x807974 : 0xffffff;

  const ewRoadMat = new THREE.MeshStandardMaterial({
    map: baseRoadTex,
    color: roadTint,
    roughness: useAsphalt ? 0.72 : 0.85,
  });
  const ewRoad = new THREE.Mesh(new THREE.BoxGeometry(62, 0.08, 6.2), ewRoadMat);
  ewRoad.position.set(-7.0, 0.01, 0);
  ewRoad.receiveShadow = true;

  const nsRoadTex = baseRoadTex.clone();
  nsRoadTex.needsUpdate = true;
  nsRoadTex.rotation = Math.PI / 2;
  nsRoadTex.center.set(0.5, 0.5);
  nsRoadTex.repeat.set(16, 1);
  const nsRoadMat = new THREE.MeshStandardMaterial({
    map: nsRoadTex,
    color: roadTint,
    roughness: useAsphalt ? 0.72 : 0.85,
  });
  const nsRoad = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.08, 72), nsRoadMat);
  nsRoad.position.set(0, 0.018, 0);
  nsRoad.receiveShadow = true;

  // Perimeter Boulevard Ring (connects outer kampung/factories/skyscrapers with harbor promenade)
  const ewRingTex = baseRoadTex.clone();
  ewRingTex.needsUpdate = true;
  ewRingTex.repeat.set(12, 1);
  const ringMat = new THREE.MeshStandardMaterial({
    map: ewRingTex,
    color: roadTint,
    roughness: useAsphalt ? 0.76 : 0.88,
  });
  const northRing = new THREE.Mesh(new THREE.BoxGeometry(53, 0.06, 3.6), ringMat);
  northRing.position.set(-4.2, 0.008, -30.4);
  const southRing = new THREE.Mesh(new THREE.BoxGeometry(53, 0.06, 3.6), ringMat);
  southRing.position.set(-4.2, 0.008, 30.4);
  const westRing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.06, 62), nsRoadMat);
  westRing.position.set(-30.0, 0.012, 0);
  const eastPromenade = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.06, 62), nsRoadMat);
  eastPromenade.position.set(21.4, 0.012, 0);
  root.add(ewRoad, nsRoad, northRing, southRing, westRing, eastPromenade);

  // Stage 3 Crisp Crosswalks at Central Plaza
  if (stage === 3) {
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    for (let i = -2; i <= 2; i++) {
      const sN = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 1.4), stripeMat);
      sN.rotation.x = -Math.PI / 2;
      sN.position.set(i * 0.9, 0.062, -3.7);
      const sS = sN.clone();
      sS.position.set(i * 0.9, 0.062, 3.7);
      root.add(sN, sS);
    }
  }

  // Ocean Plane
  const oceanMat = new THREE.MeshStandardMaterial({
    map: textures.waterWave,
    color: stage === 3 ? 0x2dd4bf : stage === 2 ? 0x2c6b7a : 0x228b9c,
    roughness: 0.18,
    metalness: 0.15,
  });
  const oceanMesh = new THREE.Mesh(new THREE.PlaneGeometry(240, 260), oceanMat);
  oceanMesh.rotation.x = -Math.PI / 2;
  oceanMesh.position.set(140, -0.45, 0);
  oceanMesh.receiveShadow = true;
  root.add(oceanMesh);

  // Walkable Piers
  const plankMat =
    stage === 2
      ? new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7, metalness: 0.3 })
      : stage === 3
        ? new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.55 })
        : new THREE.MeshStandardMaterial({ map: textures.woodPlank, roughness: 0.8 });

  const pilingMat = new THREE.MeshStandardMaterial({
    color: stage === 1 ? 0x452715 : 0x334155,
    roughness: 0.85,
  });
  const capMat = new THREE.MeshStandardMaterial({
    color: stage === 3 ? 0x0ea5e9 : 0xd97706,
    roughness: 0.45,
  });

  const buildPier = (startX: number, endX: number, centerZ: number, widthZ: number) => {
    const length = endX - startX;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(length, 0.24, widthZ), plankMat);
    deck.position.set(startX + length / 2, PIER_HEIGHT - 0.12, centerZ);
    deck.receiveShadow = true;
    root.add(deck);

    const ramp = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.22, widthZ), plankMat);
    ramp.position.set(20.75, PIER_HEIGHT * 0.42, centerZ);
    ramp.rotation.z = Math.atan2(PIER_HEIGHT, 2.5);
    ramp.receiveShadow = true;
    root.add(ramp);

    for (let px = startX + 1.5; px <= endX - 0.8; px += 4.2) {
      for (const side of [-1, 1]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 2.8, 8), pilingMat);
        post.position.set(px, 0.1, centerZ + side * (widthZ / 2 - 0.28));
        root.add(post);

        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 8), capMat);
        cap.position.set(px, PIER_HEIGHT + 0.58, centerZ + side * (widthZ / 2 - 0.28));
        root.add(cap);
      }
    }
  };

  buildPier(22.0, 41.8, 0, 6.4);
  buildPier(22.0, 32.8, -17.5, 4.2);

  // Distant Mountains & Volcano Backdrop
  const mountainMat = new THREE.MeshStandardMaterial({
    color: stage === 2 ? 0x475569 : stage === 3 ? 0x15803d : 0x3b5941,
    roughness: 0.95,
  });
  const volcanoSpecs: [number, number, number, number][] = [
    [-82, -32, 34, 28],
    [-88, 22, 38, 34],
    [-58, -76, 30, 22],
    [10, -82, 28, 18],
    [-62, 76, 32, 24],
  ];
  for (const [mx, mz, rad, h] of volcanoSpecs) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(rad, h, 9), mountainMat);
    m.position.set(mx, h * 0.42, mz);
    root.add(m);
  }

  return { nsRoadTex, ewRingTex };
}

function addDenseFoliageAndStreetFurniture(
  root: THREE.Group,
  stage: StageNumber,
  textures: WorldTextures,
  animRefs: AnimRefs
) {
  const dummy = new THREE.Object3D();
  const colorTmp = new THREE.Color();

  // 1. Trees: 52 instanced palms / urban shade trees around coast, boulevards & outer groves
  const treeSpots: [number, number][] = [
    [22.6, -34], [22.6, -26], [22.6, -10], [22.6, 8], [22.6, 19], [22.6, 31],
    [-36.5, -33], [-36.5, -24], [-36.5, -9], [-36.5, 9], [-36.5, 24], [-36.5, 33],
    [-24.5, -36], [-13.6, -36], [-5.2, -36], [5.2, -36], [20.0, -36],
    [-24.5, 36], [-13.6, 36], [-5.2, 36], [5.2, 36], [20.0, 36],
    // Inner boulevard shade trees (in clear 4m road edges / corners, avoiding spawn camera corridor)
    [-29.2, -29.2], [-29.2, -13.6], [-29.2, 13.6], [-29.2, 29.2],
    [-13.6, -22.6], [-22.6, 22.6], [-5.2, -16.5], [-5.2, 22.6],
    [5.2, -5.2], [5.2, 5.2], [13.6, -28.0], [13.6, 28.0],
    [-22.6, -13.6], [-22.6, 13.6], [-5.2, 14.5],
    // Far outer perimeter woodland frame
    [-46.0, -36], [-46.0, -18], [-46.0, 0], [-46.0, 18], [-46.0, 36],
    [-52.0, -28], [-52.0, -8], [-52.0, 10], [-52.0, 28],
  ];

  const trunkGeo = new THREE.CylinderGeometry(0.15, 0.26, 4.0, 7);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.9 });
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.84 });

  if (stage === 1) {
    // Tropical Coconut Palms + lush crowns (animated sway stored in animRefs.palmSway)
    const frondGeo = new THREE.BoxGeometry(3.4, 0.2, 0.64);
    const crownTopGeo = new THREE.DodecahedronGeometry(0.72, 0);
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeSpots.length);
    const frondsA = new THREE.InstancedMesh(frondGeo, canopyMat, treeSpots.length);
    const frondsB = new THREE.InstancedMesh(frondGeo, canopyMat, treeSpots.length);
    const crowns = new THREE.InstancedMesh(crownTopGeo, canopyMat, treeSpots.length);
    const palette = [0x2f6e33, 0x3a7d3e, 0x245d2a];

    treeSpots.forEach(([px, pz], idx) => {
      const scale = 0.85 + ((idx * 17) % 5) * 0.08;
      const yaw = idx * 0.7;
      dummy.position.set(px, 1.95 * scale, pz);
      dummy.rotation.set(0.06 * ((idx % 3) - 1), yaw, 0);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      trunks.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(px, 3.95 * scale, pz);
      dummy.rotation.set(0.12, yaw, 0.08);
      dummy.updateMatrix();
      frondsA.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(px, 3.9 * scale, pz);
      dummy.rotation.set(-0.1, yaw + Math.PI / 2, -0.08);
      dummy.updateMatrix();
      frondsB.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(px, 4.2 * scale, pz);
      dummy.rotation.set(0, yaw + 0.4, 0);
      dummy.updateMatrix();
      crowns.setMatrixAt(idx, dummy.matrix);

      colorTmp.setHex(palette[idx % palette.length]);
      frondsA.setColorAt(idx, colorTmp);
      frondsB.setColorAt(idx, colorTmp);
      crowns.setColorAt(idx, colorTmp);
    });
    [trunks, frondsA, frondsB, crowns].forEach((m) => {
      m.computeBoundingSphere();
      root.add(m);
    });
    animRefs.palmSway = { spots: treeSpots, frondsA, frondsB, crowns };
  } else {
    // Leafy Urban Boulevard Trees (Stage 2 & lush multi-color Eco-City Stage 3)
    const canopyGeo = new THREE.DodecahedronGeometry(1.35, 1);
    const capGeo = new THREE.DodecahedronGeometry(0.95, 1);
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeSpots.length);
    const canopies = new THREE.InstancedMesh(canopyGeo, canopyMat, treeSpots.length);
    const caps = new THREE.InstancedMesh(capGeo, canopyMat, treeSpots.length);
    const palette =
      stage === 3 ? [0x22c55e, 0x16a34a, 0x4ade80, 0xf472b6] : [0x4d7c0f, 0x3f6212, 0x65a30d];

    treeSpots.forEach(([px, pz], idx) => {
      const scale = 0.82 + ((idx * 13) % 5) * 0.08;
      dummy.position.set(px, 1.5 * scale, pz);
      dummy.rotation.set(0, idx * 0.5, 0);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      trunks.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(px, 3.15 * scale, pz);
      dummy.updateMatrix();
      canopies.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(px + 0.25, 3.9 * scale, pz - 0.18);
      dummy.updateMatrix();
      caps.setMatrixAt(idx, dummy.matrix);

      colorTmp.setHex(palette[idx % palette.length]);
      canopies.setColorAt(idx, colorTmp);
      caps.setColorAt(idx, colorTmp);
    });
    [trunks, canopies, caps].forEach((m) => {
      m.computeBoundingSphere();
      root.add(m);
    });
  }

  // 2. Streetlamps (20 instanced poles + heads along EW, NS & perimeter avenues)
  const lampCoords: [number, number][] = [
    [-24, -3.5], [-16, -3.5], [-8, -3.5], [8, -3.5], [16, -3.5],
    [-24, 3.5], [-16, 3.5], [-8, 3.5], [8, 3.5], [16, 3.5],
    [-3.5, -24], [-3.5, -14], [-3.5, 14], [-3.5, 24],
    [3.5, -24], [3.5, -14], [3.5, 14], [3.5, 24],
    [22.4, -5.0], [22.4, 5.0],
  ];
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.11, 3.2, 7);
  const poleMat = new THREE.MeshStandardMaterial({
    color: stage === 1 ? 0x3f2e21 : stage === 2 ? 0x1e293b : 0xe2e8f0,
    roughness: 0.7,
  });
  const headGeo = new THREE.BoxGeometry(0.36, 0.42, 0.36);
  const headMat = new THREE.MeshStandardMaterial({
    color: stage === 3 ? 0x67e8f9 : 0xfde68a,
    emissive: stage === 3 ? 0x06b6d4 : 0xf59e0b,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });
  const polesInst = new THREE.InstancedMesh(poleGeo, poleMat, lampCoords.length);
  const headsInst = new THREE.InstancedMesh(headGeo, headMat, lampCoords.length);
  lampCoords.forEach(([lx, lz], i) => {
    dummy.position.set(lx, 1.6, lz);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    polesInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lx, 3.3, lz);
    dummy.updateMatrix();
    headsInst.setMatrixAt(i, dummy.matrix);
  });
  polesInst.computeBoundingSphere();
  headsInst.computeBoundingSphere();
  root.add(polesInst, headsInst);

  // 3. Park & Plaza Benches (`Bangku Jalan & Taman`)
  const benchCoords: [number, number, number][] = [
    [-11.5, -3.5, 0], [11.5, -3.5, 0], [-11.5, 3.5, Math.PI], [11.5, 3.5, Math.PI],
    [-3.5, -10.5, Math.PI / 2], [3.5, -10.5, -Math.PI / 2],
    [-3.5, 10.5, Math.PI / 2], [3.5, 10.5, -Math.PI / 2],
    [-3.5, 20.5, Math.PI / 2], [3.5, 20.5, -Math.PI / 2],
    [22.4, -10.5, -Math.PI / 2], [22.4, 10.5, -Math.PI / 2],
    [-13.6, -8.5, 0], [-13.6, 8.5, Math.PI],
  ];
  const seatGeo = new THREE.BoxGeometry(1.5, 0.14, 0.55);
  const backGeo = new THREE.BoxGeometry(1.5, 0.45, 0.12);
  const benchMat = new THREE.MeshStandardMaterial({
    color: stage === 3 ? 0xf1f5f9 : 0x8c552b,
    roughness: 0.72,
  });
  const seatsInst = new THREE.InstancedMesh(seatGeo, benchMat, benchCoords.length);
  const backsInst = new THREE.InstancedMesh(backGeo, benchMat, benchCoords.length);
  benchCoords.forEach(([bx, bz, yaw], i) => {
    dummy.position.set(bx, 0.42, bz);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    seatsInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(bx - Math.sin(yaw) * 0.22, 0.68, bz - Math.cos(yaw) * 0.22);
    dummy.updateMatrix();
    backsInst.setMatrixAt(i, dummy.matrix);
  });
  seatsInst.computeBoundingSphere();
  backsInst.computeBoundingSphere();
  root.add(seatsInst, backsInst);

  // 4. Directional Signposts (`Papan Petunjuk Kota`) at Main Intersections
  const signPostMat = new THREE.MeshStandardMaterial({ color: stage === 3 ? 0x334155 : 0x5c3a1e, roughness: 0.8 });
  const signBoardMat = new THREE.MeshStandardMaterial({
    color: stage === 3 ? 0x0284c7 : stage === 2 ? 0xb45309 : 0xd97706,
    roughness: 0.55,
  });
  for (const [sx, sz, yaw] of [
    [-3.4, -3.4, Math.PI * 0.25],
    [3.4, -3.4, -Math.PI * 0.25],
    [19.2, -3.6, -Math.PI * 0.5],
  ] as [number, number, number][]) {
    const signGroup = new THREE.Group();
    signGroup.position.set(sx, 0, sz);
    signGroup.rotation.y = yaw;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.3, 6), signPostMat);
    post.position.y = 1.15;
    const armA = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.26, 0.08), signBoardMat);
    armA.position.set(0.32, 2.05, 0);
    const armB = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.24, 0.08), signBoardMat);
    armB.position.set(-0.26, 1.7, 0);
    armB.rotation.y = Math.PI / 2;
    signGroup.add(post, armA, armB);
    root.add(signGroup);
  }

  // 5. Stacked Crates, Barrels & Spice Sacks (Harbor, Market, Factory Yards)
  const cratePositions: [number, number, number][] =
    stage === 1
      ? [
          [25.5, PIER_HEIGHT, 2.1], [26.6, PIER_HEIGHT, 2.0], [26.0, PIER_HEIGHT + 0.72, 2.05],
          [34.2, PIER_HEIGHT, -2.1], [35.3, PIER_HEIGHT, -2.1], [24.5, PIER_HEIGHT, -16.2],
          [11.4, 0, -24.5], [15.8, 0, -24.2], [11.8, 0, -13.6], [15.2, 0, 14.0],
        ]
      : stage === 2
        ? [
            [25.5, PIER_HEIGHT, 2.1], [26.6, PIER_HEIGHT, 2.1], [34.0, PIER_HEIGHT, -2.1],
            [-29.8, 0, -14.0], [-29.8, 0, 14.0], [16.5, 0, -14.2], [16.5, 0, 14.2],
          ]
        : [
            [25.5, PIER_HEIGHT, 2.1], [34.2, PIER_HEIGHT, -2.1], [16.5, 0, -13.8],
          ];

  const crateGeo = new THREE.BoxGeometry(0.75, 0.75, 0.75);
  const crateMat = new THREE.MeshStandardMaterial({
    map: textures.woodPlank,
    color: stage === 3 ? 0x38bdf8 : 0xd9a05b,
    roughness: 0.78,
  });
  const cratesInst = new THREE.InstancedMesh(crateGeo, crateMat, cratePositions.length);
  cratePositions.forEach(([cx, cy, cz], i) => {
    dummy.position.set(cx, cy + 0.375, cz);
    dummy.rotation.set(0, (i * 0.4) % Math.PI, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    cratesInst.setMatrixAt(i, dummy.matrix);
  });
  cratesInst.computeBoundingSphere();
  root.add(cratesInst);

  if (stage <= 2) {
    const barrelPositions: [number, number, number][] = [
      [28.5, PIER_HEIGHT, 2.2], [29.4, PIER_HEIGHT, 2.1], [27.0, PIER_HEIGHT, -16.4],
      [12.0, 0, -22.8], [15.4, 0, -4.5], [15.4, 0, 11.4],
    ];
    const barrelGeo = new THREE.CylinderGeometry(0.32, 0.34, 0.78, 10);
    const barrelMat = new THREE.MeshStandardMaterial({
      color: stage === 1 ? 0x854d0e : 0x475569,
      roughness: 0.72,
    });
    const barrelsInst = new THREE.InstancedMesh(barrelGeo, barrelMat, barrelPositions.length);
    barrelPositions.forEach(([bx, by, bz], i) => {
      dummy.position.set(bx, by + 0.39, bz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      barrelsInst.setMatrixAt(i, dummy.matrix);
    });
    barrelsInst.computeBoundingSphere();
    root.add(barrelsInst);
  }

  // 6. Stage 1 Exclusive Living Environment Details: Trash Bins, Potted Plants, Stepping Stones, Area Signboards, Banners & Pier Props
  if (stage === 1) {
    // Terracotta Plant Pots + Lush Shrubs beside Benches & Houses
    const potSpots: [number, number][] = [
      [-12.6, -3.5], [12.6, -3.5], [-12.6, 3.5], [12.6, 3.5],
      [-3.5, -9.2], [3.5, -9.2], [-3.5, 9.2], [3.5, 9.2],
      [22.4, -8.5], [22.4, 8.5], [-29.8, -6.2], [-29.8, 6.2],
    ];
    const potGeo = new THREE.CylinderGeometry(0.28, 0.2, 0.42, 10);
    const potMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.78 });
    const shrubGeo = new THREE.DodecahedronGeometry(0.34, 0);
    const shrubMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.85 });
    const potsInst = new THREE.InstancedMesh(potGeo, potMat, potSpots.length);
    const shrubsInst = new THREE.InstancedMesh(shrubGeo, shrubMat, potSpots.length);
    potSpots.forEach(([px, pz], i) => {
      dummy.position.set(px, 0.21, pz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      potsInst.setMatrixAt(i, dummy.matrix);

      dummy.position.set(px, 0.58, pz);
      dummy.updateMatrix();
      shrubsInst.setMatrixAt(i, dummy.matrix);
    });
    potsInst.computeBoundingSphere();
    shrubsInst.computeBoundingSphere();
    root.add(potsInst, shrubsInst);

    // Woven Wood Street Trash Bins beside benches
    const binSpots: [number, number][] = [
      [-10.2, -3.5], [10.2, -3.5], [-10.2, 3.5], [10.2, 3.5],
      [-3.5, -11.8], [3.5, -11.8], [22.4, -11.8], [22.4, 11.8],
    ];
    const binGeo = new THREE.CylinderGeometry(0.22, 0.19, 0.56, 8);
    const binMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.85 });
    const binsInst = new THREE.InstancedMesh(binGeo, binMat, binSpots.length);
    binSpots.forEach(([bx, bz], i) => {
      dummy.position.set(bx, 0.28, bz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      binsInst.setMatrixAt(i, dummy.matrix);
    });
    binsInst.computeBoundingSphere();
    root.add(binsInst);

    // Stepping Stones linking market plaza & kampung gardens
    const stoneSpots: [number, number][] = [
      [-13.6, 17.5], [-13.6, 19.0], [-13.6, 20.5],
      [-22.6, -17.5], [-22.6, -19.0], [-22.6, -20.5],
      [8.5, -13.6], [10.0, -13.6], [8.5, 13.6], [10.0, 13.6],
    ];
    const stoneGeo = new THREE.CylinderGeometry(0.42, 0.45, 0.06, 7);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.9 });
    const stonesInst = new THREE.InstancedMesh(stoneGeo, stoneMat, stoneSpots.length);
    stoneSpots.forEach(([sx, sz], i) => {
      dummy.position.set(sx, 0.03, sz);
      dummy.rotation.set(0, i * 0.5, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      stonesInst.setMatrixAt(i, dummy.matrix);
    });
    stonesInst.computeBoundingSphere();
    root.add(stonesInst);

    // Area Name Signboards (`Papan Nama Kawasan`)
    const marketSign = createAreaSignboardMesh(
      'PASAR REMPAH',
      'Kain · Rempah · Kuliner',
      '#78350f',
      '#fbbf24',
      animRefs.disposables
    );
    marketSign.position.set(10.5, 0, -3.5);
    marketSign.rotation.y = -Math.PI * 0.25;

    const harborSign = createAreaSignboardMesh(
      'PELABUHAN NIAGA',
      'Dermaga Jalur Rempah',
      '#1e3a5f',
      '#38bdf8',
      animRefs.disposables
    );
    harborSign.position.set(21.2, 0, 4.3);
    harborSign.rotation.y = -Math.PI * 0.65;

    const kampungSign = createAreaSignboardMesh(
      'KAMPUNG NUSANTARA',
      'Rumah Adat & Pendopo',
      '#3f2e21',
      '#f59e0b',
      animRefs.disposables
    );
    kampungSign.position.set(-24.2, 0, -3.5);
    kampungSign.rotation.y = Math.PI * 0.25;
    root.add(marketSign, harborSign, kampungSign);

    // Festive Nusantara Umbul-Umbul Banners swaying in the breeze
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.78 });
    const bannerColors = [0xdc2626, 0xf59e0b, 0x059669, 0x2563eb];
    const bannerCoords: [number, number, number][] = [
      [3.8, -3.8, 0], [3.8, 3.8, 1], [16.8, -3.6, 2], [16.8, 3.6, 3],
      [-3.8, -18.5, 0], [3.8, -18.5, 1], [-18.5, -3.6, 2], [-18.5, 3.6, 3],
    ];
    bannerCoords.forEach(([ux, uz, ci], idx) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 4.6, 6), bambooMat);
      pole.position.set(ux, 2.3, uz);
      const cloth = new THREE.Mesh(
        new THREE.ConeGeometry(0.32, 2.4, 4),
        new THREE.MeshStandardMaterial({ color: bannerColors[ci], roughness: 0.8 })
      );
      cloth.position.set(ux + 0.16, 3.35, uz);
      cloth.rotation.z = Math.PI;
      root.add(pole, cloth);
      animRefs.banners.push({ mesh: cloth, baseRot: Math.PI, phase: idx * 0.85 });
    });

    // Dock Bollards & Warm Pier Lanterns along Main Harbor Pier (`y = PIER_HEIGHT`)
    const bollardMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.75 });
    const pierLampMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
    });
    for (const bx of [24.2, 29.2, 34.4, 39.2]) {
      for (const bz of [-2.85, 2.85]) {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.55, 8), bollardMat);
        b.position.set(bx, PIER_HEIGHT + 0.275, bz);
        root.add(b);
      }
      const lPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.0, 6), binMat);
      lPost.position.set(bx, PIER_HEIGHT + 1.0, -2.95);
      const lOrb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), pierLampMat);
      lOrb.position.set(bx, PIER_HEIGHT + 2.05, -2.95);
      root.add(lPost, lOrb);
    }

    // Shoreline Surf Foam Strip gently lapping at beach edge
    const foam = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 110),
      new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.36,
        depthWrite: false,
      })
    );
    foam.rotation.x = -Math.PI / 2;
    foam.position.set(24.5, -0.4, 0);
    root.add(foam);
    animRefs.surfFoam = foam;
  }
}

function addEraAtmosphericParticles(stage: StageNumber, animRefs: AnimRefs, root: THREE.Group): () => void {
  const count = 72;
  const positions = new Float32Array(count * 3);
  const baseY = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const px = (((Math.sin(i * 19.3) * 43758.5) % 1 + 1) % 1) * 76 - 38;
    const py = 1.2 + (((Math.sin(i * 73.1) * 19341.2) % 1 + 1) % 1) * 8.5;
    const pz = (((Math.sin(i * 41.7) * 28411.9) % 1 + 1) % 1) * 68 - 34;
    positions[i * 3] = px;
    positions[i * 3 + 1] = py;
    positions[i * 3 + 2] = pz;
    baseY[i] = py;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: stage === 1 ? 0xfde68a : stage === 2 ? 0xfdba74 : 0x67e8f9,
    size: 0.28,
    transparent: true,
    opacity: stage === 2 ? 0.45 : 0.6,
    depthWrite: false,
  });
  const pts = new THREE.Points(geo, mat);
  root.add(pts);
  animRefs.particles = pts;
  animRefs.particleBaseY = baseY;

  return () => {
    geo.dispose();
    mat.dispose();
  };
}

export function buildStageWorld(stage: StageNumber, textures: WorldTextures): StageWorldHandle {
  const root = new THREE.Group();
  const { nsRoadTex, ewRingTex } = addSharedBaseGeography(root, textures, stage);

  const animRefs: AnimRefs = {
    gears: [],
    smokePuffs: [],
    ships: [],
    rotors: [],
    trainGroup: null,
    monorailGroup: null,
    crowd: [],
    vehicles: [],
    particles: null,
    particleBaseY: null,
    palmSway: null,
    birds: [],
    critters: [],
    banners: [],
    craneArms: [],
    surfFoam: null,
    disposables: [],
  };

  // 1. Inspectable Era Landmarks
  for (const lm of getStageLandmarks(stage)) {
    root.add(createLandmarkMesh(lm, textures, animRefs));
  }

  // 2. Dense Multi-District Scenery Buildings (~30+ buildings per Stage)
  for (const sc of getStageSceneryBuildings(stage)) {
    root.add(createSceneryBuildingMesh(sc, textures, animRefs));
  }

  // 3. Dense Foliage, Streetlamps, Benches, Signposts & Crates/Barrels
  addDenseFoliageAndStreetFurniture(root, stage, textures, animRefs);

  // 4. Living Autonomous Crowd NPCs (10 active citizens/workers/traders/engineers per Stage)
  for (const def of getStageCrowdPatrols(stage)) {
    const rig = createCrowdCitizenRig(def);
    const startWp = def.waypoints[0];
    const nextWp = def.waypoints[1] ?? startWp;
    const initYaw = Math.atan2(nextWp.x - startWp.x, nextWp.z - startWp.z);
    rig.root.position.set(startWp.x, groundHeightAt(startWp.x, startWp.z), startWp.z);
    rig.root.rotation.y = initYaw;
    root.add(rig.root);
    animRefs.crowd.push({
      def,
      rig,
      wpIndex: 1 % def.waypoints.length,
      x: startWp.x,
      z: startWp.z,
      yaw: initYaw,
      pauseTimer: 0,
      walkCycle: 0,
    });
  }

  // 5. Era-specific Ships, Trains, Road Vehicles, Park Pond & Wind Turbines
  if (stage === 1) {
    // 5 Docked & Harbor Nusantara Sailing Ships (bobbing at piers)
    for (const s of [
      { x: 40.5, z: -8.5, yaw: -0.25, scale: 0.95, striped: true, masts: 2 as const, tint: 0x7c4a26, phase: 0.0 },
      { x: 47.0, z: 9.5, yaw: 0.35, scale: 1.12, striped: false, masts: 2 as const, tint: 0x6b3d1e, phase: 1.7 },
      { x: 58.0, z: -22.0, yaw: 0.85, scale: 1.2, striped: true, masts: 2 as const, tint: 0x854d0e, phase: 3.1 },
      { x: 38.5, z: -26.0, yaw: -0.6, scale: 0.72, striped: false, masts: 1 as const, tint: 0x92400e, phase: 0.9 },
      { x: 45.0, z: 24.0, yaw: 0.15, scale: 0.82, striped: true, masts: 1 as const, tint: 0x78350f, phase: 2.3 },
    ]) {
      const shipGroup = createSailingShip(textures, s.scale, s.striped, s.masts, s.tint);
      shipGroup.position.set(s.x, -0.5, s.z);
      shipGroup.rotation.y = s.yaw;
      root.add(shipGroup);
      animRefs.ships.push({ group: shipGroup, baseY: -0.5, phase: s.phase, rollAmp: 0.035 });
    }

    // 2 Slow-Cruising Offshore Merchant Sailing Ships
    for (const cruise of [
      {
        scale: 0.88,
        striped: true,
        tint: 0x854d0e,
        speed: 2.6,
        pts: [{ x: 64, z: -36 }, { x: 64, z: 36 }, { x: 76, z: 36 }, { x: 76, z: -36 }],
      },
      {
        scale: 0.76,
        striped: false,
        tint: 0x7c4a26,
        speed: 2.2,
        pts: [{ x: 54, z: 34 }, { x: 54, z: -34 }, { x: 68, z: -34 }, { x: 68, z: 34 }],
      },
    ]) {
      const movingShip = createSailingShip(textures, cruise.scale, cruise.striped, 2, cruise.tint);
      movingShip.position.set(cruise.pts[0].x, -0.48, cruise.pts[0].z);
      root.add(movingShip);
      animRefs.ships.push({ group: movingShip, baseY: -0.48, phase: cruise.speed, rollAmp: 0.03 });
      animRefs.vehicles.push({
        group: movingShip,
        waypoints: cruise.pts,
        wpIndex: 1,
        speed: cruise.speed,
        x: cruise.pts[0].x,
        z: cruise.pts[0].z,
        yaw: 0,
      });
    }

    // 3 Docked Traditional Sampan Boats beside piers
    for (const [bx, bz, yaw, ph] of [
      [27.0, 5.2, 0.25, 0.5],
      [31.5, -13.2, -0.4, 1.4],
      [26.5, -22.0, 0.6, 2.2],
    ] as [number, number, number, number][]) {
      const sampan = createSampanBoat(textures);
      sampan.position.set(bx, -0.35, bz);
      sampan.rotation.y = yaw;
      root.add(sampan);
      animRefs.ships.push({ group: sampan, baseY: -0.35, phase: ph, rollAmp: 0.05 });
    }

    // 2 Moving Traditional Fishing Jukungs in the Harbor Bay
    for (const jSpec of [
      {
        color: 0xd97706,
        speed: 3.1,
        pts: [{ x: 34, z: 14 }, { x: 46, z: 28 }, { x: 35, z: 32 }, { x: 30, z: 12 }],
      },
      {
        color: 0x0ea5e9,
        speed: 2.8,
        pts: [{ x: 35, z: -32 }, { x: 48, z: -26 }, { x: 48, z: -12 }, { x: 35, z: -14 }],
      },
    ]) {
      const jukung = createStage1VehicleMesh('fishing_jukung', jSpec.color);
      jukung.position.set(jSpec.pts[0].x, -0.35, jSpec.pts[0].z);
      root.add(jukung);
      animRefs.ships.push({ group: jukung, baseY: -0.35, phase: jSpec.speed, rollAmp: 0.055 });
      animRefs.vehicles.push({
        group: jukung,
        waypoints: jSpec.pts,
        wpIndex: 1,
        speed: jSpec.speed,
        x: jSpec.pts[0].x,
        z: jSpec.pts[0].z,
        yaw: 0,
      });
    }

    // Stage 1 Road Vehicles: Merchant Handcarts, Vintage Bicycle & Cargo Ox-Cart along safe road corridors
    for (const vSpec of [
      {
        kind: 'bicycle' as const,
        color: 0x0f766e,
        speed: 4.3,
        pts: [{ x: -27.5, z: -1.8 }, { x: 17.5, z: -1.8 }, { x: 17.5, z: 1.8 }, { x: -27.5, z: 1.8 }],
      },
      {
        kind: 'handcart' as const,
        color: 0xb45309,
        speed: 2.8,
        pts: [{ x: 1.8, z: -24.5 }, { x: 1.8, z: 27.5 }, { x: -1.8, z: 27.5 }, { x: -1.8, z: -24.5 }],
      },
      {
        kind: 'oxcart' as const,
        color: 0x991b1b,
        speed: 3.1,
        pts: [{ x: -28.0, z: 31.1 }, { x: 18.0, z: 31.1 }, { x: 18.0, z: 29.8 }, { x: -28.0, z: 29.8 }],
      },
    ]) {
      const veh = createStage1VehicleMesh(vSpec.kind, vSpec.color);
      veh.position.set(vSpec.pts[0].x, 0, vSpec.pts[0].z);
      root.add(veh);
      animRefs.vehicles.push({
        group: veh,
        waypoints: vSpec.pts,
        wpIndex: 1,
        speed: vSpec.speed,
        x: vSpec.pts[0].x,
        z: vSpec.pts[0].z,
        yaw: 0,
      });
    }

    // Kampung Roosters & Cats roaming small courtyards
    const critterConfigs = [
      { cx: -18.5, cz: 4.5, r: 1.4, bodyColor: 0xd97706, combColor: 0xdc2626, speed: 1.3, phase: 0.0 },
      { cx: -25.5, cz: -12.0, r: 1.6, bodyColor: 0xfef3c7, combColor: 0xe11d48, speed: 1.5, phase: 1.2 },
      { cx: 11.2, cz: -18.2, r: 1.2, bodyColor: 0x92400e, combColor: 0xf59e0b, speed: 1.1, phase: 2.1 },
      { cx: -11.5, cz: 21.8, r: 1.5, bodyColor: 0x334155, combColor: 0xfbbf24, speed: 1.4, phase: 0.7 },
    ];
    for (const c of critterConfigs) {
      const cg = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.24, 0.42),
        new THREE.MeshStandardMaterial({ color: c.bodyColor, roughness: 0.85 })
      );
      body.position.y = 0.22;
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 8, 6),
        new THREE.MeshStandardMaterial({ color: c.bodyColor, roughness: 0.85 })
      );
      head.position.set(0, 0.38, 0.2);
      const comb = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.08, 0.12),
        new THREE.MeshStandardMaterial({ color: c.combColor, roughness: 0.7 })
      );
      comb.position.set(0, 0.48, 0.22);
      const tail = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.24, 5),
        new THREE.MeshStandardMaterial({ color: c.combColor, roughness: 0.8 })
      );
      tail.position.set(0, 0.34, -0.24);
      tail.rotation.x = -0.7;
      cg.add(body, head, comb, tail);
      root.add(cg);
      animRefs.critters.push({ group: cg, cx: c.cx, cz: c.cz, r: c.r, speed: c.speed, phase: c.phase });
    }

    // Tropical Seabirds & Swallows circling high over Harbor & Market
    const birdBodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
    for (let i = 0; i < 5; i++) {
      const bg = new THREE.Group();
      const bBody = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.46), birdBodyMat);
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.22), wingMat);
      wingL.position.x = -0.28;
      const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.22), wingMat);
      wingR.position.x = 0.28;
      bg.add(bBody, wingL, wingR);
      root.add(bg);
      animRefs.birds.push({
        group: bg,
        wingL,
        wingR,
        cx: i < 3 ? 28 : 4,
        cz: i < 3 ? -4 + i * 7 : -6 + (i - 3) * 14,
        rx: 11 + i * 2.2,
        rz: 9 + i * 1.8,
        y: 11.5 + (i % 3) * 1.8,
        speed: 0.38 + (i % 2) * 0.12,
        phase: i * 1.4,
      });
    }
  } else if (stage === 2) {
    // 3 Industrial Steam Cargo Ships
    for (const s of [
      { x: 43.0, z: -9.5, yaw: -0.15, scale: 1.0, col: 0x9a3412, phase: 0.3 },
      { x: 52.0, z: 12.0, yaw: 0.4, scale: 1.12, col: 0x1d4ed8, phase: 2.0 },
      { x: 46.5, z: -26.5, yaw: -0.5, scale: 0.88, col: 0x0f766e, phase: 1.1 },
    ]) {
      const shipGroup = createSteamCargoShip(s.scale, s.col);
      shipGroup.position.set(s.x, -0.5, s.z);
      shipGroup.rotation.y = s.yaw;
      root.add(shipGroup);
      animRefs.ships.push({ group: shipGroup, baseY: -0.5, phase: s.phase, rollAmp: 0.025 });
    }

    // North-South Steel Railway Track along x = 20.2
    const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.35, metalness: 0.7 });
    const tieMat = new THREE.MeshStandardMaterial({ color: 0x452715, roughness: 0.9 });
    for (const rx of [19.4, 21.0]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 76), railMat);
      rail.position.set(rx, 0.06, 0);
      root.add(rail);
    }
    for (let rz = -36; rz <= 36; rz += 2.2) {
      const tie = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.06, 0.35), tieMat);
      tie.position.set(20.2, 0.03, rz);
      root.add(tie);
    }

    // Animated Steam Locomotive + 2 Cargo Wagons
    const train = new THREE.Group();
    train.position.set(20.2, 0.12, 0);
    const engineBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 1.5, 4.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 })
    );
    engineBody.position.y = 0.85;
    const boiler = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 2.8, 12),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 })
    );
    boiler.rotation.x = Math.PI / 2;
    boiler.position.set(0, 1.15, 1.2);
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1.2, 10), railMat);
    chimney.position.set(0, 2.0, 2.0);
    const wagonA = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.2, 3.8),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.75 })
    );
    wagonA.position.set(0, 0.75, -4.6);
    const wagonB = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.2, 3.8),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.75 })
    );
    wagonB.position.set(0, 0.75, -9.0);
    train.add(engineBody, boiler, chimney, wagonA, wagonB);
    root.add(train);
    animRefs.trainGroup = train;

    // Animated Industrial Cargo Trucks along Outer Perimeter Boulevard (safe off player central lanes)
    for (const spec of [
      {
        color: 0xb45309,
        speed: 4.5,
        pts: [{ x: -29.8, z: -29.8 }, { x: 16.0, z: -29.8 }, { x: 16.0, z: -31.2 }, { x: -29.8, z: -31.2 }],
      },
      {
        color: 0x475569,
        speed: 4.2,
        pts: [{ x: 16.0, z: 30.8 }, { x: -29.8, z: 30.8 }, { x: -29.8, z: 29.6 }, { x: 16.0, z: 29.6 }],
      },
    ]) {
      const truck = createRoadVehicleMesh('truck', spec.color);
      truck.position.set(spec.pts[0].x, 0, spec.pts[0].z);
      root.add(truck);
      animRefs.vehicles.push({
        group: truck,
        waypoints: spec.pts,
        wpIndex: 1,
        speed: spec.speed,
        x: spec.pts[0].x,
        z: spec.pts[0].z,
        yaw: 0,
      });
    }

    // Distant Foundry Skyline
    const brickMat = new THREE.MeshStandardMaterial({ map: textures.brickWall, roughness: 0.8 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.45, metalness: 0.5 });
    for (let i = 0; i < 4; i++) {
      const fz = -24 + i * 16;
      const hall = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 6), brickMat);
      hall.position.set(-48, 2.5, fz);
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 12, 10), ironMat);
      stack.position.set(-48, 8.5, fz - 1.5);
      root.add(hall, stack);
    }
  } else {
    // Stage 3: Modern Smart Eco-City — Compact Lake + Arched Footbridge at (-13.6, -13.6), Monorail, EV Traffic & Wind Turbines
    const lakeWater = new THREE.Mesh(
      new THREE.CircleGeometry(2.55, 24),
      new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        roughness: 0.12,
        metalness: 0.25,
      })
    );
    lakeWater.rotation.x = -Math.PI / 2;
    lakeWater.position.set(-13.6, 0.04, -13.6);
    const lakeRim = new THREE.Mesh(
      new THREE.RingGeometry(2.5, 2.85, 24),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6, side: THREE.DoubleSide })
    );
    lakeRim.rotation.x = -Math.PI / 2;
    lakeRim.position.set(-13.6, 0.03, -13.6);
    root.add(lakeWater, lakeRim);

    // Pedestrian Footbridges linking the central pond Gazebo island to East & West park paths
    const bridgeDeckMat = new THREE.MeshStandardMaterial({ map: textures.woodPlank, color: 0xf1f5f9, roughness: 0.6 });
    const railGlowMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.35 });
    const ewBridge = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.14, 1.35), bridgeDeckMat);
    ewBridge.position.set(-13.6, 0.1, -13.6);
    const bridgeRailN = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.35, 0.08), railGlowMat);
    bridgeRailN.position.set(-13.6, 0.32, -14.22);
    const bridgeRailS = bridgeRailN.clone();
    bridgeRailS.position.set(-13.6, 0.32, -12.98);
    root.add(ewBridge, bridgeRailN, bridgeRailS);

    // Elevated Futuristic Monorail Viaduct (along z = -22, y = 6.2m)
    const viaductMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
    const cyanAccent = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.65,
      roughness: 0.2,
    });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(82, 0.7, 1.8), viaductMat);
    beam.position.set(-4, 6.2, -22.0);
    const railStrip = new THREE.Mesh(new THREE.BoxGeometry(82, 0.18, 1.95), cyanAccent);
    railStrip.position.set(-4, 6.3, -22.0);
    root.add(beam, railStrip);

    for (const px of [-32, -16, 8, 20]) {
      const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.58, 6.0, 10), viaductMat);
      pier.position.set(px, 3.0, -22.0);
      root.add(pier);
    }

    // Animated Futuristic Monorail Train
    const monorail = new THREE.Group();
    monorail.position.set(0, 7.05, -22.0);
    const trainCar = new THREE.Mesh(new THREE.BoxGeometry(9.5, 1.25, 1.6), viaductMat);
    const windowBand = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.55, 1.66), cyanAccent);
    windowBand.position.y = 0.1;
    monorail.add(trainCar, windowBand);
    root.add(monorail);
    animRefs.monorailGroup = monorail;

    // 4 Colorful EV Cars & Eco-Buses cruising outer avenues smoothly
    for (const spec of [
      {
        kind: 'eco_bus' as const,
        color: 0x10b981,
        speed: 4.8,
        pts: [{ x: -30.0, z: -30.4 }, { x: 18.0, z: -30.4 }, { x: 18.0, z: 30.4 }, { x: -30.0, z: 30.4 }],
      },
      {
        kind: 'ev_car' as const,
        color: 0x0ea5e9,
        speed: 6.2,
        pts: [{ x: 18.0, z: 30.4 }, { x: -30.0, z: 30.4 }, { x: -30.0, z: -30.4 }, { x: 18.0, z: -30.4 }],
      },
      {
        kind: 'ev_car' as const,
        color: 0xf43f5e,
        speed: 5.8,
        pts: [{ x: -29.2, z: 1.5 }, { x: 18.5, z: 1.5 }, { x: 18.5, z: -1.5 }, { x: -29.2, z: -1.5 }],
      },
      {
        kind: 'eco_bus' as const,
        color: 0x3b82f6,
        speed: 4.6,
        pts: [{ x: 1.5, z: -29.0 }, { x: 1.5, z: 29.0 }, { x: -1.5, z: 29.0 }, { x: -1.5, z: -29.0 }],
      },
    ]) {
      const car = createRoadVehicleMesh(spec.kind, spec.color);
      car.position.set(spec.pts[0].x, 0, spec.pts[0].z);
      root.add(car);
      animRefs.vehicles.push({
        group: car,
        waypoints: spec.pts,
        wpIndex: 1,
        speed: spec.speed,
        x: spec.pts[0].x,
        z: spec.pts[0].z,
        yaw: 0,
      });
    }

    // Offshore Spinning Wind Turbines (framed clearly above horizon sky)
    const whiteMetalMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.4 });
    for (let i = 0; i < 4; i++) {
      const tz = -27 + i * 18;
      const tx = 58;
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.58, 11.5, 12), whiteMetalMat);
      tower.position.set(tx, 5.2, tz);
      const hub = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), whiteMetalMat);
      hub.position.set(tx - 0.45, 10.9, tz);
      root.add(hub);
      const rotor = new THREE.Group();
      rotor.position.set(tx - 0.55, 10.9, tz);
      for (let b = 0; b < 3; b++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.0, 0.48), whiteMetalMat);
        blade.position.y = 2.0;
        const bladeWrap = new THREE.Group();
        bladeWrap.rotation.x = (b * Math.PI * 2) / 3 + i * 0.4;
        bladeWrap.add(blade);
        rotor.add(bladeWrap);
      }
      animRefs.rotors.push(rotor);
      root.add(tower, rotor);
    }

    // Distant Eco-Skyscraper Horizon Silhouette
    const ecoGlassMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.15, metalness: 0.7 });
    for (let i = 0; i < 5; i++) {
      const h = 13 + (i % 3) * 5;
      const t = new THREE.Mesh(new THREE.BoxGeometry(5.5, h, 5.5), ecoGlassMat);
      t.position.set(-48, h / 2, -28 + i * 14);
      root.add(t);
    }
  }

  const disposeParticles = addEraAtmosphericParticles(stage, animRefs, root);

  return {
    root,
    update: (elapsed, dt) => {
      textures.waterWave.offset.x = (elapsed * 0.03) % 1;
      textures.waterWave.offset.y = (elapsed * 0.02) % 1;

      for (const ship of animRefs.ships) {
        ship.group.position.y = ship.baseY + Math.sin(elapsed * 1.4 + ship.phase) * 0.16;
        ship.group.rotation.z = Math.sin(elapsed * 1.1 + ship.phase) * ship.rollAmp;
      }

      for (const gear of animRefs.gears) {
        gear.rotation.z += dt * 1.2;
      }

      for (const puff of animRefs.smokePuffs) {
        const cycle = (elapsed * 0.6 + puff.phase) % 3.0;
        puff.mesh.position.y = puff.baseY + cycle * 1.4;
        puff.mesh.scale.setScalar(0.8 + cycle * 0.45);
      }

      if (animRefs.trainGroup) {
        animRefs.trainGroup.position.z = Math.sin(elapsed * 0.25) * 26.0;
      }

      if (animRefs.monorailGroup) {
        animRefs.monorailGroup.position.x = Math.sin(elapsed * 0.35) * 30.0 - 4.0;
      }

      for (const rotor of animRefs.rotors) {
        rotor.rotation.x += dt * 1.4;
      }

      // Gentle Sway of Tropical Palms & Festive Banners (zero-allocation InstancedMesh updates)
      if (animRefs.palmSway) {
        const { spots, frondsA, frondsB, crowns } = animRefs.palmSway;
        for (let idx = 0; idx < spots.length; idx++) {
          const [px, pz] = spots[idx];
          const scale = 0.85 + ((idx * 17) % 5) * 0.08;
          const yaw = idx * 0.7;
          const sway = Math.sin(elapsed * 1.45 + idx * 0.7) * 0.045;
          _swayDummy.scale.setScalar(scale);

          _swayDummy.position.set(px, 3.95 * scale, pz);
          _swayDummy.rotation.set(0.12 + sway, yaw, 0.08 + sway * 0.7);
          _swayDummy.updateMatrix();
          frondsA.setMatrixAt(idx, _swayDummy.matrix);

          _swayDummy.position.set(px, 3.9 * scale, pz);
          _swayDummy.rotation.set(-0.1 - sway * 0.7, yaw + Math.PI / 2, -0.08 + sway);
          _swayDummy.updateMatrix();
          frondsB.setMatrixAt(idx, _swayDummy.matrix);

          _swayDummy.position.set(px, 4.2 * scale, pz);
          _swayDummy.rotation.set(sway * 0.5, yaw + 0.4, 0);
          _swayDummy.updateMatrix();
          crowns.setMatrixAt(idx, _swayDummy.matrix);
        }
        frondsA.instanceMatrix.needsUpdate = true;
        frondsB.instanceMatrix.needsUpdate = true;
        crowns.instanceMatrix.needsUpdate = true;
      }

      for (const b of animRefs.banners) {
        b.mesh.rotation.z = b.baseRot + Math.sin(elapsed * 2.3 + b.phase) * 0.08;
      }

      for (const c of animRefs.craneArms) {
        c.arm.rotation.y = Math.sin(elapsed * 0.65 + c.phase) * 0.38;
        c.crate.position.y = -1.42 + Math.sin(elapsed * 1.3 + c.phase) * 0.18;
      }

      if (animRefs.surfFoam) {
        animRefs.surfFoam.position.x = 24.45 + Math.sin(elapsed * 1.6) * 0.25;
      }

      for (const cr of animRefs.critters) {
        const ang = elapsed * cr.speed + cr.phase;
        const nx = cr.cx + Math.cos(ang) * cr.r;
        const nz = cr.cz + Math.sin(ang) * cr.r;
        cr.group.position.set(nx, Math.abs(Math.sin(elapsed * 6 + cr.phase)) * 0.05, nz);
        cr.group.rotation.y = -ang;
      }

      for (const bird of animRefs.birds) {
        const ang = elapsed * bird.speed + bird.phase;
        const bx = bird.cx + Math.cos(ang) * bird.rx;
        const bz = bird.cz + Math.sin(ang) * bird.rz;
        bird.group.position.set(bx, bird.y + Math.sin(elapsed * 1.2 + bird.phase) * 0.45, bz);
        bird.group.rotation.y = -ang;
        const flap = Math.sin(elapsed * 8.5 + bird.phase) * 0.42;
        bird.wingL.rotation.z = flap;
        bird.wingR.rotation.z = -flap;
      }

      // Autonomous Crowd Patrols (zero-allocation update loop + role-specific idle gestures)
      const turnAlpha = 1 - Math.exp(-8 * dt);
      for (const agent of animRefs.crowd) {
        if (agent.pauseTimer > 0) {
          agent.pauseTimer -= dt;
          agent.rig.leftLeg.rotation.x *= 0.85;
          agent.rig.rightLeg.rotation.x *= 0.85;
          if (agent.def.behavior === 'tend_stall' || agent.def.behavior === 'converse') {
            const gesture = Math.sin(elapsed * 3.4 + agent.wpIndex) * 0.35;
            agent.rig.leftArm.rotation.x = -0.45 + gesture * 0.5;
            agent.rig.rightArm.rotation.x = -0.45 - gesture * 0.5;
          } else {
            agent.rig.leftArm.rotation.x *= 0.85;
            agent.rig.rightArm.rotation.x *= 0.85;
          }
          continue;
        }
        const target = agent.def.waypoints[agent.wpIndex];
        const dx = target.x - agent.x;
        const dz = target.z - agent.z;
        const dist = Math.hypot(dx, dz);

        if (dist < 0.28) {
          agent.wpIndex = (agent.wpIndex + 1) % agent.def.waypoints.length;
          agent.pauseTimer = agent.def.pauseSeconds;
        } else {
          const step = Math.min(dist, agent.def.speed * dt);
          agent.x += (dx / dist) * step;
          agent.z += (dz / dist) * step;

          const desiredYaw = Math.atan2(dx, dz);
          let diff = desiredYaw - agent.yaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          agent.yaw += diff * turnAlpha;

          agent.walkCycle += step * (agent.def.behavior === 'play_tag' ? 2.8 : 2.1);
          const swing = Math.sin(agent.walkCycle) * (agent.def.behavior === 'play_tag' ? 0.72 : 0.58);
          agent.rig.leftLeg.rotation.x = swing;
          agent.rig.rightLeg.rotation.x = -swing;
          agent.rig.leftArm.rotation.x = agent.def.prop === 'crate' ? -0.75 : -swing * 0.7;
          agent.rig.rightArm.rotation.x = agent.def.prop === 'crate' ? -0.75 : swing * 0.7;
        }

        const gy = groundHeightAt(agent.x, agent.z);
        const bounce =
          agent.def.behavior === 'play_tag' && agent.pauseTimer <= 0
            ? Math.abs(Math.sin(agent.walkCycle)) * 0.09
            : 0;
        agent.rig.root.position.set(agent.x, gy + bounce, agent.z);
        agent.rig.root.rotation.y = agent.yaw;
      }

      // Moving Vehicles & Vessels (Road Carts, Bicycles, Fishing Jukungs, Sailing Ships, Trucks, EVs)
      for (const veh of animRefs.vehicles) {
        const target = veh.waypoints[veh.wpIndex];
        const dx = target.x - veh.x;
        const dz = target.z - veh.z;
        const dist = Math.hypot(dx, dz);

        if (dist < 0.45) {
          veh.wpIndex = (veh.wpIndex + 1) % veh.waypoints.length;
        } else {
          const step = Math.min(dist, veh.speed * dt);
          veh.x += (dx / dist) * step;
          veh.z += (dz / dist) * step;

          const desiredYaw = Math.atan2(dx, dz);
          let diff = desiredYaw - veh.yaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          veh.yaw += diff * turnAlpha;
        }
        veh.group.position.x = veh.x;
        veh.group.position.z = veh.z;
        veh.group.rotation.y = veh.yaw;
      }

      // Gentle Floating Atmospheric Motes
      if (animRefs.particles && animRefs.particleBaseY) {
        const attr = animRefs.particles.geometry.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < animRefs.particleBaseY.length; i++) {
          attr.setY(i, animRefs.particleBaseY[i] + Math.sin(elapsed * 0.8 + i) * 0.45);
        }
        attr.needsUpdate = true;
      }
    },
    dispose: () => {
      nsRoadTex.dispose();
      ewRingTex.dispose();
      disposeParticles();
      for (const d of animRefs.disposables) {
        d();
      }
    },
  };
}
