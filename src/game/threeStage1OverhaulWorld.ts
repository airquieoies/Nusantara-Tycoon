import * as THREE from 'three';
import {
  CollectibleRarity,
  EnterableBuildingDef,
  STAGE1_COLLECTIBLES,
  STAGE1_DELIVERY_SPOTS,
  STAGE1_DISTRICTS,
  STAGE1_ENTERABLE_BUILDINGS,
  STAGE1_WARDROBE_MIRROR_SPOT,
  STAGE1_WORLD_PICKUPS,
} from './stage1Data';
import {
  BUKIT_WISATA,
  getStage1CrowdPatrols,
  getStage1Landmarks,
  getStage1SceneryBuildings,
  LIGHTHOUSE_ISLAND,
  STAGE1_SHIP_DECKS,
  STAGE1_SHORELINE_X,
  stage1GroundHeightAt,
} from './stage1Physics';
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

export interface Stage1OverhaulWorldHandle {
  root: THREE.Group;
  interiorRoofs: Map<string, THREE.Object3D>;
  pickupMeshes: Map<string, THREE.Object3D>;
  collectibleMeshes: Map<string, THREE.Object3D>;
  deliveryMeshes: Map<string, THREE.Object3D>;
  questBeacon: THREE.Group;
  update: (elapsed: number, dt: number, timeOfDay: number) => void;
  dispose: () => void;
}

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

function createSignboard(
  title: string,
  subtitle: string,
  bgHex: string,
  borderHex: string,
  disposables: (() => void)[]
): THREE.Group {
  const g = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.85 });
  for (const sx of [-1.2, 1.2]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.8, 7), postMat);
    post.position.set(sx, 1.4, 0);
    g.add(post);
  }
  const c = document.createElement('canvas');
  c.width = 420;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 420, 128);
  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 408, 116);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
  ctx.fillText(title, 210, 56);
  ctx.fillStyle = borderHex;
  ctx.font = '600 18px system-ui, -apple-system, sans-serif';
  ctx.fillText(subtitle, 210, 92);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const boardMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.65 });
  const backMat = new THREE.MeshStandardMaterial({ color: 0x452715, roughness: 0.85 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 0.14), [
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
  });
  return g;
}

function buildEnterableBuildingMesh(
  b: EnterableBuildingDef,
  textures: WorldTextures,
  disposables: (() => void)[]
): { group: THREE.Group; roofGroup: THREE.Group } {
  const group = new THREE.Group();
  group.position.set(b.x, 0, b.z);

  const wallMat = new THREE.MeshStandardMaterial({ color: b.wallColor, roughness: 0.85 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.8 });
  const roofMat = new THREE.MeshStandardMaterial({
    map: textures.roofTile,
    color: b.roofColor,
    roughness: 0.72,
  });
  const floorMat = new THREE.MeshStandardMaterial({
    map: textures.woodPlank,
    color: b.furnitureKind === 'townhall' || b.furnitureKind === 'school' ? 0xd6d3d1 : 0xb0804f,
    roughness: 0.78,
  });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });

  const w = b.halfW * 2;
  const d = b.halfD * 2;
  const t = 0.35;
  const h = b.wallHeight;

  // Raised interior floor slab (y = 0.22 matches stage1GroundHeightAt!)
  const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), floorMat);
  floor.position.y = 0.11;
  group.add(floor);

  // Entrance ramp/step on doorSide
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

  const addWallSegment = (cx: number, cz: number, sx: number, sz: number) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(sx, h, sz), wallMat);
    wall.position.set(cx, 0.22 + h / 2, cz);
    group.add(wall);
  };

  const addDoorFrame = (x: number, z: number, rotY: number) => {
    const frame = new THREE.Group();
    frame.position.set(x, 0.22, z);
    frame.rotation.y = rotY;
    const postL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.7, 0.45), trimMat);
    postL.position.set(-b.doorHalfWidth, 1.35, 0);
    const postR = postL.clone();
    postR.position.set(b.doorHalfWidth, 1.35, 0);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(b.doorHalfWidth * 2 + 0.36, 0.28, 0.48), trimMat);
    lintel.position.set(0, 2.75, 0);
    const upperWall = new THREE.Mesh(
      new THREE.BoxGeometry(b.doorHalfWidth * 2, Math.max(0.4, h - 2.8), 0.35),
      wallMat
    );
    upperWall.position.set(0, 2.8 + Math.max(0.4, h - 2.8) / 2, 0);
    frame.add(postL, postR, lintel, upperWall);
    group.add(frame);
  };

  // North wall
  if (b.doorSide === 'north') {
    const segW = b.halfW - b.doorHalfWidth;
    addWallSegment(-b.halfW + segW / 2, -b.halfD + t / 2, segW, t);
    addWallSegment(b.halfW - segW / 2, -b.halfD + t / 2, segW, t);
    addDoorFrame(0, -b.halfD + t / 2, 0);
  } else {
    addWallSegment(0, -b.halfD + t / 2, w, t);
  }

  // South wall
  if (b.doorSide === 'south') {
    const segW = b.halfW - b.doorHalfWidth;
    addWallSegment(-b.halfW + segW / 2, b.halfD - t / 2, segW, t);
    addWallSegment(b.halfW - segW / 2, b.halfD - t / 2, segW, t);
    addDoorFrame(0, b.halfD - t / 2, 0);
  } else {
    addWallSegment(0, b.halfD - t / 2, w, t);
  }

  // West wall
  if (b.doorSide === 'west') {
    const segD = b.halfD - b.doorHalfWidth;
    addWallSegment(-b.halfW + t / 2, -b.halfD + segD / 2, t, segD);
    addWallSegment(-b.halfW + t / 2, b.halfD - segD / 2, t, segD);
    addDoorFrame(-b.halfW + t / 2, 0, Math.PI / 2);
  } else {
    addWallSegment(-b.halfW + t / 2, 0, t, d);
  }

  // East wall
  if (b.doorSide === 'east') {
    const segD = b.halfD - b.doorHalfWidth;
    addWallSegment(b.halfW - t / 2, -b.halfD + segD / 2, t, segD);
    addWallSegment(b.halfW - t / 2, b.halfD - segD / 2, t, segD);
    addDoorFrame(b.halfW - t / 2, 0, Math.PI / 2);
  } else {
    addWallSegment(b.halfW - t / 2, 0, t, d);
  }

  // Interior Furniture (pushed cleanly toward inner edges so player can walk inside!)
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x7c4a26, roughness: 0.78 });
  const clothMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
  const bookColors = [0xd97706, 0x0284c7, 0x16a34a, 0xbe123c];

  if (b.furnitureKind === 'townhall') {
    const carpet = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.03, 3.6), clothMat);
    carpet.position.set(0, 0.235, -0.3);
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 1.2), deskMat);
    desk.position.set(0, 0.67, -2.2);
    const mapScroll = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.8), accentMat);
    mapScroll.position.set(0, 1.15, -2.2);
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.55), deskMat);
    shelf.position.set(3.4, 1.32, -2.8);
    group.add(carpet, desk, mapScroll, shelf);
  } else if (b.furnitureKind === 'market') {
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.95, 3.6), deskMat);
    counter.position.set(3.2, 0.7, 0);
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.1, 0.6), deskMat);
    shelf.position.set(-1.0, 1.27, -3.2);
    for (let i = 0; i < 3; i++) {
      const sack = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xd6b88d, roughness: 0.9 })
      );
      sack.position.set(-3.6 + i * 1.1, 0.62, 2.8);
      group.add(sack);
    }
    group.add(counter, shelf);
  } else if (b.furnitureKind === 'warehouse') {
    for (const [cx, cz] of [
      [-3.2, -2.4],
      [-2.0, -2.4],
      [-3.2, 2.2],
      [0.4, -2.5],
    ]) {
      const crate = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 1.0, 1.05),
        new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.84 })
      );
      crate.position.set(cx, 0.72, cz);
      group.add(crate);
    }
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.95, 10), deskMat);
    barrel.position.set(-0.8, 0.7, 2.4);
    group.add(barrel);
  } else if (b.furnitureKind === 'house') {
    const rug = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.04, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.88 })
    );
    rug.position.set(-0.6, 0.24, 0);
    const lowTable = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 1.1), deskMat);
    lowTable.position.set(-0.8, 0.45, 0);
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.0, 0.55), deskMat);
    shelf.position.set(-2.0, 1.22, -2.9);
    group.add(rug, lowTable, shelf);
  } else if (b.furnitureKind === 'workshop') {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.92, 1.1), deskMat);
    bench.position.set(-1.5, 0.68, 2.4);
    const rack = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 3.2), deskMat);
    rack.position.set(3.4, 1.32, 1.0);
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.9, 0.95), accentMat);
    crate.position.set(-3.4, 0.67, -2.2);
    group.add(bench, rack, crate);
  } else if (b.furnitureKind === 'school') {
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 1.5, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.85 })
    );
    board.position.set(0, 1.8, -3.55);
    const teacherDesk = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.85, 0.85), deskMat);
    teacherDesk.position.set(1.8, 0.65, -2.2);
    group.add(board, teacherDesk);
    for (const bx of [-4.2, 4.2]) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.4, 2.8), deskMat);
      shelf.position.set(bx, 1.42, -1.0);
      group.add(shelf);
      for (let r = 0; r < 3; r++) {
        const bookRow = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.28, 2.2),
          new THREE.MeshStandardMaterial({ color: bookColors[r % bookColors.length], roughness: 0.7 })
        );
        bookRow.position.set(bx, 0.8 + r * 0.65, -1.0);
        group.add(bookRow);
      }
    }
  } else if (b.furnitureKind === 'boutique') {
    const carpet = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.03, 3.4),
      new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.85 })
    );
    carpet.position.set(0, 0.235, 0);
    // Fabric display rack on west edge
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.1, 2.8), deskMat);
    rack.position.set(-3.4, 1.25, -0.5);
    const fabricRoll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 2.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.7 })
    );
    fabricRoll.rotation.x = Math.PI / 2;
    fabricRoll.position.set(-3.4, 1.4, -0.5);
    // Two stylized mannequin stands
    for (const [mx, mz, mCol] of [
      [-3.1, -2.5, 0xd97706],
      [-0.6, 2.6, 0x0284c7],
    ] as [number, number, number][]) {
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.2, 1.4, 8), deskMat);
      stand.position.set(mx, 0.92, mz);
      const bust = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.16, 0.65, 8),
        new THREE.MeshStandardMaterial({ color: mCol, roughness: 0.6 })
      );
      bust.position.set(mx, 1.72, mz);
      group.add(stand, bust);
    }

    // Glowing 3D Wardrobe Mirror matching STAGE1_WARDROBE_MIRROR_SPOT (-12.0, 23.6 => local +2.0, +1.6)
    const lx = STAGE1_WARDROBE_MIRROR_SPOT.x - b.x;
    const lz = STAGE1_WARDROBE_MIRROR_SPOT.z - b.z;
    const mirrorGroup = new THREE.Group();
    mirrorGroup.position.set(lx, 0.22, lz);
    mirrorGroup.rotation.y = -Math.PI * 0.25;
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.55 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.45,
      roughness: 0.12,
      metalness: 0.85,
    });
    const mBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.14, 0.55), frameMat);
    mBase.position.y = 0.07;
    const mFrame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.2, 0.12), frameMat);
    mFrame.position.y = 1.22;
    const mGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 1.94), glassMat);
    mGlass.position.set(0, 1.22, 0.07);
    const mRing = new THREE.Mesh(
      new THREE.RingGeometry(0.75, 1.0, 20),
      new THREE.MeshBasicMaterial({ color: 0xf472b6, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    mRing.rotation.x = -Math.PI / 2;
    mRing.position.set(0, 0.03, 0.5);
    const mLbl = createFloatingLabelSprite('Cermin Studio 3D', '[E] Ubah Karakter', '#f472b6');
    mLbl.sprite.position.set(0, 2.8, 0);
    mLbl.sprite.scale.set(3.2, 0.72, 1);
    disposables.push(mLbl.dispose);
    mirrorGroup.add(mBase, mFrame, mGlass, mRing, mLbl.sprite);

    group.add(carpet, rack, fabricRoll, mirrorGroup);
  } else if (b.furnitureKind === 'hotel') {
    const lobbyRug = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.03, 3.6),
      new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.85 })
    );
    lobbyRug.position.set(-1.2, 0.235, 0);
    const reception = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 2.6), deskMat);
    reception.position.set(2.4, 0.72, -1.8);
    // Guest beds along back-right corner
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 });
    const blanketMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.8 });
    for (const [bx, bz] of [
      [2.8, 2.2],
      [-1.4, 2.5],
    ] as [number, number][]) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.38, 1.25), deskMat);
      frame.position.set(bx, 0.41, bz);
      const pad = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.18, 1.15), mattressMat);
      pad.position.set(bx, 0.68, bz);
      const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.2, 1.17), blanketMat);
      blanket.position.set(bx + 0.35, 0.69, bz);
      group.add(frame, pad, blanket);
    }
    group.add(lobbyRug, reception);
  } else if (b.furnitureKind === 'cafe') {
    const barCounter = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.0, 0.9), deskMat);
    barCounter.position.set(-1.0, 0.72, 2.2);
    const urn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.26, 0.55, 10),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.7 })
    );
    urn.position.set(-1.2, 1.48, 2.2);
    const cafeRug = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 0.03, 3.0),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.88 })
    );
    cafeRug.position.set(1.2, 0.235, -0.4);
    for (const [tx, tz] of [
      [2.2, 1.4],
      [2.2, -2.0],
    ] as [number, number][]) {
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.08, 12), deskMat);
      top.position.set(tx, 0.96, tz);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.74, 8), stoneMat);
      leg.position.set(tx, 0.59, tz);
      group.add(top, leg);
    }
    group.add(cafeRug, barCounter, urn);
  }

  // Floating Label Sprite
  const label = createFloatingLabelSprite(b.label, 'Bisa Dimasuki', '#34d399');
  label.sprite.position.set(0, h + 2.5, 0);
  label.sprite.scale.set(4.2, 0.95, 1);
  group.add(label.sprite);
  disposables.push(label.dispose);

  // Separate Roof Group (hides cleanly when player steps inside!)
  const roofGroup = new THREE.Group();
  const roofLower = new THREE.Mesh(
    new THREE.ConeGeometry(Math.max(w, d) * 0.76, 1.5, 4),
    roofMat
  );
  roofLower.rotation.y = Math.PI / 4;
  roofLower.position.y = 0.22 + h + 0.75;
  const roofUpper = new THREE.Mesh(
    new THREE.ConeGeometry(Math.max(w, d) * 0.44, 1.35, 4),
    roofMat
  );
  roofUpper.rotation.y = Math.PI / 4;
  roofUpper.position.y = 0.22 + h + 1.85;
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 4), accentMat);
  crown.position.y = 0.22 + h + 2.75;
  roofGroup.add(roofLower, roofUpper, crown);
  group.add(roofGroup);

  return { group, roofGroup };
}

