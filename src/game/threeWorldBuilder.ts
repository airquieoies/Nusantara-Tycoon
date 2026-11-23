import * as THREE from 'three';
import { CharacterAppearance, DEFAULT_CHARACTER_APPEARANCE } from './stage1Data';
import {
  createCustomizableCharacterRig,
  createSculptedHeadGroup,
  FacialExpression,
} from './threeCharacterRig';
import { BuildingDefinition, StageNumber, TileTerrain, VehicleKind } from './types';
import { CrowdPatrolDef, groundHeightAt, NpcWaypoint, PORTAL_POSITION } from './world3dPhysics';

export interface WorldTextures {
  sandEarth: THREE.CanvasTexture;
  cobbleRoad: THREE.CanvasTexture;
  asphaltRoad: THREE.CanvasTexture;
  brickWall: THREE.CanvasTexture;
  woodPlank: THREE.CanvasTexture;
  waterWave: THREE.CanvasTexture;
  sailStripe: THREE.CanvasTexture;
  roofTile: THREE.CanvasTexture;
  dispose: () => void;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  return [c, ctx];
}

export function createWorldTextures(maxAnisotropy: number): WorldTextures {
  const aniso = Math.min(8, Math.max(1, maxAnisotropy));

  // 1. Tropical Grass & Earth Ground (soft organic mottling)
  const [gc, gctx] = makeCanvas(256, 256);
  gctx.fillStyle = '#5f7f46';
  gctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 420; i++) {
    const x = (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1 * 256;
    const y = (((Math.sin(i * 78.233) * 19341.123) % 1) + 1) % 1 * 256;
    const rad = 8 + (i % 14);
    gctx.fillStyle =
      i % 3 === 0
        ? 'rgba(108, 142, 78, 0.28)'
        : i % 3 === 1
          ? 'rgba(74, 104, 52, 0.24)'
          : 'rgba(130, 152, 92, 0.2)';
    gctx.beginPath();
    gctx.arc(x, y, rad, 0, Math.PI * 2);
    gctx.fill();
  }
  const sandEarth = new THREE.CanvasTexture(gc);
  sandEarth.colorSpace = THREE.SRGBColorSpace;
  sandEarth.wrapS = THREE.RepeatWrapping;
  sandEarth.wrapT = THREE.RepeatWrapping;
  sandEarth.repeat.set(28, 28);
  sandEarth.anisotropy = aniso;

  // 2. Cobblestone Plaza & Avenue
  const [cc, cctx] = makeCanvas(256, 256);
  cctx.fillStyle = '#8b7b65';
  cctx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const offset = (row % 2) * 16;
      const sx = (col * 32 + offset) % 256;
      const sy = row * 32;
      const shade = 148 + ((row * 7 + col * 13) % 28);
      cctx.fillStyle = `rgb(${shade}, ${shade - 12}, ${shade - 26})`;
      cctx.fillRect(sx + 2, sy + 2, 28, 28);
    }
  }
  const cobbleRoad = new THREE.CanvasTexture(cc);
  cobbleRoad.colorSpace = THREE.SRGBColorSpace;
  cobbleRoad.wrapS = THREE.RepeatWrapping;
  cobbleRoad.wrapT = THREE.RepeatWrapping;
  cobbleRoad.repeat.set(14, 2);
  cobbleRoad.anisotropy = aniso;

  // 3. Wooden Pier Planks
  const [wc, wctx] = makeCanvas(256, 256);
  wctx.fillStyle = '#7c5332';
  wctx.fillRect(0, 0, 256, 256);
  for (let p = 0; p < 8; p++) {
    const y = p * 32;
    wctx.fillStyle = p % 2 === 0 ? '#8c5e3a' : '#734c2d';
    wctx.fillRect(0, y + 1, 256, 29);
    wctx.fillStyle = '#4f311b';
    wctx.fillRect(0, y, 256, 2);
    wctx.fillRect((p * 67) % 240, y + 1, 2, 30);
  }
  const woodPlank = new THREE.CanvasTexture(wc);
  woodPlank.colorSpace = THREE.SRGBColorSpace;
  woodPlank.wrapS = THREE.RepeatWrapping;
  woodPlank.wrapT = THREE.RepeatWrapping;
  woodPlank.repeat.set(6, 2);
  woodPlank.anisotropy = aniso;

  // 4. Shimmering Harbor Ocean Water
  const [oc, octx] = makeCanvas(256, 256);
  octx.fillStyle = '#146b7d';
  octx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 120; i++) {
    const x = (i * 53) % 256;
    const y = (i * 89) % 256;
    octx.fillStyle = i % 2 === 0 ? 'rgba(110, 215, 224, 0.26)' : 'rgba(14, 80, 96, 0.35)';
    octx.fillRect(x, y, 36, 4);
  }
  const waterWave = new THREE.CanvasTexture(oc);
  waterWave.colorSpace = THREE.SRGBColorSpace;
  waterWave.wrapS = THREE.RepeatWrapping;
  waterWave.wrapT = THREE.RepeatWrapping;
  waterWave.repeat.set(16, 16);
  waterWave.anisotropy = aniso;

  // 5. Striped Nusantara Sail Canvas
  const [sc, sctx] = makeCanvas(128, 128);
  for (let i = 0; i < 8; i++) {
    sctx.fillStyle = i % 2 === 0 ? '#f4e7cf' : '#b84b2c';
    sctx.fillRect(i * 16, 0, 16, 128);
  }
  const sailStripe = new THREE.CanvasTexture(sc);
  sailStripe.colorSpace = THREE.SRGBColorSpace;
  sailStripe.anisotropy = aniso;

  // 6. Terracotta Roof Tiles
  const [rc, rctx] = makeCanvas(128, 128);
  rctx.fillStyle = '#9c4327';
  rctx.fillRect(0, 0, 128, 128);
  for (let row = 0; row < 8; row++) {
    rctx.fillStyle = row % 2 === 0 ? '#ad4d2e' : '#8a391f';
    rctx.fillRect(0, row * 16, 128, 14);
  }
  const roofTile = new THREE.CanvasTexture(rc);
  roofTile.colorSpace = THREE.SRGBColorSpace;
  roofTile.wrapS = THREE.RepeatWrapping;
  roofTile.wrapT = THREE.RepeatWrapping;
  roofTile.repeat.set(2, 2);
  roofTile.anisotropy = aniso;

  // 7. Modern Smart City Asphalt Avenue with Dashed Markings
  const [ac, actx] = makeCanvas(256, 256);
  actx.fillStyle = '#334155';
  actx.fillRect(0, 0, 256, 256);
  // Subtle aggregate speckles
  for (let i = 0; i < 320; i++) {
    const x = ((i * 73) % 256);
    const y = ((i * 139) % 256);
    actx.fillStyle = i % 2 === 0 ? 'rgba(148,163,184,0.14)' : 'rgba(15,23,42,0.18)';
    actx.fillRect(x, y, 3, 3);
  }
  // Crisp side edge curbs & center dashes
  actx.fillStyle = '#cbd5e1';
  actx.fillRect(0, 0, 256, 12);
  actx.fillRect(0, 244, 256, 12);
  actx.fillStyle = '#f8fafc';
  for (let d = 16; d < 256; d += 64) {
    actx.fillRect(d, 124, 34, 8);
  }
  const asphaltRoad = new THREE.CanvasTexture(ac);
  asphaltRoad.colorSpace = THREE.SRGBColorSpace;
  asphaltRoad.wrapS = THREE.RepeatWrapping;
  asphaltRoad.wrapT = THREE.RepeatWrapping;
  asphaltRoad.repeat.set(14, 1);
  asphaltRoad.anisotropy = aniso;

  // 8. Industrial Brick Masonry Texture
  const [bc, bctx] = makeCanvas(128, 128);
  bctx.fillStyle = '#7c2d12';
  bctx.fillRect(0, 0, 128, 128);
  for (let row = 0; row < 8; row++) {
    const offset = (row % 2) * 16;
    for (let col = 0; col < 5; col++) {
      const bx = (col * 32 + offset - 16) % 128;
      const by = row * 16;
      bctx.fillStyle = (row + col) % 2 === 0 ? '#9a3412' : '#852e12';
      bctx.fillRect(bx + 1, by + 1, 29, 13);
    }
  }
  const brickWall = new THREE.CanvasTexture(bc);
  brickWall.colorSpace = THREE.SRGBColorSpace;
  brickWall.wrapS = THREE.RepeatWrapping;
  brickWall.wrapT = THREE.RepeatWrapping;
  brickWall.repeat.set(2, 2);
  brickWall.anisotropy = aniso;

  return {
    sandEarth,
    cobbleRoad,
    asphaltRoad,
    brickWall,
    woodPlank,
    waterWave,
    sailStripe,
    roofTile,
    dispose: () => {
      sandEarth.dispose();
      cobbleRoad.dispose();
      asphaltRoad.dispose();
      brickWall.dispose();
      woodPlank.dispose();
      waterWave.dispose();
      sailStripe.dispose();
      roofTile.dispose();
    },
  };
}

