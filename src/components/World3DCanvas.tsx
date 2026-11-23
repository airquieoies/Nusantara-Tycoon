import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BUILDING_CATALOG } from '../game/data/bermainData';
import { RemotePlayerSnapshot } from '../game/multiplayerClient';
import {
  CharacterAppearance,
  DEFAULT_CHARACTER_APPEARANCE,
  findDistrictAt,
  PLAYER_TITLES,
} from '../game/stage1Data';
import {
  buildStage1WorldColliders,
  createInitialVehicles,
  findNearestStage1Interactable,
  getStage1BoardedShipId,
  getStage1EnterableBuildingAt,
  getStage1Npcs,
  LIGHTHOUSE_ISLAND,
  Stage1Interactable,
  stage1GroundHeightAt,
  stepStage1PlayerPhysics,
  stepVehiclePhysics,
  updateStage1Camera,
  validateFreeBuildingPlacement,
  VehicleRuntimeState,
} from '../game/stage1Physics';
import { PlacedBuildingInstance } from '../game/stage1WorldLogic';
import { findStage2DistrictAt } from '../game/stage2Data';
import {
  buildStage2WorldColliders,
  createInitialStage2Vehicles,
  findNearestStage2Interactable,
  getStage2BoardedShipId,
  getStage2EnterableBuildingAt,
  getStage2Npcs,
  Stage2Interactable,
  stage2GroundHeightAt,
  stepStage2PlayerPhysics,
  stepStage2VehiclePhysics,
  updateStage2Camera,
  validateStage2BuildingPlacement,
} from '../game/stage2Physics';
import { FacialExpression } from '../game/threeCharacterRig';
import {
  buildStage1OverhaulWorld,
  Stage1OverhaulWorldHandle,
} from '../game/threeStage1OverhaulWorld';
import { createStage2IndustrialWorld } from '../game/threeStage2World';
import {
  createConstructionSiteMesh,
  createFloatingLabelSprite,
  createGhostPreviewMesh,
  createNpcRig,
  createPlayerRig,
  createRideableVehicleMesh,
  createUpgradedCityBuildingMesh,
  createWorldTextures,
  PlayerRig,
  WorldTextures,
} from '../game/threeWorldBuilder';
import { VehicleKind } from '../game/types';
import {
  AabbCollider,
  createInitialCameraState,
  createInitialPlayerState,
  Player3DState,
  ThirdPersonCamState,
} from '../game/world3dPhysics';

export type WorldInteractable = Stage1Interactable | Stage2Interactable;

export interface World3DCanvasProps {
  activeStage: 1 | 2;
  paused: boolean;
  pointerLockRequestId: number;
  appearance: CharacterAppearance;
  playerMood?: FacialExpression;
  activeTalkingNpcId?: string | null;
  localEmote?: string | null;
  remotePlayers?: RemotePlayerSnapshot[];
  localClientId?: string | null;
  collectedPickups: string[];
  collectedArtifacts: string[];
  completedDeliveries: string[];
  placedBuildings: PlacedBuildingInstance[];
  placementBuildingId: string | null;
  placementRotationY: number;
  trackedWaypoint: { x: number; z: number; label: string } | null;
  timeOfDay: number;
  cameraSensitivity: number;
  initialPlayerPos?: { x: number; y: number; z: number; facingYaw: number };
  resetPositionSignal: number;
  touchActionQueue?: { action: 'jump' | 'interact' | 'vehicle'; id: number } | null;
  touchKeysRef?: React.MutableRefObject<Record<string, boolean>>;
  onNearInteractableChange: (target: WorldInteractable | null) => void;
  onInteract: (target: WorldInteractable) => void;
  onDistrictChange: (districtId: string) => void;
  onBoardShip: (shipId: 'ship-pinisi' | 'ship-penumpang' | 'ship-stage1-return') => void;
  onEnterInterior: (interiorId: string) => void;
  onRideVehicle: (vehicleId: string | null) => void;
  onPlacementPreviewUpdate: (preview: { x: number; z: number; valid: boolean; reason: string }) => void;
  onConfirmPlacement: (x: number, z: number, rotationY: number) => void;
  onRotatePlacement: () => void;
  onCancelPlacement: () => void;
  onPlayerPositionSync: (pos: { x: number; y: number; z: number; facingYaw: number }) => void;
  onRealtimePoseSync?: (pose: {
    x: number;
    y: number;
    z: number;
    facingYaw: number;
    speed: number;
    grounded: boolean;
    ridingKind: string | null;
  }) => void;
  onToggleHud?: () => void;
  onToggleMenuTab?: (tab: 'inventaris' | 'misi' | 'sosial') => void;
  onToggleCustomizer?: () => void;
  onToggleWorldMap?: () => void;
  onToggleBuildMode?: () => void;
  onPointerLockChange?: (locked: boolean) => void;
}

function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(renderer);
  } catch {
    return false;
  }
}

function afterDraw(gl: WebGLRenderingContext | WebGL2RenderingContext, cb: () => void) {
  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (sync) {
      gl.flush();
      const start = performance.now();
      const poll = () => {
        const res = gl.clientWaitSync(sync, 0, 0);
        if (res !== gl.TIMEOUT_EXPIRED || performance.now() - start > 80) {
          gl.deleteSync(sync);
          window.setTimeout(() => requestAnimationFrame(cb), 16);
          return;
        }
        window.setTimeout(poll, 8);
      };
      window.setTimeout(poll, 8);
      return;
    }
  }
  requestAnimationFrame(cb);
}

function getInteractableKey(target: WorldInteractable | null): string {
  if (!target) return '';
  if (target.kind === 'npc') return `npc:${target.npc.id}`;
  if (target.kind === 'pickup') return `pk:${target.pickup.id}`;
  if (target.kind === 'collectible') return `col:${target.collectible.id}`;
  if (target.kind === 'delivery') return `del:${target.delivery.id}`;
  if (target.kind === 'factory_station') return `fac:${target.station.id}`;
  if (target.kind === 'stage_transition') return `stg:${target.targetStage}`;
  if (target.kind === 'locked_stage3') return `s3:${target.landmark.id}`;
  if (target.kind === 'wardrobe_mirror') return `mirror:${target.spot.id}`;
  if (target.kind === 'placed_building') {
    return `pb:${target.instance.id}:${target.instance.level}:${target.instance.isConstructing}`;
  }
  if (target.kind === 'vehicle') return `veh:${target.vehicle.def.id}`;
  return `lm:${target.landmark.id}`;
}