function createBoardablePinisiShip(textures: WorldTextures): THREE.Group {
  const ship = new THREE.Group();
  // Located in world coords matching STAGE1_SHIP_DECKS[0] (x: 64..84.5, z: 5.5..11.6)
  // Let's place ship local origin at (74.25, 0, 8.55) so halfLen = 10.25, halfW = 3.05
  ship.position.set(74.25, 0, 8.55);

  const hullMat = new THREE.MeshStandardMaterial({ map: textures.woodPlank, color: 0x7c4a26, roughness: 0.78 });
  const deckMat = new THREE.MeshStandardMaterial({ map: textures.woodPlank, color: 0xa16207, roughness: 0.76 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
  const mastMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.85 });
  const sailMat = new THREE.MeshStandardMaterial({
    map: textures.sailStripe,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });

  // Main hull body below deckY = 2.15
  const hull = new THREE.Mesh(new THREE.BoxGeometry(20.5, 2.45, 6.1), hullMat);
  hull.position.set(0, 0.92, 0);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(20.5, 0.16, 6.1), deckMat);
  deck.position.set(0, 2.08, 0);

  // Bow cone pointing East (+X)
  const bow = new THREE.Mesh(new THREE.ConeGeometry(3.05, 4.4, 4), hullMat);
  bow.rotation.z = -Math.PI / 2;
  bow.rotation.x = Math.PI / 4;
  bow.position.set(12.3, 1.35, 0);
  const bowsprit = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 5.2, 8), mastMat);
  bowsprit.rotation.z = -Math.PI / 2.6;
  bowsprit.position.set(13.2, 2.9, 0);

  // Raised Walkable Stern Deck (x: 64..69.5 => local x: -10.25..-4.75, y: 3.25)
  const sternBase = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.1, 6.0), trimMat);
  sternBase.position.set(-7.5, 2.7, 0);
  // Sloped ramp from main deck to stern deck (local x: -4.75..-2.95)
  const sternRamp = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.16, 4.6), deckMat);
  sternRamp.position.set(-3.85, 2.68, 0);
  sternRamp.rotation.z = -0.54;

  // Ship wheel on stern deck
  const wheelStand = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.9, 0.4), mastMat);
  wheelStand.position.set(-7.8, 3.7, 0);
  const wheelRing = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.06, 8, 16), trimMat);
  wheelRing.rotation.y = Math.PI / 2;
  wheelRing.position.set(-7.55, 4.15, 0);

  // Tall Pinisi Masts & Sails (overhead clearance > 3m above deck!)
  const mainMast = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 12.5, 8), mastMat);
  mainMast.position.set(-0.6, 8.2, 0);
  const mainSail = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 6.0), sailMat);
  mainSail.rotation.y = Math.PI / 2;
  mainSail.position.set(-0.2, 8.6, 0);

  const foreMast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 10.2, 8), mastMat);
  foreMast.position.set(5.4, 7.1, 0);
  const foreSail = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.6), sailMat);
  foreSail.rotation.y = Math.PI / 2;
  foreSail.position.set(5.75, 7.3, 0);

  // Cargo crates along edge of deck (out of gangway path)
  const crateMat = new THREE.MeshStandardMaterial({ color: 0xc28a46, roughness: 0.85 });
  const c1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.1), crateMat);
  c1.position.set(4.5, 2.6, 2.0);
  const c2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.85, 1.0), crateMat);
  c2.position.set(6.2, 2.57, -2.0);

  // Safety railings (split on north side around gangway x: 71.5..76.0 => local -2.75..1.75)
  const railMat = new THREE.MeshStandardMaterial({ color: 0x452715, roughness: 0.85 });
  const outerRail = new THREE.Mesh(new THREE.BoxGeometry(20.5, 0.65, 0.16), railMat);
  outerRail.position.set(0, 2.48, 2.98);
  const innerRailA = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.65, 0.16), railMat);
  innerRailA.position.set(-6.5, 3.0, -2.98);
  const innerRailB = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.65, 0.16), railMat);
  innerRailB.position.set(6.0, 2.48, -2.98);

  ship.add(
    hull,
    deck,
    bow,
    bowsprit,
    sternBase,
    sternRamp,
    wheelStand,
    wheelRing,
    mainMast,
    mainSail,
    foreMast,
    foreSail,
    c1,
    c2,
    outerRail,
    innerRailA,
    innerRailB
  );
  return ship;
}