function addContactShadow(parent: THREE.Group, radius: number) {
  const geo = new THREE.CircleGeometry(radius, 20);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x0b1215,
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(geo, mat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.025;
  parent.add(shadow);
}

export function createFloatingLabelSprite(
  title: string,
  subtitle?: string,
  accentHex = '#f59e0b'
): { sprite: THREE.Sprite; dispose: () => void } {
  const [canvas, ctx] = makeCanvas(512, 112);
  ctx.clearRect(0, 0, 512, 112);

  // Rounded dark plate
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.beginPath();
  ctx.roundRect(14, 10, 484, 92, 20);
  ctx.fill();

  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillText(title, 256, subtitle ? 48 : 64);

  if (subtitle) {
    ctx.fillStyle = accentHex;
    ctx.font = '600 18px system-ui, -apple-system, sans-serif';
    ctx.fillText(subtitle, 256, 80);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3.8, 0.84, 1);

  return {
    sprite,
    dispose: () => {
      tex.dispose();
      mat.dispose();
    },
  };
}

export interface PlayerRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  applyAppearance: (appearance: CharacterAppearance) => void;
  applyCosmetics: (outfitId: string, hatId: string) => void;
  setExpression: (expr: FacialExpression, elapsed?: number) => void;
  setAnimationState: (opts: {
    walkCycle: number;
    speed: number;
    grounded: boolean;
    ridingKind: VehicleKind | null;
    elapsed: number;
    expression?: FacialExpression;
  }) => void;
  dispose: () => void;
}

export function createPlayerRig(
  initialAppearance: CharacterAppearance = DEFAULT_CHARACTER_APPEARANCE
): PlayerRig {
  return createCustomizableCharacterRig(initialAppearance);
}

