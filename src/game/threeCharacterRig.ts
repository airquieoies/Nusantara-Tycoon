import * as THREE from 'three';
import {
  BODY_TYPES,
  CharacterAppearance,
  CUSTOMIZATION_ITEMS,
  DEFAULT_CHARACTER_APPEARANCE,
  EYE_COLORS,
  EyeShapeId,
  EyebrowStyleId,
  FacePresetId,
  HAIR_COLORS,
  MouthPresetId,
  NosePresetId,
  SKIN_TONES,
} from './stage1Data';
import { VehicleKind } from './types';

export type FacialExpression =
  | 'neutral'
  | 'smiling'
  | 'talking'
  | 'blinking'
  | 'looking_around'
  | 'happy'
  | 'surprised';

export interface SculptedHeadOptions {
  skinHex: number | string;
  hairHex: number | string;
  eyeHex: number | string;
  facePreset?: FacePresetId;
  eyeShape?: EyeShapeId;
  eyebrowStyle?: EyebrowStyleId;
  nosePreset?: NosePresetId;
  mouthPreset?: MouthPresetId;
  hairVariant?: string;
  accentHex?: number | string;
}

export interface SculptedHeadHandle {
  headGroup: THREE.Group;
  skinMat: THREE.MeshStandardMaterial;
  hairMat: THREE.MeshStandardMaterial;
  irisMat: THREE.MeshStandardMaterial;
  lipMat: THREE.MeshStandardMaterial;
  hairAccentMat: THREE.MeshStandardMaterial;
  applyFaceAndHair: (opts: Partial<SculptedHeadOptions>) => void;
  setExpression: (expr: FacialExpression, elapsed: number, blinkAmount?: number) => void;
  dispose: () => void;
}