const _skyColor = new THREE.Color();
const _fogColor = new THREE.Color();
const _daySky = new THREE.Color(0xd9a86c);
const _noonSky = new THREE.Color(0x7dd3fc);
const _duskSky = new THREE.Color(0xc26546);
const _nightSky = new THREE.Color(0x0f172a);
const _s2DaySky = new THREE.Color(0xb6c5d6);
const _s2NoonSky = new THREE.Color(0x93c5fd);
const _s2DuskSky = new THREE.Color(0x9a5846);
const _sunColor = new THREE.Color();
const _daySun = new THREE.Color(0xffe1b0);
const _duskSun = new THREE.Color(0xfb923c);
const _nightSun = new THREE.Color(0x93c5fd);

function updateLightingForTime(
  timeOfDay: number,
  stage: 1 | 2,
  scene: THREE.Scene,
  dirLight: THREE.DirectionalLight,
  hemiLight: THREE.HemisphereLight
) {
  const dayBase = stage === 2 ? _s2DaySky : _daySky;
  const noonBase = stage === 2 ? _s2NoonSky : _noonSky;
  const duskBase = stage === 2 ? _s2DuskSky : _duskSky;

  if (timeOfDay < 0.25) {
    const t = timeOfDay / 0.25;
    _skyColor.lerpColors(_nightSky, dayBase, t);
    _sunColor.lerpColors(_nightSun, _daySun, t);
    dirLight.intensity = 0.7 + t * 1.5;
    hemiLight.intensity = 0.35 + t * 0.4;
  } else if (timeOfDay < 0.58) {
    const t = (timeOfDay - 0.25) / 0.33;
    _skyColor.lerpColors(dayBase, noonBase, Math.sin(t * Math.PI) * 0.65);
    _sunColor.copy(_daySun);
    dirLight.intensity = 2.25;
    hemiLight.intensity = 0.78;
  } else if (timeOfDay < 0.78) {
    const t = (timeOfDay - 0.58) / 0.2;
    _skyColor.lerpColors(dayBase, duskBase, t);
    _sunColor.lerpColors(_daySun, _duskSun, t);
    dirLight.intensity = 2.2 - t * 0.8;
    hemiLight.intensity = 0.74 - t * 0.22;
  } else {
    const t = Math.min(1, (timeOfDay - 0.78) / 0.14);
    _skyColor.lerpColors(duskBase, _nightSky, t);
    _sunColor.lerpColors(_duskSun, _nightSun, t);
    dirLight.intensity = 1.4 - t * 0.75;
    hemiLight.intensity = 0.52 - t * 0.18;
  }

  _fogColor.copy(_skyColor);
  if (scene.background instanceof THREE.Color) {
    scene.background.copy(_skyColor);
  }
  if (scene.fog instanceof THREE.Fog) {
    scene.fog.color.copy(_fogColor);
  }
  dirLight.color.copy(_sunColor);
  const sunAng = timeOfDay * Math.PI * 2;
  dirLight.position.set(Math.cos(sunAng) * 55, 22 + Math.abs(Math.sin(sunAng)) * 42, -28);
}

function getGroundHeight(stage: 1 | 2, x: number, z: number): number {
  return stage === 2 ? stage2GroundHeightAt(x, z) : stage1GroundHeightAt(x, z);
}

function buildCollidersForStage(stage: 1 | 2, placed: PlacedBuildingInstance[]): AabbCollider[] {
  return stage === 2 ? buildStage2WorldColliders(placed) : buildStage1WorldColliders(placed);
}

interface RemoteRigEntry {
  rig: PlayerRig;
  label: { sprite: THREE.Sprite; dispose: () => void };
  appearanceKey: string;
  currX: number;
  currY: number;
  currZ: number;
  currYaw: number;
  walkCycle: number;
}