export function createNpcRig(npc: NpcWaypoint): {
  root: THREE.Group;
  update?: (elapsed: number, isTalking?: boolean) => void;
  dispose: () => void;
} {
  const root = new THREE.Group();
  root.position.set(npc.x, groundHeightAt(npc.x, npc.z), npc.z);
  root.rotation.y = npc.facingYaw;
  addContactShadow(root, 0.56);

  let coatColor = 0xd97706;
  let pantsColor = 0x475569;
  let accentColor = 0xfef3c7;
  let skinHex: number | string = '#dfad81';
  let hairHex: number | string = '#1c1917';
  let eyeHex: number | string = '#2b1b12';
  let hairVariant = 'rapi';
  let facePreset: 'ramah' | 'tegas' | 'lembut' | 'cerdas' = 'ramah';
  let eyebrowStyle: 'natural' | 'tebal' | 'melengkung' | 'lurus' = 'natural';
  let nosePreset: 'klasik' | 'mancung' | 'mungil' | 'tegas' = 'klasik';
  let mouthPreset: 'senyum' | 'netral' | 'ceria' | 'berwibawa' = 'senyum';
  let badgeHex = '#f59e0b';
  let subtitle = 'Warga Nusantara';

  if (npc.characterId === 'aditya') {
    coatColor = 0x1d4ed8;
    pantsColor = 0xd6c7b2;
    accentColor = 0xffffff;
    skinHex = '#f2cba9';
    hairVariant = 'undercut';
    facePreset = 'cerdas';
    eyebrowStyle = 'lurus';
    nosePreset = 'mancung';
    mouthPreset = 'ceria';
    badgeHex = '#38bdf8';
    subtitle = 'Hiperglobalis';
  } else if (npc.characterId === 'laras') {
    coatColor = 0x991b1b;
    pantsColor = 0x451a03;
    accentColor = 0xf59e0b;
    skinHex = '#e6b58a';
    hairVariant = 'konde';
    facePreset = 'lembut';
    eyebrowStyle = 'melengkung';
    nosePreset = 'mungil';
    mouthPreset = 'berwibawa';
    badgeHex = '#fb7185';
    subtitle = 'Skeptis';
  } else if (npc.characterId === 'naya') {
    coatColor = 0x3f6212;
    pantsColor = 0x1e293b;
    accentColor = 0xfef08a;
    skinHex = '#e6b58a';
    hairVariant = 'ombak-panjang';
    facePreset = 'ramah';
    eyebrowStyle = 'melengkung';
    mouthPreset = 'ceria';
    badgeHex = '#34d399';
    subtitle = 'Transformasionalis';
  } else if (npc.id === 'npc-syahbandar') {
    coatColor = 0x78350f;
    pantsColor = 0x292524;
    accentColor = 0xfbbf24;
    skinHex = '#b67a4e';
    facePreset = 'tegas';
    eyebrowStyle = 'tebal';
    nosePreset = 'tegas';
    mouthPreset = 'berwibawa';
    subtitle = 'Pelabuhan';
  } else if (npc.id === 'npc-kapten-raka') {
    coatColor = 0x1e3a8a;
    pantsColor = 0x1e293b;
    accentColor = 0xfbbf24;
    skinHex = '#8f5934';
    facePreset = 'tegas';
    eyebrowStyle = 'tebal';
    nosePreset = 'tegas';
    badgeHex = '#38bdf8';
    subtitle = 'Kapten Pinisi';
  } else if (npc.id === 'npc-pelaut-budi') {
    coatColor = 0x0369a1;
    pantsColor = 0x334155;
    accentColor = 0xfef3c7;
    skinHex = '#cf9566';
    hairVariant = 'belah-tengah';
    badgeHex = '#38bdf8';
    subtitle = 'Awak Kapal';
  } else if (npc.id === 'npc-kepala-kota') {
    coatColor = 0x7c2d12;
    pantsColor = 0x1c1917;
    accentColor = 0xfde047;
    skinHex = '#cf9566';
    hairHex = '#94a3b8';
    facePreset = 'tegas';
    eyebrowStyle = 'tebal';
    mouthPreset = 'berwibawa';
    badgeHex = '#fbbf24';
    subtitle = 'Kepala Kota';
  } else if (npc.id === 'npc-bu-ratna') {
    coatColor = 0x0f766e;
    pantsColor = 0x3f2e21;
    accentColor = 0xfef08a;
    skinHex = '#cf9566';
    hairVariant = 'konde';
    facePreset = 'lembut';
    badgeHex = '#34d399';
    subtitle = 'Tokoh Warga';
  } else if (npc.id === 'npc-ibu-kartini') {
    coatColor = 0x1e40af;
    pantsColor = 0x312e81;
    accentColor = 0xfde68a;
    skinHex = '#e6b58a';
    hairVariant = 'konde';
    facePreset = 'cerdas';
    eyebrowStyle = 'melengkung';
    badgeHex = '#818cf8';
    subtitle = 'Kepala Sekolah';
  } else if (npc.id === 'npc-pedagang-kain') {
    coatColor = 0xbe123c;
    pantsColor = 0x451a03;
    accentColor = 0xfde047;
    skinHex = '#cf9566';
    hairVariant = 'konde';
    badgeHex = '#fb7185';
    subtitle = 'Pedagang Batik';
  } else if (npc.id === 'npc-pedagang-kuliner') {
    coatColor = 0x15803d;
    pantsColor = 0x292524;
    accentColor = 0xfef3c7;
    skinHex = '#b67a4e';
    eyebrowStyle = 'tebal';
    badgeHex = '#34d399';
    subtitle = 'Kuliner Nusantara';
  } else if (npc.id === 'npc-nelayan') {
    coatColor = 0x0e7490;
    pantsColor = 0x1e293b;
    accentColor = 0xeab308;
    skinHex = '#8f5934';
    eyebrowStyle = 'tebal';
    nosePreset = 'tegas';
    badgeHex = '#38bdf8';
    subtitle = 'Nelayan Dermaga';
  } else if (npc.id === 'npc-wisatawan') {
    coatColor = 0x0284c7;
    pantsColor = 0xd6c7b2;
    accentColor = 0xfef08a;
    skinHex = '#f2cba9';
    hairVariant = 'ponytail';
    hairHex = '#451a03';
    badgeHex = '#a78bfa';
    subtitle = 'Wisatawan';
  } else if (npc.id === 'npc-barista-kopi') {
    coatColor = 0x78350f;
    pantsColor = 0x1c1917;
    accentColor = 0xfef3c7;
    skinHex = '#cf9566';
    hairVariant = 'undercut';
    facePreset = 'ramah';
    badgeHex = '#fb923c';
    subtitle = 'Peracik Kopi';
  } else if (npc.id === 'npc-penjahit') {
    coatColor = 0x9f1239;
    pantsColor = 0x3b0764;
    accentColor = 0xfde047;
    skinHex = '#e6b58a';
    hairVariant = 'ombak-panjang';
    facePreset = 'lembut';
    eyebrowStyle = 'melengkung';
    badgeHex = '#f472b6';
    subtitle = 'Perancang Busana';
  } else if (npc.id === 'npc-kurator') {
    coatColor = 0x334155;
    pantsColor = 0x1e293b;
    accentColor = 0xfbbf24;
    skinHex = '#b67a4e';
    hairHex = '#94a3b8';
    hairVariant = 'belah-tengah';
    facePreset = 'cerdas';
    eyebrowStyle = 'lurus';
    badgeHex = '#a855f7';
    subtitle = 'Kurator Sejarah';
  }

  const skinMat = new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.62 });
  const coatMat = new THREE.MeshStandardMaterial({ color: coatColor, roughness: 0.7 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.85 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.42 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x291a10, roughness: 0.55 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairHex, roughness: 0.88 });

  // Articulated legs + shoes
  for (const sx of [-0.14, 0.14]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.64, 0.23), pantsMat);
    leg.position.set(sx, 0.4, 0);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.13, 0.32), shoeMat);
    shoe.position.set(sx, 0.065, 0.04);
    root.add(leg, shoe);
  }

  // Torso + collar + waist sash + arms with hands
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.72, 0.34), coatMat);
  torso.position.y = 1.08;
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.62, 0.36), accentMat);
  collar.position.y = 1.09;
  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.61, 0.09, 0.37), accentMat);
  sash.position.y = 0.78;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.115, 0.16, 10), skinMat);
  neck.position.y = 1.49;

  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.2), coatMat);
  armL.position.set(-0.4, 1.12, 0);
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), skinMat);
  handL.position.set(-0.4, 0.83, 0);
  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.2), coatMat);
  armR.position.set(0.4, 1.12, 0);
  const handR = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), skinMat);
  handR.position.set(0.4, 0.83, 0);

  // Sculpted 3D Head with Eyes, Eyelids, Nose, Lips & Volumetric Hair
  const sculptedHead = createSculptedHeadGroup({
    skinHex,
    hairHex,
    eyeHex,
    facePreset,
    eyeShape: 'almond',
    eyebrowStyle,
    nosePreset,
    mouthPreset,
    hairVariant,
    accentHex: `#${accentColor.toString(16).padStart(6, '0')}`,
  });
  sculptedHead.headGroup.position.set(0, 1.73, 0);

  root.add(torso, collar, sash, neck, armL, handL, armR, handR, sculptedHead.headGroup);

  // Character-specific uniforms, headwear & handheld props
  if (npc.characterId === 'aditya') {
    const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 10), accentMat);
    scroll.rotation.z = Math.PI / 3;
    scroll.position.set(0.42, 0.95, 0.2);
    root.add(scroll);
  } else if (npc.characterId === 'laras') {
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.08), accentMat);
    book.position.set(-0.36, 0.98, 0.22);
    root.add(book);
  } else if (npc.characterId === 'naya') {
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.14), accentMat);
    bag.position.set(-0.44, 0.85, 0.05);
    root.add(bag);
  } else if (npc.id === 'npc-nelayan') {
    const caping = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.2, 12), accentMat);
    caping.position.y = 1.98;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 1.9, 6), hairMat);
    rod.position.set(0.42, 1.35, 0.38);
    rod.rotation.x = 0.55;
    root.add(caping, rod);
  } else if (npc.id === 'npc-pedagang-kain') {
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.52, 8), accentMat);
    roll.rotation.z = Math.PI / 2;
    roll.position.set(0.2, 1.0, 0.26);
    root.add(roll);
  } else if (npc.id === 'npc-wisatawan') {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.4, 0.05, 14), accentMat);
    brim.position.y = 1.93;
    const satchel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.12), pantsMat);
    satchel.position.set(-0.38, 0.88, 0.12);
    root.add(brim, satchel);
  } else if (npc.id === 'npc-barista-kopi') {
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.62, 0.37),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.88 })
    );
    apron.position.set(0, 0.92, 0.02);
    const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 12), hairMat);
    tray.position.set(0.36, 0.92, 0.22);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.12, 8), accentMat);
    cup.position.set(0.36, 1.0, 0.22);
    root.add(apron, tray, cup);
  } else if (npc.id === 'npc-penjahit') {
    const tape = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.025, 6, 14), accentMat);
    tape.rotation.x = Math.PI / 2;
    tape.position.set(0, 1.46, 0.02);
    const swatch = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.06), coatMat);
    swatch.position.set(-0.36, 0.94, 0.2);
    root.add(tape, swatch);
  } else if (npc.id === 'npc-kurator') {
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.5 });
    const gL = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 6, 12), glassMat);
    gL.position.set(-0.082, 1.755, 0.248);
    const gR = gL.clone();
    gR.position.x = 0.082;
    const scroll = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.06), accentMat);
    scroll.position.set(0.36, 0.96, 0.2);
    root.add(gL, gR, scroll);
  } else if (npc.id === 'npc-kepala-kota' || npc.id === 'npc-syahbandar') {
    const peci = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.22, 0.15, 14), hairMat);
    peci.position.set(0, 1.98, 0);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 6, 16), accentMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 1.91, 0);
    root.add(peci, rim);
  }

  const label = createFloatingLabelSprite(npc.name, subtitle, badgeHex);
  label.sprite.position.set(0, 2.75, 0);
  root.add(label.sprite);

  if (npc.characterId) {
    const marker = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18, 0),
      new THREE.MeshStandardMaterial({
        color: coatColor,
        emissive: coatColor,
        emissiveIntensity: 0.45,
        roughness: 0.2,
      })
    );
    marker.position.y = 2.24;
    marker.name = 'npc-beacon';
    root.add(marker);
  }

  const seedPhase = Math.abs(npc.x * 0.37 + npc.z * 0.19);
  const update = (elapsed: number, isTalking = false) => {
    const blinkWindow = (elapsed + seedPhase) % 4.1;
    const blinkAmount = blinkWindow > 3.92 ? Math.sin(((blinkWindow - 3.92) / 0.18) * Math.PI) : 0;
    const expr: FacialExpression = isTalking ? 'talking' : 'smiling';
    sculptedHead.setExpression(expr, elapsed + seedPhase, blinkAmount);
    sculptedHead.headGroup.rotation.y = isTalking
      ? Math.sin(elapsed * 2.5) * 0.1
      : Math.sin(elapsed * 0.7 + seedPhase) * 0.08;
  };

  return {
    root,
    update,
    dispose: () => {
      label.dispose();
      sculptedHead.dispose();
      skinMat.dispose();
      coatMat.dispose();
      pantsMat.dispose();
      accentMat.dispose();
      shoeMat.dispose();
      hairMat.dispose();
    },
  };
}

export interface CrowdCitizenRig {
  root: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
}

const CITIZEN_SKIN_PAL = [0xf2cba9, 0xe6b58a, 0xcf9566, 0xb67a4e, 0x8f5934];
const CITIZEN_HAIR_PAL = [0x1c1917, 0x3b2210, 0x451a03, 0x292524];