export function createSculptedHeadGroup(initial: SculptedHeadOptions): SculptedHeadHandle {
  const headGroup = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({
    color: initial.skinHex,
    roughness: 0.58,
    metalness: 0.02,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: initial.hairHex,
    roughness: 0.85,
  });
  const hairAccentMat = new THREE.MeshStandardMaterial({
    color: initial.accentHex ?? 0xf59e0b,
    roughness: 0.35,
    metalness: 0.45,
  });
  const scleraMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.25,
  });
  const irisMat = new THREE.MeshStandardMaterial({
    color: initial.eyeHex,
    roughness: 0.2,
  });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
  const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const lipMat = new THREE.MeshStandardMaterial({
    color: 0xa8554e,
    roughness: 0.52,
  });
  const mouthCavityMat = new THREE.MeshBasicMaterial({ color: 0x3b0f12 });

  // Cranium + Cheekbones + Jaw/Chin sculpting
  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.245, 18, 14), skinMat);
  cranium.scale.set(0.96, 1.04, 0.98);
  cranium.castShadow = true;

  const jaw = new THREE.Mesh(
    new THREE.CylinderGeometry(0.205, 0.14, 0.155, 14),
    skinMat
  );
  jaw.scale.set(1.04, 1, 0.94);
  jaw.position.set(0, -0.108, 0.02);

  const chin = new THREE.Mesh(new THREE.SphereGeometry(0.105, 12, 10), skinMat);
  chin.position.set(0, -0.172, 0.082);
  chin.scale.set(0.98, 0.68, 0.86);

  const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.072, 10, 8), skinMat);
  leftCheek.position.set(-0.095, -0.032, 0.148);
  leftCheek.scale.set(1.05, 0.82, 0.7);
  const rightCheek = leftCheek.clone();
  rightCheek.position.x = 0.095;

  // Sculpted Ears
  const leftEar = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), skinMat);
  leftEar.scale.set(0.42, 1.05, 0.65);
  leftEar.position.set(-0.242, -0.015, -0.015);
  const rightEar = leftEar.clone();
  rightEar.position.x = 0.242;

  headGroup.add(cranium, jaw, chin, leftCheek, rightCheek, leftEar, rightEar);

  // Sculpted 3D Nose (bridge + tip)
  const noseGroup = new THREE.Group();
  noseGroup.position.set(0, -0.015, 0.232);
  const noseBridge = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.082, 0.052), skinMat);
  noseBridge.position.set(0, 0.02, -0.004);
  noseBridge.rotation.x = -0.22;
  const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), skinMat);
  noseTip.position.set(0, -0.025, 0.018);
  noseTip.scale.set(1.05, 0.85, 1.0);
  noseGroup.add(noseBridge, noseTip);
  headGroup.add(noseGroup);

  // Eyes (Socket + Sclera + Iris + Pupil + Specular + Upper/Lower Eyelids)
  interface EyeAssembly {
    container: THREE.Group;
    irisPivot: THREE.Group;
    upperLid: THREE.Mesh;
    lowerLid: THREE.Mesh;
    brow: THREE.Mesh;
    baseBrowY: number;
    side: -1 | 1;
  }

  const eyeAssemblies: EyeAssembly[] = [];
  for (const side of [-1, 1] as (-1 | 1)[]) {
    const container = new THREE.Group();
    container.position.set(side * 0.088, 0.024, 0.205);

    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.044, 12, 10), scleraMat);
    sclera.scale.set(1.04, 0.94, 0.58);

    const irisPivot = new THREE.Group();
    irisPivot.position.z = 0.017;
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), irisMat);
    iris.scale.set(1, 1, 0.52);
    iris.position.z = 0.008;
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), pupilMat);
    pupil.scale.set(1, 1, 0.45);
    pupil.position.z = 0.018;
    const catchlight = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 6, 6), catchlightMat);
    catchlight.position.set(0.008, 0.008, 0.022);
    irisPivot.add(iris, pupil, catchlight);

    const upperLid = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.034, 0.042), skinMat);
    upperLid.position.set(0, 0.044, 0.014);
    const lowerLid = new THREE.Mesh(new THREE.BoxGeometry(0.084, 0.022, 0.038), skinMat);
    lowerLid.position.set(0, -0.037, 0.013);

    container.add(sclera, irisPivot, upperLid, lowerLid);
    headGroup.add(container);

    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.018, 0.024), hairMat);
    brow.position.set(side * 0.088, 0.084, 0.228);
    headGroup.add(brow);

    eyeAssemblies.push({
      container,
      irisPivot,
      upperLid,
      lowerLid,
      brow,
      baseBrowY: 0.084,
      side,
    });
  }

  // Sculpted Upper/Lower Lips + Mouth Cavity
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.105, 0.214);
  const mouthCavity = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.018, 0.02), mouthCavityMat);
  mouthCavity.position.set(0, 0, 0.003);
  const upperLip = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.016, 0.028), lipMat);
  upperLip.position.set(0, 0.01, 0.01);
  const lowerLip = new THREE.Mesh(new THREE.BoxGeometry(0.074, 0.018, 0.028), lipMat);
  lowerLip.position.set(0, -0.01, 0.009);
  mouthGroup.add(mouthCavity, upperLip, lowerLip);
  headGroup.add(mouthGroup);

  // Volumetric 3D Hairstyles (7 Variants)
  const hairVariants = new Map<string, THREE.Group>();

  const buildHair = (id: string, fn: (g: THREE.Group) => void) => {
    const g = new THREE.Group();
    fn(g);
    g.visible = false;
    headGroup.add(g);
    hairVariants.set(id, g);
  };

  // 1. Rapi Wali Kota (side-swept crown + neat back)
  buildHair('rapi', (g) => {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.262, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat
    );
    cap.position.set(0, 0.025, -0.02);
    cap.rotation.x = -0.18;
    const sweep = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.085, 0.14), hairMat);
    sweep.position.set(0.04, 0.178, 0.13);
    sweep.rotation.z = -0.16;
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.16), hairMat);
    back.position.set(0, -0.01, -0.185);
    g.add(cap, sweep, back);
  });

  // 2. Belah Tengah Klasik (twin swept bangs + volume)
  buildHair('belah-tengah', (g) => {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.264, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
      hairMat
    );
    cap.position.set(0, 0.03, -0.02);
    cap.rotation.x = -0.16;
    const bangL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.11, 0.13), hairMat);
    bangL.position.set(-0.095, 0.14, 0.145);
    bangL.rotation.z = 0.28;
    const bangR = bangL.clone();
    bangR.position.x = 0.095;
    bangR.rotation.z = -0.28;
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.18), hairMat);
    sideL.position.set(-0.22, 0.01, -0.02);
    const sideR = sideL.clone();
    sideR.position.x = 0.22;
    g.add(cap, bangL, bangR, sideL, sideR);
  });

  // 3. Ponytail Dinamis
  buildHair('ponytail', (g) => {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.262, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat
    );
    cap.position.set(0, 0.02, -0.02);
    cap.rotation.x = -0.14;
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.02, 8, 12), hairAccentMat);
    tie.position.set(0, 0.06, -0.265);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.36, 10), hairMat);
    tail.position.set(0, -0.09, -0.32);
    tail.rotation.x = 0.42;
    g.add(cap, tie, tail);
  });

  // 4. Undercut Modern
  buildHair('undercut', (g) => {
    const topPoof = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.38), hairMat);
    topPoof.position.set(0, 0.205, 0.02);
    const quiff = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), hairMat);
    quiff.scale.set(1.25, 0.72, 1.15);
    quiff.position.set(0, 0.22, 0.14);
    const fadeBack = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.12), hairMat);
    fadeBack.position.set(0, 0.07, -0.2);
    g.add(topPoof, quiff, fadeBack);
  });

  // 5. Ikal Mengembang Nusantara
  buildHair('ikal', (g) => {
    const puffs: [number, number, number, number][] = [
      [0, 0.22, 0.04, 0.18],
      [-0.17, 0.15, 0.03, 0.14],
      [0.17, 0.15, 0.03, 0.14],
      [-0.19, 0.04, -0.1, 0.14],
      [0.19, 0.04, -0.1, 0.14],
      [0, 0.14, -0.18, 0.18],
      [-0.09, 0.21, 0.14, 0.11],
      [0.09, 0.21, 0.14, 0.11],
    ];
    for (const [px, py, pz, r] of puffs) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), hairMat);
      m.position.set(px, py, pz);
      g.add(m);
    }
  });

  // 6. Ombak Panjang Anggun
  buildHair('ombak-panjang', (g) => {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.266, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat
    );
    cap.position.set(0, 0.025, -0.02);
    const drapeBack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.16), hairMat);
    drapeBack.position.set(0, -0.1, -0.2);
    const drapeL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.38, 0.18), hairMat);
    drapeL.position.set(-0.22, -0.08, -0.03);
    const drapeR = drapeL.clone();
    drapeR.position.x = 0.22;
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.04), hairAccentMat);
    clip.position.set(0.16, 0.12, 0.18);
    g.add(cap, drapeBack, drapeL, drapeR, clip);
  });

  // 7. Sanggul Konde Nusantara
  buildHair('konde', (g) => {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.262, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
      hairMat
    );
    cap.position.set(0, 0.02, -0.02);
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.145, 14, 10), hairMat);
    bun.scale.set(1.15, 0.92, 0.95);
    bun.position.set(0, 0.04, -0.29);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.34, 8), hairAccentMat);
    pin.rotation.z = Math.PI / 3;
    pin.position.set(0, 0.07, -0.29);
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), hairAccentMat);
    flower.position.set(0.12, 0.11, -0.23);
    g.add(cap, bun, pin, flower);
  });

  let currentMouthPreset: MouthPresetId = initial.mouthPreset ?? 'senyum';
  let currentEyebrowStyle: EyebrowStyleId = initial.eyebrowStyle ?? 'natural';
  let currentEyeShape: EyeShapeId = initial.eyeShape ?? 'almond';

  const applyFaceAndHair = (opts: Partial<SculptedHeadOptions>) => {
    if (opts.skinHex !== undefined) skinMat.color.set(opts.skinHex);
    if (opts.hairHex !== undefined) hairMat.color.set(opts.hairHex);
    if (opts.eyeHex !== undefined) irisMat.color.set(opts.eyeHex);
    if (opts.accentHex !== undefined) hairAccentMat.color.set(opts.accentHex);

    if (opts.facePreset) {
      if (opts.facePreset === 'tegas') {
        jaw.scale.set(1.12, 1.08, 1.05);
        leftCheek.scale.set(1.0, 0.72, 0.65);
        rightCheek.scale.set(1.0, 0.72, 0.65);
      } else if (opts.facePreset === 'lembut') {
        jaw.scale.set(0.92, 0.94, 0.95);
        leftCheek.scale.set(1.22, 0.9, 0.8);
        rightCheek.scale.set(1.22, 0.9, 0.8);
      } else if (opts.facePreset === 'cerdas') {
        jaw.scale.set(0.96, 1.02, 1.0);
        cranium.scale.set(0.95, 1.07, 0.99);
      } else {
        jaw.scale.set(1, 1, 1);
        cranium.scale.set(0.96, 1.04, 0.98);
        leftCheek.scale.set(1.1, 0.8, 0.72);
        rightCheek.scale.set(1.1, 0.8, 0.72);
      }
    }

    if (opts.eyeShape) {
      currentEyeShape = opts.eyeShape;
      for (const ea of eyeAssemblies) {
        if (currentEyeShape === 'bulat') ea.container.scale.set(1.08, 1.18, 1);
        else if (currentEyeShape === 'sipit') ea.container.scale.set(1.1, 0.74, 1);
        else if (currentEyeShape === 'tegas') ea.container.scale.set(1.05, 0.9, 1);
        else ea.container.scale.set(1.0, 1.0, 1);
      }
    }

    if (opts.eyebrowStyle) {
      currentEyebrowStyle = opts.eyebrowStyle;
      for (const ea of eyeAssemblies) {
        if (currentEyebrowStyle === 'tebal') ea.brow.scale.set(1.08, 1.45, 1.1);
        else if (currentEyebrowStyle === 'melengkung') ea.brow.scale.set(0.96, 0.85, 1);
        else if (currentEyebrowStyle === 'lurus') ea.brow.scale.set(1.04, 0.95, 1);
        else ea.brow.scale.set(1, 1, 1);
      }
    }

    if (opts.nosePreset) {
      if (opts.nosePreset === 'mancung') noseGroup.scale.set(0.92, 1.14, 1.32);
      else if (opts.nosePreset === 'mungil') noseGroup.scale.set(0.84, 0.86, 0.84);
      else if (opts.nosePreset === 'tegas') noseGroup.scale.set(1.24, 1.02, 1.1);
      else noseGroup.scale.set(1, 1, 1);
    }

    if (opts.mouthPreset) {
      currentMouthPreset = opts.mouthPreset;
    }

    if (opts.hairVariant !== undefined) {
      const targetKey = hairVariants.has(opts.hairVariant) ? opts.hairVariant : 'rapi';
      for (const [k, g] of hairVariants.entries()) {
        g.visible = k === targetKey;
      }
    }
  };

  applyFaceAndHair({
    ...initial,
    hairVariant: initial.hairVariant ?? 'rapi',
  });

  const setExpression = (expr: FacialExpression, elapsed: number, blinkAmount = 0) => {
    const isBlinking = expr === 'blinking' || blinkAmount > 0.05;
    const lidClose = expr === 'blinking' ? 1 : Math.max(0, Math.min(1, blinkAmount));

    for (const ea of eyeAssemblies) {
      // Eyelid close / widen
      if (isBlinking) {
        ea.upperLid.position.y = 0.044 - lidClose * 0.042;
        ea.upperLid.scale.y = 1 + lidClose * 1.3;
        ea.lowerLid.position.y = -0.037 + lidClose * 0.02;
      } else if (expr === 'surprised') {
        ea.upperLid.position.y = 0.05;
        ea.upperLid.scale.y = 0.72;
        ea.lowerLid.position.y = -0.041;
      } else if (expr === 'happy') {
        ea.upperLid.position.y = 0.041;
        ea.upperLid.scale.y = 0.95;
        ea.lowerLid.position.y = -0.027;
      } else {
        ea.upperLid.position.y = 0.044;
        ea.upperLid.scale.y = 0.9;
        ea.lowerLid.position.y = -0.037;
      }

      // Eyebrows
      const baseTilt =
        currentEyebrowStyle === 'melengkung' ? -ea.side * 0.14 : currentEyebrowStyle === 'lurus' ? 0 : -ea.side * 0.06;
      if (expr === 'surprised') {
        ea.brow.position.y = ea.baseBrowY + 0.022;
        ea.brow.rotation.z = -ea.side * 0.18;
      } else if (expr === 'happy' || expr === 'smiling') {
        ea.brow.position.y = ea.baseBrowY + 0.009;
        ea.brow.rotation.z = baseTilt - ea.side * 0.06;
      } else if (expr === 'talking') {
        ea.brow.position.y = ea.baseBrowY + Math.abs(Math.sin(elapsed * 5.2)) * 0.012;
        ea.brow.rotation.z = baseTilt;
      } else {
        ea.brow.position.y = ea.baseBrowY;
        ea.brow.rotation.z = baseTilt;
      }

      // Iris look-around
      if (expr === 'looking_around') {
        ea.irisPivot.position.x = Math.sin(elapsed * 1.6) * 0.014;
      } else {
        ea.irisPivot.position.x = 0;
      }
    }

    // Mouth & Lips animation
    const baseWidth =
      currentMouthPreset === 'ceria' ? 1.15 : currentMouthPreset === 'berwibawa' ? 0.92 : 1.0;

    if (expr === 'talking') {
      const open = 0.4 + Math.abs(Math.sin(elapsed * 11.5)) * 1.45;
      mouthCavity.scale.set(baseWidth * 0.92, open, 1);
      upperLip.position.y = 0.011 + open * 0.005;
      lowerLip.position.y = -0.011 - open * 0.009;
      mouthGroup.scale.set(baseWidth, 1, 1);
    } else if (expr === 'surprised') {
      mouthCavity.scale.set(0.68, 2.1, 1);
      upperLip.position.y = 0.021;
      lowerLip.position.y = -0.022;
      mouthGroup.scale.set(0.85, 1, 1);
    } else if (expr === 'happy') {
      mouthCavity.scale.set(baseWidth * 1.1, 1.15, 1);
      upperLip.position.y = 0.014;
      lowerLip.position.y = -0.016;
      mouthGroup.scale.set(baseWidth * 1.15, 1.05, 1);
    } else if (expr === 'smiling' || currentMouthPreset === 'senyum' || currentMouthPreset === 'ceria') {
      mouthCavity.scale.set(baseWidth, 0.38, 1);
      upperLip.position.y = 0.011;
      lowerLip.position.y = -0.011;
      mouthGroup.scale.set(baseWidth * 1.08, 1, 1);
    } else {
      mouthCavity.scale.set(baseWidth * 0.85, 0.16, 1);
      upperLip.position.y = 0.009;
      lowerLip.position.y = -0.009;
      mouthGroup.scale.set(baseWidth * 0.94, 1, 1);
    }
  };

  return {
    headGroup,
    skinMat,
    hairMat,
    irisMat,
    lipMat,
    hairAccentMat,
    applyFaceAndHair,
    setExpression,
    dispose: () => {
      skinMat.dispose();
      hairMat.dispose();
      hairAccentMat.dispose();
      scleraMat.dispose();
      irisMat.dispose();
      pupilMat.dispose();
      catchlightMat.dispose();
      lipMat.dispose();
      mouthCavityMat.dispose();
    },
  };
}