function createBoardablePassengerShip(textures: WorldTextures): THREE.Group {
  const ship = new THREE.Group();
  // Matching STAGE1_SHIP_DECKS[1]: x 63..81.5, z -11.6..-5.5, deckY 2.05
  ship.position.set(72.25, 0, -8.55);

  const hullMat = new THREE.MeshStandardMaterial({ map: textures.woodPlank, color: 0x5c3a1e, roughness: 0.78 });
  const deckMat = new THREE.MeshStandardMaterial({ map: textures.woodPlank, color: 0xb45309, roughness: 0.76 });
  const sailMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9, side: THREE.DoubleSide });

  const hull = new THREE.Mesh(new THREE.BoxGeometry(18.5, 2.35, 6.1), hullMat);
  hull.position.set(0, 0.88, 0);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(18.5, 0.16, 6.1), deckMat);
  deck.position.set(0, 1.98, 0);
  const bow = new THREE.Mesh(new THREE.ConeGeometry(3.0, 4.0, 4), hullMat);
  bow.rotation.z = -Math.PI / 2;
  bow.rotation.x = Math.PI / 4;
  bow.position.set(11.1, 1.25, 0);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 10.5, 8), hullMat);
  mast.position.set(1.2, 7.2, 0);
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 5.2), sailMat);
  sail.rotation.y = Math.PI / 2;
  sail.position.set(1.5, 7.5, 0);

  // Passenger benches
  for (const bx of [-4.5, -1.5, 4.5]) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 0.7), hullMat);
    bench.position.set(bx, 2.28, -2.0);
    ship.add(bench);
  }

  ship.add(hull, deck, bow, mast, sail);
  return ship;
}

function createLandmarkModel(lm: StageLandmarkDef, textures: WorldTextures): THREE.Group {
  const g = new THREE.Group();
  const baseY = stage1GroundHeightAt(lm.x, lm.z);
  g.position.set(lm.x, baseY, lm.z);
  g.rotation.y = lm.yaw;

  const woodMat = new THREE.MeshStandardMaterial({ map: textures.woodPlank, roughness: 0.8 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.88 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.6 });
  const roofMat = new THREE.MeshStandardMaterial({ map: textures.roofTile, roughness: 0.72 });

  if (lm.kind === 'market') {
    const counter = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.0, 2.4), woodMat);
    counter.position.y = 0.5;
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.16, 3.0),
      new THREE.MeshStandardMaterial({ map: textures.sailStripe, roughness: 0.85, side: THREE.DoubleSide })
    );
    awning.position.set(0, 2.8, 0);
    awning.rotation.x = 0.16;
    for (const px of [-1.7, 1.7]) {
      for (const pz of [-1.1, 1.1]) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 6), woodMat);
        p.position.set(px, 1.4, pz);
        g.add(p);
      }
    }
    g.add(counter, awning);
  } else if (lm.kind === 'harbor_crane') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 1.3), woodMat);
    base.position.y = 0.15;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 3.8, 8), woodMat);
    mast.position.y = 2.05;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.22, 0.22), woodMat);
    arm.position.set(1.1, 3.9, 0);
    arm.rotation.z = 0.22;
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.8), goldMat);
    crate.position.set(2.2, 2.3, 0);
    g.add(base, mast, arm, crate);
  } else if (lm.kind === 'park_gazebo') {
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 0.35, 12), woodMat);
    deck.position.y = 0.175;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.3, 8), woodMat);
      col.position.set(Math.cos(a) * 1.25, 1.35, Math.sin(a) * 1.25);
      g.add(col);
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.35, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 3.1;
    g.add(deck, roof);
  } else if (lm.id === 'lm-mercusuar') {
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 1.0, 12), stoneMat);
    plinth.position.y = 0.5;
    const lowerTower = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.45, 4.0, 14),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.75 })
    );
    lowerTower.position.y = 3.0;
    const midBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.15, 3.2, 14),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.75 })
    );
    midBand.position.y = 6.6;
    const lantern = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.75, 1.1, 12),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 1.4 })
    );
    lantern.position.y = 8.75;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.0, 12), stoneMat);
    cap.position.y = 9.8;
    g.add(plinth, lowerTower, midBand, lantern, cap);
  } else {
    // Tugu monument
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.85, 2.0), stoneMat);
    plinth.position.y = 0.425;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.9, 1.15), stoneMat);
    shaft.position.y = 2.3;
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.4, 4), goldMat);
    crown.rotation.y = Math.PI / 4;
    crown.position.y = 4.45;
    g.add(plinth, shaft, crown);
  }

  return g;
}