export function createCrowdCitizenRig(def: CrowdPatrolDef): CrowdCitizenRig {
  const root = new THREE.Group();
  addContactShadow(root, 0.44);

  let hash = 0;
  for (let i = 0; i < def.id.length; i++) {
    hash = (hash * 31 + def.id.charCodeAt(i)) >>> 0;
  }

  const skinMat = new THREE.MeshStandardMaterial({
    color: CITIZEN_SKIN_PAL[hash % CITIZEN_SKIN_PAL.length],
    roughness: 0.65,
  });
  const shirtMat = new THREE.MeshStandardMaterial({ color: def.shirtColor, roughness: 0.76 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: def.pantsColor, roughness: 0.85 });
  const hatMat = new THREE.MeshStandardMaterial({ color: def.hatColor, roughness: 0.55 });
  const hairMat = new THREE.MeshStandardMaterial({
    color: CITIZEN_HAIR_PAL[(hash >> 3) % CITIZEN_HAIR_PAL.length],
    roughness: 0.88,
  });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x2b1d12, roughness: 0.6 });

  const makeLeg = (xOff: number) => {
    const leg = new THREE.Group();
    leg.position.set(xOff, 0.66, 0);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.54, 0.2), pantsMat);
    mesh.position.y = -0.27;
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.11, 0.28), shoeMat);
    shoe.position.set(0, -0.59, 0.03);
    leg.add(mesh, shoe);
    root.add(leg);
    return leg;
  };
  const leftLeg = makeLeg(-0.12);
  const rightLeg = makeLeg(0.12);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.62, 0.28), shirtMat);
  torso.position.y = 1.0;

  const makeArm = (xOff: number) => {
    const arm = new THREE.Group();
    arm.position.set(xOff, 1.26, 0);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.16), shirtMat);
    mesh.position.y = -0.19;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.072, 7, 7), skinMat);
    hand.position.y = -0.43;
    arm.add(mesh, hand);
    root.add(arm);
    return arm;
  };
  const leftArm = makeArm(-0.32);
  const rightArm = makeArm(0.32);

  // Sculpted Citizen Head with 3D Facial Geometry (eyes, nose bridge, brow, mouth)
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.12, 8), skinMat);
  neck.position.y = 1.35;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 12), skinMat);
  head.scale.set(0.95, 1.04, 0.97);
  head.position.y = 1.56;
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.11, 0.21), skinMat);
  jaw.position.set(0, 1.46, 0.02);

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.222, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.56),
    hairMat
  );
  hairCap.position.set(0, 1.58, -0.015);
  hairCap.rotation.x = -0.12;

  const scleraMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const irisMat = new THREE.MeshBasicMaterial({ color: 0x1e1b18 });
  const lipMat = new THREE.MeshBasicMaterial({ color: 0x994a44 });

  for (const sx of [-0.072, 0.072]) {
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), scleraMat);
    sclera.scale.set(1.15, 0.85, 0.6);
    sclera.position.set(sx, 1.575, 0.186);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.017, 7, 6), irisMat);
    iris.position.set(sx, 1.575, 0.198);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.064, 0.014, 0.016), hairMat);
    brow.position.set(sx, 1.615, 0.192);
    root.add(sclera, iris, brow);
  }
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.06, 0.042), skinMat);
  nose.position.set(0, 1.545, 0.2);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.016, 0.018), lipMat);
  mouth.position.set(0, 1.485, 0.194);

  root.add(torso, neck, head, jaw, hairCap, nose, mouth);

  if (def.tunicStyle === 'sarung') {
    const sarung = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.38, 0.31),
      new THREE.MeshStandardMaterial({ color: def.hatColor, roughness: 0.85 })
    );
    sarung.position.y = 0.55;
    root.add(sarung);
  } else if (def.tunicStyle === 'apron') {
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.58, 0.31),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 })
    );
    apron.position.set(0, 0.92, 0.02);
    root.add(apron);
  } else if (def.tunicStyle === 'vest') {
    const vest = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.44, 0.31),
      new THREE.MeshStandardMaterial({ color: def.pantsColor, roughness: 0.78 })
    );
    vest.position.y = 1.06;
    root.add(vest);
  } else if (def.tunicStyle === 'kebaya') {
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.12, 0.32), hatMat);
    sash.position.y = 0.74;
    root.add(sash);
  }

  if (def.role === 'fisher' || def.role === 'trader') {
    const caping = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.16, 10), hatMat);
    caping.position.y = 1.77;
    root.add(caping);
  } else if (def.role === 'worker' || def.role === 'engineer') {
    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.23, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.48),
      hatMat
    );
    helmet.position.y = 1.62;
    root.add(helmet);
  } else if (def.role === 'tourist') {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.36, 0.04, 12), hatMat);
    brim.position.y = 1.73;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.14, 10), hatMat);
    crown.position.y = 1.81;
    root.add(brim, crown);
  } else if (def.role === 'shopkeeper') {
    const headband = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 6, 12), hatMat);
    headband.rotation.x = Math.PI / 2;
    headband.position.y = 1.68;
    root.add(headband);
  } else if (def.role === 'robot' || def.role === 'drone_bot') {
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });
    const helmShell = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.36), hatMat);
    helmShell.position.y = 1.62;
    const ledVisor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.08), visorMat);
    ledVisor.position.set(0, 1.62, 0.18);
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, 0.22, 6), visorMat);
    ant.position.set(0.14, 1.88, 0);
    const chestCore = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 10), visorMat);
    chestCore.rotation.x = Math.PI / 2;
    chestCore.position.set(0, 1.06, 0.16);
    root.add(helmShell, ledVisor, ant, chestCore);
    if (def.role === 'drone_bot') {
      const pack = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.42, 0.16), hatMat);
      pack.position.set(0, 1.04, -0.2);
      root.add(pack);
    }
  } else if (def.role === 'scientist') {
    const coat = new THREE.Mesh(
      new THREE.BoxGeometry(0.51, 0.64, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.72 })
    );
    coat.position.y = 0.98;
    const goggle = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.075, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.45 })
    );
    goggle.position.set(0, 1.58, 0.19);
    root.add(coat, goggle);
  } else if (def.role === 'office') {
    const headset = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.025, 6, 14, Math.PI), hatMat);
    headset.position.y = 1.62;
    root.add(headset);
  }

  if (def.prop === 'crate') {
    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.28, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.85 })
    );
    crate.position.set(0, 0.96, 0.28);
    root.add(crate);
  } else if (def.prop === 'basket') {
    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.14, 0.26, 10),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 })
    );
    basket.position.set(0.32, 0.85, 0.12);
    root.add(basket);
  } else if (def.prop === 'tablet') {
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.26, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 })
    );
    pad.position.set(0.28, 0.96, 0.2);
    pad.rotation.x = -0.4;
    root.add(pad);
  } else if (def.prop === 'wrench') {
    const tool = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.34, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 })
    );
    tool.position.set(0.32, 0.82, 0.16);
    tool.rotation.x = 0.6;
    root.add(tool);
  } else if (def.prop === 'satchel') {
    const bag = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.24, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
    );
    bag.position.set(-0.3, 0.84, 0.05);
    root.add(bag);
  } else if (def.prop === 'umbrella') {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 1.35, 6),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
    );
    pole.position.set(0.32, 1.5, 0.12);
    const canopy = new THREE.Mesh(
      new THREE.ConeGeometry(0.55, 0.22, 10),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.7 })
    );
    canopy.position.set(0.32, 2.2, 0.12);
    root.add(pole, canopy);
  } else if (def.prop === 'rod') {
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.03, 1.65, 6),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 })
    );
    rod.position.set(0.32, 1.25, 0.36);
    rod.rotation.x = 0.65;
    root.add(rod);
  } else if (def.prop === 'holopad') {
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.04, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    pad.position.set(0.28, 0.9, 0.24);
    const holo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.26, 0.22),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.78, side: THREE.DoubleSide })
    );
    holo.position.set(0.28, 1.06, 0.24);
    holo.rotation.y = 0.35;
    root.add(pad, holo);
  }

  if (def.scale && def.scale !== 1) {
    root.scale.setScalar(def.scale);
  }

  return { root, leftArm, rightArm, leftLeg, rightLeg };
}