export interface CustomizableCharacterRigHandle {
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

export function createCustomizableCharacterRig(
  initialAppearance: CharacterAppearance = DEFAULT_CHARACTER_APPEARANCE
): CustomizableCharacterRigHandle {
  const root = new THREE.Group();

  const shadowGeo = new THREE.CircleGeometry(0.58, 20);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x0b1215,
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.025;
  root.add(shadow);

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const torsoScaleGroup = new THREE.Group();
  bodyGroup.add(torsoScaleGroup);

  // Materials
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
  const shirtAccentMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.72 });
  const coatMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.72 });
  const coatAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.3,
    metalness: 0.55,
  });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.82 });
  const pantsAccentMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.7 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 0.5 });
  const shoeAccentMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const hatPrimaryMat = new THREE.MeshStandardMaterial({ color: 0x1e1b18, roughness: 0.65 });
  const hatAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.3,
    metalness: 0.5,
  });
  const glassFrameMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.45,
  });
  const glassLensMat = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
    metalness: 0.3,
  });
  const bagPrimaryMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.78 });
  const bagAccentMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.55 });
  const accPrimaryMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.65 });
  const accAccentMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.35,
    metalness: 0.4,
  });

  // Sculpted Head + Neck
  const skinDef = SKIN_TONES.find((s) => s.id === initialAppearance.skinTone) ?? SKIN_TONES[1];
  const eyeColorDef =
    EYE_COLORS.find((c) => c.id === initialAppearance.eyeColor) ?? EYE_COLORS[0];
  const hairColorDef =
    HAIR_COLORS.find((h) => h.id === initialAppearance.hairColor) ?? HAIR_COLORS[0];

  const sculptedHead = createSculptedHeadGroup({
    skinHex: skinDef.hex,
    hairHex: hairColorDef.hex,
    eyeHex: eyeColorDef.hex,
    facePreset: initialAppearance.facePreset,
    eyeShape: initialAppearance.eyeShape,
    eyebrowStyle: initialAppearance.eyebrowStyle,
    nosePreset: initialAppearance.nosePreset,
    mouthPreset: initialAppearance.mouthPreset,
    hairVariant: 'rapi',
  });

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.118, 0.16, 12),
    sculptedHead.skinMat
  );
  neck.position.y = 1.5;
  torsoScaleGroup.add(neck);

  const headGroup = sculptedHead.headGroup;
  headGroup.position.set(0, 1.73, 0);
  bodyGroup.add(headGroup);

  // Legs + Shoes + Batik Sarung / Pleated Skirt / Shorts Support
  const legToeCaps: THREE.Mesh[] = [];
  const legShins: THREE.Mesh[] = [];
  const legThighs: THREE.Mesh[] = [];
  const legSportStripes: THREE.Mesh[] = [];
  const makeLeg = (xOff: number) => {
    const legPivot = new THREE.Group();
    legPivot.position.set(xOff, 0.72, 0);
    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.34, 0.24), pantsMat);
    thigh.position.y = -0.17;
    const shin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.32, 0.22), pantsMat);
    shin.position.y = -0.48;
    const sportStripe = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.56, 0.06), pantsAccentMat);
    sportStripe.position.set(xOff < 0 ? -0.115 : 0.115, -0.31, 0);
    sportStripe.visible = false;
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.13, 0.34), shoeMat);
    shoe.position.set(0, -0.65, 0.04);
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.245, 0.04, 0.355), shoeAccentMat);
    sole.position.set(0, -0.71, 0.04);
    const toeCap = new THREE.Mesh(new THREE.BoxGeometry(0.235, 0.08, 0.12), shoeAccentMat);
    toeCap.position.set(0, -0.64, 0.16);
    legToeCaps.push(toeCap);
    legShins.push(shin);
    legThighs.push(thigh);
    legSportStripes.push(sportStripe);
    legPivot.add(thigh, shin, sportStripe, shoe, sole, toeCap);
    torsoScaleGroup.add(legPivot);
    return legPivot;
  };
  const leftLeg = makeLeg(-0.15);
  const rightLeg = makeLeg(0.15);

  // Batik Sarung/Skirt Wrap
  const sarungGroup = new THREE.Group();
  const sarungBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.56, 14), pantsMat);
  sarungBody.scale.set(1.05, 1, 0.68);
  sarungBody.position.y = 0.49;
  const sarungTrim = new THREE.Mesh(new THREE.CylinderGeometry(0.325, 0.345, 0.09, 14), pantsAccentMat);
  sarungTrim.scale.set(1.05, 1, 0.68);
  sarungTrim.position.y = 0.25;
  sarungGroup.add(sarungBody, sarungTrim);
  sarungGroup.visible = false;
  torsoScaleGroup.add(sarungGroup);

  // Pleated Skirt Group
  const pleatedSkirtGroup = new THREE.Group();
  const pleatedCone = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.42, 0.4, 16), pantsMat);
  pleatedCone.scale.set(1.06, 1, 0.72);
  pleatedCone.position.y = 0.55;
  const pleatedHem = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.43, 0.06, 16), pantsAccentMat);
  pleatedHem.scale.set(1.06, 1, 0.72);
  pleatedHem.position.y = 0.37;
  pleatedSkirtGroup.add(pleatedCone, pleatedHem);
  pleatedSkirtGroup.visible = false;
  torsoScaleGroup.add(pleatedSkirtGroup);

  // Torso (Base Shirt + Dress + Hoodie + Jacket/Outerwear Layers)
  const shirtTorso = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.62, 0.32), shirtMat);
  shirtTorso.position.y = 1.13;
  shirtTorso.castShadow = true;
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.11, 0.34), shirtAccentMat);
  collar.position.y = 1.42;
  const shirtPlacket = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.56, 0.335), shirtAccentMat);
  shirtPlacket.position.y = 1.14;
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.59, 0.095, 0.345), coatAccentMat);
  belt.position.y = 0.785;

  // Shirt Dress Skirt Extension
  const dressSkirtGroup = new THREE.Group();
  const dressSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.43, 0.46, 16), shirtMat);
  dressSkirt.scale.set(1.06, 1, 0.7);
  dressSkirt.position.y = 0.54;
  const dressHem = new THREE.Mesh(new THREE.CylinderGeometry(0.415, 0.44, 0.07, 16), shirtAccentMat);
  dressHem.scale.set(1.06, 1, 0.7);
  dressHem.position.y = 0.34;
  dressSkirtGroup.add(dressSkirt, dressHem);
  dressSkirtGroup.visible = false;

  // Shirt Hoodie Hood & Kangaroo Pocket
  const shirtHoodGroup = new THREE.Group();
  const shirtHoodBack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.22), shirtMat);
  shirtHoodBack.position.set(0, 1.49, -0.17);
  shirtHoodBack.rotation.x = 0.28;
  const shirtPocket = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.05), shirtAccentMat);
  shirtPocket.position.set(0, 0.94, 0.17);
  shirtHoodGroup.add(shirtHoodBack, shirtPocket);
  shirtHoodGroup.visible = false;

  torsoScaleGroup.add(shirtTorso, collar, shirtPlacket, belt, dressSkirtGroup, shirtHoodGroup);

  // Outerwear layers
  const jacketTorsoGroup = new THREE.Group();
  const jacketBack = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.64, 0.32), coatMat);
  jacketBack.position.set(0, 1.12, -0.015);
  const jacketLeftPanel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.62, 0.06), coatMat);
  jacketLeftPanel.position.set(-0.2, 1.12, 0.175);
  const jacketRightPanel = jacketLeftPanel.clone();
  jacketRightPanel.position.x = 0.2;
  const lapelTrim = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.04), coatAccentMat);
  lapelTrim.position.set(-0.18, 1.24, 0.2);
  const jubahSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.32, 0.36), coatMat);
  jubahSkirt.position.y = 0.64;
  const jacketHood = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.25, 0.24), coatMat);
  jacketHood.position.set(0, 1.5, -0.19);
  jacketHood.rotation.x = 0.3;
  jacketHood.visible = false;
  const beskapButtons = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const btn = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), coatAccentMat);
    btn.position.set(0, 1.28 - i * 0.16, 0.195);
    beskapButtons.add(btn);
  }
  const exoArmorGroup = new THREE.Group();
  const exoPadL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.3), coatAccentMat);
  exoPadL.position.set(-0.36, 1.44, 0);
  const exoPadR = exoPadL.clone();
  exoPadR.position.x = 0.36;
  const cyberCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), coatAccentMat);
  cyberCore.scale.set(1, 1, 0.38);
  cyberCore.position.set(0, 1.24, 0.195);
  const cyberStripeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.54, 0.03), coatAccentMat);
  cyberStripeL.position.set(-0.19, 1.12, 0.2);
  const cyberStripeR = cyberStripeL.clone();
  cyberStripeR.position.x = 0.19;
  exoArmorGroup.add(exoPadL, exoPadR, cyberCore, cyberStripeL, cyberStripeR);
  exoArmorGroup.visible = false;
  jacketTorsoGroup.add(
    jacketBack,
    jacketLeftPanel,
    jacketRightPanel,
    lapelTrim,
    jubahSkirt,
    jacketHood,
    beskapButtons,
    exoArmorGroup
  );
  torsoScaleGroup.add(jacketTorsoGroup);

  // Articulated Arms + Sculpted Hands (Palm + Thumb)
  const armCoatMeshes: THREE.Mesh[] = [];
  const armCuffMeshes: THREE.Mesh[] = [];
  const makeArm = (xOff: number) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(xOff, 1.38, 0);
    const shirtShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 8), shirtMat);
    shirtShoulder.position.y = 0;
    const coatShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), coatMat);
    coatShoulder.position.y = 0;
    armCoatMeshes.push(coatShoulder);

    const shirtSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.48, 0.2), shirtMat);
    shirtSleeve.position.y = -0.22;
    const coatSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.205, 0.46, 0.225), coatMat);
    coatSleeve.position.y = -0.21;
    coatSleeve.castShadow = true;
    armCoatMeshes.push(coatSleeve);

    const cuff = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.075, 0.23), coatAccentMat);
    cuff.position.y = -0.44;
    armCuffMeshes.push(cuff);

    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.14, 0.12), sculptedHead.skinMat);
    palm.position.y = -0.54;
    const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.06), sculptedHead.skinMat);
    thumb.position.set(xOff < 0 ? 0.065 : -0.065, -0.53, 0.05);
    armPivot.add(shirtShoulder, coatShoulder, shirtSleeve, coatSleeve, cuff, palm, thumb);
    torsoScaleGroup.add(armPivot);
    return armPivot;
  };
  const leftArm = makeArm(-0.39);
  const rightArm = makeArm(0.39);

  // Hats attached to headGroup (6 variants)
  const peciGroup = new THREE.Group();
  const peci = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.225, 0.16, 16), hatPrimaryMat);
  peci.position.set(0, 0.23, 0);
  const peciRim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.022, 8, 20), hatAccentMat);
  peciRim.rotation.x = Math.PI / 2;
  peciRim.position.set(0, 0.16, 0);
  peciGroup.add(peci, peciRim);

  const blangkonGroup = new THREE.Group();
  const blangkonCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.27, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.48),
    hatPrimaryMat
  );
  blangkonCap.position.set(0, 0.04, 0);
  const blangkonBand = new THREE.Mesh(new THREE.TorusGeometry(0.262, 0.04, 8, 18), hatAccentMat);
  blangkonBand.rotation.x = Math.PI / 2;
  blangkonBand.position.set(0, 0.12, 0);
  const blangkonKnot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.1), hatPrimaryMat);
  blangkonKnot.position.set(0, 0.1, -0.27);
  blangkonGroup.add(blangkonCap, blangkonBand, blangkonKnot);

  const nakhodaGroup = new THREE.Group();
  const capTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.22, 0.14, 16),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 })
  );
  capTop.position.set(0, 0.25, 0);
  const capBand = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.06, 16), hatPrimaryMat);
  capBand.position.set(0, 0.17, 0);
  const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.16), hatAccentMat);
  capVisor.position.set(0, 0.14, 0.22);
  nakhodaGroup.add(capTop, capBand, capVisor);

  const capingGroup = new THREE.Group();
  const capingCone = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.22, 16), hatPrimaryMat);
  capingCone.position.set(0, 0.26, 0);
  const capingRim = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.02, 6, 18), hatAccentMat);
  capingRim.rotation.x = Math.PI / 2;
  capingRim.position.set(0, 0.15, 0);
  capingGroup.add(capingCone, capingRim);

  const tanjakGroup = new THREE.Group();
  const tanjakBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.235, 0.14, 14), hatPrimaryMat);
  tanjakBase.position.set(0, 0.2, 0);
  const tanjakPeak = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.24, 4), hatAccentMat);
  tanjakPeak.rotation.y = Math.PI / 4;
  tanjakPeak.position.set(0, 0.34, 0.02);
  tanjakGroup.add(tanjakBase, tanjakPeak);

  // Industrial Safety Hard Hat (Stage 2)
  const safetyHelmetGroup = new THREE.Group();
  const hardHatDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.275, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52),
    hatPrimaryMat
  );
  hardHatDome.position.set(0, 0.1, 0);
  const hardHatRidge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.44), hatPrimaryMat);
  hardHatRidge.position.set(0, 0.33, 0);
  const hardHatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.295, 0.31, 0.035, 16), hatPrimaryMat);
  hardHatBrim.position.set(0, 0.11, 0.03);
  const hardHatPeak = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.025, 0.15), hatPrimaryMat);
  hardHatPeak.position.set(0, 0.105, 0.26);
  const hardHatStripe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.075, 0.04), hatAccentMat);
  hardHatStripe.position.set(0, 0.21, 0.255);
  safetyHelmetGroup.add(hardHatDome, hardHatRidge, hardHatBrim, hardHatPeak, hardHatStripe);

  // Stage 3 Futuristic Helmets (Cyber Visor / Pilot Aero / Future Crown)
  const cyberHelmGroup = new THREE.Group();
  const cyberShell = new THREE.Mesh(
    new THREE.SphereGeometry(0.285, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hatPrimaryMat
  );
  cyberShell.position.set(0, 0.06, 0);
  const cyberVisorStrip = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.09, 0.16), hatAccentMat);
  cyberVisorStrip.position.set(0, 0.08, 0.21);
  const cyberFin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.11, 0.42), hatAccentMat);
  cyberFin.position.set(0, 0.34, -0.04);
  cyberHelmGroup.add(cyberShell, cyberVisorStrip, cyberFin);

  const pilotHelmGroup = new THREE.Group();
  const pilotDome = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), hatPrimaryMat);
  pilotDome.scale.set(1.02, 0.88, 1.08);
  pilotDome.position.set(0, 0.09, -0.02);
  const pilotEarL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 10), hatAccentMat);
  pilotEarL.rotation.z = Math.PI / 2;
  pilotEarL.position.set(-0.28, 0.06, 0);
  const pilotEarR = pilotEarL.clone();
  pilotEarR.position.x = 0.28;
  const pilotShield = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.11, 0.12), hatAccentMat);
  pilotShield.position.set(0, 0.06, 0.22);
  pilotHelmGroup.add(pilotDome, pilotEarL, pilotEarR, pilotShield);

  const futureCrownGroup = new THREE.Group();
  const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 8, 24), hatAccentMat);
  haloRing.rotation.x = Math.PI / 2;
  haloRing.position.set(0, 0.36, 0);
  const crownGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), hatPrimaryMat);
  crownGem.position.set(0, 0.24, 0.25);
  futureCrownGroup.add(haloRing, crownGem);

  headGroup.add(
    peciGroup,
    blangkonGroup,
    nakhodaGroup,
    capingGroup,
    tanjakGroup,
    safetyHelmetGroup,
    cyberHelmGroup,
    pilotHelmGroup,
    futureCrownGroup
  );

  // Glasses attached to headGroup
  const glassesGroup = new THREE.Group();
  glassesGroup.position.set(0, 0.024, 0.246);
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.015, 0.02), glassFrameMat);
  const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.065, 0.018), glassFrameMat);
  frameL.position.x = -0.085;
  const frameR = frameL.clone();
  frameR.position.x = 0.085;
  const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.048, 0.022), glassLensMat);
  lensL.position.x = -0.085;
  const lensR = lensL.clone();
  lensR.position.x = 0.085;
  const armBarL = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.18), glassFrameMat);
  armBarL.position.set(-0.135, 0.005, -0.09);
  const armBarR = armBarL.clone();
  armBarR.position.x = 0.135;
  glassesGroup.add(bridge, frameL, frameR, lensL, lensR, armBarL, armBarR);
  headGroup.add(glassesGroup);

  // Bags (Backpack / Satchel / Tote / Jetpack)
  const backpackGroup = new THREE.Group();
  const bpBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.2), bagPrimaryMat);
  bpBody.position.set(0, 1.08, -0.26);
  const bpPocket = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.08), bagAccentMat);
  bpPocket.position.set(0, 0.96, -0.37);
  backpackGroup.add(bpBody, bpPocket);

  const satchelGroup = new THREE.Group();
  const satStrap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.36), bagAccentMat);
  satStrap.position.set(0, 1.1, 0);
  satStrap.rotation.z = 0.58;
  const satBag = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.26), bagPrimaryMat);
  satBag.position.set(-0.34, 0.82, 0.05);
  satchelGroup.add(satStrap, satBag);

  const toteGroup = new THREE.Group();
  const toteBody = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.34, 0.3), bagPrimaryMat);
  toteBody.position.set(0.35, 0.84, 0.06);
  const toteStripe = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.1, 0.31), bagAccentMat);
  toteStripe.position.set(0.35, 0.84, 0.06);
  toteGroup.add(toteBody, toteStripe);

  const jetpackGroup = new THREE.Group();
  const jpThrusterL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.095, 0.42, 10), bagPrimaryMat);
  jpThrusterL.position.set(-0.13, 1.12, -0.26);
  const jpThrusterR = jpThrusterL.clone();
  jpThrusterR.position.x = 0.13;
  const jpCore = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.14), bagAccentMat);
  jpCore.position.set(0, 1.16, -0.24);
  const jpNozzleL = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.12, 8), bagAccentMat);
  jpNozzleL.rotation.x = Math.PI;
  jpNozzleL.position.set(-0.13, 0.88, -0.26);
  const jpNozzleR = jpNozzleL.clone();
  jpNozzleR.position.x = 0.13;
  jetpackGroup.add(jpThrusterL, jpThrusterR, jpCore, jpNozzleL, jpNozzleR);
  jetpackGroup.visible = false;

  torsoScaleGroup.add(backpackGroup, satchelGroup, toteGroup, jetpackGroup);

  // Accessories (Scarf / Badge / Sash / Watch / Hairband / Respirator Mask)
  const scarfGroup = new THREE.Group();
  const scarfRing = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.048, 8, 16), accPrimaryMat);
  scarfRing.rotation.x = Math.PI / 2;
  scarfRing.position.set(0, 1.46, 0);
  const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.05), accAccentMat);
  scarfTail.position.set(0.08, 1.32, 0.19);
  scarfTail.rotation.z = -0.15;
  scarfGroup.add(scarfRing, scarfTail);

  const badgeGroup = new THREE.Group();
  const emblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), accPrimaryMat);
  emblem.scale.set(1, 1, 0.45);
  emblem.position.set(0.16, 1.24, 0.21);
  badgeGroup.add(emblem);

  const sashGroup = new THREE.Group();
  const sashBand = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.78, 0.38), accPrimaryMat);
  sashBand.position.set(0, 1.09, 0);
  sashBand.rotation.z = -0.62;
  const sashBorder = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.39), accAccentMat);
  sashBorder.position.set(-0.18, 0.9, 0);
  sashBorder.rotation.z = -0.62;
  sashGroup.add(sashBand, sashBorder);

  // Wristwatch / Holo Armband on Left Arm
  const watchGroup = new THREE.Group();
  const watchStrap = new THREE.Mesh(new THREE.BoxGeometry(0.225, 0.06, 0.245), accPrimaryMat);
  watchStrap.position.set(0, -0.45, 0);
  const watchDial = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 12), accAccentMat);
  watchDial.rotation.z = Math.PI / 2;
  watchDial.position.set(-0.12, -0.45, 0.02);
  watchGroup.add(watchStrap, watchDial);
  watchGroup.visible = false;
  leftArm.add(watchGroup);

  const holoArmbandGroup = new THREE.Group();
  const holoCuff = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.09, 0.25), accPrimaryMat);
  holoCuff.position.set(0, -0.43, 0);
  const holoRing = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.015, 6, 16), accAccentMat);
  holoRing.rotation.y = Math.PI / 2;
  holoRing.position.set(-0.15, -0.43, 0.02);
  holoArmbandGroup.add(holoCuff, holoRing);
  holoArmbandGroup.visible = false;
  leftArm.add(holoArmbandGroup);

  // Hairband / Headband on headGroup
  const hairbandGroup = new THREE.Group();
  const bandTorus = new THREE.Mesh(new THREE.TorusGeometry(0.252, 0.03, 8, 22), accPrimaryMat);
  bandTorus.rotation.x = Math.PI / 2 + 0.18;
  bandTorus.position.set(0, 0.125, 0.01);
  const bandKnot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.05), accAccentMat);
  bandKnot.position.set(0.12, 0.175, 0.19);
  bandKnot.rotation.z = -0.35;
  hairbandGroup.add(bandTorus, bandKnot);
  hairbandGroup.visible = false;
  headGroup.add(hairbandGroup);

  // Respirator / Mask on lower face
  const maskGroup = new THREE.Group();
  const maskShield = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.135, 0.12), accPrimaryMat);
  maskShield.position.set(0, -0.095, 0.205);
  const maskFilter = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 10), accAccentMat);
  maskFilter.rotation.x = Math.PI / 2;
  maskFilter.position.set(0, -0.1, 0.27);
  maskGroup.add(maskShield, maskFilter);
  maskGroup.visible = false;
  headGroup.add(maskGroup);

  torsoScaleGroup.add(scarfGroup, badgeGroup, sashGroup);

  let currentAppearance: CharacterAppearance = { ...initialAppearance };

  const applyAppearance = (appearance: CharacterAppearance) => {
    currentAppearance = { ...appearance };

    const skin = SKIN_TONES.find((s) => s.id === appearance.skinTone) ?? SKIN_TONES[1];
    const eyeCol = EYE_COLORS.find((c) => c.id === appearance.eyeColor) ?? EYE_COLORS[0];
    const hairCol = HAIR_COLORS.find((h) => h.id === appearance.hairColor) ?? HAIR_COLORS[0];
    const hairDef = CUSTOMIZATION_ITEMS.find((i) => i.id === appearance.hairstyle);
    const shirtDef = CUSTOMIZATION_ITEMS.find((i) => i.id === appearance.shirtId);
    const jacketDef = CUSTOMIZATION_ITEMS.find((i) => i.id === appearance.jacketId);
    const pantsDef = CUSTOMIZATION_ITEMS.find((i) => i.id === appearance.pantsId);
    const shoeDef = CUSTOMIZATION_ITEMS.find((i) => i.id === appearance.shoeId);
    const hatDef = CUSTOMIZATION_ITEMS.find((i) => i.id === appearance.hatId);
    const glassDef = CUSTOMIZATION_ITEMS.find((i) => i.id === appearance.glassesId);
    const bagDef = CUSTOMIZATION_ITEMS.find((i) => i.id === appearance.bagId);
    const accDef = CUSTOMIZATION_ITEMS.find((i) => i.id === appearance.accessoryId);

    // 1. Face & Hair
    sculptedHead.applyFaceAndHair({
      skinHex: skin.hex,
      hairHex: hairCol.hex,
      eyeHex: eyeCol.hex,
      facePreset: appearance.facePreset,
      eyeShape: appearance.eyeShape,
      eyebrowStyle: appearance.eyebrowStyle,
      nosePreset: appearance.nosePreset,
      mouthPreset: appearance.mouthPreset,
      hairVariant: hairDef?.styleVariant ?? 'rapi',
      accentHex: hairDef?.accentHex ?? '#f59e0b',
    });

    // 2. Body proportions
    const bDef = BODY_TYPES.find((b) => b.id === appearance.bodyType) ?? BODY_TYPES[1];
    torsoScaleGroup.scale.set(bDef.scaleX, 1, bDef.scaleZ);

    // 3. Shirt (supports hoodie, dress, sport, kemeja/batik/kebaya)
    if (shirtDef) {
      shirtMat.color.set(shirtDef.primaryHex);
      shirtAccentMat.color.set(shirtDef.accentHex);
    }
    const sVar = shirtDef?.styleVariant ?? 'kemeja';
    dressSkirtGroup.visible = sVar === 'dress';
    shirtHoodGroup.visible = sVar === 'hoodie';
    shirtPlacket.scale.x = sVar === 'sport' ? 1.8 : 1.0;

    // 4. Jacket / Outerwear (supports jas, rompi, beskap, jubah, hoodie, cyber_suit, exosuit, pilot_jacket, none)
    const jVar = jacketDef?.styleVariant ?? 'jas';
    if (jVar === 'none') {
      jacketTorsoGroup.visible = false;
      exoArmorGroup.visible = false;
      for (const m of armCoatMeshes) m.visible = false;
      for (const c of armCuffMeshes) c.visible = false;
    } else {
      jacketTorsoGroup.visible = true;
      if (jacketDef) {
        coatMat.color.set(jacketDef.primaryHex);
        coatAccentMat.color.set(jacketDef.accentHex);
      }
      const isVest = jVar === 'rompi';
      for (const m of armCoatMeshes) m.visible = !isVest;
      for (const c of armCuffMeshes) c.visible = !isVest;
      jubahSkirt.visible = jVar === 'jubah';
      jacketHood.visible = jVar === 'hoodie';
      beskapButtons.visible = jVar === 'beskap';
      lapelTrim.visible = jVar === 'jas' || jVar === 'rompi' || jVar === 'pilot_jacket';
      exoArmorGroup.visible = jVar === 'cyber_suit' || jVar === 'exosuit' || jVar === 'pilot_jacket';
    }

    // 5. Pants / Sarung / Shorts / Pleated Skirt / Sport
    if (pantsDef) {
      pantsMat.color.set(pantsDef.primaryHex);
      pantsAccentMat.color.set(pantsDef.accentHex);
      const pVar = pantsDef.styleVariant ?? 'trousers';
      sarungGroup.visible = pVar === 'skirt';
      pleatedSkirtGroup.visible = pVar === 'skirt_pleated';
      const showBareCalves = pVar === 'shorts' || pVar === 'skirt_pleated';
      for (const shin of legShins) {
        shin.material = showBareCalves ? sculptedHead.skinMat : pantsMat;
      }
      for (const thigh of legThighs) {
        thigh.scale.y = pVar === 'shorts' ? 0.72 : 1.0;
      }
      for (const stripe of legSportStripes) {
        stripe.visible = pVar === 'sport';
      }
    }

    // 6. Shoes
    if (shoeDef) {
      shoeMat.color.set(shoeDef.primaryHex);
      shoeAccentMat.color.set(shoeDef.accentHex);
      for (const cap of legToeCaps) {
        cap.visible = shoeDef.styleVariant === 'sneakers' || shoeDef.styleVariant === 'selop';
      }
    }

    // 7. Hats
    const hVar = hatDef?.styleVariant ?? 'none';
    peciGroup.visible = hVar === 'peci';
    blangkonGroup.visible = hVar === 'blangkon';
    nakhodaGroup.visible = hVar === 'nakhoda';
    capingGroup.visible = hVar === 'caping';
    tanjakGroup.visible = hVar === 'tanjak';
    safetyHelmetGroup.visible = hVar === 'safety_helmet';
    cyberHelmGroup.visible = hVar === 'cyber_visor_helm';
    pilotHelmGroup.visible = hVar === 'pilot_helm';
    futureCrownGroup.visible = hVar === 'future_crown';
    if (hatDef && hVar !== 'none') {
      hatPrimaryMat.color.set(hatDef.primaryHex);
      hatAccentMat.color.set(hatDef.accentHex);
    }

    // 8. Glasses
    const gVar = glassDef?.styleVariant ?? 'none';
    glassesGroup.visible = gVar !== 'none';
    if (glassDef && gVar !== 'none') {
      glassFrameMat.color.set(glassDef.primaryHex);
      glassLensMat.color.set(glassDef.accentHex);
      glassLensMat.opacity =
        gVar === 'sunglasses' ? 0.88 : gVar === 'goggles' || gVar === 'holo_visor' ? 0.72 : 0.38;
      if (gVar === 'holo_visor') {
        frameL.scale.set(1.55, 1.05, 1.2);
        frameR.scale.copy(frameL.scale);
        lensL.scale.set(1.55, 1.05, 1.2);
        lensR.scale.copy(lensL.scale);
      } else if (gVar === 'goggles') {
        frameL.scale.set(1.22, 1.32, 1.35);
        frameR.scale.copy(frameL.scale);
        lensL.scale.set(1.22, 1.32, 1.35);
        lensR.scale.copy(lensL.scale);
      } else {
        frameL.scale.set(gVar === 'round' ? 0.88 : 1.04, gVar === 'round' ? 1.15 : 0.96, 1);
        frameR.scale.copy(frameL.scale);
        lensL.scale.copy(frameL.scale);
        lensR.scale.copy(frameL.scale);
      }
    }

    // 9. Bags
    const bVar = bagDef?.styleVariant ?? 'none';
    backpackGroup.visible = bVar === 'backpack';
    satchelGroup.visible = bVar === 'satchel';
    toteGroup.visible = bVar === 'tote';
    jetpackGroup.visible = bVar === 'jetpack';
    if (bagDef && bVar !== 'none') {
      bagPrimaryMat.color.set(bagDef.primaryHex);
      bagAccentMat.color.set(bagDef.accentHex);
    }

    // 10. Accessories
    const aVar = accDef?.styleVariant ?? 'none';
    scarfGroup.visible = aVar === 'scarf';
    badgeGroup.visible = aVar === 'badge';
    sashGroup.visible = aVar === 'sash';
    watchGroup.visible = aVar === 'watch';
    holoArmbandGroup.visible = aVar === 'holo_armband';
    hairbandGroup.visible = aVar === 'hairband';
    maskGroup.visible = aVar === 'mask';
    if (accDef && aVar !== 'none') {
      accPrimaryMat.color.set(accDef.primaryHex);
      accAccentMat.color.set(accDef.accentHex);
    }
  };

  applyAppearance(initialAppearance);

  const applyCosmetics = (outfitId: string, hatId: string) => {
    applyAppearance({
      ...currentAppearance,
      jacketId: outfitId,
      hatId,
    });
  };

  const setExpression = (expr: FacialExpression, elapsed = 0) => {
    sculptedHead.setExpression(expr, elapsed, 0);
  };

  const setAnimationState: CustomizableCharacterRigHandle['setAnimationState'] = ({
    walkCycle,
    speed,
    grounded,
    ridingKind,
    elapsed,
    expression,
  }) => {
    // Periodic natural blinking unless actively overridden by surprised/blinking
    const blinkCycle = elapsed % 3.8;
    const blinkPulse = blinkCycle > 3.62 ? Math.sin(((blinkCycle - 3.62) / 0.18) * Math.PI) : 0;

    let resolvedExpr: FacialExpression = expression ?? 'neutral';
    if (!expression && !grounded) {
      resolvedExpr = 'surprised';
    } else if (!expression && speed < 0.25) {
      resolvedExpr = 'looking_around';
    }

    sculptedHead.setExpression(resolvedExpr, elapsed, blinkPulse);

    if (resolvedExpr === 'looking_around') {
      headGroup.rotation.y = Math.sin(elapsed * 0.9) * 0.14;
    } else if (resolvedExpr === 'talking') {
      headGroup.rotation.y = Math.sin(elapsed * 2.2) * 0.08;
      headGroup.rotation.x = Math.sin(elapsed * 4.5) * 0.04;
    } else {
      headGroup.rotation.y = 0;
      headGroup.rotation.x = 0;
    }

    if (ridingKind) {
      bodyGroup.position.y = ridingKind === 'bicycle' ? 0.18 : 0.25;
      bodyGroup.rotation.x = ridingKind === 'bicycle' ? 0.2 : 0.05;
      leftLeg.rotation.x = -1.15;
      rightLeg.rotation.x = -1.15;
      leftArm.rotation.x = -0.85;
      rightArm.rotation.x = -0.85;
      return;
    }

    const strideAmp = Math.min(1, speed / 7.8) * 0.72;
    const isMoving = speed > 0.35;
    if (!grounded) {
      leftLeg.rotation.x = 0.45;
      rightLeg.rotation.x = -0.45;
      leftArm.rotation.x = -0.65;
      rightArm.rotation.x = -0.65;
      bodyGroup.position.y = 0.06;
      bodyGroup.rotation.x = 0.06;
      return;
    }

    if (isMoving) {
      const swing = Math.sin(walkCycle) * strideAmp;
      leftLeg.rotation.x = swing;
      rightLeg.rotation.x = -swing;
      leftArm.rotation.x = -swing * 0.85;
      rightArm.rotation.x = swing * 0.85;
      bodyGroup.position.y = Math.abs(Math.cos(walkCycle)) * strideAmp * 0.08;
      bodyGroup.rotation.x = speed > 10.5 ? 0.12 : 0.04;
    } else {
      const breath = Math.sin(elapsed * 2.4) * 0.025;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftArm.rotation.x = breath;
      rightArm.rotation.x = -breath;
      bodyGroup.position.y = breath * 0.4;
      bodyGroup.rotation.x = 0;
    }
  };

  return {
    root,
    bodyGroup,
    headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    applyAppearance,
    applyCosmetics,
    setExpression,
    setAnimationState,
    dispose: () => {
      sculptedHead.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shirtMat.dispose();
      shirtAccentMat.dispose();
      coatMat.dispose();
      coatAccentMat.dispose();
      pantsMat.dispose();
      pantsAccentMat.dispose();
      shoeMat.dispose();
      shoeAccentMat.dispose();
      hatPrimaryMat.dispose();
      hatAccentMat.dispose();
      glassFrameMat.dispose();
      glassLensMat.dispose();
      bagPrimaryMat.dispose();
      bagAccentMat.dispose();
      accPrimaryMat.dispose();
      accAccentMat.dispose();
    },
  };
}