function createSceneryModel(sc: SceneryBuildingDef, textures: WorldTextures): THREE.Group {
  const g = new THREE.Group();
  g.position.set(sc.x, stage1GroundHeightAt(sc.x, sc.z), sc.z);
  g.rotation.y = sc.yaw;

  const w = sc.halfW * 2;
  const d = sc.halfD * 2;
  const woodMat = new THREE.MeshStandardMaterial({ map: textures.woodPlank, roughness: 0.82 });
  const roofMat = new THREE.MeshStandardMaterial({ map: textures.roofTile, roughness: 0.72 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 });
  const wallPal = [0xefe3ce, 0xf3e8d2, 0xe2d5be, 0xf5ebe0];
  const wallMat = new THREE.MeshStandardMaterial({
    color: wallPal[sc.variant % wallPal.length],
    roughness: 0.85,
  });

  if (sc.kind === 'pocket_park') {
    const lawn = new THREE.Mesh(
      new THREE.CylinderGeometry(w * 0.48, w * 0.5, 0.14, 16),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.9 })
    );
    lawn.position.y = 0.07;
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.42, 0.5), woodMat);
    bench.position.set(0, 0.26, 0.8);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.6, 7), woodMat);
    trunk.position.set(-0.6, 0.8, -0.5);
    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 })
    );
    crown.position.set(-0.6, 2.0, -0.5);
    g.add(lawn, bench, trunk, crown);
    return g;
  }

  if (sc.kind === 'spice_stall' || sc.kind === 'cloth_stall' || sc.kind === 'food_stall') {
    const counter = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.92, d * 0.8), woodMat);
    counter.position.y = 0.46;
    const awningColor = sc.kind === 'cloth_stall' ? 0xbe123c : sc.kind === 'food_stall' ? 0x15803d : 0xffffff;
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(w * 1.0, 0.14, d * 1.1),
      new THREE.MeshStandardMaterial({
        ...(sc.kind === 'spice_stall' ? { map: textures.sailStripe } : {}),
        color: awningColor,
        roughness: 0.85,
      })
    );
    awning.position.set(0, 2.45, 0);
    awning.rotation.x = 0.14;
    for (const px of [-w * 0.4, w * 0.4]) {
      for (const pz of [-d * 0.35, d * 0.35]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), woodMat);
        post.position.set(px, 1.2, pz);
        g.add(post);
      }
    }
    g.add(counter, awning);
    return g;
  }

  if (sc.kind === 'pendopo_hall') {
    const floor = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.4, d * 0.96), stoneMat);
    floor.position.y = 0.2;
    g.add(floor);
    for (const px of [-w * 0.36, w * 0.36]) {
      for (const pz of [-d * 0.36, d * 0.36]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.2, 7), woodMat);
        col.position.set(px, 1.5, pz);
        g.add(col);
      }
    }
    const r1 = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.76, 1.3, 4), roofMat);
    r1.rotation.y = Math.PI / 4;
    r1.position.y = 3.15;
    const r2 = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.42, 1.2, 4), roofMat);
    r2.rotation.y = Math.PI / 4;
    r2.position.y = 4.05;
    g.add(r1, r2);
    return g;
  }

  if (sc.kind === 'stilt_house') {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, 0.2, d * 0.92), woodMat);
    deck.position.y = 0.85;
    for (const sx of [-w * 0.34, w * 0.34]) {
      for (const sz of [-d * 0.34, d * 0.34]) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.9, 6), woodMat);
        p.position.set(sx, 0.45, sz);
        g.add(p);
      }
    }
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(w * 0.78, 1.75, d * 0.76), wallMat);
    cabin.position.y = 1.82;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.72, 1.35, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 3.35;
    g.add(deck, cabin, roof);
    return g;
  }

  if (sc.kind === 'cargo_depot') {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.38, d * 0.96), stoneMat);
    pad.position.y = 0.19;
    const shed = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.9, 2.5, d * 0.86),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 })
    );
    shed.position.y = 1.63;
    const vault = new THREE.Mesh(
      new THREE.CylinderGeometry(d * 0.44, d * 0.44, w * 0.9, 10, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 })
    );
    vault.rotation.z = Math.PI / 2;
    vault.position.y = 2.9;
    g.add(pad, shed, vault);
    return g;
  }

  if (sc.kind === 'ruko_2story') {
    const facadeColors = [0xf8fafc, 0xfef3c7, 0xe0f2fe, 0xfce7f3];
    const upperMat = new THREE.MeshStandardMaterial({
      color: facadeColors[sc.variant % facadeColors.length],
      roughness: 0.8,
    });
    const awningColors = [0xb91c1c, 0x0f766e, 0xd97706, 0x1d4ed8];
    const awningMat = new THREE.MeshStandardMaterial({
      color: awningColors[sc.variant % awningColors.length],
      roughness: 0.78,
    });
    const winMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.3,
      roughness: 0.3,
    });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, 0.26, d * 0.98), stoneMat);
    plinth.position.y = 0.13;
    const f1 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 2.45, d * 0.86), wallMat);
    f1.position.y = 1.48;
    const f2 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 2.35, d * 0.86), upperMat);
    f2.position.y = 3.88;
    const awning = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, 0.14, 0.75), awningMat);
    awning.position.set(0, 2.42, d * 0.43 + 0.34);
    awning.rotation.x = 0.22;
    const balcony = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, 0.14, 0.62), stoneMat);
    balcony.position.set(0, 2.82, d * 0.43 + 0.25);
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.75, 0.12), woodMat);
    door.position.set(-w * 0.18, 1.12, d * 0.43 + 0.04);
    const shopWin = new THREE.Mesh(new THREE.BoxGeometry(w * 0.34, 1.1, 0.1), winMat);
    shopWin.position.set(w * 0.2, 1.35, d * 0.43 + 0.04);
    for (const wx of [-w * 0.24, w * 0.24]) {
      const upWin = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.95, 0.1), winMat);
      upWin.position.set(wx, 3.85, d * 0.43 + 0.04);
      g.add(upWin);
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.74, 1.45, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 5.75;
    g.add(plinth, f1, f2, awning, balcony, door, shopWin, roof);
    return g;
  }

  if (sc.kind === 'hotel_coastal') {
    const facade = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.92, 5.4, d * 0.86),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.78 })
    );
    facade.position.y = 2.85;
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, 0.32, d * 0.96), stoneMat);
    plinth.position.y = 0.16;
    const trimTeal = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.7 });
    const winMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.35,
      roughness: 0.28,
    });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 1.1), trimTeal);
    canopy.position.set(0, 2.2, d * 0.43 + 0.45);
    for (const fy of [2.9, 4.45]) {
      const balc = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.16, 0.6), stoneMat);
      balc.position.set(0, fy - 0.55, d * 0.43 + 0.24);
      g.add(balc);
      for (const wx of [-w * 0.28, 0, w * 0.28]) {
        const wMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.92, 0.1), winMat);
        wMesh.position.set(wx, fy, d * 0.43 + 0.04);
        g.add(wMesh);
      }
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.76, 1.5, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 6.25;
    g.add(plinth, facade, canopy, roof);
    return g;
  }

  if (sc.kind === 'office_colonial') {
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xfdf6e7, roughness: 0.82 });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w, 0.45, d), stoneMat);
    plinth.position.y = 0.225;
    const body = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 4.6, d * 0.84), creamMat);
    body.position.y = 2.75;
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 });
    for (const px of [-w * 0.36, -w * 0.12, w * 0.12, w * 0.36]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 4.4, 8), pillarMat);
      col.position.set(px, 2.65, d * 0.44);
      g.add(col);
    }
    const winMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
    for (const wx of [-w * 0.25, 0, w * 0.25]) {
      const w1 = new THREE.Mesh(new THREE.BoxGeometry(0.68, 1.05, 0.1), winMat);
      w1.position.set(wx, 1.85, d * 0.42 + 0.02);
      const w2 = w1.clone();
      w2.position.y = 3.75;
      g.add(w1, w2);
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.76, 1.7, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 5.9;
    g.add(plinth, body, roof);
    return g;
  }

  if (sc.kind === 'apartment_block') {
    const pal = [0xe2e8f0, 0xfef3c7, 0xdbeafe];
    const blockMat = new THREE.MeshStandardMaterial({
      color: pal[sc.variant % pal.length],
      roughness: 0.82,
    });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.75 });
    const winMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.25,
      roughness: 0.35,
    });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, 0.32, d * 0.98), stoneMat);
    plinth.position.y = 0.16;
    const tower = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 6.2, d * 0.86), blockMat);
    tower.position.y = 3.42;
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, 0.35, d * 0.9), trimMat);
    parapet.position.y = 6.65;
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.95, 10), trimMat);
    tank.position.set(w * 0.22, 7.25, 0);
    for (const fy of [1.7, 3.4, 5.1]) {
      for (const wx of [-w * 0.28, 0, w * 0.28]) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.82, 0.1), winMat);
        win.position.set(wx, fy, d * 0.43 + 0.04);
        g.add(win);
      }
    }
    g.add(plinth, tower, parapet, tank);
    return g;
  }

  if (sc.kind === 'cafe_terrace') {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, 0.24, d * 0.98), woodMat);
    deck.position.y = 0.12;
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.72, 2.35, d * 0.62),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.8 })
    );
    cabin.position.set(0, 1.4, -d * 0.12);
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.94, 0.14, d * 0.96),
      new THREE.MeshStandardMaterial({ map: textures.sailStripe, roughness: 0.85 })
    );
    canopy.position.set(0, 2.72, 0.08);
    canopy.rotation.x = 0.12;
    const counter = new THREE.Mesh(new THREE.BoxGeometry(w * 0.65, 0.95, 0.55), woodMat);
    counter.position.set(0, 0.7, d * 0.24);
    g.add(deck, cabin, canopy, counter);
    return g;
  }

  if (sc.kind === 'cultural_hall') {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, d), stoneMat);
    plinth.position.y = 0.25;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.82, 2.5, d * 0.78),
      new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.8 })
    );
    body.position.y = 1.75;
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.6 });
    for (const px of [-w * 0.42, w * 0.42]) {
      for (const pz of [-d * 0.4, d * 0.4]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 2.55, 8), goldMat);
        col.position.set(px, 1.78, pz);
        g.add(col);
      }
    }
    const r1 = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.76, 1.45, 4), roofMat);
    r1.rotation.y = Math.PI / 4;
    r1.position.y = 3.7;
    const r2 = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.42, 1.25, 4), roofMat);
    r2.rotation.y = Math.PI / 4;
    r2.position.y = 4.75;
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.65, 4), goldMat);
    spire.position.y = 5.65;
    g.add(plinth, body, r1, r2, spire);
    return g;
  }

  if (sc.kind === 'clinic_post') {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.28, d * 0.96), stoneMat);
    plinth.position.y = 0.14;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.86, 2.3, d * 0.82),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.78 })
    );
    body.position.y = 1.42;
    const crossMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.2, 0.08), crossMat);
    crossH.position.set(0, 2.15, d * 0.41 + 0.04);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.68, 0.08), crossMat);
    crossV.position.set(0, 2.15, d * 0.41 + 0.04);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(Math.max(w, d) * 0.74, 1.3, 4),
      new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.72 })
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 3.2;
    g.add(plinth, body, crossH, crossV, roof);
    return g;
  }

  if (sc.kind === 'workshop_open') {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.24, d * 0.96), stoneMat);
    pad.position.y = 0.12;
    for (const px of [-w * 0.4, w * 0.4]) {
      for (const pz of [-d * 0.38, d * 0.38]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 2.6, 7), woodMat);
        post.position.set(px, 1.42, pz);
        g.add(post);
      }
    }
    const bench = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, 0.9, 0.8), woodMat);
    bench.position.set(-w * 0.12, 0.68, -d * 0.15);
    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.85, 0.85),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.82 })
    );
    crate.position.set(w * 0.22, 0.66, d * 0.14);
    const tinRoof = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.98, 0.16, d * 0.98),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.65, metalness: 0.35 })
    );
    tinRoof.position.y = 2.82;
    tinRoof.rotation.x = 0.08;
    g.add(pad, bench, crate, tinRoof);
    return g;
  }

  // joglo_house & wooden_warehouse
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.35, d * 0.96), stoneMat);
  plinth.position.y = 0.175;
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.86, 2.15, d * 0.82),
    sc.kind === 'wooden_warehouse' ? woodMat : wallMat
  );
  body.position.y = 1.42;
  const r1 = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.74, 1.35, 4), roofMat);
  r1.rotation.y = Math.PI / 4;
  r1.position.y = 3.1;
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.5, 0.12), woodMat);
  door.position.set(0, 1.1, d * 0.41 + 0.04);
  g.add(plinth, body, r1, door);
  return g;
}