export interface PortalGateHandle {
  root: THREE.Group;
  update: (elapsed: number, stage: StageNumber, unlocked: boolean) => void;
  dispose: () => void;
}

export function createPortalGateMesh(): PortalGateHandle {
  const root = new THREE.Group();
  root.position.set(PORTAL_POSITION.x, 0, PORTAL_POSITION.z);
  addContactShadow(root, 3.8);

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.82 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.28, metalness: 0.65 });

  // Twin Nusantara Portal Pillars + Top Arch Lintel
  for (const side of [-1, 1]) {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.7, 1.5), stoneMat);
    plinth.position.set(side * 2.8, 0.35, 0);
    const col = new THREE.Mesh(new THREE.BoxGeometry(1.0, 5.0, 1.0), stoneMat);
    col.position.set(side * 2.8, 3.2, 0);
    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.1, 4), goldMat);
    finial.rotation.y = Math.PI / 4;
    finial.position.set(side * 2.8, 6.25, 0);
    root.add(plinth, col, finial);
  }
  const archBeam = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.8, 1.2), stoneMat);
  archBeam.position.set(0, 5.7, 0);
  const archCrest = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.5, 1.35), goldMat);
  archCrest.position.set(0, 6.2, 0);
  root.add(archBeam, archCrest);

  // Glowing Swirling Portal Energy Ring & Curtain
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.7,
    roughness: 0.2,
  });
  const energyRing = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.16, 12, 32), ringMat);
  energyRing.position.set(0, 2.9, 0);

  const curtainMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
  });
  const curtain = new THREE.Mesh(new THREE.CircleGeometry(1.95, 28), curtainMat);
  curtain.position.set(0, 2.9, 0);

  const label = createFloatingLabelSprite('GERBANG ERA NUSANTARA', 'Buka di Stage 2', '#f59e0b');
  label.sprite.position.set(0, 7.5, 0);
  label.sprite.scale.set(4.5, 1.1, 1);

  root.add(energyRing, curtain, label.sprite);

  return {
    root,
    update: (elapsed, stage, unlocked) => {
      root.visible = stage < 3;
      if (!root.visible) return;

      if (unlocked) {
        ringMat.color.setHex(0x10b981);
        ringMat.emissive.setHex(0x34d399);
        ringMat.emissiveIntensity = 1.2 + Math.sin(elapsed * 4.0) * 0.35;
        curtainMat.color.setHex(0x34d399);
        curtainMat.opacity = 0.42 + Math.sin(elapsed * 3.5) * 0.12;
        energyRing.rotation.z = elapsed * 1.4;
      } else {
        ringMat.color.setHex(0xf59e0b);
        ringMat.emissive.setHex(0xd97706);
        ringMat.emissiveIntensity = 0.5;
        curtainMat.color.setHex(0xf59e0b);
        curtainMat.opacity = 0.16;
        energyRing.rotation.z = elapsed * 0.35;
      }
    },
    dispose: () => {
      label.dispose();
    },
  };
}