export const World3DCanvas: React.FC<World3DCanvasProps> = ({
  activeStage,
  paused,
  pointerLockRequestId,
  appearance,
  playerMood = 'neutral',
  activeTalkingNpcId = null,
  localEmote = null,
  remotePlayers = [],
  localClientId = null,
  collectedPickups,
  collectedArtifacts,
  completedDeliveries,
  placedBuildings,
  placementBuildingId,
  placementRotationY,
  trackedWaypoint,
  timeOfDay,
  cameraSensitivity,
  initialPlayerPos,
  resetPositionSignal,
  touchActionQueue,
  touchKeysRef,
  onNearInteractableChange,
  onInteract,
  onDistrictChange,
  onBoardShip,
  onEnterInterior,
  onRideVehicle,
  onPlacementPreviewUpdate,
  onConfirmPlacement,
  onRotatePlacement,
  onCancelPlacement,
  onPlayerPositionSync,
  onRealtimePoseSync,
  onToggleHud,
  onToggleMenuTab,
  onToggleCustomizer,
  onToggleWorldMap,
  onToggleBuildMode,
  onPointerLockChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const activeStageRef = useRef<1 | 2>(activeStage);
  activeStageRef.current = activeStage;

  const remotePlayersRef = useRef<RemotePlayerSnapshot[]>(remotePlayers);
  remotePlayersRef.current = remotePlayers;

  const localClientIdRef = useRef<string | null>(localClientId);
  localClientIdRef.current = localClientId;

  const propsRef = useRef({
    appearance,
    playerMood,
    activeTalkingNpcId,
    localEmote,
    collectedPickups,
    collectedArtifacts,
    completedDeliveries,
    placedBuildings,
    placementBuildingId,
    placementRotationY,
    trackedWaypoint,
    timeOfDay,
    cameraSensitivity,
    initialPlayerPos,
  });
  propsRef.current = {
    appearance,
    playerMood,
    activeTalkingNpcId,
    localEmote,
    collectedPickups,
    collectedArtifacts,
    completedDeliveries,
    placedBuildings,
    placementBuildingId,
    placementRotationY,
    trackedWaypoint,
    timeOfDay,
    cameraSensitivity,
    initialPlayerPos,
  };

  const callbacksRef = useRef({
    onNearInteractableChange,
    onInteract,
    onDistrictChange,
    onBoardShip,
    onEnterInterior,
    onRideVehicle,
    onPlacementPreviewUpdate,
    onConfirmPlacement,
    onRotatePlacement,
    onCancelPlacement,
    onPlayerPositionSync,
    onRealtimePoseSync,
    onToggleHud,
    onToggleMenuTab,
    onToggleCustomizer,
    onToggleWorldMap,
    onToggleBuildMode,
    onPointerLockChange,
  });
  callbacksRef.current = {
    onNearInteractableChange,
    onInteract,
    onDistrictChange,
    onBoardShip,
    onEnterInterior,
    onRideVehicle,
    onPlacementPreviewUpdate,
    onConfirmPlacement,
    onRotatePlacement,
    onCancelPlacement,
    onPlayerPositionSync,
    onRealtimePoseSync,
    onToggleHud,
    onToggleMenuTab,
    onToggleCustomizer,
    onToggleWorldMap,
    onToggleBuildMode,
    onPointerLockChange,
  };

  const startPos =
    initialPlayerPos ??
    (activeStage === 2
      ? { x: 56.0, y: 0.72, z: 0.0, facingYaw: -Math.PI / 2 }
      : { x: -7.5, y: 0, z: 0.4, facingYaw: Math.PI / 2 });

  const playerRef = useRef<Player3DState>({
    ...createInitialPlayerState(),
    x: startPos.x,
    y: startPos.y,
    z: startPos.z,
    facingYaw: startPos.facingYaw,
  });
  const camRef = useRef<ThirdPersonCamState>(createInitialCameraState(playerRef.current));
  const collidersRef = useRef<AabbCollider[]>(buildCollidersForStage(activeStage, placedBuildings));
  const vehiclesRef = useRef<VehicleRuntimeState[]>(
    activeStage === 2 ? createInitialStage2Vehicles() : createInitialVehicles()
  );
  const activeVehicleIdRef = useRef<string | null>(null);
  const nearTargetRef = useRef<WorldInteractable | null>(null);
  const lastDistrictRef = useRef<string>(activeStage === 2 ? 's2-transportasi' : 'pusat-kota');
  const lastInteriorRef = useRef<string | null>(null);
  const lastShipRef = useRef<string | null>(null);
  const ghostPreviewRef = useRef<{ x: number; z: number; valid: boolean; reason: string }>({
    x: 0,
    z: 0,
    valid: false,
    reason: '',
  });
  const jumpQueueRef = useRef(false);
  const vehicleToggleQueueRef = useRef(false);

  const sceneHandlesRef = useRef<{
    scene: THREE.Scene;
    dirLight: THREE.DirectionalLight;
    hemiLight: THREE.HemisphereLight;
    textures: WorldTextures;
    world: Stage1OverhaulWorldHandle;
    loadedStage: 1 | 2;
    playerRig: PlayerRig;
    npcRigs: {
      id: string;
      root: THREE.Group;
      x: number;
      update?: (elapsed: number, isTalking?: boolean) => void;
      dispose: () => void;
    }[];
    vehicleMeshes: Map<string, THREE.Group>;
    dynamicRoot: THREE.Group;
    remoteRoot: THREE.Group;
    remoteRigs: Map<string, RemoteRigEntry>;
    placedMeshes: Map<
      string,
      {
        group: THREE.Group;
        isConstructing: boolean;
        level: number;
        updateProgress?: (p: number, elapsed: number) => void;
      }
    >;
    ghostHandle: { group: THREE.Group; setValid: (v: boolean) => void };
    renderer: THREE.WebGLRenderer;
    rebuildStageWorld: (targetStage: 1 | 2) => void;
  } | null>(null);

  const syncWorldStateVisibility = (
    stage: 1 | 2,
    world: Stage1OverhaulWorldHandle,
    collectedPk: string[],
    collectedArt: string[],
    completedDel: string[],
    waypoint: { x: number; z: number; label: string } | null
  ) => {
    for (const [id, mesh] of world.pickupMeshes.entries()) {
      mesh.visible = !collectedPk.includes(id);
    }
    for (const [id, mesh] of world.collectibleMeshes.entries()) {
      mesh.visible = !collectedArt.includes(id);
    }
    for (const [id, mesh] of world.deliveryMeshes.entries()) {
      const isRepeatableS2 = stage === 2 && (id === 's2-del-gudang' || id === 's2-del-grosir');
      mesh.visible = isRepeatableS2 ? true : !completedDel.includes(id);
    }
    if (waypoint) {
      world.questBeacon.visible = true;
      world.questBeacon.position.set(
        waypoint.x,
        getGroundHeight(stage, waypoint.x, waypoint.z),
        waypoint.z
      );
    } else {
      world.questBeacon.visible = false;
    }
  };

  // Switch active stage world seamlessly without tearing down WebGLRenderer
  useEffect(() => {
    const h = sceneHandlesRef.current;
    if (!h || h.loadedStage === activeStage) return;
    h.rebuildStageWorld(activeStage);
    if (containerRef.current) {
      containerRef.current.dataset.stage = String(activeStage);
    }
  }, [activeStage]);

  // Sync colliders & placed building meshes whenever placedBuildings or activeStage changes
  useEffect(() => {
    collidersRef.current = buildCollidersForStage(activeStage, placedBuildings);
    const h = sceneHandlesRef.current;
    if (!h) return;

    const activeIds = new Set(placedBuildings.map((b) => b.id));
    for (const [id, entry] of h.placedMeshes.entries()) {
      if (!activeIds.has(id)) {
        h.dynamicRoot.remove(entry.group);
        h.placedMeshes.delete(id);
      }
    }

    for (const pb of placedBuildings) {
      const existing = h.placedMeshes.get(pb.id);
      const needsRebuild =
        !existing || existing.isConstructing !== pb.isConstructing || existing.level !== pb.level;

      if (needsRebuild) {
        if (existing) {
          h.dynamicRoot.remove(existing.group);
          h.placedMeshes.delete(pb.id);
        }
        const def = BUILDING_CATALOG.find((c) => c.id === pb.buildingId);
        if (!def) continue;

        if (pb.isConstructing) {
          const site = createConstructionSiteMesh();
          site.group.position.set(pb.x, getGroundHeight(activeStage, pb.x, pb.z), pb.z);
          site.group.rotation.y = pb.rotationY;
          h.dynamicRoot.add(site.group);
          h.placedMeshes.set(pb.id, {
            group: site.group,
            isConstructing: true,
            level: pb.level,
            updateProgress: site.updateProgress,
          });
        } else {
          const mesh = createUpgradedCityBuildingMesh(def, pb.level);
          mesh.position.set(pb.x, getGroundHeight(activeStage, pb.x, pb.z), pb.z);
          mesh.rotation.y = pb.rotationY;
          h.dynamicRoot.add(mesh);
          h.placedMeshes.set(pb.id, {
            group: mesh,
            isConstructing: false,
            level: pb.level,
          });
        }
      }
    }
  }, [placedBuildings, activeStage]);

  // Sync full 3D appearance on player rig + DOM test attributes
  useEffect(() => {
    sceneHandlesRef.current?.playerRig.applyAppearance(appearance);
    if (containerRef.current) {
      containerRef.current.dataset.hairstyle = appearance.hairstyle;
      containerRef.current.dataset.shirt = appearance.shirtId;
      containerRef.current.dataset.jacket = appearance.jacketId;
      containerRef.current.dataset.hat = appearance.hatId;
    }
  }, [appearance]);

  // Sync pickup, collectible, delivery visibility & quest beacon
  useEffect(() => {
    const h = sceneHandlesRef.current;
    if (!h) return;
    syncWorldStateVisibility(
      activeStage,
      h.world,
      collectedPickups,
      collectedArtifacts,
      completedDeliveries,
      trackedWaypoint
    );
  }, [collectedPickups, collectedArtifacts, completedDeliveries, trackedWaypoint, activeStage]);

  // Reset player position when storage reset triggered
  useEffect(() => {
    if (resetPositionSignal === 0) return;
    const stage = activeStageRef.current;
    const resetPos =
      stage === 2
        ? { x: 56.0, y: 0.72, z: 0.0, facingYaw: -Math.PI / 2 }
        : { x: -7.5, y: 0, z: 0.4, facingYaw: Math.PI / 2 };
    const resetState: Player3DState = {
      ...createInitialPlayerState(),
      x: resetPos.x,
      y: resetPos.y,
      z: resetPos.z,
      facingYaw: resetPos.facingYaw,
    };
    playerRef.current = resetState;
    camRef.current = createInitialCameraState(resetState);
    vehiclesRef.current = stage === 2 ? createInitialStage2Vehicles() : createInitialVehicles();
    activeVehicleIdRef.current = null;
  }, [resetPositionSignal]);

  // Handle touch button actions
  useEffect(() => {
    if (!touchActionQueue) return;
    if (touchActionQueue.action === 'jump') {
      jumpQueueRef.current = true;
    } else if (touchActionQueue.action === 'interact' && nearTargetRef.current) {
      callbacksRef.current.onInteract(nearTargetRef.current);
    } else if (touchActionQueue.action === 'vehicle') {
      vehicleToggleQueueRef.current = true;
    }
  }, [touchActionQueue]);

  useEffect(() => {
    if (paused && document.pointerLockElement) {
      document.exitPointerLock?.();
    }
  }, [paused]);

  useEffect(() => {
    if (pointerLockRequestId === 0) return;
    const canvas = sceneHandlesRef.current?.renderer.domElement;
    if (canvas && document.pointerLockElement !== canvas) {
      canvas.requestPointerLock?.();
    }
  }, [pointerLockRequestId]);

  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) return;

    const isSoftwareGl = detectSoftwareGl();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mountEl.clientWidth || window.innerWidth, mountEl.clientHeight || window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mountEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd9a86c);
    scene.fog = new THREE.Fog(0xd9b382, 65, 220);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();

    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x6b5b47, 0.75);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffe1b0, 2.25);
    dirLight.position.set(45, 52, -28);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.set(1024, 1024);
      dirLight.shadow.camera.near = 5;
      dirLight.shadow.camera.far = 160;
      const d = 60;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0005;
    }
    scene.add(dirLight);

    const camera = new THREE.PerspectiveCamera(
      56,
      (mountEl.clientWidth || window.innerWidth) / (mountEl.clientHeight || window.innerHeight),
      0.2,
      320
    );

    const textures = createWorldTextures(renderer.capabilities.getMaxAnisotropy());
    const playerRig = createPlayerRig(propsRef.current.appearance);
    playerRig.root.position.set(playerRef.current.x, playerRef.current.y, playerRef.current.z);
    playerRig.root.rotation.y = playerRef.current.facingYaw;
    scene.add(playerRig.root);

    const dynamicRoot = new THREE.Group();
    scene.add(dynamicRoot);
    const remoteRoot = new THREE.Group();
    scene.add(remoteRoot);
    const remoteRigs = new Map<string, RemoteRigEntry>();
    const placedMeshes = new Map<
      string,
      {
        group: THREE.Group;
        isConstructing: boolean;
        level: number;
        updateProgress?: (p: number, elapsed: number) => void;
      }
    >();

    const ghostHandle = createGhostPreviewMesh();
    ghostHandle.group.visible = false;
    scene.add(ghostHandle.group);

    const spawnStageObjects = (stage: 1 | 2) => {
      const world =
        stage === 2
          ? createStage2IndustrialWorld(textures)
          : buildStage1OverhaulWorld(textures);
      scene.add(world.root);

      const npcDefs = stage === 2 ? getStage2Npcs() : getStage1Npcs();
      const npcRigs = npcDefs.map((npc) => {
        const rig = createNpcRig(npc);
        rig.root.position.y = getGroundHeight(stage, npc.x, npc.z);
        scene.add(rig.root);
        return { id: npc.id, root: rig.root, x: npc.x, update: rig.update, dispose: rig.dispose };
      });

      const vList = stage === 2 ? createInitialStage2Vehicles() : createInitialVehicles();
      vehiclesRef.current = vList;
      const vehicleMeshes = new Map<string, THREE.Group>();
      for (const v of vList) {
        const mesh = createRideableVehicleMesh(v.def.kind);
        mesh.position.set(v.x, v.y, v.z);
        mesh.rotation.y = v.yaw;
        scene.add(mesh);
        vehicleMeshes.set(v.def.id, mesh);
      }

      syncWorldStateVisibility(
        stage,
        world,
        propsRef.current.collectedPickups,
        propsRef.current.collectedArtifacts,
        propsRef.current.completedDeliveries,
        propsRef.current.trackedWaypoint
      );

      return { world, npcRigs, vehicleMeshes };
    };

    const initialBuilt = spawnStageObjects(activeStageRef.current);

    const rebuildStageWorld = (targetStage: 1 | 2) => {
      const h = sceneHandlesRef.current;
      if (!h) return;

      // Clear previous stage world & dynamic meshes
      scene.remove(h.world.root);
      h.world.dispose();
      for (const npcItem of h.npcRigs) {
        scene.remove(npcItem.root);
        npcItem.dispose();
      }
      for (const vMesh of h.vehicleMeshes.values()) {
        scene.remove(vMesh);
      }
      for (const entry of h.placedMeshes.values()) {
        h.dynamicRoot.remove(entry.group);
      }
      h.placedMeshes.clear();

      activeVehicleIdRef.current = null;
      nearTargetRef.current = null;
      lastInteriorRef.current = null;
      lastShipRef.current = null;
      lastDistrictRef.current = targetStage === 2 ? 's2-transportasi' : 'pusat-kota';
      callbacksRef.current.onNearInteractableChange(null);
      callbacksRef.current.onRideVehicle(null);

      const fallbackPos =
        targetStage === 2
          ? { x: 56.0, y: 0.72, z: 0.0, facingYaw: -Math.PI / 2 }
          : { x: 55.5, y: 0.72, z: -3.2, facingYaw: -Math.PI / 2 };
      const spawn = propsRef.current.initialPlayerPos ?? fallbackPos;
      playerRef.current = {
        ...createInitialPlayerState(),
        x: spawn.x,
        y: spawn.y,
        z: spawn.z,
        facingYaw: spawn.facingYaw,
      };
      camRef.current = createInitialCameraState(playerRef.current);

      const built = spawnStageObjects(targetStage);
      h.world = built.world;
      h.npcRigs = built.npcRigs;
      h.vehicleMeshes = built.vehicleMeshes;
      h.loadedStage = targetStage;
      collidersRef.current = buildCollidersForStage(targetStage, propsRef.current.placedBuildings);
    };

    sceneHandlesRef.current = {
      scene,
      dirLight,
      hemiLight,
      textures,
      world: initialBuilt.world,
      loadedStage: activeStageRef.current,
      playerRig,
      npcRigs: initialBuilt.npcRigs,
      vehicleMeshes: initialBuilt.vehicleMeshes,
      dynamicRoot,
      remoteRoot,
      remoteRigs,
      placedMeshes,
      ghostHandle,
      renderer,
      rebuildStageWorld,
    };

    // Populate initial placedBuildings for active stage
    for (const pb of propsRef.current.placedBuildings) {
      const def = BUILDING_CATALOG.find((c) => c.id === pb.buildingId);
      if (!def) continue;
      if (pb.isConstructing) {
        const site = createConstructionSiteMesh();
        site.group.position.set(pb.x, getGroundHeight(activeStageRef.current, pb.x, pb.z), pb.z);
        site.group.rotation.y = pb.rotationY;
        dynamicRoot.add(site.group);
        placedMeshes.set(pb.id, {
          group: site.group,
          isConstructing: true,
          level: pb.level,
          updateProgress: site.updateProgress,
        });
      } else {
        const mesh = createUpgradedCityBuildingMesh(def, pb.level);
        mesh.position.set(pb.x, getGroundHeight(activeStageRef.current, pb.x, pb.z), pb.z);
        mesh.rotation.y = pb.rotationY;
        dynamicRoot.add(mesh);
        placedMeshes.set(pb.id, { group: mesh, isConstructing: false, level: pb.level });
      }
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const keys = new Set<string>();
    let isDragging = false;
    let dragMoved = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    const pointerNdc = new THREE.Vector2(0, 0);
    let pointerActive = false;
    const raycaster = new THREE.Raycaster();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const rayHit = new THREE.Vector3();

    const clearKeys = () => {
      keys.clear();
      isDragging = false;
    };

    const toggleVehicleMount = () => {
      const stage = activeStageRef.current;
      const activeId = activeVehicleIdRef.current;
      if (activeId) {
        const veh = vehiclesRef.current.find((v) => v.def.id === activeId);
        activeVehicleIdRef.current = null;
        callbacksRef.current.onRideVehicle(null);
        if (veh) {
          let dx = veh.x;
          let dz = veh.z;
          if (stage === 1 && veh.def.kind === 'boat') {
            const dIsl = Math.hypot(veh.x - LIGHTHOUSE_ISLAND.x, veh.z - LIGHTHOUSE_ISLAND.z);
            if (dIsl < 15.5 && dIsl > 0.01) {
              dx = LIGHTHOUSE_ISLAND.x + ((veh.x - LIGHTHOUSE_ISLAND.x) / dIsl) * 6.5;
              dz = LIGHTHOUSE_ISLAND.z + ((veh.z - LIGHTHOUSE_ISLAND.z) / dIsl) * 6.5;
            } else if (veh.x < 80 && veh.z >= 16 && veh.z <= 36) {
              dx = Math.max(54, Math.min(70, veh.x));
              dz = 28.2;
            } else {
              dx = 49.5;
              dz = Math.max(-44, Math.min(44, veh.z));
            }
          } else {
            const minX = stage === 2 ? -108 : -110;
            const maxX = stage === 2 ? 51 : 50;
            dx = Math.max(minX, Math.min(maxX, veh.x + Math.cos(veh.yaw) * 1.6));
            dz = Math.max(-88, Math.min(88, veh.z - Math.sin(veh.yaw) * 1.6));
          }
          playerRef.current = {
            ...playerRef.current,
            x: dx,
            y: getGroundHeight(stage, dx, dz),
            z: dz,
            vy: 0,
            grounded: true,
          };
        }
        return;
      }

      let nearest: VehicleRuntimeState | null = null;
      let bestDist = 4.6;
      for (const v of vehiclesRef.current) {
        const d = Math.hypot(playerRef.current.x - v.x, playerRef.current.z - v.z);
        if (d <= bestDist) {
          bestDist = d;
          nearest = v;
        }
      }
      if (nearest) {
        activeVehicleIdRef.current = nearest.def.id;
        callbacksRef.current.onRideVehicle(nearest.def.id);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      const code = e.code;
      if (code === 'Space') {
        if (!pausedRef.current) {
          e.preventDefault();
          jumpQueueRef.current = true;
        }
      } else if (code === 'KeyE' && !e.repeat) {
        if (!pausedRef.current && nearTargetRef.current) {
          callbacksRef.current.onInteract(nearTargetRef.current);
        }
      } else if (code === 'KeyF' && !e.repeat) {
        if (!pausedRef.current) {
          toggleVehicleMount();
        }
      } else if (code === 'KeyR' && !e.repeat) {
        if (!pausedRef.current && propsRef.current.placementBuildingId) {
          callbacksRef.current.onRotatePlacement();
        }
      } else if (code === 'Enter' && !e.repeat) {
        if (!pausedRef.current && propsRef.current.placementBuildingId && ghostPreviewRef.current.valid) {
          callbacksRef.current.onConfirmPlacement(
            ghostPreviewRef.current.x,
            ghostPreviewRef.current.z,
            propsRef.current.placementRotationY
          );
        }
      } else if (code === 'Escape' && !e.repeat) {
        if (propsRef.current.placementBuildingId) {
          callbacksRef.current.onCancelPlacement();
          return;
        }
      } else if (code === 'KeyH' && !e.repeat) {
        callbacksRef.current.onToggleHud?.();
      } else if (code === 'KeyM' && !e.repeat) {
        callbacksRef.current.onToggleWorldMap?.();
      } else if (code === 'KeyB' && !e.repeat) {
        callbacksRef.current.onToggleBuildMode?.();
      } else if (code === 'KeyI' && !e.repeat) {
        callbacksRef.current.onToggleMenuTab?.('inventaris');
      } else if (code === 'KeyQ' && !e.repeat) {
        callbacksRef.current.onToggleMenuTab?.('misi');
      } else if (code === 'KeyC' && !e.repeat) {
        callbacksRef.current.onToggleCustomizer?.();
      }
      keys.add(code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.code);
    };

    const canvas = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (pausedRef.current) return;
      isDragging = true;
      dragMoved = false;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        pointerActive = true;
      }

      if (pausedRef.current) return;
      const sensitivity = 0.0052 * propsRef.current.cameraSensitivity;
      if (document.pointerLockElement === canvas) {
        camRef.current.yaw -= e.movementX * sensitivity;
        camRef.current.pitch = Math.max(
          0.14,
          Math.min(1.08, camRef.current.pitch + e.movementY * sensitivity * 0.85)
        );
        return;
      }
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      if (Math.hypot(dx, dy) > 4) dragMoved = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      camRef.current.yaw -= dx * sensitivity;
      camRef.current.pitch = Math.max(
        0.14,
        Math.min(1.08, camRef.current.pitch + dy * sensitivity * 0.85)
      );
    };

    const onPointerUp = () => {
      if (
        isDragging &&
        !pausedRef.current &&
        !dragMoved &&
        propsRef.current.placementBuildingId &&
        ghostPreviewRef.current.valid
      ) {
        callbacksRef.current.onConfirmPlacement(
          ghostPreviewRef.current.x,
          ghostPreviewRef.current.z,
          propsRef.current.placementRotationY
        );
      }
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (pausedRef.current) return;
      camRef.current.distance = Math.max(5.5, Math.min(22.0, camRef.current.distance + e.deltaY * 0.01));
    };

    const onDblClick = () => {
      if (!pausedRef.current && !propsRef.current.placementBuildingId && document.pointerLockElement !== canvas) {
        canvas.requestPointerLock?.();
      }
    };

    const onLockChange = () => {
      callbacksRef.current.onPointerLockChange?.(document.pointerLockElement === canvas);
    };

    const onResize = () => {
      const w = mountEl.clientWidth || window.innerWidth;
      const h = mountEl.clientHeight || window.innerHeight;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearKeys);
    document.addEventListener('visibilitychange', clearKeys);
    document.addEventListener('pointerlockchange', onLockChange);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: true });
    canvas.addEventListener('dblclick', onDblClick);
    window.addEventListener('resize', onResize);

    const ro = new ResizeObserver(onResize);
    ro.observe(mountEl);

    let disposed = false;
    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let hudSyncAcc = 0;
    let posSyncAcc = 0;
    let rtSyncAcc = 0;
    let lastRidingKind: VehicleKind | null = null;

    const syncRemoteAvatars = (h: NonNullable<typeof sceneHandlesRef.current>, dt: number) => {
      const stage = activeStageRef.current;
      const myId = localClientIdRef.current;
      const activeRemotes = remotePlayersRef.current.filter(
        (rp) => rp.id !== myId && rp.stage === stage
      );
      const activeIds = new Set(activeRemotes.map((r) => r.id));

      for (const [id, entry] of h.remoteRigs.entries()) {
        if (!activeIds.has(id)) {
          h.remoteRoot.remove(entry.rig.root);
          entry.rig.dispose();
          entry.label.dispose();
          h.remoteRigs.delete(id);
        }
      }

      const alpha = 1 - Math.exp(-10 * dt);
      for (const rp of activeRemotes) {
        const appKey = JSON.stringify(rp.appearance ?? {});
        let entry = h.remoteRigs.get(rp.id);
        if (!entry) {
          const fullApp: CharacterAppearance = {
            ...DEFAULT_CHARACTER_APPEARANCE,
            ...(rp.appearance ?? {}),
          };
          const rig = createPlayerRig(fullApp);
          const tDef = PLAYER_TITLES.find((t) => t.id === rp.titleId);
          const label = createFloatingLabelSprite(rp.name, tDef?.name ?? 'Wali Kota', '#38bdf8');
          label.sprite.position.set(0, 2.38, 0);
          label.sprite.scale.set(2.9, 0.65, 1);
          rig.root.add(label.sprite);
          rig.root.position.set(rp.x, rp.y, rp.z);
          rig.root.rotation.y = rp.facingYaw;
          h.remoteRoot.add(rig.root);
          entry = {
            rig,
            label,
            appearanceKey: appKey,
            currX: rp.x,
            currY: rp.y,
            currZ: rp.z,
            currYaw: rp.facingYaw,
            walkCycle: 0,
          };
          h.remoteRigs.set(rp.id, entry);
        } else if (entry.appearanceKey !== appKey) {
          entry.appearanceKey = appKey;
          entry.rig.applyAppearance({
            ...DEFAULT_CHARACTER_APPEARANCE,
            ...(rp.appearance ?? {}),
          });
        }

        entry.currX += (rp.x - entry.currX) * alpha;
        entry.currY += (rp.y - entry.currY) * alpha;
        entry.currZ += (rp.z - entry.currZ) * alpha;

        let dYaw = rp.facingYaw - entry.currYaw;
        while (dYaw > Math.PI) dYaw -= Math.PI * 2;
        while (dYaw < -Math.PI) dYaw += Math.PI * 2;
        entry.currYaw += dYaw * alpha;

        if (rp.speed > 0.35 && rp.grounded) {
          entry.walkCycle += rp.speed * dt * 1.35;
        }

        entry.rig.root.position.set(entry.currX, entry.currY, entry.currZ);
        entry.rig.root.rotation.y = entry.currYaw;
        entry.rig.setAnimationState({
          walkCycle: entry.walkCycle,
          speed: rp.speed,
          grounded: rp.grounded,
          ridingKind: (rp.ridingKind as VehicleKind | null) ?? null,
          elapsed,
          expression: rp.emote ? 'happy' : 'neutral',
        });

        if (rp.emote === 'wave') {
          entry.rig.rightArm.rotation.x = -2.35;
          entry.rig.rightArm.rotation.z = Math.sin(elapsed * 8) * 0.35 - 0.25;
        } else if (rp.emote === 'cheer') {
          entry.rig.leftArm.rotation.x = -2.6 + Math.sin(elapsed * 9) * 0.2;
          entry.rig.rightArm.rotation.x = -2.6 - Math.sin(elapsed * 9) * 0.2;
          entry.rig.bodyGroup.position.y = Math.abs(Math.sin(elapsed * 6)) * 0.14;
        } else if (rp.emote === 'pose') {
          entry.rig.leftArm.rotation.x = -0.8;
          entry.rig.rightArm.rotation.x = -1.6;
        } else {
          entry.rig.rightArm.rotation.z = 0;
        }
      }
    };

    const tick = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += dt;

      const stage = activeStageRef.current;
      const h = sceneHandlesRef.current;
      if (h) {
        updateLightingForTime(propsRef.current.timeOfDay, stage, h.scene, h.dirLight, h.hemiLight);
        syncRemoteAvatars(h, dt);
      }

      if (!pausedRef.current && h && h.loadedStage === stage) {
        if (vehicleToggleQueueRef.current) {
          vehicleToggleQueueRef.current = false;
          toggleVehicleMount();
        }

        const tKeys = touchKeysRef?.current ?? {};
        const forward =
          (keys.has('KeyW') || keys.has('ArrowUp') || tKeys['KeyW'] ? 1 : 0) -
          (keys.has('KeyS') || keys.has('ArrowDown') || tKeys['KeyS'] ? 1 : 0);
        const right =
          (keys.has('KeyD') || keys.has('ArrowRight') || tKeys['KeyD'] ? 1 : 0) -
          (keys.has('KeyA') || keys.has('ArrowLeft') || tKeys['KeyA'] ? 1 : 0);
        const sprint = keys.has('ShiftLeft') || keys.has('ShiftRight');
        const jump = jumpQueueRef.current || keys.has('Space');
        jumpQueueRef.current = false;

        let ridingKind: VehicleKind | null = null;
        if (activeVehicleIdRef.current) {
          const idx = vehiclesRef.current.findIndex((v) => v.def.id === activeVehicleIdRef.current);
          if (idx >= 0) {
            const nextVeh =
              stage === 2
                ? stepStage2VehiclePhysics(vehiclesRef.current[idx], { forward, right }, collidersRef.current, dt)
                : stepVehiclePhysics(vehiclesRef.current[idx], { forward, right }, collidersRef.current, dt);
            vehiclesRef.current[idx] = nextVeh;
            ridingKind = nextVeh.def.kind;
            const vMesh = h.vehicleMeshes.get(nextVeh.def.id);
            if (vMesh) {
              vMesh.position.set(nextVeh.x, nextVeh.y, nextVeh.z);
              vMesh.rotation.y = nextVeh.yaw;
            }
            const seatY =
              nextVeh.def.kind === 'bicycle'
                ? 0.25
                : nextVeh.def.kind === 'cart'
                  ? 0.55
                  : nextVeh.def.kind === 'boat'
                    ? 0.22
                    : 0.95;
            playerRef.current = {
              ...playerRef.current,
              x: nextVeh.x,
              y: nextVeh.y + seatY,
              z: nextVeh.z,
              facingYaw: nextVeh.yaw,
              speed: Math.abs(nextVeh.speed),
              grounded: true,
            };
          }
        } else {
          const nextPlayer =
            stage === 2
              ? stepStage2PlayerPhysics(
                  playerRef.current,
                  { forward, right, sprint, jump },
                  camRef.current.yaw,
                  collidersRef.current,
                  dt
                )
              : stepStage1PlayerPhysics(
                  playerRef.current,
                  { forward, right, sprint, jump },
                  camRef.current.yaw,
                  collidersRef.current,
                  dt
                );
          playerRef.current = nextPlayer;
        }
        lastRidingKind = ridingKind;

        const p = playerRef.current;
        h.playerRig.root.position.set(p.x, p.y, p.z);
        h.playerRig.root.rotation.y = p.facingYaw;
        h.playerRig.setAnimationState({
          walkCycle: p.walkCycle,
          speed: p.speed,
          grounded: p.grounded,
          ridingKind,
          elapsed,
          expression: propsRef.current.localEmote ? 'happy' : propsRef.current.playerMood ?? 'neutral',
        });

        const em = propsRef.current.localEmote;
        if (em === 'wave') {
          h.playerRig.rightArm.rotation.x = -2.35;
          h.playerRig.rightArm.rotation.z = Math.sin(elapsed * 8) * 0.35 - 0.25;
        } else if (em === 'cheer') {
          h.playerRig.leftArm.rotation.x = -2.6 + Math.sin(elapsed * 9) * 0.2;
          h.playerRig.rightArm.rotation.x = -2.6 - Math.sin(elapsed * 9) * 0.2;
          h.playerRig.bodyGroup.position.y = Math.abs(Math.sin(elapsed * 6)) * 0.14;
        } else if (em === 'pose') {
          h.playerRig.leftArm.rotation.x = -0.8;
          h.playerRig.rightArm.rotation.x = -1.6;
        } else {
          h.playerRig.rightArm.rotation.z = 0;
        }

        const nextCam =
          stage === 2
            ? updateStage2Camera(camRef.current, p, collidersRef.current, dt)
            : updateStage1Camera(camRef.current, p, collidersRef.current, dt);
        camRef.current = nextCam;
        camera.position.set(nextCam.x, nextCam.y, nextCam.z);
        camera.lookAt(nextCam.targetX, nextCam.targetY, nextCam.targetZ);

        // Enterable Interiors (auto-hide roof)
        const insideBuilding =
          stage === 2
            ? getStage2EnterableBuildingAt(p.x, p.z)
            : getStage1EnterableBuildingAt(p.x, p.z);
        for (const [bId, roofObj] of h.world.interiorRoofs.entries()) {
          roofObj.visible = insideBuilding?.id !== bId;
        }
        const insideId = insideBuilding?.id ?? null;
        if (insideId && insideId !== lastInteriorRef.current) {
          callbacksRef.current.onEnterInterior(insideId);
        }
        lastInteriorRef.current = insideId;

        // Boarded Ships
        const shipId =
          stage === 2
            ? getStage2BoardedShipId(p.x, p.z, p.y)
            : getStage1BoardedShipId(p.x, p.z, p.y);
        if (shipId && shipId !== lastShipRef.current) {
          callbacksRef.current.onBoardShip(shipId);
        }
        lastShipRef.current = shipId;

        // Ghost Building Preview
        const placeId = propsRef.current.placementBuildingId;
        const validatePlacement =
          stage === 2 ? validateStage2BuildingPlacement : validateFreeBuildingPlacement;

        if (placeId) {
          h.ghostHandle.group.visible = true;
          let gx = p.x + Math.sin(p.facingYaw) * 7.5;
          let gz = p.z + Math.cos(p.facingYaw) * 7.5;
          if (pointerActive && document.pointerLockElement !== canvas) {
            raycaster.setFromCamera(pointerNdc, camera);
            if (raycaster.ray.intersectPlane(groundPlane, rayHit)) {
              const distFromPlayer = Math.hypot(rayHit.x - p.x, rayHit.z - p.z);
              if (distFromPlayer <= 34) {
                gx = rayHit.x;
                gz = rayHit.z;
              }
            }
          } else {
            const initialCheck = validatePlacement(
              placeId,
              gx,
              gz,
              propsRef.current.placedBuildings,
              p.x,
              p.z
            );
            if (!initialCheck.valid) {
              outer: for (const radius of [8.5, 11.5, 15.0]) {
                for (let step = 0; step < 12; step++) {
                  const ang = p.facingYaw + (step / 12) * Math.PI * 2;
                  const cx = p.x + Math.sin(ang) * radius;
                  const cz = p.z + Math.cos(ang) * radius;
                  if (
                    validatePlacement(
                      placeId,
                      cx,
                      cz,
                      propsRef.current.placedBuildings,
                      p.x,
                      p.z
                    ).valid
                  ) {
                    gx = cx;
                    gz = cz;
                    break outer;
                  }
                }
              }
            }
          }
          const validation = validatePlacement(
            placeId,
            gx,
            gz,
            propsRef.current.placedBuildings,
            p.x,
            p.z
          );
          h.ghostHandle.group.position.set(gx, getGroundHeight(stage, gx, gz), gz);
          h.ghostHandle.group.rotation.y = propsRef.current.placementRotationY;
          h.ghostHandle.setValid(validation.valid);
          ghostPreviewRef.current = { x: gx, z: gz, valid: validation.valid, reason: validation.reason };
        } else {
          h.ghostHandle.group.visible = false;
        }

        // Update construction sites progress visually
        for (const pb of propsRef.current.placedBuildings) {
          const entry = h.placedMeshes.get(pb.id);
          if (entry?.updateProgress && pb.isConstructing) {
            entry.updateProgress(pb.constructionProgress, elapsed);
          }
        }

        // Update animated world & NPC beacons
        h.world.update(elapsed, dt, propsRef.current.timeOfDay);
        for (const npcItem of h.npcRigs) {
          npcItem.update?.(elapsed, npcItem.id === propsRef.current.activeTalkingNpcId);
          const beacon = npcItem.root.getObjectByName('npc-beacon');
          if (beacon) {
            beacon.rotation.y += dt * 1.6;
            beacon.position.y = 2.18 + Math.sin(elapsed * 2.4 + npcItem.x) * 0.1;
          }
        }

        // Periodic HUD & District sync (~11Hz)
        hudSyncAcc += dt;
        if (hudSyncAcc >= 0.09) {
          hudSyncAcc = 0;

          if (placeId) {
            callbacksRef.current.onPlacementPreviewUpdate(ghostPreviewRef.current);
          }

          const district =
            stage === 2 ? findStage2DistrictAt(p.x, p.z).id : findDistrictAt(p.x, p.z).id;
          if (district !== lastDistrictRef.current) {
            lastDistrictRef.current = district;
            callbacksRef.current.onDistrictChange(district);
          }

          const nextNear: WorldInteractable | null =
            stage === 2
              ? findNearestStage2Interactable(p.x, p.z, {
                  collectedPickups: propsRef.current.collectedPickups,
                  collectedArtifacts: propsRef.current.collectedArtifacts,
                  completedDeliveries: propsRef.current.completedDeliveries,
                  placedBuildings: propsRef.current.placedBuildings,
                  vehicles: vehiclesRef.current,
                })
              : findNearestStage1Interactable(p.x, p.z, {
                  collectedPickups: propsRef.current.collectedPickups,
                  collectedArtifacts: propsRef.current.collectedArtifacts,
                  completedDeliveries: propsRef.current.completedDeliveries,
                  placedBuildings: propsRef.current.placedBuildings,
                  vehicles: vehiclesRef.current,
                });

          if (getInteractableKey(nearTargetRef.current) !== getInteractableKey(nextNear)) {
            nearTargetRef.current = nextNear;
            callbacksRef.current.onNearInteractableChange(nextNear);
          }

          if (containerRef.current) {
            containerRef.current.dataset.stage = String(stage);
            containerRef.current.dataset.playerX = p.x.toFixed(2);
            containerRef.current.dataset.playerY = p.y.toFixed(2);
            containerRef.current.dataset.playerZ = p.z.toFixed(2);
            containerRef.current.dataset.grounded = String(p.grounded);
            containerRef.current.dataset.camYaw = nextCam.yaw.toFixed(2);
            containerRef.current.dataset.district = district;
            containerRef.current.dataset.enteredInterior = insideId ?? '';
            containerRef.current.dataset.boardedShip = shipId ?? '';
            containerRef.current.dataset.ridingVehicle = activeVehicleIdRef.current ?? '';
            containerRef.current.dataset.nearKind = nextNear?.kind ?? '';
            containerRef.current.dataset.nearNpc = nextNear?.kind === 'npc' ? nextNear.npc.id : '';
          }
        }

        // Realtime Multiplayer pose stream (~8Hz)
        rtSyncAcc += dt;
        if (rtSyncAcc >= 0.125) {
          rtSyncAcc = 0;
          callbacksRef.current.onRealtimePoseSync?.({
            x: p.x,
            y: p.y,
            z: p.z,
            facingYaw: p.facingYaw,
            speed: p.speed,
            grounded: p.grounded,
            ridingKind: lastRidingKind,
          });
        }

        // Sync player position to React for Minimap / Save (~2.5Hz)
        posSyncAcc += dt;
        if (posSyncAcc >= 0.4) {
          posSyncAcc = 0;
          callbacksRef.current.onPlayerPositionSync({
            x: p.x,
            y: p.y,
            z: p.z,
            facingYaw: p.facingYaw,
          });
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(renderer.getContext(), () => {
          if (!disposed) tick(performance.now());
        });
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    const glCtx = renderer.getContext();
    if (isSoftwareGl) {
      afterDraw(glCtx, () => {
        if (!disposed) tick(performance.now());
      });
    } else {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearKeys);
      document.removeEventListener('visibilitychange', clearKeys);
      document.removeEventListener('pointerlockchange', onLockChange);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('dblclick', onDblClick);
      window.removeEventListener('resize', onResize);

      if (document.pointerLockElement === canvas) {
        document.exitPointerLock?.();
      }

      sceneHandlesRef.current?.world.dispose();
      sceneHandlesRef.current?.playerRig.dispose();
      for (const npcItem of sceneHandlesRef.current?.npcRigs ?? []) {
        npcItem.dispose();
      }
      for (const rr of sceneHandlesRef.current?.remoteRigs.values() ?? []) {
        rr.rig.dispose();
        rr.label.dispose();
      }
      textures.dispose();
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (canvas.parentElement === mountEl) {
        mountEl.removeChild(canvas);
      }
      sceneHandlesRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-testid="world-3d-canvas"
      data-stage={String(activeStage)}
      data-player-x={(startPos.x ?? 0).toFixed(2)}
      data-player-y={(startPos.y ?? 0).toFixed(2)}
      data-player-z={(startPos.z ?? 0).toFixed(2)}
      data-grounded="true"
      data-cam-yaw="1.57"
      data-district={activeStage === 2 ? 's2-transportasi' : 'pusat-kota'}
      data-entered-interior=""
      data-boarded-ship=""
      data-riding-vehicle=""
      data-near-kind=""
      data-near-npc=""
      data-hairstyle={appearance.hairstyle}
      data-shirt={appearance.shirtId}
      data-jacket={appearance.jacketId}
      data-hat={appearance.hatId}
      className="relative h-full w-full overflow-hidden select-none cursor-grab active:cursor-grabbing"
    >
      <div ref={mountRef} className="h-full w-full" />
    </div>
  );
};