export function buildStage1OverhaulWorld(textures: WorldTextures): Stage1OverhaulWorldHandle {
  const root = new THREE.Group();
  const interiorRoofs = new Map<string, THREE.Object3D>();
  const pickupMeshes = new Map<string, THREE.Object3D>();
  const collectibleMeshes = new Map<string, THREE.Object3D>();
  const deliveryMeshes = new Map<string, THREE.Object3D>();
  const disposables: (() => void)[] = [];

  // 1. Main Tropical Earth/Grass Ground (x: -135..52)
  const groundTex = textures.sandEarth.clone();
  groundTex.repeat.set(36, 36);
  groundTex.needsUpdate = true;
  disposables.push(() => groundTex.dispose());

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(187, 240),
    new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.94 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(-41.5, 0, 0);
  ground.receiveShadow = true;
  root.add(ground);

  // Beach Sand Strip (x: 50.5..54.5)
  const sandMat = new THREE.MeshStandardMaterial({ color: 0xe2c799, roughness: 0.92 });
  const beach = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.25, 220), sandMat);
  beach.position.set(52.1, -0.05, 0);
  beach.rotation.z = -0.1;
  root.add(beach);

  // Extended Ocean Bay (x: 52..240)
  const waterTex = textures.waterWave.clone();
  waterTex.repeat.set(24, 24);
  waterTex.needsUpdate = true;
  disposables.push(() => waterTex.dispose());

  const oceanMat = new THREE.MeshStandardMaterial({
    map: waterTex,
    color: 0x0ea5e9,
    roughness: 0.22,
    metalness: 0.18,
  });
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(195, 280), oceanMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(148, -0.28, 0);
  root.add(ocean);

  const surfFoam = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 220),
    new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.42 })
  );
  surfFoam.rotation.x = -Math.PI / 2;
  surfFoam.position.set(53.4, -0.18, 0);
  root.add(surfFoam);

  // 2. Bukit Wisata Nusantara Displaced Hill Mesh (exact match to stage1GroundHeightAt!)
  const hillGeo = new THREE.PlaneGeometry(46, 46, 36, 36);
  hillGeo.rotateX(-Math.PI / 2);
  const posAttr = hillGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const lx = posAttr.getX(i);
    const lz = posAttr.getZ(i);
    const dist = Math.hypot(lx, lz);
    let h = 0;
    if (dist <= BUKIT_WISATA.plateauRadius) {
      h = BUKIT_WISATA.height;
    } else if (dist <= BUKIT_WISATA.outerRadius) {
      const norm = (dist - BUKIT_WISATA.plateauRadius) / (BUKIT_WISATA.outerRadius - BUKIT_WISATA.plateauRadius);
      h = 0.5 * (1 + Math.cos(norm * Math.PI)) * BUKIT_WISATA.height;
    }
    posAttr.setY(i, h);
  }
  hillGeo.computeVertexNormals();
  const hillMesh = new THREE.Mesh(
    hillGeo,
    new THREE.MeshStandardMaterial({ color: 0x4b7738, roughness: 0.9 })
  );
  hillMesh.position.set(BUKIT_WISATA.x, 0, BUKIT_WISATA.z);
  root.add(hillMesh);
  disposables.push(() => hillGeo.dispose());

  // 3. Waterfall & Cliff + Sungai Nusantara River Channels
  const cliffMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.92 });
  const waterfallGroup = new THREE.Group();
  waterfallGroup.position.set(-80.0, 0, -42.0);
  const cliffMain = new THREE.Mesh(new THREE.BoxGeometry(5.5, 6.2, 6.0), cliffMat);
  cliffMain.position.set(-2.2, 2.8, 0);
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(5.8, 22),
    new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.15, transparent: true, opacity: 0.86 })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(3.8, 0.05, 0);
  const fallMat = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.82,
  });
  const fallStrip = new THREE.Mesh(new THREE.BoxGeometry(0.45, 5.4, 2.8), fallMat);
  fallStrip.position.set(0.6, 2.7, 0);
  fallStrip.rotation.z = -0.14;
  waterfallGroup.add(cliffMain, pool, fallStrip);
  root.add(waterfallGroup);

  // Feeder stream from waterfall pool to Sungai Nusantara (-76 -> -58, z = -42)
  const riverMat = new THREE.MeshStandardMaterial({
    map: waterTex,
    color: 0x0284c7,
    roughness: 0.18,
    transparent: true,
    opacity: 0.88,
  });
  const stream = new THREE.Mesh(new THREE.PlaneGeometry(18, 3.6), riverMat);
  stream.rotation.x = -Math.PI / 2;
  stream.position.set(-67, 0.03, -42);
  root.add(stream);

  // North-South & East-West Sungai Nusantara Water Ribbons + Stone Embankments
  const riverNS = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 105), riverMat);
  riverNS.rotation.x = -Math.PI / 2;
  riverNS.position.set(-58, -0.12, 6.5);
  const riverBedNS = new THREE.Mesh(
    new THREE.PlaneGeometry(7.4, 105),
    new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.95 })
  );
  riverBedNS.rotation.x = -Math.PI / 2;
  riverBedNS.position.set(-58, -0.45, 6.5);

  const riverEW = new THREE.Mesh(new THREE.PlaneGeometry(113.5, 7.0), riverMat);
  riverEW.rotation.x = -Math.PI / 2;
  riverEW.position.set(-4.75, -0.12, 56);
  const riverBedEW = new THREE.Mesh(
    new THREE.PlaneGeometry(113.5, 7.4),
    new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.95 })
  );
  riverBedEW.rotation.x = -Math.PI / 2;
  riverBedEW.position.set(-4.75, -0.45, 56);
  root.add(riverBedNS, riverNS, riverBedEW, riverEW);

  // 4. Two Arched Walkable River Bridges (exact Y match to stage1GroundHeightAt!)
  const bridgeWood = new THREE.MeshStandardMaterial({ map: textures.woodPlank, color: 0x92400e, roughness: 0.8 });
  const railWood = new THREE.MeshStandardMaterial({ color: 0x452715, roughness: 0.85 });

  // West Bridge (x: -65..-51, z: -3.4..3.4)
  for (let i = 0; i < 12; i++) {
    const t0 = i / 12;
    const t1 = (i + 1) / 12;
    const tm = (t0 + t1) / 2;
    const wx = -65 + tm * 14;
    const y = Math.sin(tm * Math.PI) * 1.65;
    const slope = Math.atan2(
      (Math.sin(t1 * Math.PI) - Math.sin(t0 * Math.PI)) * 1.65,
      14 / 12
    );
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.24, 6.8), bridgeWood);
    plank.position.set(wx, y - 0.1, 0);
    plank.rotation.z = slope;
    root.add(plank);
    for (const rz of [-3.25, 3.25]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 0.18), railWood);
      post.position.set(wx, y + 0.35, rz);
      root.add(post);
    }
  }

  // South Bridge (z: 49..63, x: -3.4..3.4)
  for (let i = 0; i < 12; i++) {
    const t0 = i / 12;
    const t1 = (i + 1) / 12;
    const tm = (t0 + t1) / 2;
    const wz = 49 + tm * 14;
    const y = Math.sin(tm * Math.PI) * 1.65;
    const slope = -Math.atan2(
      (Math.sin(t1 * Math.PI) - Math.sin(t0 * Math.PI)) * 1.65,
      14 / 12
    );
    const plank = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.24, 1.32), bridgeWood);
    plank.position.set(0, y - 0.1, wz);
    plank.rotation.x = slope;
    root.add(plank);
    for (const rx of [-3.25, 3.25]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 0.18), railWood);
      post.position.set(rx, y + 0.35, wz);
      root.add(post);
    }
  }

  // 5. Lighthouse Island in Eastern Harbor Bay
  const islGeo = new THREE.PlaneGeometry(28, 28, 24, 24);
  islGeo.rotateX(-Math.PI / 2);
  const islAttr = islGeo.attributes.position;
  for (let i = 0; i < islAttr.count; i++) {
    const lx = islAttr.getX(i);
    const lz = islAttr.getZ(i);
    const d = Math.hypot(lx, lz);
    let h = -0.35;
    if (d <= LIGHTHOUSE_ISLAND.plateauRadius) {
      h = LIGHTHOUSE_ISLAND.height;
    } else if (d <= LIGHTHOUSE_ISLAND.radius) {
      const t = 1 - (d - LIGHTHOUSE_ISLAND.plateauRadius) / (LIGHTHOUSE_ISLAND.radius - LIGHTHOUSE_ISLAND.plateauRadius);
      h = -0.3 + t * (LIGHTHOUSE_ISLAND.height + 0.3);
    }
    islAttr.setY(i, h);
  }
  islGeo.computeVertexNormals();
  const islMesh = new THREE.Mesh(islGeo, new THREE.MeshStandardMaterial({ color: 0xc2a878, roughness: 0.9 }));
  islMesh.position.set(LIGHTHOUSE_ISLAND.x, 0, LIGHTHOUSE_ISLAND.z);
  const islGrass = new THREE.Mesh(
    new THREE.CylinderGeometry(7.3, 7.6, 0.12, 20),
    new THREE.MeshStandardMaterial({ color: 0x4d7c36, roughness: 0.9 })
  );
  islGrass.position.set(LIGHTHOUSE_ISLAND.x, LIGHTHOUSE_ISLAND.height - 0.02, LIGHTHOUSE_ISLAND.z);
  root.add(islMesh, islGrass);
  disposables.push(() => islGeo.dispose());

  // 6. Connected Cobblestone Road Network & Central Plaza
  const makeRoad = (cx: number, cz: number, sx: number, sz: number, rx: number, ry: number) => {
    const t = textures.cobbleRoad.clone();
    t.repeat.set(rx, ry);
    t.needsUpdate = true;
    disposables.push(() => t.dispose());
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(sx, sz),
      new THREE.MeshStandardMaterial({ map: t, roughness: 0.86 })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, 0.02, cz);
    mesh.receiveShadow = true;
    root.add(mesh);
  };

  makeRoad(-0.5, 0, 102, 7.0, 20, 2); // Grand EW Ave (-51..52)
  makeRoad(-68.5, 0, 7.5, 7.0, 2, 2); // West approach across bridge
  makeRoad(0, -11.5, 7.0, 121, 2, 24); // Central NS Ave (-72..49)
  makeRoad(0, 70.5, 7.0, 15, 2, 3); // South Ave past South Bridge (63..78)
  makeRoad(21.5, -2, 5.0, 96, 1.5, 18); // Market Ave
  makeRoad(-29.5, -8, 5.0, 120, 1.5, 22); // Kampung West Ave
  makeRoad(50, 0, 4.0, 88, 1.2, 16); // Coastal Promenade
  makeRoad(-3, -53.75, 90, 4.5, 16, 1.5); // Education Ave
  makeRoad(7, 36, 78, 5.0, 15, 1.5); // Industrial Ave

  // Alun-Alun Central Plaza
  const plazaTex = textures.cobbleRoad.clone();
  plazaTex.repeat.set(6, 6);
  plazaTex.needsUpdate = true;
  disposables.push(() => plazaTex.dispose());
  const plaza = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 22),
    new THREE.MeshStandardMaterial({ map: plazaTex, color: 0xe7d8c1, roughness: 0.82 })
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(-3, 0.025, 0);
  root.add(plaza);

  // District Entrance Signboards
  const districtSigns: [number, number, number, string, string, string, string][] = [
    [18.2, -5.0, Math.PI / 2, 'PASAR TRADISIONAL', 'Sentra Rempah & Batik', '#451a03', '#f59e0b'],
    [47.5, -5.0, -Math.PI / 2, 'PELABUHAN NIAGA', '3 Dermaga & Kapal Pinisi', '#0c4a6e', '#38bdf8'],
    [-24.2, -5.0, Math.PI / 2, 'PERMUKIMAN WARGA', 'Kampung & Rumah Adat', '#064e3b', '#34d399'],
    [6.0, 31.0, 0, 'KAWASAN INDUSTRI', 'Bengkel & Logistik', '#431407', '#fb923c'],
    [6.0, -49.0, Math.PI, 'KAWASAN PENDIDIKAN', 'Sekolah & Perpustakaan', '#1e1b4b', '#818cf8'],
    [-66.5, -5.0, Math.PI / 2, 'WISATA ALAM & BUKIT', 'Air Terjun & Sungai', '#14532d', '#4ade80'],
  ];
  for (const [sx, sz, ry, title, sub, bg, border] of districtSigns) {
    const sign = createSignboard(title, sub, bg, border, disposables);
    sign.position.set(sx, 0, sz);
    sign.rotation.y = ry;
    root.add(sign);
  }

  // 7. Three Wooden Piers + Ramps + Pilings
  const pierMat = new THREE.MeshStandardMaterial({ map: textures.woodPlank, roughness: 0.8 });
  const postMat = new THREE.MeshStandardMaterial({ color: 0x452715, roughness: 0.9 });
  const buildPier = (xStart: number, xEnd: number, zCenter: number, width: number) => {
    const len = xEnd - xStart;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(len, 0.25, width), pierMat);
    deck.position.set(xStart + len / 2, PIER_HEIGHT - 0.125, zCenter);
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.22, width), pierMat);
    ramp.position.set(xStart - 1.4, PIER_HEIGHT * 0.45, zCenter);
    ramp.rotation.z = 0.23;
    root.add(deck, ramp);
    for (let px = xStart + 2; px <= xEnd - 1; px += 6) {
      for (const pz of [zCenter - width / 2 + 0.4, zCenter + width / 2 - 0.4]) {
        const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 1.6, 8), postMat);
        pile.position.set(px, 0.1, pz);
        root.add(pile);
      }
    }
  };
  buildPier(52.5, 85.0, 0, 8.4); // Main Pier
  buildPier(52.5, 74.0, -30.75, 6.5); // North Pier
  buildPier(52.5, 72.0, 28.25, 6.5); // South Pier

  // 8. Two Boardable Ships + Walkable Gangways (matching STAGE1_SHIP_DECKS!)
  root.add(createBoardablePinisiShip(textures));
  root.add(createBoardablePassengerShip(textures));

  for (const ship of STAGE1_SHIP_DECKS) {
    const gw = ship.gangway;
    const gwWidth = gw.maxX - gw.minX;
    const dz = gw.endZ - gw.startZ;
    const dy = ship.deckY - PIER_HEIGHT;
    const gwLen = Math.hypot(dz, dy);
    const gwMesh = new THREE.Mesh(new THREE.BoxGeometry(gwWidth, 0.2, gwLen), pierMat);
    gwMesh.position.set(
      (gw.minX + gw.maxX) / 2,
      (PIER_HEIGHT + ship.deckY) / 2 - 0.08,
      (gw.startZ + gw.endZ) / 2
    );
    gwMesh.rotation.x = -Math.atan2(dy, dz);
    root.add(gwMesh);
  }

  // Harbor Background Ships (anchored + gentle bobbing barge)
  const bobbingShips: { group: THREE.Group; baseY: number; phase: number }[] = [];
  const bgShipMat = new THREE.MeshStandardMaterial({ map: textures.woodPlank, color: 0x6b3f20, roughness: 0.8 });
  const bgSailMat = new THREE.MeshStandardMaterial({ map: textures.sailStripe, side: THREE.DoubleSide, roughness: 0.9 });
  for (const [bx, bz, ry, ph] of [
    [104, 22, -0.5, 0.2],
    [112, -38, 0.4, 1.4],
    [98, -58, 0.15, 2.5],
  ] as [number, number, number, number][]) {
    const s = new THREE.Group();
    const h = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.4, 10.0), bgShipMat);
    h.position.y = 0.6;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 7.5, 7), bgShipMat);
    m.position.y = 4.4;
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 4.2), bgSailMat);
    sail.rotation.y = Math.PI / 2;
    sail.position.set(0.2, 4.6, 0);
    s.add(h, m, sail);
    s.position.set(bx, -0.25, bz);
    s.rotation.y = ry;
    root.add(s);
    bobbingShips.push({ group: s, baseY: -0.25, phase: ph });
  }

  // 9. Six Enterable Buildings (Walls with open doorways + Furniture + Hideable Roofs)
  for (const eb of STAGE1_ENTERABLE_BUILDINGS) {
    const built = buildEnterableBuildingMesh(eb, textures, disposables);
    root.add(built.group);
    interiorRoofs.set(eb.id, built.roofGroup);
  }

  // 10. Landmarks & Scenery Buildings
  for (const lm of getStage1Landmarks()) {
    root.add(createLandmarkModel(lm, textures));
  }
  for (const sc of getStage1SceneryBuildings()) {
    root.add(createSceneryModel(sc, textures));
  }

  // 11. Instanced Trees, Streetlamps & Park Benches (High performance for WebGL!)
  const treeSpots: [number, number, number][] = [];
  const addTreeCluster = (cx: number, cz: number, count: number, radius: number, seed: number) => {
    for (let i = 0; i < count; i++) {
      const ang = ((i * 137.5 + seed * 47) % 360) * (Math.PI / 180);
      const r = radius * (0.35 + ((i * 29 + seed * 11) % 65) / 100);
      const tx = cx + Math.cos(ang) * r;
      const tz = cz + Math.sin(ang) * r;
      if (tx > STAGE1_SHORELINE_X - 4 && Math.hypot(tx - LIGHTHOUSE_ISLAND.x, tz - LIGHTHOUSE_ISLAND.z) > 6.8) {
        continue;
      }
      if (Math.abs(tx) < 5.5 || Math.abs(tz) < 5.5) continue;
      if (tx >= -63 && tx <= -53 && tz >= -48 && tz <= 61) continue;
      treeSpots.push([tx, stage1GroundHeightAt(tx, tz), tz]);
    }
  };
  addTreeCluster(-84, -18, 12, 16, 1);
  addTreeCluster(-86, 40, 14, 18, 2);
  addTreeCluster(-18, 14, 7, 7, 3);
  addTreeCluster(8, -22, 6, 6, 4);
  addTreeCluster(-38, -78, 10, 12, 5);
  addTreeCluster(26, -78, 10, 12, 6);
  addTreeCluster(28, 78, 10, 12, 7);
  addTreeCluster(-42, 74, 10, 14, 8);
  // Coastline palms
  for (const pz of [-46, -24, -14, 14, 22, 42, 66]) {
    treeSpots.push([46.2, 0, pz]);
  }
  // Island palms
  treeSpots.push(
    [LIGHTHOUSE_ISLAND.x - 4.2, LIGHTHOUSE_ISLAND.height, LIGHTHOUSE_ISLAND.z + 3.2],
    [LIGHTHOUSE_ISLAND.x + 4.4, LIGHTHOUSE_ISLAND.height, LIGHTHOUSE_ISLAND.z + 2.8]
  );

  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 3.2, 7);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.9 });
  const canopyGeo = new THREE.DodecahedronGeometry(1.45, 1);
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 });

  const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, treeSpots.length);
  const canopyInst = new THREE.InstancedMesh(canopyGeo, canopyMat, treeSpots.length);
  const dummy = new THREE.Object3D();
  treeSpots.forEach(([tx, ty, tz], idx) => {
    const scale = 0.85 + ((idx * 17) % 35) / 100;
    dummy.position.set(tx, ty + 1.6 * scale, tz);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(tx, ty + 3.55 * scale, tz);
    dummy.scale.set(scale, scale * 0.88, scale);
    dummy.updateMatrix();
    canopyInst.setMatrixAt(idx, dummy.matrix);
  });
  root.add(trunkInst, canopyInst);
  disposables.push(() => {
    trunkGeo.dispose();
    canopyGeo.dispose();
  });

  // Instanced Streetlamps (reacts to day/night cycle!)
  const lampPositions: [number, number][] = [
    [-12, -4.4],
    [10, -4.4],
    [32, -4.4],
    [-22, 4.4],
    [10, 4.4],
    [32, 4.4],
    [-4.4, -20],
    [-4.4, -40],
    [4.4, -20],
    [4.4, -40],
    [-4.4, 20],
    [-4.4, 42],
    [4.4, 20],
    [4.4, 42],
    [47.5, -16],
    [47.5, 16],
    [-26.2, -24],
    [-26.2, 24],
    [25.0, 32.5],
    [-10.0, -50.5],
  ];
  const lampPoleGeo = new THREE.CylinderGeometry(0.08, 0.12, 3.8, 7);
  const lampPoleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.5 });
  const lampHeadGeo = new THREE.SphereGeometry(0.28, 8, 8);
  const lampHeadMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.35,
  });
  const poleInst = new THREE.InstancedMesh(lampPoleGeo, lampPoleMat, lampPositions.length);
  const headInst = new THREE.InstancedMesh(lampHeadGeo, lampHeadMat, lampPositions.length);
  lampPositions.forEach(([lx, lz], idx) => {
    const ly = stage1GroundHeightAt(lx, lz);
    dummy.position.set(lx, ly + 1.9, lz);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    poleInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(lx, ly + 3.9, lz);
    dummy.updateMatrix();
    headInst.setMatrixAt(idx, dummy.matrix);
  });
  root.add(poleInst, headInst);
  disposables.push(() => {
    lampPoleGeo.dispose();
    lampHeadGeo.dispose();
  });

  // 11b. Instanced Urban Props: Sidewalk Curbs, Benches, Planters, Fences, Market Crates & Cafe Umbrellas
  const curbGeo = new THREE.BoxGeometry(1, 0.12, 1);
  const curbMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.88 });
  const curbSpecs: [number, number, number, number][] = [
    [13.0, -4.0, 16.0, 0.9],
    [13.0, 4.0, 16.0, 0.9],
    [35.0, -4.0, 22.0, 0.9],
    [35.0, 4.0, 22.0, 0.9],
    [-20.0, -4.0, 14.0, 0.9],
    [-20.0, 4.0, 14.0, 0.9],
    [-4.0, -24.0, 0.9, 24.0],
    [4.0, -24.0, 0.9, 24.0],
    [-4.0, 24.0, 0.9, 22.0],
    [4.0, 24.0, 0.9, 22.0],
  ];
  const curbInst = new THREE.InstancedMesh(curbGeo, curbMat, curbSpecs.length);
  curbSpecs.forEach(([cx, cz, sx, sz], i) => {
    dummy.position.set(cx, 0.06, cz);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(sx, 1, sz);
    dummy.updateMatrix();
    curbInst.setMatrixAt(i, dummy.matrix);
  });
  root.add(curbInst);

  const benchSpecs: [number, number, number][] = [
    [-9.5, -6.5, 0],
    [2.5, -6.5, 0],
    [-9.5, 6.5, Math.PI],
    [2.5, 6.5, Math.PI],
    [47.5, -10.5, -Math.PI / 2],
    [47.5, 10.5, -Math.PI / 2],
    [47.5, 22.0, -Math.PI / 2],
    [-26.5, -18.0, Math.PI / 2],
    [-26.5, 4.0, Math.PI / 2],
    [18.5, -36.0, Math.PI / 2],
  ];
  const benchGeo = new THREE.BoxGeometry(1.75, 0.46, 0.58);
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x7c4a26, roughness: 0.82 });
  const benchInst = new THREE.InstancedMesh(benchGeo, benchMat, benchSpecs.length);
  benchSpecs.forEach(([bx, bz, ry], i) => {
    dummy.position.set(bx, stage1GroundHeightAt(bx, bz) + 0.23, bz);
    dummy.rotation.set(0, ry, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    benchInst.setMatrixAt(i, dummy.matrix);
  });
  root.add(benchInst);

  const planterSpecs: [number, number][] = [
    [-11.0, 17.5],
    [-17.0, 17.5],
    [-10.0, -9.0],
    [2.0, -9.0],
    [25.5, -19.5],
    [25.5, -10.5],
    [28.5, 20.5],
    [28.5, 28.5],
    [28.5, -41.5],
    [47.5, -4.5],
    [47.5, 4.5],
    [-11.5, -60.5],
    [-20.5, -60.5],
  ];
  const potGeo = new THREE.CylinderGeometry(0.44, 0.34, 0.48, 8);
  const potMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 });
  const bushGeo = new THREE.DodecahedronGeometry(0.46, 0);
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
  const potInst = new THREE.InstancedMesh(potGeo, potMat, planterSpecs.length);
  const bushInst = new THREE.InstancedMesh(bushGeo, bushMat, planterSpecs.length);
  planterSpecs.forEach(([px, pz], i) => {
    const py = stage1GroundHeightAt(px, pz);
    dummy.position.set(px, py + 0.24, pz);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    potInst.setMatrixAt(i, dummy.matrix);
    dummy.position.set(px, py + 0.64, pz);
    dummy.updateMatrix();
    bushInst.setMatrixAt(i, dummy.matrix);
  });
  root.add(potInst, bushInst);

  const crateSpots: [number, number, number][] = [
    [54.5, 2.8, 0.3],
    [55.6, 2.8, 0.1],
    [60.0, -2.8, -0.2],
    [61.2, -29.2, 0.4],
    [25.5, -24.5, 0.0],
    [38.5, 11.5, 0.2],
    [38.5, -31.5, -0.3],
    [13.5, 43.0, 0.15],
    [30.5, 43.0, -0.25],
    [47.8, -23.5, 0.0],
  ];
  const crateGeo = new THREE.BoxGeometry(0.78, 0.72, 0.78);
  const crateMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.84 });
  const crateInst = new THREE.InstancedMesh(crateGeo, crateMat, crateSpots.length);
  crateSpots.forEach(([cx, cz, ry], i) => {
    dummy.position.set(cx, stage1GroundHeightAt(cx, cz) + 0.36, cz);
    dummy.rotation.set(0, ry, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    crateInst.setMatrixAt(i, dummy.matrix);
  });
  root.add(crateInst);

  const umbrellaSpots: [number, number][] = [
    [29.2, -35.0],
    [29.2, -40.5],
    [-21.0, 7.2],
    [46.5, 8.8],
    [46.5, -8.8],
    [-69.5, -26.0],
  ];
  const umbPoleGeo = new THREE.CylinderGeometry(0.05, 0.06, 2.3, 6);
  const umbTopGeo = new THREE.ConeGeometry(1.15, 0.55, 8);
  const umbTopMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.75 });
  const umbPoleInst = new THREE.InstancedMesh(umbPoleGeo, lampPoleMat, umbrellaSpots.length);
  const umbTopInst = new THREE.InstancedMesh(umbTopGeo, umbTopMat, umbrellaSpots.length);
  umbrellaSpots.forEach(([ux, uz], i) => {
    const uy = stage1GroundHeightAt(ux, uz);
    dummy.position.set(ux, uy + 1.15, uz);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    umbPoleInst.setMatrixAt(i, dummy.matrix);
    dummy.position.set(ux, uy + 2.35, uz);
    dummy.updateMatrix();
    umbTopInst.setMatrixAt(i, dummy.matrix);
  });
  root.add(umbPoleInst, umbTopInst);

  const fenceSpots: [number, number, number][] = [
    [-34.8, -27.5, Math.PI / 2],
    [-34.8, -5.8, Math.PI / 2],
    [-34.8, 8.5, Math.PI / 2],
    [-34.8, 21.5, Math.PI / 2],
    [-43.2, -26.5, Math.PI / 2],
    [-43.2, -8.0, Math.PI / 2],
    [-43.2, 40.5, Math.PI / 2],
  ];
  const fenceGeo = new THREE.BoxGeometry(3.2, 0.62, 0.14);
  const fenceInst = new THREE.InstancedMesh(fenceGeo, benchMat, fenceSpots.length);
  fenceSpots.forEach(([fx, fz, ry], i) => {
    dummy.position.set(fx, 0.31, fz);
    dummy.rotation.set(0, ry, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    fenceInst.setMatrixAt(i, dummy.matrix);
  });
  root.add(fenceInst);

  disposables.push(() => {
    curbGeo.dispose();
    benchGeo.dispose();
    potGeo.dispose();
    bushGeo.dispose();
    crateGeo.dispose();
    umbPoleGeo.dispose();
    umbTopGeo.dispose();
    fenceGeo.dispose();
  });

  // 12. Animated Crowd Patrols
  const crowd: CrowdRuntime[] = getStage1CrowdPatrols().map((def) => {
    const rig = createCrowdCitizenRig(def);
    const start = def.waypoints[0];
    rig.root.position.set(start.x, stage1GroundHeightAt(start.x, start.z), start.z);
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

  // 13. Interactive Pickups, Collectibles, Delivery Counters, & Quest Beacon
  for (const pk of STAGE1_WORLD_PICKUPS) {
    const g = new THREE.Group();
    const baseY = pk.yOffset ?? stage1GroundHeightAt(pk.x, pk.z);
    g.position.set(pk.x, baseY, pk.z);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.78, 18),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.78 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;

    const itemCrate = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.56, 0.62),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.45,
        roughness: 0.45,
      })
    );
    itemCrate.position.y = 0.55;
    itemCrate.name = 'floating-node';

    const lbl = createFloatingLabelSprite(pk.label, '[E] Ambil Barang', '#fbbf24');
    lbl.sprite.position.set(0, 1.65, 0);
    lbl.sprite.scale.set(3.2, 0.72, 1);
    disposables.push(lbl.dispose);

    g.add(ring, itemCrate, lbl.sprite);
    root.add(g);
    pickupMeshes.set(pk.id, g);
  }

  for (const col of STAGE1_COLLECTIBLES) {
    const g = new THREE.Group();
    const baseY = col.yOffset ?? stage1GroundHeightAt(col.x, col.z);
    g.position.set(col.x, baseY, col.z);

    const rColor = RARITY_COLOR[col.rarity];
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.55, 0.25, 12),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
    );
    pedestal.position.y = 0.125;

    const relic = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.42, 0),
      new THREE.MeshStandardMaterial({
        color: rColor,
        emissive: rColor,
        emissiveIntensity: 0.75,
        roughness: 0.2,
      })
    );
    relic.position.y = 0.85;
    relic.name = 'floating-node';

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.62, 0.85, 20),
      new THREE.MeshBasicMaterial({ color: rColor, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;

    const lbl = createFloatingLabelSprite(col.name, `${col.rarity} · [E] Koleksi`, '#f472b6');
    lbl.sprite.position.set(0, 1.9, 0);
    lbl.sprite.scale.set(3.4, 0.76, 1);
    disposables.push(lbl.dispose);

    g.add(pedestal, relic, ring, lbl.sprite);
    root.add(g);
    collectibleMeshes.set(col.id, g);
  }

  for (const del of STAGE1_DELIVERY_SPOTS) {
    const g = new THREE.Group();
    const baseY = del.yOffset ?? stage1GroundHeightAt(del.x, del.z);
    g.position.set(del.x, baseY, del.z);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.85, 1.15, 22),
      new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;

    const marker = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.75, 4),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.7 })
    );
    marker.rotation.x = Math.PI;
    marker.position.y = 1.25;
    marker.name = 'floating-node';

    const lbl = createFloatingLabelSprite(del.label, '[E] Antar Misi', '#34d399');
    lbl.sprite.position.set(0, 2.2, 0);
    lbl.sprite.scale.set(3.5, 0.78, 1);
    disposables.push(lbl.dispose);

    g.add(ring, marker, lbl.sprite);
    root.add(g);
    deliveryMeshes.set(del.id, g);
  }

  // Quest Objective Light Beacon Pillar
  const questBeacon = new THREE.Group();
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.85, 18, 14, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  beam.position.y = 9.0;
  const beaconDiamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55, 0),
    new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.0,
    })
  );
  beaconDiamond.position.y = 3.8;
  beaconDiamond.name = 'beacon-diamond';
  questBeacon.add(beam, beaconDiamond);
  root.add(questBeacon);

  // Subtle District Border Pillars (visual flavor matching STAGE1_DISTRICTS)
  void STAGE1_DISTRICTS;

  const update = (elapsed: number, dt: number, timeOfDay: number) => {
    waterTex.offset.x = (elapsed * 0.03) % 1;
    waterTex.offset.y = (elapsed * 0.02) % 1;

    // Night/Dusk lighting on streetlamps
    const nightStrength =
      timeOfDay > 0.72 || timeOfDay < 0.18
        ? 1.4
        : timeOfDay > 0.62
          ? (timeOfDay - 0.62) * 14
          : 0.25;
    lampHeadMat.emissiveIntensity = nightStrength;

    // Bobbing harbor ships
    for (const bs of bobbingShips) {
      bs.group.position.y = bs.baseY + Math.sin(elapsed * 1.15 + bs.phase) * 0.12;
      bs.group.rotation.z = Math.sin(elapsed * 0.9 + bs.phase) * 0.025;
    }

    // Waterfall shimmer
    fallStrip.scale.y = 0.96 + Math.sin(elapsed * 8.0) * 0.04;

    // Floating animation for pickups / collectibles / delivery spots
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

    // Animate crowd patrols
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

      const y = stage1GroundHeightAt(agent.x, agent.z);
      agent.rig.root.position.set(agent.x, y, agent.z);
      agent.rig.root.rotation.y = agent.yaw;

      const swing = Math.sin(agent.walkCycle) * 0.55;
      agent.rig.leftLeg.rotation.x = swing;
      agent.rig.rightLeg.rotation.x = -swing;
      agent.rig.leftArm.rotation.x = -swing * 0.75;
      agent.rig.rightArm.rotation.x = swing * 0.75;
    }
  };

  const dispose = () => {
    for (const fn of disposables) {
      fn();
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
    dispose,
  };
}