export function createCityBuildingMesh(def: BuildingDefinition): THREE.Group {
  const group = new THREE.Group();
  const primaryMat = new THREE.MeshStandardMaterial({ color: def.colorPrimary, roughness: 0.72 });
  const roofMat = new THREE.MeshStandardMaterial({ color: def.colorRoof, roughness: 0.55 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.88 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    roughness: 0.15,
    metalness: 0.65,
  });

  const isPark = def.id === 'taman-kota' || def.id === 'hutan-kota';
  addContactShadow(group, isPark ? 2.1 : 2.9);

  if (isPark) {
    const lawn = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.7, 0.16, 24),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.9 })
    );
    lawn.position.y = 0.08;
    const fountain = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 0.75, 16), stoneMat);
    fountain.position.y = 0.45;
    const waterTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15 })
    );
    waterTop.position.y = 0.82;
    group.add(lawn, fountain, waterTop);

    for (const [tx, tz] of [
      [-1.7, -1.7],
      [1.7, -1.7],
      [-1.7, 1.7],
      [1.7, 1.7],
    ]) {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.18, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
      );
      trunk.position.set(tx, 0.7, tz);
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 10), roofMat);
      canopy.position.set(tx, 1.85, tz);
      group.add(trunk, canopy);
    }
    return group;
  }

  if (def.id === 'pelabuhan-nusantara') {
    const dockDeck = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.5, 4.8), primaryMat);
    dockDeck.position.y = 0.45;
    const office = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.1, 2.4), primaryMat);
    office.position.set(-0.5, 1.7, 0);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.2, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(-0.5, 3.35, 0);
    const craneMast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 4.2, 8), stoneMat);
    craneMast.position.set(1.5, 2.4, 1.1);
    const craneArm = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 0.2), roofMat);
    craneArm.position.set(2.2, 4.2, 1.1);
    group.add(dockDeck, office, roof, craneMast, craneArm);
    return group;
  }

  if (def.id === 'gapura-batik') {
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.55 });
    const lanternMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.9 });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.3, 2.4), stoneMat);
    plinth.position.y = 0.15;
    group.add(plinth);
    for (const sx of [-1.7, 1.7]) {
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.1), primaryMat);
      base.position.set(sx, 0.75, 0);
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.82, 2.9, 0.82), primaryMat);
      pillar.position.set(sx, 2.65, 0);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.9, 4), goldMat);
      cap.rotation.y = Math.PI / 4;
      cap.position.set(sx, 4.55, 0);
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), lanternMat);
      lantern.position.set(sx, 2.8, 0.55);
      group.add(base, pillar, cap, lantern);
    }
    const arch = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.75, 0.95), roofMat);
    arch.position.set(0, 3.85, 0);
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.85, 4), goldMat);
    crest.rotation.y = Math.PI / 4;
    crest.position.set(0, 4.65, 0);
    group.add(arch, crest);
    return group;
  }

  if (def.id === 'pendopo-seni') {
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.5 });
    const stage = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.45, 4.8), stoneMat);
    stage.position.y = 0.225;
    group.add(stage);
    for (const px of [-1.6, 1.6]) {
      for (const pz of [-1.6, 1.6]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 2.5, 8), primaryMat);
        col.position.set(px, 1.7, pz);
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 8), goldMat);
        ring.position.set(px, 0.55, pz);
        group.add(col, ring);
      }
    }
    const r1 = new THREE.Mesh(new THREE.ConeGeometry(3.8, 1.4, 4), roofMat);
    r1.rotation.y = Math.PI / 4;
    r1.position.y = 3.55;
    const r2 = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.25, 4), roofMat);
    r2.rotation.y = Math.PI / 4;
    r2.position.y = 4.65;
    const gongStand = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 0.18), primaryMat);
    gongStand.position.set(0, 1.05, -0.4);
    const gong = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 14), goldMat);
    gong.rotation.x = Math.PI / 2;
    gong.position.set(0, 1.15, -0.3);
    group.add(r1, r2, gongStand, gong);
    return group;
  }

  if (def.id === 'mercusuar-alun') {
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 1.2 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 2.15, 0.9, 8), stoneMat);
    base.position.y = 0.45;
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.45, 2.2, 12), whiteMat);
    lower.position.y = 2.0;
    const mid = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.15, 2.0, 12), primaryMat);
    mid.position.y = 4.1;
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.92, 1.4, 12), whiteMat);
    upper.position.y = 5.8;
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.85, 12), beaconMat);
    lantern.position.y = 6.9;
    const dome = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.9, 12), roofMat);
    dome.position.y = 7.75;
    group.add(base, lower, mid, upper, lantern, dome);
    return group;
  }

  if (def.id === 'monumen-rempah') {
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.25, metalness: 0.65 });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.55, 4.4), stoneMat);
    plinth.position.y = 0.275;
    const tier2 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.7, 2.8), primaryMat);
    tier2.position.y = 0.9;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 2.6, 12), primaryMat);
    pillar.position.y = 2.55;
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.72, 14, 12), goldMat);
    globe.position.y = 4.55;
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.06, 8, 22), roofMat);
    ring1.position.y = 4.55;
    ring1.rotation.x = 0.45;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.06, 8, 22), goldMat);
    ring2.position.y = 4.55;
    ring2.rotation.y = 0.7;
    ring2.rotation.x = -0.35;
    group.add(plinth, tier2, pillar, globe, ring1, ring2);
    return group;
  }

  if (def.id === 'pembangkit-listrik') {
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.65 });
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.35, 4.8), stoneMat);
    base.position.y = 0.175;
    const hall = new THREE.Mesh(new THREE.BoxGeometry(4.1, 2.6, 3.6), primaryMat);
    hall.position.set(0, 1.65, -0.3);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.35, 3.8), roofMat);
    roof.position.set(0, 3.12, -0.3);
    const turbine = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 14), copperMat);
    turbine.rotation.z = Math.PI / 2;
    turbine.position.set(0, 1.25, 1.4);
    const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.44, 2.2, 12), stoneMat);
    coil.position.set(1.3, 4.2, -0.5);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), glowMat);
    bulb.position.set(1.3, 5.45, -0.5);
    group.add(base, hall, roof, turbine, coil, bulb);
    return group;
  }

  if (def.id === 'instalasi-pengolah-air') {
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.15 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.3, 4.8), stoneMat);
    base.position.y = 0.15;
    group.add(base);
    for (const bx of [-1.25, 1.25]) {
      const tankWall = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 1.1, 16), primaryMat);
      tankWall.position.set(bx, 0.85, -0.5);
      const pool = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 16), waterMat);
      pool.position.set(bx, 1.38, -0.5);
      group.add(tankWall, pool);
    }
    const pumpHouse = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 1.5), roofMat);
    pumpHouse.position.set(0, 1.2, 1.45);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.2, 8), stoneMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, 1.6, 0.25);
    group.add(pumpHouse, pipe);
    return group;
  }

  if (def.id === 'fasilitas-daur-ulang') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.3, 4.8), stoneMat);
    base.position.y = 0.15;
    const hall = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.4, 3.8), primaryMat);
    hall.position.y = 1.5;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.1, 1.1, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 3.25;
    const binColors = [0x22c55e, 0xeab308, 0x0ea5e9];
    for (let i = 0; i < 3; i++) {
      const bin = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.9, 0.8),
        new THREE.MeshStandardMaterial({ color: binColors[i], roughness: 0.55 })
      );
      bin.position.set(-1.15 + i * 1.15, 0.75, 2.05);
      group.add(bin);
    }
    group.add(base, hall, roof);
    return group;
  }

  if (def.id === 'stasiun-kereta-logistik') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.36, 4.8), stoneMat);
    base.position.y = 0.18;
    const hall = new THREE.Mesh(new THREE.BoxGeometry(4.3, 2.2, 3.4), primaryMat);
    hall.position.y = 1.46;
    const vault = new THREE.Mesh(
      new THREE.CylinderGeometry(1.75, 1.75, 4.4, 12, 1, false, 0, Math.PI),
      roofMat
    );
    vault.rotation.z = Math.PI / 2;
    vault.position.y = 2.55;
    const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.16, 12), glassMat);
    clock.rotation.x = Math.PI / 2;
    clock.position.set(0, 3.1, 1.75);
    group.add(base, hall, vault, clock);
    return group;
  }

  if (def.id === 'pembangkit-surya') {
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.18, metalness: 0.7 });
    const neonMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8,
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.32, 4.8), stoneMat);
    base.position.y = 0.16;
    const core = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.35, 3.4, 12), primaryMat);
    core.position.y = 2.0;
    const collector = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), neonMat);
    collector.position.y = 4.3;
    group.add(base, core, collector);
    for (const [px, pz, ry] of [
      [-1.55, 1.4, 0.3],
      [1.55, 1.4, -0.3],
      [-1.55, -1.4, 0.3],
      [1.55, -1.4, -0.3],
    ]) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 1.5), solarMat);
      panel.position.set(px, 1.15, pz);
      panel.rotation.x = 0.45;
      panel.rotation.y = ry;
      group.add(panel);
    }
    return group;
  }

  if (def.id === 'lab-robotika') {
    const neonPurple = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x9333ea,
      emissiveIntensity: 0.75,
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.34, 4.8), stoneMat);
    base.position.y = 0.17;
    const lab = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.8, 3.9), primaryMat);
    lab.position.y = 1.74;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.45, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), glassMat);
    dome.position.y = 3.12;
    const dish = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.1, 8, 18), neonPurple);
    dish.rotation.x = Math.PI / 2;
    dish.position.y = 3.25;
    group.add(base, lab, dome, dish);
    return group;
  }

  if (def.id === 'apartemen-eko' || def.id === 'taman-vertikal-cerdas') {
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 });
    const neonGreen = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 0.65,
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.34, 4.8), stoneMat);
    base.position.y = 0.17;
    group.add(base);
    const floors = def.id === 'apartemen-eko' ? 3 : 2;
    for (let f = 0; f < floors; f++) {
      const w = 4.0 - f * 0.45;
      const tier = new THREE.Mesh(new THREE.BoxGeometry(w, 1.45, w), f % 2 === 0 ? primaryMat : glassMat);
      tier.position.y = 1.05 + f * 1.55;
      const garden = new THREE.Mesh(new THREE.BoxGeometry(w + 0.32, 0.28, w + 0.32), leafMat);
      garden.position.y = 1.78 + f * 1.55;
      group.add(tier, garden);
    }
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), neonGreen);
    beacon.position.y = 1.05 + floors * 1.55 + 0.4;
    group.add(beacon);
    return group;
  }

  if (def.id === 'hub-transit-otonom') {
    const cyanMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.8,
    });
    const pad = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.3, 4.8), stoneMat);
    pad.position.y = 0.15;
    const canopy = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.28, 12), primaryMat);
    canopy.position.y = 2.6;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.1, 8, 22), cyanMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 2.6;
    group.add(pad, canopy, ring);
    for (const px of [-1.4, 1.4]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 2.3, 8), glassMat);
      col.position.set(px, 1.45, 0);
      group.add(col);
    }
    return group;
  }

  const baseH = 0.35;
  const bodyH = Math.max(2.0, def.heightLevel * 1.9);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(4.8, baseH, 4.8), stoneMat);
  plinth.position.y = baseH / 2;

  const body = new THREE.Mesh(new THREE.BoxGeometry(4.1, bodyH, 4.1), primaryMat);
  body.position.y = baseH + bodyH / 2;
  body.castShadow = true;
  group.add(plinth, body);

  if (def.category === 'teknologi' || def.id === 'kawasan-internasional') {
    const glassBand = new THREE.Mesh(new THREE.BoxGeometry(4.2, bodyH * 0.7, 4.2), glassMat);
    glassBand.position.y = baseH + bodyH * 0.55;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 3.6), roofMat);
    cap.position.y = baseH + bodyH + 0.2;
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, 2.4, 10), glassMat);
    spire.position.y = baseH + bodyH + 1.5;
    group.add(glassBand, cap, spire);
  } else if (def.category === 'industri') {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.45, 4.3), roofMat);
    roof.position.y = baseH + bodyH + 0.22;
    const stack1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 2.6, 12), stoneMat);
    stack1.position.set(-1.1, baseH + bodyH + 1.4, -1.0);
    const stack2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 2.2, 12), stoneMat);
    stack2.position.set(1.1, baseH + bodyH + 1.2, -1.0);
    group.add(roof, stack1, stack2);
  } else {
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.7, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = baseH + bodyH + 0.85;
    const windowStrip = new THREE.Mesh(new THREE.BoxGeometry(4.18, 0.55, 2.4), glassMat);
    windowStrip.position.y = baseH + bodyH * 0.55;
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.5, 0.16), roofMat);
    door.position.set(0, baseH + 0.75, 2.06);
    group.add(roof, windowStrip, door);
  }

  return group;
}

export function createBuildPadMesh(terrain: TileTerrain): THREE.Group {
  const pad = new THREE.Group();
  const isWater = terrain === 'water';
  const color = isWater ? 0x38bdf8 : terrain === 'park_base' ? 0x34d399 : 0xf59e0b;

  const baseRing = new THREE.Mesh(
    new THREE.RingGeometry(1.45, 1.9, 4),
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
  );
  baseRing.rotation.x = -Math.PI / 2;
  baseRing.rotation.z = Math.PI / 4;
  baseRing.position.y = 0.04;

  const innerPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
  );
  innerPlate.rotation.x = -Math.PI / 2;
  innerPlate.position.y = 0.03;

  const diamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.32, 0),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.55,
      roughness: 0.25,
    })
  );
  diamond.position.y = 1.05;
  diamond.name = 'pad-diamond';

  pad.add(baseRing, innerPlate, diamond);
  return pad;
}

export function createUpgradedCityBuildingMesh(def: BuildingDefinition, level: 1 | 2 | 3): THREE.Group {
  const group = createCityBuildingMesh(def);
  if (level >= 2) {
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.28, metalness: 0.65 });
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.85,
    });
    const trim = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.22, 4.5), goldMat);
    trim.position.y = 0.38;
    group.add(trim);
    for (const sx of [-2.0, 2.0]) {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), lanternMat);
      lamp.position.set(sx, 2.2, 2.15);
      group.add(lamp);
    }
  }
  if (level === 3) {
    const crestMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.45,
    });
    const upperCap = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.3, 2.6),
      new THREE.MeshStandardMaterial({ color: def.colorPrimary, roughness: 0.65 })
    );
    upperCap.position.y = Math.max(3.6, def.heightLevel * 1.9 + 1.4);
    const roofPeak = new THREE.Mesh(
      new THREE.ConeGeometry(2.1, 1.15, 4),
      new THREE.MeshStandardMaterial({ color: def.colorRoof, roughness: 0.5 })
    );
    roofPeak.rotation.y = Math.PI / 4;
    roofPeak.position.y = upperCap.position.y + 1.2;
    const banner = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), crestMat);
    banner.position.y = roofPeak.position.y + 0.95;
    group.add(upperCap, roofPeak, banner);
  }
  return group;
}

export function createConstructionSiteMesh(): {
  group: THREE.Group;
  updateProgress: (progress: number, elapsed: number) => void;
} {
  const group = new THREE.Group();
  addContactShadow(group, 2.8);

  const earthMat = new THREE.MeshStandardMaterial({ color: 0x78553a, roughness: 0.92 });
  const bambooMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.82 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd6c7b2, roughness: 0.85 });
  const crateMat = new THREE.MeshStandardMaterial({ color: 0xc28a46, roughness: 0.8 });

  const foundation = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.24, 4.8), earthMat);
  foundation.position.y = 0.12;
  group.add(foundation);

  // Corner bamboo scaffolding posts
  for (const px of [-2.2, 2.2]) {
    for (const pz of [-2.2, 2.2]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.8, 6), bambooMat);
      pole.position.set(px, 1.9, pz);
      group.add(pole);
    }
  }
  // Cross beams
  const beam1 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 0.12), bambooMat);
  beam1.position.set(0, 2.4, 2.2);
  const beam2 = beam1.clone();
  beam2.position.set(0, 2.4, -2.2);
  group.add(beam1, beam2);

  // Material stacks
  const pile = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.65, 0.9), crateMat);
  pile.position.set(-1.6, 0.44, 1.6);
  group.add(pile);

  // Rising core structure
  const core = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.8, 3.6), wallMat);
  core.position.y = 0.25;
  group.add(core);

  // Builder figure with helmet
  const worker = new THREE.Group();
  worker.position.set(1.8, 0.24, 1.9);
  const wBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.7, 0.28),
    new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.8 })
  );
  wBody.position.y = 0.75;
  const wHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xe3b184, roughness: 0.65 })
  );
  wHead.position.y = 1.28;
  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 })
  );
  helmet.position.y = 1.32;
  worker.add(wBody, wHead, helmet);
  group.add(worker);

  const updateProgress = (progress: number, elapsed: number) => {
    const p = Math.max(0.08, Math.min(1, progress));
    core.scale.set(1, p, 1);
    core.position.y = 0.24 + (2.8 * p) / 2;
    worker.position.y = 0.24 + Math.abs(Math.sin(elapsed * 5.0)) * 0.08;
    worker.rotation.y = Math.sin(elapsed * 2.2) * 0.45 - 0.8;
  };

  return { group, updateProgress };
}

export function createGhostPreviewMesh(): {
  group: THREE.Group;
  setValid: (valid: boolean) => void;
} {
  const group = new THREE.Group();
  const boxMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.36,
    wireframe: false,
  });
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    wireframe: true,
  });
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 3.2, 4.4), boxMat);
  body.position.y = 1.6;
  const wire = new THREE.Mesh(new THREE.BoxGeometry(4.48, 3.26, 4.48), wireMat);
  wire.position.y = 1.6;
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.7, 3.1, 4), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.rotation.z = Math.PI / 4;
  ring.position.y = 0.08;
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 4), ringMat);
  arrow.rotation.x = Math.PI / 2;
  arrow.position.set(0, 0.4, 2.9);

  group.add(body, wire, ring, arrow);

  const setValid = (valid: boolean) => {
    boxMat.color.setHex(valid ? 0x10b981 : 0xef4444);
    wireMat.color.setHex(valid ? 0x34d399 : 0xfca5a5);
    ringMat.color.setHex(valid ? 0x34d399 : 0xf87171);
  };

  return { group, setValid };
}

export function createRideableVehicleMesh(kind: VehicleKind): THREE.Group {
  const g = new THREE.Group();
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.55 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x7c4a26, roughness: 0.82 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
  const glassCabMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.12, metalness: 0.25 });
  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfacc15,
    emissiveIntensity: 0.85,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: kind === 'bicycle' ? 0xd97706 : kind === 'cart' ? 0x991b1b : 0x0284c7,
    roughness: 0.6,
  });
  const crateMat = new THREE.MeshStandardMaterial({ color: 0xc28a46, roughness: 0.82 });

  if (kind === 'bicycle') {
    addContactShadow(g, 0.72);
    for (const wz of [-0.6, 0.6]) {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 8, 18), metalMat);
      wheel.rotation.y = Math.PI / 2;
      wheel.position.set(0, 0.36, wz);
      g.add(wheel);
    }
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.25), accentMat);
    frame.position.set(0, 0.68, 0);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.65, 8), metalMat);
    stem.position.set(0, 0.82, 0.45);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.05, 0.06), metalMat);
    handle.position.set(0, 1.12, 0.45);
    const basket = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.25, 0.26), crateMat);
    basket.position.set(0, 0.92, 0.62);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.28), woodMat);
    seat.position.set(0, 0.88, -0.2);
    g.add(frame, stem, handle, basket, seat);
    return g;
  }

  if (kind === 'cart') {
    addContactShadow(g, 1.35);
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.26, 2.4), woodMat);
    bed.position.y = 0.62;
    const canopy = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.78, 1.9, 10, 1, false, 0, Math.PI),
      accentMat
    );
    canopy.rotation.z = Math.PI / 2;
    canopy.rotation.y = Math.PI / 2;
    canopy.position.set(0, 1.32, -0.15);
    for (const wx of [-0.88, 0.88]) {
      for (const wz of [-0.8, 0.8]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.14, 12), metalMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.4, wz);
        g.add(wheel);
      }
    }
    const cargo = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.55, 0.95), crateMat);
    cargo.position.set(0, 0.98, 0.4);
    g.add(bed, canopy, cargo);
    return g;
  }

  if (kind === 'delivery_truck' || kind === 'cargo_truck') {
    const isHeavy = kind === 'cargo_truck';
    addContactShadow(g, isHeavy ? 1.85 : 1.55);
    const chassisLen = isHeavy ? 4.3 : 3.4;
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.26, chassisLen), metalMat);
    chassis.position.set(0, 0.5, 0);

    const cabMat = new THREE.MeshStandardMaterial({
      color: isHeavy ? 0x991b1b : 0xd97706,
      roughness: 0.45,
    });
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.68, 1.25, 1.25), cabMat);
    cab.position.set(0, 1.18, isHeavy ? 1.38 : 0.95);
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.54, 0.08), glassCabMat);
    windshield.position.set(0, 1.42, (isHeavy ? 1.38 : 0.95) + 0.62);

    const cargoMat = new THREE.MeshStandardMaterial({
      color: isHeavy ? 0x475569 : 0xf8fafc,
      roughness: 0.62,
    });
    const boxLen = isHeavy ? 2.65 : 2.0;
    const cargoBox = new THREE.Mesh(new THREE.BoxGeometry(1.78, isHeavy ? 1.55 : 1.35, boxLen), cargoMat);
    cargoBox.position.set(0, isHeavy ? 1.38 : 1.28, isHeavy ? -0.68 : -0.65);

    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(1.82, 0.22, boxLen + 0.04),
      new THREE.MeshStandardMaterial({ color: isHeavy ? 0xf59e0b : 0x0284c7, roughness: 0.45 })
    );
    stripe.position.set(0, 1.28, isHeavy ? -0.68 : -0.65);

    for (const lx of [-0.55, 0.55]) {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.08), headlightMat);
      hl.position.set(lx, 0.85, (isHeavy ? 1.38 : 0.95) + 0.63);
      g.add(hl);
    }

    const wheelZ = isHeavy ? [-1.5, -0.5, 1.4] : [-1.15, 1.05];
    for (const wz of wheelZ) {
      for (const wx of [-0.9, 0.9]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.24, 14), tireMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.42, wz);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.26, 8), metalMat);
        hub.rotation.z = Math.PI / 2;
        hub.position.copy(wheel.position);
        g.add(wheel, hub);
      }
    }

    if (isHeavy) {
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.1, 8), metalMat);
      stack.position.set(-0.78, 1.85, 0.8);
      g.add(stack);
    }
    g.add(chassis, cab, windshield, cargoBox, stripe);
    return g;
  }

  if (kind === 'industrial_bus') {
    addContactShadow(g, 2.0);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.48 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.28, 4.6), metalMat);
    chassis.position.y = 0.46;
    const coach = new THREE.Mesh(new THREE.BoxGeometry(1.84, 1.55, 4.5), bodyMat);
    coach.position.y = 1.36;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 4.4), roofMat);
    roof.position.y = 2.18;
    const winBand = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.58, 4.1), glassCabMat);
    winBand.position.y = 1.55;
    for (const lx of [-0.58, 0.58]) {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.08), headlightMat);
      hl.position.set(lx, 0.85, 2.26);
      g.add(hl);
    }
    for (const wz of [-1.45, 1.45]) {
      for (const wx of [-0.94, 0.94]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.24, 14), tireMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.42, wz);
        g.add(wheel);
      }
    }
    g.add(chassis, coach, roof, winBand);
    return g;
  }

  if (kind === 'forklift') {
    addContactShadow(g, 1.05);
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.48 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.72, 1.65), yellowMat);
    body.position.set(0, 0.62, -0.2);
    const counterweight = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.62, 0.45), metalMat);
    counterweight.position.set(0, 0.72, -0.95);
    const roofCage = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.08, 1.1), metalMat);
    roofCage.position.set(0, 1.78, -0.2);
    for (const cx of [-0.46, 0.46]) {
      for (const cz of [-0.65, 0.25]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.92, 6), metalMat);
        post.position.set(cx, 1.32, cz);
        g.add(post);
      }
      const mast = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.75, 0.12), metalMat);
      mast.position.set(cx * 0.72, 1.12, 0.82);
      const fork = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.82), metalMat);
      fork.position.set(cx * 0.68, 0.34, 1.25);
      g.add(mast, fork);
    }
    const cargoCrate = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.56, 0.68), crateMat);
    cargoCrate.position.set(0, 0.65, 1.28);
    for (const wz of [-0.68, 0.52]) {
      for (const wx of [-0.62, 0.62]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 12), tireMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.28, wz);
        g.add(wheel);
      }
    }
    g.add(body, counterweight, roofCage, cargoCrate);
    return g;
  }

  if (kind === 'ev_car' || kind === 'autonomous_taxi' || kind === 'courier_pod') {
    const isTaxi = kind === 'autonomous_taxi';
    const isCourier = kind === 'courier_pod';
    addContactShadow(g, isCourier ? 1.15 : 1.45);
    const bodyHex = isTaxi ? 0x06b6d4 : isCourier ? 0xf59e0b : 0x0ea5e9;
    const neonHex = isTaxi ? 0x22d3ee : isCourier ? 0xfde047 : 0x38bdf8;
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyHex, roughness: 0.25, metalness: 0.45 });
    const neonMat = new THREE.MeshStandardMaterial({
      color: neonHex,
      emissive: neonHex,
      emissiveIntensity: 0.9,
    });
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(isCourier ? 1.35 : 1.65, 0.62, isCourier ? 2.4 : 3.2),
      bodyMat
    );
    hull.position.y = 0.56;
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(isCourier ? 1.15 : 1.38, isCourier ? 0.65 : 0.48, isCourier ? 1.45 : 1.7),
      glassCabMat
    );
    canopy.position.set(0, isCourier ? 1.1 : 1.05, isCourier ? 0.2 : -0.15);
    const lightBar = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.1, 0.08), neonMat);
    lightBar.position.set(0, 0.62, (isCourier ? 2.4 : 3.2) / 2 + 0.02);
    g.add(hull, canopy, lightBar);
    if (isTaxi || isCourier) {
      const lidar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.16, 10), neonMat);
      lidar.position.set(0, isCourier ? 1.5 : 1.36, 0);
      g.add(lidar);
    }
    const wzArr = isCourier ? [-0.82, 0.82] : [-1.05, 1.05];
    const wxVal = isCourier ? 0.72 : 0.86;
    for (const wz of wzArr) {
      for (const wx of [-wxVal, wxVal]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.2, 12), tireMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.34, wz);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.22, 8), neonMat);
        rim.rotation.z = Math.PI / 2;
        rim.position.copy(wheel.position);
        g.add(wheel, rim);
      }
    }
    return g;
  }

  if (kind === 'ev_moto') {
    addContactShadow(g, 0.8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.55 });
    const neonMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: 0xec4899,
      emissiveIntensity: 0.95,
    });
    for (const wz of [-0.66, 0.66]) {
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.09, 8, 16), tireMat);
      tire.rotation.y = Math.PI / 2;
      tire.position.set(0, 0.36, wz);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 6, 14), neonMat);
      rim.rotation.y = Math.PI / 2;
      rim.position.copy(tire.position);
      g.add(tire, rim);
    }
    const cowl = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.44, 1.35), bodyMat);
    cowl.position.set(0, 0.66, 0);
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.35, 0.22), glassCabMat);
    shield.position.set(0, 0.98, 0.5);
    shield.rotation.x = -0.45;
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 1.25), neonMat);
    strip.position.set(0, 0.66, 0);
    g.add(cowl, shield, strip);
    return g;
  }

  if (kind === 'future_bus') {
    addContactShadow(g, 2.15);
    const shellMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.25 });
    const cyanMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.75,
    });
    const coach = new THREE.Mesh(new THREE.BoxGeometry(1.92, 1.62, 5.2), shellMat);
    coach.position.y = 1.24;
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.68, 4.7), glassCabMat);
    glass.position.y = 1.42;
    const neonBand = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.14, 5.24), cyanMat);
    neonBand.position.y = 0.72;
    const solarRoof = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.08, 4.2),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.2, metalness: 0.7 })
    );
    solarRoof.position.y = 2.09;
    for (const wz of [-1.7, 1.7]) {
      for (const wx of [-0.95, 0.95]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.24, 14), tireMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.42, wz);
        g.add(wheel);
      }
    }
    g.add(coach, glass, neonBand, solarRoof);
    return g;
  }

  // Rideable Outrigger Jukung Boat
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.55, 4.4), woodMat);
  hull.position.y = 0.25;
  const prow = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.5, 4), accentMat);
  prow.rotation.x = Math.PI / 2;
  prow.rotation.y = Math.PI / 4;
  prow.position.set(0, 0.35, 2.8);
  for (const side of [-1, 1]) {
    const boom = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.07, 0.1), woodMat);
    boom.position.set(side * 1.1, 0.42, 0);
    const floatLog = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.4, 8), crateMat);
    floatLog.rotation.x = Math.PI / 2;
    floatLog.position.set(side * 1.75, 0.16, 0);
    g.add(boom, floatLog);
  }
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3.1, 8), woodMat);
  mast.position.set(0, 1.8, 0.3);
  const sail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.75, 1.55), accentMat);
  sail.position.set(0, 2.0, -0.35);
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.9 })
  );
  lamp.position.set(0, 3.4, 0.3);
  g.add(hull, prow, mast, sail, lamp);
  return g;
}

