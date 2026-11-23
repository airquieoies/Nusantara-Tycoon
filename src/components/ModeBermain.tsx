import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowUpCircle,
  Backpack,
  Building2,
  CheckCircle2,
  Coins,
  Compass,
  Eye,
  EyeOff,
  Factory,
  Hammer,
  Heart,
  LayoutGrid,
  Lock,
  MapPin,
  MessageCircle,
  Navigation,
  PackageCheck,
  Pause,
  Play,
  RotateCcw,
  Ship,
  ShoppingCart,
  Sparkles,
  Trophy,
  UserCheck,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { audioEngine } from '../game/audio';
import { BUILDING_CATALOG, STAGE_CHALLENGES } from '../game/data/bermainData';
import { CHARACTERS } from '../game/data/characters';
import {
  extractRoomCodeFromUrl,
  MultiplayerSessionSnapshot,
  NusantaraMultiplayerClient,
  PublicRoomSummary,
  RemotePlayerSnapshot,
} from '../game/multiplayerClient';
import {
  acceptActiveStageQuest,
  applyCharacterPreset,
  buyStage2Supply,
  calculateMultiStageIncome,
  collectNusantaraArtifact,
  collectStage2Artifact,
  collectStage2Pickup,
  collectStage2Production,
  collectWorldPickup,
  deliverOrSellStage2,
  deliverToSpot,
  discoverDistrict,
  discoverStage2District,
  dismissMultiStageCelebration,
  equipMultiStageTitle,
  evaluateAchievements,
  getActiveQuestSummary,
  getIndustrialBalanceLevel,
  getItemDefById,
  loadMultiStageFromStorage,
  MultiStageWorldState,
  PlacedBuildingInstance,
  PLAYER_TITLES,
  recordInteriorEntered,
  recordShipBoarded,
  recordStage2InteriorEntered,
  recordStage2LandmarkInspected,
  recordStage2ShipBoarded,
  recordStage2VehicleDriven,
  recordVehicleDriven,
  resetMultiStageStorage,
  saveMultiStageToStorage,
  startBuildingConstruction,
  startStage2BuildingConstruction,
  startStage2Production,
  tickMultiStageWorld,
  tickStage2Production,
  trackActiveStageQuest,
  travelBetweenStages,
  triggerQuestEvent,
  triggerStage2QuestEvent,
  updateGlobalAppearance,
  upgradePlacedBuilding,
  upgradeStage2PlacedBuilding,
  useMultiStageInventoryItem,
} from '../game/multiStageLogic';
import { addXpAndCoins } from '../game/stage1WorldLogic';
import { clamp } from '../game/rules';
import {
  CharacterAppearance,
  CUSTOMIZATION_ITEMS,
  DistrictId,
  findDistrictAt,
  STAGE1_COLLECTIBLES,
  STAGE1_ENTERABLE_BUILDINGS,
  STAGE1_QUESTS,
  STAGE1_VEHICLES,
} from '../game/stage1Data';
import {
  findStage2DistrictAt,
  STAGE2_COLLECTIBLES,
  STAGE2_ENTERABLE_BUILDINGS,
  STAGE2_FACTORY_STATIONS,
  STAGE2_MARKET_SUPPLIES,
  STAGE2_PRODUCTION_RECIPES,
  STAGE2_QUESTS,
  STAGE2_VEHICLES,
  Stage2DistrictId,
} from '../game/stage2Data';
import { FacialExpression } from '../game/threeCharacterRig';
import { ChallengeOption, StageChallenge, StageNumber } from '../game/types';
import { NpcWaypoint, StageLandmarkDef } from '../game/world3dPhysics';
import { BuildCatalogBar } from './game/BuildCatalogBar';
import { GameMenuDrawer, MenuTabId } from './game/GameMenuDrawer';
import { MinimapWidget } from './game/MinimapWidget';
import { TouchControls } from './game/TouchControls';
import { WorldMapModal } from './game/WorldMapModal';
import { World3DCanvas, WorldInteractable } from './World3DCanvas';

interface ModeBermainProps {
  onBackDashboard: () => void;
  onUpdateRecord: (stageReached: StageNumber, score: number) => void;
  muted: boolean;
  onToggleMute: () => void;
}

function buildRemotePlayerPayload(
  state: MultiStageWorldState,
  emote: string | null,
  ridingKind: string | null,
  poseOverride?: {
    x: number;
    y: number;
    z: number;
    facingYaw: number;
    speed: number;
    grounded: boolean;
  }
): Omit<RemotePlayerSnapshot, 'id'> {
  const pos = state.activeStage === 2 ? state.stage2.playerPos : state.stage1.playerPos;
  return {
    name: state.displayName || 'Wali Kota Muda',
    titleId: state.stage1.equippedTitle,
    stage: state.activeStage,
    x: poseOverride ? poseOverride.x : pos.x,
    y: poseOverride ? poseOverride.y : pos.y,
    z: poseOverride ? poseOverride.z : pos.z,
    facingYaw: poseOverride ? poseOverride.facingYaw : pos.facingYaw,
    speed: poseOverride ? poseOverride.speed : 0,
    grounded: poseOverride ? poseOverride.grounded : true,
    ridingKind,
    emote,
    appearance: state.stage1.appearance,
  };
}

export const ModeBermain: React.FC<ModeBermainProps> = ({
  onBackDashboard,
  onUpdateRecord,
  muted,
  onToggleMute,
}) => {
  const [worldState, setWorldState] = useState<MultiStageWorldState>(() => loadMultiStageFromStorage());
  const [paused, setPaused] = useState<boolean>(false);
  const [hudHidden, setHudHidden] = useState<boolean>(false);
  const [pointerLockRequestId] = useState<number>(0);

  // Navigation & Drawers
  const [buildBarOpen, setBuildBarOpen] = useState<boolean>(false);
  const [worldMapOpen, setWorldMapOpen] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [menuTab, setMenuTab] = useState<MenuTabId>('misi');
  const [metricsPanelOpen, setMetricsPanelOpen] = useState<boolean>(false);

  // Ghost Placement
  const [placementBuildingId, setPlacementBuildingId] = useState<string | null>(null);
  const [placementRotationY, setPlacementRotationY] = useState<number>(0);
  const [placementPreview, setPlacementPreview] = useState<{
    x: number;
    z: number;
    valid: boolean;
    reason: string;
  }>({ x: 0, z: 0, valid: false, reason: 'Arahkan posisi bangunan...' });

  // Live 3D Proximity & World Context
  const [nearTarget, setNearTarget] = useState<WorldInteractable | null>(null);
  const [currentDistrict, setCurrentDistrict] = useState<string>(() =>
    worldState.activeStage === 2
      ? findStage2DistrictAt(worldState.stage2.playerPos.x, worldState.stage2.playerPos.z).id
      : findDistrictAt(worldState.stage1.playerPos.x, worldState.stage1.playerPos.z).id
  );
  const [insideBuildingId, setInsideBuildingId] = useState<string | null>(null);
  const [boardedShipId, setBoardedShipId] = useState<string | null>(null);
  const [ridingVehicleId, setRidingVehicleId] = useState<string | null>(null);
  const [resetPosSignal, setResetPosSignal] = useState<number>(0);

  // Modals
  const [activeNpcModal, setActiveNpcModal] = useState<NpcWaypoint | null>(null);
  const [activeLandmark, setActiveLandmark] = useState<StageLandmarkDef | null>(null);
  const [activeBuildingInspectId, setActiveBuildingInspectId] = useState<string | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<StageChallenge | null>(null);
  const [challengeResult, setChallengeResult] = useState<{ option: ChallengeOption } | null>(null);
  const [activeFactoryStationId, setActiveFactoryStationId] = useState<string | null>(null);
  const [voyageTargetStage, setVoyageTargetStage] = useState<1 | 2 | null>(null);
  const [stage3PreviewOpen, setStage3PreviewOpen] = useState<boolean>(false);
  const [bgmActive, setBgmActive] = useState<boolean>(audioEngine.isBgmEnabled());
  const [previewExpression, setPreviewExpression] = useState<FacialExpression>('neutral');

  // Multiplayer state
  const mpClientRef = useRef<NusantaraMultiplayerClient | null>(null);
  if (!mpClientRef.current) {
    mpClientRef.current = new NusantaraMultiplayerClient();
  }
  const [mpSession, setMpSession] = useState<MultiplayerSessionSnapshot>(() =>
    mpClientRef.current!.getSnapshot()
  );
  const [publicRooms, setPublicRooms] = useState<PublicRoomSummary[]>([]);
  const [localEmote, setLocalEmote] = useState<string | null>(null);
  const emoteTimerRef = useRef<number | null>(null);
  const roomAutoJoinTriedRef = useRef<boolean>(false);

  // Touch inputs
  const touchKeysRef = useRef<Record<string, boolean>>({});
  const [touchActionQueue, setTouchActionQueue] = useState<{
    action: 'jump' | 'interact' | 'vehicle';
    id: number;
  } | null>(null);

  const isStage2 = worldState.activeStage === 2;
  const s1 = worldState.stage1;
  const s2 = worldState.stage2;
  const activePos = isStage2 ? s2.playerPos : s1.playerPos;
  const activeDiscovered = isStage2 ? s2.discoveredDistricts : s1.discoveredDistricts;
  const activePickups = isStage2 ? s2.collectedPickups : s1.collectedPickups;
  const activeCollectibles = isStage2 ? s2.collectibles : s1.collectibles;
  const activeDeliveries = isStage2 ? s2.completedDeliveries : s1.completedDeliveries;
  const activeBuildings = isStage2 ? s2.placedBuildings : s1.placedBuildings;
  const activeScore = isStage2 ? s2.score : s1.score;
  const collectibleTotal = isStage2 ? STAGE2_COLLECTIBLES.length : STAGE1_COLLECTIBLES.length;

  const activeChallenges = useMemo(
    () => STAGE_CHALLENGES.filter((c) => c.stage === worldState.activeStage),
    [worldState.activeStage]
  );
  const tracked = useMemo(() => getActiveQuestSummary(worldState), [worldState]);
  const incomePerCycle = useMemo(() => calculateMultiStageIncome(worldState), [worldState]);
  const activeTitleDef = useMemo(
    () => PLAYER_TITLES.find((t) => t.id === s1.equippedTitle) ?? PLAYER_TITLES[0],
    [s1.equippedTitle]
  );
  const industrialBalance = useMemo(
    () => getIndustrialBalanceLevel(s2.industrialMetrics),
    [s2.industrialMetrics]
  );

  const activeBuildingInspect: PlacedBuildingInstance | null = useMemo(
    () => activeBuildings.find((b) => b.id === activeBuildingInspectId) ?? null,
    [activeBuildings, activeBuildingInspectId]
  );

  const activeVehicleDef = useMemo(() => {
    if (!ridingVehicleId) return null;
    return (
      STAGE1_VEHICLES.find((v) => v.id === ridingVehicleId) ??
      STAGE2_VEHICLES.find((v) => v.id === ridingVehicleId) ??
      null
    );
  }, [ridingVehicleId]);

  const activeFactoryStation = useMemo(
    () => STAGE2_FACTORY_STATIONS.find((f) => f.id === activeFactoryStationId) ?? null,
    [activeFactoryStationId]
  );

  // Persist multi-stage state to localStorage + report record to App
  useEffect(() => {
    saveMultiStageToStorage(worldState);
    onUpdateRecord(worldState.activeStage, Math.max(s1.score, s2.score));
  }, [worldState, s1.score, s2.score, onUpdateRecord]);

  // Multiplayer subscription & auto-join via ?room=CODE
  useEffect(() => {
    const client = mpClientRef.current!;
    const unsub = client.subscribe(setMpSession);
    const roomCode = extractRoomCodeFromUrl();
    if (roomCode && !roomAutoJoinTriedRef.current) {
      roomAutoJoinTriedRef.current = true;
      void client.joinRoom({
        code: roomCode,
        player: buildRemotePlayerPayload(worldState, null, null),
      });
    }
    return () => {
      unsub();
      roomAutoJoinTriedRef.current = false;
      if (emoteTimerRef.current) window.clearTimeout(emoteTimerRef.current);
      client.disconnectToOffline();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push cosmetic / stage / displayName / emote updates immediately when in a room
  useEffect(() => {
    if (!mpSession.room) return;
    mpClientRef.current?.sendPlayerUpdate(
      buildRemotePlayerPayload(worldState, localEmote, activeVehicleDef?.kind ?? null)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mpSession.room?.code,
    worldState.activeStage,
    worldState.displayName,
    s1.equippedTitle,
    s1.appearance,
    localEmote,
    activeVehicleDef?.kind,
  ]);

  const refreshPublicRooms = useCallback(async () => {
    const rooms = await mpClientRef.current!.fetchPublicRooms();
    setPublicRooms(rooms);
  }, []);

  useEffect(() => {
    if (menuOpen && menuTab === 'sosial') {
      void refreshPublicRooms();
    }
  }, [menuOpen, menuTab, refreshPublicRooms]);

  useEffect(() => {
    if (s1.lastRewardCelebration) {
      audioEngine.playLevelUp();
    }
  }, [s1.lastRewardCelebration?.id]);

  useEffect(() => {
    document.body.dataset.state = paused ? 'paused' : 'playing';
    document.body.dataset.stage = String(worldState.activeStage);
  }, [paused, worldState.activeStage]);

  // Real-time simulation loop (construction progress, production orders, passive income every 6s, optional day/night)
  const simTickRef = useRef<number>(0);
  useEffect(() => {
    const hasWorldBlockingModal =
      paused ||
      worldMapOpen ||
      menuOpen ||
      activeNpcModal !== null ||
      activeLandmark !== null ||
      activeBuildingInspectId !== null ||
      activeChallenge !== null ||
      voyageTargetStage !== null ||
      stage3PreviewOpen ||
      s1.lastRewardCelebration !== null;

    if (hasWorldBlockingModal) return;

    const timer = window.setInterval(() => {
      simTickRef.current += 1;
      const tickCount = simTickRef.current;

      setWorldState((prev) => {
        // Keep Stage 2 factory production moving smoothly even while inspecting the Factory Console!
        let next = activeFactoryStationId
          ? tickStage2Production(prev, 0.5)
          : tickMultiStageWorld(prev, 0.5);

        if (!activeFactoryStationId && next.stage1.settings.dayNightAuto) {
          next = {
            ...next,
            stage1: {
              ...next.stage1,
              settings: {
                ...next.stage1.settings,
                timeOfDay: (next.stage1.settings.timeOfDay + 0.0022) % 1,
              },
            },
          };
        }

        // Passive city tax / industrial trade income every 6 seconds (12 ticks of 0.5s)
        if (!activeFactoryStationId && tickCount % 12 === 0) {
          const gain = calculateMultiStageIncome(next);
          next = {
            ...next,
            stage1: {
              ...next.stage1,
              coins: next.stage1.coins + gain,
            },
          };
          audioEngine.playCoin();
        }
        return next;
      });
    }, 500);

    return () => window.clearInterval(timer);
  }, [
    paused,
    worldMapOpen,
    menuOpen,
    activeNpcModal,
    activeLandmark,
    activeBuildingInspectId,
    activeChallenge,
    activeFactoryStationId,
    voyageTargetStage,
    stage3PreviewOpen,
    s1.lastRewardCelebration,
  ]);

  // Escape key closes modals or toggles pause
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (placementBuildingId) {
        setPlacementBuildingId(null);
        return;
      }
      if (s1.lastRewardCelebration) {
        setWorldState((prev) => dismissMultiStageCelebration(prev));
        return;
      }
      if (activeChallenge) return;
      if (activeFactoryStationId) {
        setActiveFactoryStationId(null);
        return;
      }
      if (stage3PreviewOpen) {
        setStage3PreviewOpen(false);
        return;
      }
      if (voyageTargetStage) {
        setVoyageTargetStage(null);
        return;
      }
      if (activeNpcModal) {
        setActiveNpcModal(null);
        return;
      }
      if (activeLandmark) {
        setActiveLandmark(null);
        return;
      }
      if (activeBuildingInspectId) {
        setActiveBuildingInspectId(null);
        return;
      }
      if (worldMapOpen) {
        setWorldMapOpen(false);
        return;
      }
      if (menuOpen) {
        setMenuOpen(false);
        return;
      }
      if (buildBarOpen) {
        setBuildBarOpen(false);
        return;
      }
      if (metricsPanelOpen) {
        setMetricsPanelOpen(false);
        return;
      }
      setPaused((p) => !p);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    placementBuildingId,
    s1.lastRewardCelebration,
    activeChallenge,
    activeFactoryStationId,
    stage3PreviewOpen,
    voyageTargetStage,
    activeNpcModal,
    activeLandmark,
    activeBuildingInspectId,
    worldMapOpen,
    menuOpen,
    buildBarOpen,
    metricsPanelOpen,
  ]);

  const handleDistrictChange = useCallback((dId: string) => {
    setCurrentDistrict(dId);
    setWorldState((prev) =>
      prev.activeStage === 2
        ? discoverStage2District(prev, dId as Stage2DistrictId)
        : { ...prev, stage1: discoverDistrict(prev.stage1, dId as DistrictId) }
    );
  }, []);

  const handleEnterInterior = useCallback((interiorId: string) => {
    setInsideBuildingId(interiorId);
    if (interiorId) {
      setWorldState((prev) =>
        prev.activeStage === 2
          ? recordStage2InteriorEntered(prev, interiorId)
          : { ...prev, stage1: recordInteriorEntered(prev.stage1, interiorId) }
      );
    }
  }, []);

  const handleBoardShip = useCallback((shipId: 'ship-pinisi' | 'ship-penumpang' | 'ship-stage1-return') => {
    setBoardedShipId(shipId);
    setWorldState((prev) =>
      prev.activeStage === 2
        ? recordStage2ShipBoarded(prev, shipId)
        : { ...prev, stage1: recordShipBoarded(prev.stage1, shipId) }
    );
  }, []);

  const handleRideVehicle = useCallback((vehicleId: string | null) => {
    setRidingVehicleId(vehicleId);
    if (vehicleId) {
      audioEngine.playClick();
      setWorldState((prev) =>
        prev.activeStage === 2
          ? recordStage2VehicleDriven(prev, vehicleId)
          : { ...prev, stage1: recordVehicleDriven(prev.stage1, vehicleId) }
      );
    }
  }, []);

  // Poll interior & ship badges cleanly off player position updates
  const handlePlayerPositionSync = useCallback(
    (pos: { x: number; y: number; z: number; facingYaw: number }) => {
      setWorldState((prev) =>
        prev.activeStage === 2
          ? { ...prev, stage2: { ...prev.stage2, playerPos: pos } }
          : { ...prev, stage1: { ...prev.stage1, playerPos: pos } }
      );
      const list = worldState.activeStage === 2 ? STAGE2_ENTERABLE_BUILDINGS : STAGE1_ENTERABLE_BUILDINGS;
      const inside = list.find(
        (b) => Math.abs(pos.x - b.x) <= b.halfW - 0.25 && Math.abs(pos.z - b.z) <= b.halfD - 0.25
      );
      setInsideBuildingId(inside?.id ?? null);
      if (pos.y < 1.5) {
        setBoardedShipId(null);
      }
    },
    [worldState.activeStage]
  );

  const handleRealtimePoseSync = useCallback(
    (pose: {
      x: number;
      y: number;
      z: number;
      facingYaw: number;
      speed: number;
      grounded: boolean;
      ridingKind: string | null;
    }) => {
      if (!mpSession.room) return;
      mpClientRef.current?.sendPlayerUpdate(
        buildRemotePlayerPayload(worldState, localEmote, pose.ridingKind, pose)
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mpSession.room?.code, worldState.activeStage, worldState.displayName, s1.equippedTitle, localEmote]
  );

  const handleInteract = useCallback((target: WorldInteractable) => {
    audioEngine.unlockOnGesture();

    if (target.kind === 'stage_transition') {
      audioEngine.playClick();
      setVoyageTargetStage(target.targetStage);
      return;
    }

    if (target.kind === 'factory_station') {
      audioEngine.playClick();
      setActiveFactoryStationId(target.station.id);
      return;
    }

    if (target.kind === 'locked_stage3') {
      audioEngine.playClick();
      setWorldState((prev) => recordStage2LandmarkInspected(prev, target.landmark.id));
      setStage3PreviewOpen(true);
      return;
    }

    if (target.kind === 'pickup') {
      audioEngine.playCorrect();
      setWorldState((prev) =>
        prev.activeStage === 2
          ? collectStage2Pickup(prev, target.pickup.id)
          : { ...prev, stage1: collectWorldPickup(prev.stage1, target.pickup.id) }
      );
      return;
    }

    if (target.kind === 'collectible') {
      audioEngine.playLevelUp();
      setWorldState((prev) =>
        prev.activeStage === 2
          ? collectStage2Artifact(prev, target.collectible.id)
          : { ...prev, stage1: collectNusantaraArtifact(prev.stage1, target.collectible.id) }
      );
      return;
    }

    if (target.kind === 'delivery') {
      audioEngine.playClick();
      setWorldState((prev) =>
        prev.activeStage === 2
          ? deliverOrSellStage2(prev, target.delivery.id)
          : { ...prev, stage1: deliverToSpot(prev.stage1, target.delivery.id) }
      );
      return;
    }

    if (target.kind === 'npc') {
      audioEngine.playClick();
      setWorldState((prev) =>
        prev.activeStage === 2
          ? triggerStage2QuestEvent(prev, 'talk_npc', target.npc.id)
          : { ...prev, stage1: triggerQuestEvent(prev.stage1, 'talk_npc', target.npc.id) }
      );
      setActiveNpcModal(target.npc);
      return;
    }

    if (target.kind === 'placed_building') {
      audioEngine.playClick();
      setActiveBuildingInspectId(target.instance.id);
      return;
    }

    if (target.kind === 'landmark') {
      audioEngine.playClick();
      setWorldState((prev) =>
        prev.activeStage === 2
          ? recordStage2LandmarkInspected(prev, target.landmark.id)
          : { ...prev, stage1: triggerQuestEvent(prev.stage1, 'inspect_landmark', target.landmark.id) }
      );
      setActiveLandmark(target.landmark);
      return;
    }

    if (target.kind === 'wardrobe_mirror') {
      audioEngine.playClick();
      setBuildBarOpen(false);
      setWorldMapOpen(false);
      setMenuTab('karakter');
      setMenuOpen(true);
      return;
    }

    if (target.kind === 'vehicle') {
      setTouchActionQueue((q) => ({ action: 'vehicle', id: (q?.id ?? 0) + 1 }));
    }
  }, []);

  const confirmStageVoyage = useCallback((targetStage: 1 | 2) => {
    audioEngine.unlockOnGesture();
    audioEngine.playLevelUp();
    setVoyageTargetStage(null);
    setWorldMapOpen(false);
    setMenuOpen(false);
    setBuildBarOpen(false);
    setPlacementBuildingId(null);
    setActiveFactoryStationId(null);
    setActiveNpcModal(null);
    setActiveLandmark(null);
    setActiveBuildingInspectId(null);
    setNearTarget(null);
    setInsideBuildingId(null);
    setBoardedShipId(null);
    setRidingVehicleId(null);
    setMetricsPanelOpen(false);
    setCurrentDistrict(targetStage === 2 ? 's2-transportasi' : 'pelabuhan');
    setWorldState((prev) => travelBetweenStages(prev, targetStage));
    setResetPosSignal((s) => s + 1);
  }, []);

  const handleConfirmPlacement = useCallback(
    (x: number, z: number, rotY: number) => {
      if (!placementBuildingId) return;
      audioEngine.unlockOnGesture();
      audioEngine.playBuild();
      const targetId = placementBuildingId;
      setPlacementBuildingId(null);
      setBuildBarOpen(false);
      setWorldState((prev) =>
        prev.activeStage === 2
          ? startStage2BuildingConstruction(prev, targetId, x, z, rotY)
          : { ...prev, stage1: startBuildingConstruction(prev.stage1, targetId, x, z, rotY) }
      );
    },
    [placementBuildingId]
  );

  const handleUpgradeBuilding = useCallback((instanceId: string) => {
    audioEngine.unlockOnGesture();
    setWorldState((prev) => {
      const next =
        prev.activeStage === 2
          ? upgradeStage2PlacedBuilding(prev, instanceId)
          : { ...prev, stage1: upgradePlacedBuilding(prev.stage1, instanceId) };
      if (next.stage1.lastNotification?.type === 'success') {
        audioEngine.playLevelUp();
      } else {
        audioEngine.playError();
      }
      return next;
    });
  }, []);

  const handleAnswerChallenge = (opt: ChallengeOption) => {
    if (!activeChallenge || challengeResult) return;
    setChallengeResult({ option: opt });
    if (opt.isCorrect) {
      audioEngine.playCorrect();
    } else {
      audioEngine.playError();
    }

    setWorldState((prev) => {
      if (prev.stage1.resolvedChallengeIds.includes(activeChallenge.id)) return prev;
      let nextS1 = {
        ...prev.stage1,
        resolvedChallengeIds: [...prev.stage1.resolvedChallengeIds, activeChallenge.id],
        indicators: {
          ekonomiGlobal: clamp(prev.stage1.indicators.ekonomiGlobal + opt.delta.ekonomiGlobal, 0, 100),
          iptek: clamp(prev.stage1.indicators.iptek + opt.delta.iptek, 0, 100),
          kearifanLokal: clamp(prev.stage1.indicators.kearifanLokal + opt.delta.kearifanLokal, 0, 100),
          hpKota: clamp(prev.stage1.indicators.hpKota + opt.delta.hpKota, 0, 100),
        },
      };
      nextS1 = addXpAndCoins(nextS1, opt.isCorrect ? 85 : 25, Math.max(0, opt.delta.money));

      if (activeChallenge.stage === 2) {
        const nextS2 = {
          ...prev.stage2,
          score: clamp(prev.stage2.score + opt.delta.score, 0, 500),
          reputation: clamp(prev.stage2.reputation + (opt.isCorrect ? 7 : -3), 0, 100),
          happiness: clamp(prev.stage2.happiness + (opt.isCorrect ? 6 : -3), 0, 100),
          welfare: clamp(prev.stage2.welfare + (opt.isCorrect ? 6 : -4), 0, 100),
        };
        return {
          ...prev,
          stage1: nextS1,
          stage2: nextS2,
        };
      }

      nextS1 = {
        ...nextS1,
        score: clamp(nextS1.score + opt.delta.score, 0, 500),
        reputation: clamp(nextS1.reputation + (opt.isCorrect ? 7 : -3), 0, 100),
        happiness: clamp(nextS1.happiness + (opt.isCorrect ? 6 : -3), 0, 100),
      };
      return {
        ...prev,
        stage1: evaluateAchievements(nextS1),
      };
    });
  };

  const handleToggleBgm = () => {
    audioEngine.unlockOnGesture();
    const next = !bgmActive;
    audioEngine.setBgmEnabled(next);
    setBgmActive(next);
  };

  const handleResetProgress = () => {
    audioEngine.playClick();
    const fresh = resetMultiStageStorage();
    setWorldState(fresh);
    setPlacementBuildingId(null);
    setMenuOpen(false);
    setWorldMapOpen(false);
    setActiveFactoryStationId(null);
    setVoyageTargetStage(null);
    setStage3PreviewOpen(false);
    setPaused(false);
    setCurrentDistrict('pelabuhan');
    setResetPosSignal((s) => s + 1);
  };

  const openMenuAtTab = useCallback(
    (tab: MenuTabId) => {
      audioEngine.playClick();
      setMenuTab(tab);
      setMenuOpen((prev) => (prev && menuTab === tab ? false : true));
    },
    [menuTab]
  );

  const handleTriggerEmote = useCallback((emoteId: string) => {
    audioEngine.playClick();
    setLocalEmote(emoteId);
    if (emoteTimerRef.current) window.clearTimeout(emoteTimerRef.current);
    emoteTimerRef.current = window.setTimeout(() => {
      setLocalEmote(null);
    }, 2400);
  }, []);

  const isPausedOrModal =
    paused ||
    worldMapOpen ||
    menuOpen ||
    activeNpcModal !== null ||
    activeLandmark !== null ||
    activeBuildingInspectId !== null ||
    activeChallenge !== null ||
    activeFactoryStationId !== null ||
    voyageTargetStage !== null ||
    stage3PreviewOpen ||
    s1.lastRewardCelebration !== null;

  const playerMood: FacialExpression = activeNpcModal
    ? 'talking'
    : s1.lastRewardCelebration
      ? 'happy'
      : previewExpression;

  const currentDistrictDef = useMemo(() => {
    if (isStage2) {
      return findStage2DistrictAt(activePos.x, activePos.z);
    }
    return findDistrictAt(activePos.x, activePos.z);
  }, [isStage2, activePos.x, activePos.z, currentDistrict]);

  const insideBuildingDef = useMemo(() => {
    if (!insideBuildingId) return null;
    if (isStage2) {
      return STAGE2_ENTERABLE_BUILDINGS.find((b) => b.id === insideBuildingId) ?? null;
    }
    return STAGE1_ENTERABLE_BUILDINGS.find((b) => b.id === insideBuildingId) ?? null;
  }, [insideBuildingId, isStage2]);

  const npcGiverQuest = useMemo(() => {
    if (!activeNpcModal) return null;
    if (isStage2) {
      return (
        STAGE2_QUESTS.find(
          (q) => q.giverNpcId === activeNpcModal.id && s2.quests[q.id]?.status === 'available'
        ) ?? null
      );
    }
    return (
      STAGE1_QUESTS.find(
        (q) => q.giverNpcId === activeNpcModal.id && s1.quests[q.id]?.status === 'available'
      ) ?? null
    );
  }, [activeNpcModal, isStage2, s1.quests, s2.quests]);

  const npcChallenge = useMemo(() => {
    if (!activeNpcModal?.characterId) return null;
    return (
      activeChallenges.find(
        (c) =>
          c.speaker === activeNpcModal.characterId && !s1.resolvedChallengeIds.includes(c.id)
      ) ?? null
    );
  }, [activeNpcModal, activeChallenges, s1.resolvedChallengeIds]);

  const formatTimeLabel = (t: number) => {
    const hrs = Math.floor(t * 24) % 24;
    const period =
      hrs >= 5 && hrs < 11
        ? 'Pagi'
        : hrs >= 11 && hrs < 16
          ? 'Siang'
          : hrs >= 16 && hrs < 19
            ? 'Sore'
            : 'Malam';
    return `${String(hrs).padStart(2, '0')}:00 · ${period}`;
  };

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-slate-950 text-slate-100"
      data-stage={worldState.activeStage}
    >
      {/* Full-Viewport 3D Open World */}
      <World3DCanvas
        activeStage={worldState.activeStage}
        paused={isPausedOrModal}
        pointerLockRequestId={pointerLockRequestId}
        appearance={s1.appearance}
        playerMood={playerMood}
        activeTalkingNpcId={activeNpcModal?.id ?? null}
        localEmote={localEmote}
        remotePlayers={mpSession.members}
        localClientId={mpSession.clientId}
        collectedPickups={activePickups}
        collectedArtifacts={activeCollectibles}
        completedDeliveries={activeDeliveries}
        placedBuildings={activeBuildings}
        placementBuildingId={placementBuildingId}
        placementRotationY={placementRotationY}
        trackedWaypoint={
          tracked
            ? {
                x: tracked.step.waypointX,
                z: tracked.step.waypointZ,
                label: tracked.step.waypointLabel,
              }
            : null
        }
        timeOfDay={s1.settings.timeOfDay}
        cameraSensitivity={s1.settings.cameraSensitivity}
        initialPlayerPos={activePos}
        resetPositionSignal={resetPosSignal}
        touchActionQueue={touchActionQueue}
        touchKeysRef={touchKeysRef}
        onNearInteractableChange={setNearTarget}
        onInteract={handleInteract}
        onDistrictChange={handleDistrictChange}
        onBoardShip={handleBoardShip}
        onEnterInterior={handleEnterInterior}
        onRideVehicle={handleRideVehicle}
        onPlacementPreviewUpdate={setPlacementPreview}
        onConfirmPlacement={handleConfirmPlacement}
        onRotatePlacement={() => setPlacementRotationY((r) => (r + Math.PI / 4) % (Math.PI * 2))}
        onCancelPlacement={() => setPlacementBuildingId(null)}
        onPlayerPositionSync={handlePlayerPositionSync}
        onRealtimePoseSync={handleRealtimePoseSync}
        onToggleHud={() => setHudHidden((h) => !h)}
        onToggleWorldMap={() => {
          setMenuOpen(false);
          setWorldMapOpen((o) => !o);
        }}
        onToggleBuildMode={() => {
          setMenuOpen(false);
          setWorldMapOpen(false);
          setBuildBarOpen((o) => !o);
        }}
        onToggleCustomizer={() => {
          setWorldMapOpen(false);
          setBuildBarOpen(false);
          openMenuAtTab('karakter');
        }}
        onToggleMenuTab={(tab) => {
          setWorldMapOpen(false);
          openMenuAtTab(tab);
        }}
      />

      {hudHidden && (
        <button
          type="button"
          onClick={() => setHudHidden(false)}
          className="fixed top-4 right-4 z-30 flex h-10 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/90 px-3.5 text-xs font-bold text-slate-100 shadow-lg hover:border-amber-400"
        >
          <Eye className="h-4 w-4 text-amber-400" />
          Tampilkan HUD [H]
        </button>
      )}

      {/* Top Compact HUD Bar */}
      {!hudHidden && (
        <header className="pointer-events-none fixed top-0 left-0 right-0 z-20 p-2 lg:px-3">
          <div className="pointer-events-auto mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-1.5 rounded-2xl border border-white/15 bg-slate-950/92 px-2.5 py-1.5 shadow-xl lg:flex-nowrap">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick();
                  onBackDashboard();
                }}
                className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2 text-xs font-semibold text-slate-200 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Hub
              </button>

              <div className="min-w-0 leading-tight">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`max-w-[185px] truncate text-xs font-extrabold tracking-wide xl:max-w-[245px] ${
                      isStage2 ? 'text-sky-200' : 'text-white'
                    }`}
                    data-testid="hud-stage-district"
                    title={`STAGE ${worldState.activeStage} · ${currentDistrictDef.name}`}
                  >
                    STAGE {worldState.activeStage} · {currentDistrictDef.name}
                  </span>
                  <span className="shrink-0 rounded bg-amber-500/20 px-1.5 py-0.5 font-mono-num text-[10px] font-bold text-amber-300">
                    Lv {s1.playerLevel}
                  </span>
                  <span
                    className="hidden shrink-0 rounded border border-white/15 bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold 2xl:inline"
                    style={{ color: activeTitleDef.colorHex }}
                    data-testid="hud-active-title"
                  >
                    {activeTitleDef.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] whitespace-nowrap text-slate-400">
                  <span>{formatTimeLabel(s1.settings.timeOfDay)}</span>
                  <span>·</span>
                  <span data-testid="hud-collectible-count">
                    Koleksi {activeCollectibles.length}/{collectibleTotal}
                  </span>
                  <span>·</span>
                  <span>Bangunan {activeBuildings.length}</span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <div className="flex items-center gap-1 rounded-lg border border-amber-500/35 bg-amber-950/75 px-2 py-1">
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <div className="font-mono-num text-[11px] font-bold whitespace-nowrap text-amber-300" data-testid="hud-money">
                  {s1.coins} <span className="text-[10px] font-normal">(+{incomePerCycle})</span>
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-sky-500/35 bg-sky-950/75 px-2 py-1">
                <Trophy className="h-3.5 w-3.5 text-sky-400" />
                <div className="font-mono-num text-[11px] font-bold text-sky-300" data-testid="hud-score">
                  {activeScore}
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-rose-500/35 bg-rose-950/75 px-2 py-1">
                <Heart className="h-3.5 w-3.5 text-rose-400" />
                <div className="font-mono-num text-[11px] font-bold text-rose-300" data-testid="hud-hp">
                  {s1.indicators.hpKota}%
                </div>
              </div>

              {isStage2 && (
                <button
                  type="button"
                  data-testid="toggle-industrial-metrics-btn"
                  onClick={() => {
                    audioEngine.playClick();
                    setMetricsPanelOpen((v) => !v);
                  }}
                  className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold whitespace-nowrap ${
                    industrialBalance.tone === 'emerald'
                      ? 'border-emerald-500/50 bg-emerald-950/75 text-emerald-200'
                      : industrialBalance.tone === 'rose'
                        ? 'border-rose-500/50 bg-rose-950/75 text-rose-200'
                        : 'border-amber-500/50 bg-amber-950/75 text-amber-200'
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">Industri</span>
                  <span className="font-mono-num">{industrialBalance.average}%</span>
                </button>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                data-testid="toggle-build-btn"
                onClick={() => {
                  audioEngine.playClick();
                  setMenuOpen(false);
                  setWorldMapOpen(false);
                  setBuildBarOpen((b) => !b);
                }}
                className={`flex h-8 items-center gap-1 rounded-lg border px-2 text-[11px] font-bold whitespace-nowrap ${
                  buildBarOpen || placementBuildingId
                    ? 'border-amber-400 bg-amber-500 text-slate-950'
                    : 'border-amber-500/50 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
                }`}
              >
                <Hammer className="h-3.5 w-3.5" />
                <span>Bangun [B]</span>
              </button>

              <button
                type="button"
                data-testid="toggle-customizer-btn"
                onClick={() => openMenuAtTab('karakter')}
                className="flex h-8 items-center gap-1 rounded-lg border border-pink-500/45 bg-pink-950/60 px-2 text-[11px] font-bold whitespace-nowrap text-pink-200 hover:border-pink-400"
              >
                <UserCheck className="h-3.5 w-3.5 text-pink-300" />
                <span className="hidden sm:inline">Karakter [C]</span>
              </button>

              <button
                type="button"
                data-testid="toggle-quests-btn"
                onClick={() => openMenuAtTab('misi')}
                className="flex h-8 items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2 text-[11px] font-bold whitespace-nowrap text-slate-200 hover:border-amber-400"
              >
                <Compass className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Misi [Q]</span>
              </button>

              <button
                type="button"
                data-testid="toggle-inventory-btn"
                onClick={() => openMenuAtTab('inventaris')}
                className="flex h-8 items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2 text-[11px] font-bold whitespace-nowrap text-slate-200 hover:border-amber-400"
              >
                <Backpack className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Tas [I]</span>
              </button>

              <button
                type="button"
                data-testid="hud-mp-btn"
                onClick={() => openMenuAtTab('sosial')}
                className={`flex h-8 items-center gap-1 rounded-lg border px-2 text-[11px] font-bold whitespace-nowrap ${
                  mpSession.room
                    ? 'border-emerald-400/60 bg-emerald-950/70 text-emerald-200'
                    : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-sky-400'
                }`}
              >
                <Users className="h-3.5 w-3.5 text-sky-400" />
                <span className="hidden xl:inline">
                  {mpSession.room ? `${mpSession.room.code} (${mpSession.members.length})` : 'Multiplayer'}
                </span>
              </button>

              <button
                type="button"
                data-testid="toggle-menu-btn"
                onClick={() => openMenuAtTab('koleksi')}
                className="flex h-8 items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2 text-[11px] font-bold whitespace-nowrap text-slate-200 hover:border-amber-400"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-sky-400" />
                <span>Menu</span>
              </button>

              <button
                type="button"
                onClick={() => setHudHidden(true)}
                aria-label="Sembunyikan HUD"
                className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300"
              >
                <EyeOff className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={onToggleMute}
                aria-label={muted ? 'Aktifkan Audio' : 'Bisukan Audio'}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200"
              >
                {muted ? (
                  <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label="Jeda"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200"
              >
                <Pause className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {s1.lastNotification && !metricsPanelOpen && (
            <div
              data-testid="hud-notification"
              className="pointer-events-auto mx-auto mt-2 max-w-xl rounded-xl border border-white/15 bg-slate-950/92 px-3.5 py-1.5 text-center text-xs font-semibold shadow-lg"
            >
              <span
                className={
                  s1.lastNotification.type === 'success'
                    ? 'text-emerald-300'
                    : s1.lastNotification.type === 'error'
                      ? 'text-rose-300'
                      : s1.lastNotification.type === 'warning'
                        ? 'text-amber-300'
                        : 'text-sky-200'
                }
              >
                {s1.lastNotification.message}
              </span>
            </div>
          )}
        </header>
      )}

      {/* Stage 2 Industrial Balance 8-Metric Popover */}
      {!hudHidden && isStage2 && metricsPanelOpen && (
        <div
          data-testid="industrial-metrics-panel"
          className="fixed top-[72px] left-1/2 z-30 w-[92vw] max-w-md -translate-x-1/2 rounded-2xl border border-sky-400/50 bg-slate-950/95 p-4 text-xs shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <div className="text-[10px] font-bold text-sky-300 uppercase">
                Neraca Kota Industri Stage 2
              </div>
              <div className="text-sm font-extrabold text-white">{industrialBalance.label}</div>
            </div>
            <button
              type="button"
              onClick={() => setMetricsPanelOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { label: 'Produksi Industri', val: s2.industrialMetrics.industrialProduction, color: 'bg-orange-400' },
              { label: 'Serapan Tenaga Kerja', val: s2.industrialMetrics.employment, color: 'bg-sky-400' },
              { label: 'Pertumbuhan Ekonomi', val: s2.industrialMetrics.economicGrowth, color: 'bg-amber-400' },
              { label: 'Perdagangan & Ekspor', val: s2.industrialMetrics.tradePerformance, color: 'bg-indigo-400' },
              { label: 'Kesejahteraan Pekerja', val: s2.industrialMetrics.workerWelfare, color: 'bg-emerald-400' },
              { label: 'Kualitas Lingkungan', val: s2.industrialMetrics.environmentalQuality, color: 'bg-green-400' },
              { label: 'Kualitas Infrastruktur', val: s2.industrialMetrics.infrastructureQuality, color: 'bg-cyan-400' },
              { label: 'Kepuasan Publik', val: s2.industrialMetrics.publicSatisfaction, color: 'bg-pink-400' },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border border-slate-800 bg-slate-900 p-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">{m.label}</span>
                  <span className="font-mono-num font-bold text-white">{m.val}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div className={`h-full ${m.color}`} style={{ width: `${m.val}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2.5 text-[11px] text-slate-400">
            Seimbangkan pabrik dengan Klinik K3, Perumahan Pekerja, dan Pengolahan Limbah agar sungai & pekerja tetap sejahtera.
          </p>
        </div>
      )}

      {/* Top-Left Compact Quest Tracker & Active Location Context */}
      {!hudHidden && (
        <div className="pointer-events-none fixed top-[70px] left-3 z-20 flex max-w-[265px] flex-col gap-2">
          {tracked && (
            <button
              type="button"
              data-testid="quest-tracker-card"
              onClick={() => openMenuAtTab('misi')}
              className="pointer-events-auto rounded-xl border border-amber-500/40 bg-slate-950/90 p-2.5 text-left shadow-xl hover:border-amber-400"
            >
              <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-amber-300 uppercase">
                <span className="flex items-center gap-1">
                  <Navigation className="h-3 w-3" /> Misi Stage {worldState.activeStage}
                </span>
                <span className="font-mono-num text-slate-300">
                  {Math.round(
                    Math.hypot(
                      tracked.step.waypointX - activePos.x,
                      tracked.step.waypointZ - activePos.z
                    )
                  )}{' '}
                  m
                </span>
              </div>
              <div className="mt-0.5 text-xs font-extrabold text-white">{tracked.quest.title}</div>
              <div className="mt-1 text-[11px] leading-snug text-emerald-300">
                ▶ {tracked.step.description}
              </div>
            </button>
          )}

          {insideBuildingDef && (
            <div
              data-testid="interior-badge"
              className="rounded-xl border border-emerald-400/50 bg-emerald-950/90 px-3 py-1.5 text-xs font-bold text-emerald-200 shadow-lg"
            >
              Di dalam: {insideBuildingDef.label}
            </div>
          )}

          {boardedShipId && (
            <div
              data-testid="ship-badge"
              className="flex items-center gap-1.5 rounded-xl border border-sky-400/50 bg-sky-950/90 px-3 py-1.5 text-xs font-bold text-sky-200 shadow-lg"
            >
              <Ship className="h-3.5 w-3.5" />
              Di atas dek{' '}
              {boardedShipId === 'ship-pinisi'
                ? 'Kapal Pinisi Niaga'
                : boardedShipId === 'ship-stage1-return'
                  ? 'Kapal Ekspres Industri'
                  : 'Kapal Penumpang'}
            </div>
          )}

          {activeVehicleDef && (
            <div
              data-testid="vehicle-badge"
              className="rounded-xl border border-cyan-400/60 bg-cyan-950/90 px-3 py-1.5 text-xs font-bold text-cyan-200 shadow-lg"
            >
              Mengendarai {activeVehicleDef.name} · Tekan [F] turun
            </div>
          )}
        </div>
      )}

      {/* Top-Right Live Minimap */}
      {!hudHidden && (
        <div className="pointer-events-none fixed top-[70px] right-3 z-20">
          <MinimapWidget
            activeStage={worldState.activeStage}
            playerX={activePos.x}
            playerZ={activePos.z}
            facingYaw={activePos.facingYaw}
            discoveredDistricts={activeDiscovered}
            questTarget={
              tracked
                ? {
                    x: tracked.step.waypointX,
                    z: tracked.step.waypointZ,
                    label: tracked.step.waypointLabel,
                  }
                : null
            }
            onOpenWorldMap={() => {
              setMenuOpen(false);
              setWorldMapOpen(true);
            }}
          />
        </div>
      )}

      {/* Contextual World Proximity Prompt */}
      {!hudHidden && nearTarget && !isPausedOrModal && !placementBuildingId && (
        <div
          className={`fixed left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 ${
            buildBarOpen ? 'bottom-36' : 'bottom-12'
          }`}
        >
          {nearTarget.kind === 'stage_transition' && (
            <button
              type="button"
              data-testid="stage-transition-prompt"
              onClick={() => handleInteract(nearTarget)}
              className="animate-pop-in flex items-center gap-2 rounded-xl border border-sky-400 bg-slate-950/95 px-4 py-2.5 text-xs font-bold text-white shadow-2xl hover:bg-slate-900"
            >
              <Ship className="h-4 w-4 text-sky-400" />
              <span>
                {'promptLabel' in nearTarget ? nearTarget.promptLabel : `[E] ${nearTarget.label}`}
              </span>
            </button>
          )}

          {nearTarget.kind === 'factory_station' && (
            <button
              type="button"
              data-testid="factory-station-prompt"
              onClick={() => handleInteract(nearTarget)}
              className="animate-pop-in flex items-center gap-2 rounded-xl border border-orange-400 bg-slate-950/95 px-4 py-2.5 text-xs font-bold text-white shadow-2xl hover:bg-slate-900"
            >
              <Factory className="h-4 w-4 text-orange-400" />
              <span>{nearTarget.promptLabel}</span>
            </button>
          )}

          {nearTarget.kind === 'locked_stage3' && (
            <button
              type="button"
              data-testid="locked-stage3-prompt"
              onClick={() => handleInteract(nearTarget)}
              className="animate-pop-in flex items-center gap-2 rounded-xl border border-slate-500 bg-slate-950/95 px-4 py-2.5 text-xs font-bold text-slate-200 shadow-2xl hover:bg-slate-900"
            >
              <Lock className="h-4 w-4 text-amber-400" />
              <span>{nearTarget.promptLabel}</span>
            </button>
          )}

          {nearTarget.kind === 'npc' && (
            <button
              type="button"
              data-testid="npc-interact-prompt"
              onClick={() => handleInteract(nearTarget)}
              className="animate-pop-in flex items-center gap-2 rounded-xl border border-sky-400 bg-slate-950/95 px-4 py-2.5 text-xs font-bold text-white shadow-2xl hover:bg-slate-900"
            >
              <MessageCircle className="h-4 w-4 text-sky-400" />
              <span>
                [E] Bicara dengan {nearTarget.npc.name} · {nearTarget.npc.role}
              </span>
            </button>
          )}

          {nearTarget.kind === 'pickup' && (
            <button
              type="button"
              data-testid="pickup-interact-prompt"
              onClick={() => handleInteract(nearTarget)}
              className="animate-pop-in flex items-center gap-2 rounded-xl border border-amber-400 bg-slate-950/95 px-4 py-2.5 text-xs font-bold text-white shadow-2xl hover:bg-slate-900"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>[E] Ambil {nearTarget.pickup.label}</span>
            </button>
          )}

          {nearTarget.kind === 'collectible' && (
            <button
              type="button"
              data-testid="collectible-interact-prompt"
              onClick={() => handleInteract(nearTarget)}
              className="animate-pop-in flex items-center gap-2 rounded-xl border border-pink-400 bg-slate-950/95 px-4 py-2.5 text-xs font-bold text-white shadow-2xl hover:bg-slate-900"
            >
              <Sparkles className="h-4 w-4 text-pink-400" />
              <span>
                [E] Kumpulkan Koleksi ({nearTarget.collectible.rarity}): {nearTarget.collectible.name}
              </span>
            </button>
          )}

          {nearTarget.kind === 'delivery' && (
            <button
              type="button"
              data-testid="delivery-interact-prompt"
              onClick={() => handleInteract(nearTarget)}
              className="animate-pop-in flex items-center gap-2 rounded-xl border border-emerald-400 bg-slate-950/95 px-4 py-2.5 text-xs font-bold text-white shadow-2xl hover:bg-slate-900"
            >
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>[E] Antar / Jual di {nearTarget.delivery.label}</span>
            </button>
          )}

          {nearTarget.kind === 'placed_building' && (
            <button
              type="button"
              data-testid="building-interact-prompt"
              onClick={() => handleInteract(nearTarget)}
              className="animate-pop-in flex items-center gap-2 rounded-xl border border-amber-400 bg-slate-950/95 px-4 py-2.5 text-xs font-bold text-white shadow-2xl hover:bg-slate-900"
            >
              <ArrowUpCircle className="h-4 w-4 text-amber-400" />
              <span>
                [E] Kelola & Upgrade{' '}
                {BUILDING_CATALOG.find((b) => b.id === nearTarget.instance.buildingId)?.name} (Lv{' '}
                {nearTarget.instance.level})
              </span>
            </button>
          )}

          {nearTarget.kind === 'landmark' && (
            <button
              type="button"
              data-testid="landmark-interact-prompt"
              onClick={() => handleInteract(nearTarget)}
              className="animate-pop-in flex items-center gap-2 rounded-xl border border-emerald-400/70 bg-slate-950/95 px-4 py-2.5 text-xs font-bold text-white shadow-2xl hover:bg-slate-900"
            >
              <Building2 className="h-4 w-4 text-emerald-400" />
              <span>[E] Inspeksi {nearTarget.landmark.label}</span>
            </button>
          )}

          {nearTarget.kind === 'wardrobe_mirror' && (
            <button
              type="button"
              data-testid="wardrobe-mirror-prompt"
              onClick={() => handleInteract(nearTarget)}
              className="animate-pop-in flex items-center gap-2 rounded-xl border border-pink-400 bg-slate-950/95 px-4 py-2.5 text-xs font-bold text-white shadow-2xl hover:bg-slate-900"
            >
              <UserCheck className="h-4 w-4 text-pink-400" />
              <span>[E] Ubah Karakter di {nearTarget.spot.label}</span>
            </button>
          )}

          {nearTarget.kind === 'vehicle' && !ridingVehicleId && (
            <button
              type="button"
              data-testid="vehicle-interact-prompt"
              onClick={() => handleInteract(nearTarget)}
              className="animate-pop-in flex items-center gap-2 rounded-xl border border-cyan-400 bg-slate-950/95 px-4 py-2.5 text-xs font-bold text-white shadow-2xl hover:bg-slate-900"
            >
              <span>[F] Naiki {nearTarget.vehicle.def.name}</span>
            </button>
          )}
        </div>
      )}

      {/* Subtle Bottom Controls Hint Strip (when Build Bar closed) */}
      {!hudHidden && !buildBarOpen && !placementBuildingId && (
        <div className="pointer-events-none fixed bottom-2.5 left-1/2 z-10 hidden -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/85 px-4 py-1 text-[11px] text-slate-300 md:block">
          WASD: Jalan · Shift: Lari · Space: Lompat · E: Interaksi · C: Studio Karakter · F: Kendaraan · B: Bangun · M: Peta · Q: Misi · G: Multiplayer
        </div>
      )}

      {/* Mobile Touch Controls */}
      <TouchControls
        visible={!hudHidden && !isPausedOrModal}
        onAction={(action) => setTouchActionQueue((q) => ({ action, id: (q?.id ?? 0) + 1 }))}
        onMoveInput={(k, pressed) => {
          touchKeysRef.current[k] = pressed;
        }}
      />

      {/* Free-Placement Build Catalog & Active Ghost Bar */}
      <BuildCatalogBar
        open={buildBarOpen}
        onClose={() => setBuildBarOpen(false)}
        activeStage={worldState.activeStage}
        coins={s1.coins}
        placedBuildings={activeBuildings}
        unlockedBlueprints={s1.unlockedBlueprints}
        activePlacementId={placementBuildingId}
        placementValid={placementPreview.valid}
        placementReason={placementPreview.reason}
        onStartPlacement={(id) => {
          audioEngine.playClick();
          setPlacementBuildingId(id);
          setPlacementRotationY(0);
        }}
        onCancelPlacement={() => setPlacementBuildingId(null)}
        onRotatePlacement={() => setPlacementRotationY((r) => (r + Math.PI / 4) % (Math.PI * 2))}
        onConfirmPlacement={() => {
          if (placementPreview.valid) {
            handleConfirmPlacement(placementPreview.x, placementPreview.z, placementRotationY);
          }
        }}
        onUpgradeBuilding={handleUpgradeBuilding}
      />

      {/* Interactive Full World Map Modal [M] */}
      <WorldMapModal
        open={worldMapOpen}
        onClose={() => setWorldMapOpen(false)}
        activeStage={worldState.activeStage}
        playerX={activePos.x}
        playerZ={activePos.z}
        stage1PlayerPos={{ x: s1.playerPos.x, z: s1.playerPos.z }}
        stage2PlayerPos={{ x: s2.playerPos.x, z: s2.playerPos.z }}
        discoveredDistricts={activeDiscovered}
        stage1Discovered={s1.discoveredDistricts}
        stage2Discovered={s2.discoveredDistricts}
        collectedArtifacts={activeCollectibles}
        stage1Collected={s1.collectibles}
        stage2Collected={s2.collectibles}
        placedBuildings={activeBuildings}
        stage1Buildings={s1.placedBuildings}
        stage2Buildings={s2.placedBuildings}
        questTarget={
          tracked
            ? {
                x: tracked.step.waypointX,
                z: tracked.step.waypointZ,
                label: tracked.step.waypointLabel,
              }
            : null
        }
        onTravelStage={(target) => {
          setWorldMapOpen(false);
          setVoyageTargetStage(target);
        }}
      />

      {/* Full Tabbed Menu Drawer */}
      <GameMenuDrawer
        open={menuOpen}
        activeTab={menuTab}
        onChangeTab={setMenuTab}
        onClose={() => setMenuOpen(false)}
        state={worldState}
        muted={muted}
        bgmActive={bgmActive}
        previewExpression={previewExpression}
        onToggleMute={onToggleMute}
        onToggleBgm={handleToggleBgm}
        onChangeExpression={setPreviewExpression}
        onUpdateDisplayName={(name) =>
          setWorldState((prev) => ({
            ...prev,
            displayName: name.slice(0, 24),
            lastUpdatedAt: Date.now(),
          }))
        }
        onApplyAppearance={(nextAppearance: CharacterAppearance) => {
          audioEngine.playCorrect();
          setWorldState((prev) =>
            updateGlobalAppearance(prev, nextAppearance, { triggerQuest: true })
          );
        }}
        onApplyPreset={(presetId: string) => {
          audioEngine.playCorrect();
          setWorldState((prev) => applyCharacterPreset(prev, presetId));
        }}
        onEquipTitle={(titleId: string) => {
          audioEngine.playClick();
          setWorldState((prev) => equipMultiStageTitle(prev, titleId));
        }}
        onUseItem={(itemId) => {
          audioEngine.playCorrect();
          setWorldState((prev) => useMultiStageInventoryItem(prev, itemId));
        }}
        onBuySupply={(itemId) => {
          audioEngine.playClick();
          setWorldState((prev) => buyStage2Supply(prev, itemId));
        }}
        onAcceptQuest={(qId) => {
          audioEngine.playClick();
          setWorldState((prev) => acceptActiveStageQuest(prev, qId));
        }}
        onTrackQuest={(qId) => {
          audioEngine.playClick();
          setWorldState((prev) => trackActiveStageQuest(prev, qId));
        }}
        onOpenChallenge={(ch) => {
          setMenuOpen(false);
          setChallengeResult(null);
          setActiveChallenge(ch);
        }}
        onUpdateSettings={(patch) =>
          setWorldState((prev) => ({
            ...prev,
            stage1: {
              ...prev.stage1,
              settings: { ...prev.stage1.settings, ...patch },
            },
          }))
        }
        onResetProgress={handleResetProgress}
        mpSession={mpSession}
        publicRooms={publicRooms}
        onRefreshRooms={() => {
          void refreshPublicRooms();
        }}
        onCreateRoom={(roomName, isPublic) => {
          audioEngine.playClick();
          void mpClientRef.current!.createRoom({
            roomName,
            isPublic,
            player: buildRemotePlayerPayload(worldState, localEmote, activeVehicleDef?.kind ?? null),
          });
        }}
        onJoinRoom={(code) => {
          audioEngine.playClick();
          void mpClientRef.current!.joinRoom({
            code,
            player: buildRemotePlayerPayload(worldState, localEmote, activeVehicleDef?.kind ?? null),
          });
        }}
        onLeaveRoom={() => {
          audioEngine.playClick();
          mpClientRef.current!.leaveRoom();
        }}
        onGoOffline={() => {
          audioEngine.playClick();
          mpClientRef.current!.disconnectToOffline();
        }}
        onSendChat={(text, presetId) => {
          mpClientRef.current!.sendChat(text, presetId);
        }}
        onTriggerEmote={handleTriggerEmote}
      />

      {/* Ship Voyage Cross-Stage Transition Modal (Stage 1 <-> Stage 2) */}
      {voyageTargetStage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
          role="dialog"
          aria-modal="true"
          data-testid="ship-voyage-modal"
        >
          <div className="animate-pop-in w-full max-w-lg rounded-2xl border border-sky-400/50 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-sky-400/50 bg-sky-500/20">
                  <Ship className="h-6 w-6 text-sky-300" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-sky-300 uppercase">
                    Pelayaran Antar-Era Nusantara
                  </div>
                  <h3 className="text-lg font-extrabold text-white">
                    {voyageTargetStage === 2
                      ? 'Menuju Stage 2: Kota Industri Global'
                      : 'Kembali ke Stage 1: Kota Perdagangan'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVoyageTargetStage(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-200">
              {voyageTargetStage === 2
                ? 'Kapal Penumpang Pelabuhan siap berlayar menuju Pelabuhan Kota Industri! Seluruh koin, level XP, kostum, aksesori, gelar, dan isi tasmu dibawa utuh untuk membangun pabrik, rantai pasok, serta menjaga kesejahteraan pekerja & lingkungan.'
                : 'Kapal Ekspres Industri siap membawamu berlabuh kembali di Dermaga Kota Perdagangan Nusantara. Progres pabrik, bangunan, dan misimu di Kota Industri tetap tersimpan aman.'}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setVoyageTargetStage(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                data-testid="confirm-voyage-btn"
                onClick={() => confirmStageVoyage(voyageTargetStage)}
                className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-5 py-2 text-xs font-extrabold text-slate-950 hover:bg-sky-400"
              >
                <Ship className="h-4 w-4" />
                Berangkat Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage 2 Factory Production Console Modal */}
      {activeFactoryStation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
          role="dialog"
          aria-modal="true"
          data-testid="factory-console-modal"
        >
          {(() => {
            const recipe = STAGE2_PRODUCTION_RECIPES.find((r) => r.id === activeFactoryStation.recipeId);
            if (!recipe) return null;
            const inputDef = getItemDefById(recipe.inputItemId);
            const outputDef = getItemDefById(recipe.outputItemId);
            const supplyOffer = STAGE2_MARKET_SUPPLIES.find((o) => o.itemId === recipe.inputItemId);
            const ownedInputQty = s1.inventory.find((i) => i.itemId === recipe.inputItemId)?.qty ?? 0;
            const ownedOutputQty = s1.inventory.find((i) => i.itemId === recipe.outputItemId)?.qty ?? 0;
            const stationOrders = s2.productionOrders.filter(
              (o) => o.factoryId === activeFactoryStation.buildingId
            );
            const activeOrder = stationOrders.find((o) => !o.completed);
            const completedOrders = stationOrders.filter((o) => o.completed);

            return (
              <div className="animate-pop-in w-full max-w-xl rounded-2xl border border-orange-500/50 bg-slate-900 p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-400/50 bg-orange-500/20">
                      <Factory className="h-6 w-6 text-orange-300" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-orange-300 uppercase">
                        {recipe.factoryName}
                      </div>
                      <h3 className="text-lg font-extrabold text-white">{activeFactoryStation.label}</h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveFactoryStationId(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-3 text-xs text-slate-300">{activeFactoryStation.description}</p>

                <div className="mt-4 grid gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs sm:grid-cols-2">
                  <div>
                    <div className="text-[10px] font-bold text-amber-300 uppercase">Bahan Baku Dibutuhkan</div>
                    <div className="mt-1 font-bold text-white">
                      {recipe.inputQty}x {inputDef?.name ?? recipe.inputItemId}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      Stok Tas Anda: <strong className="text-emerald-300">{ownedInputQty}</strong>
                    </div>
                    {supplyOffer && ownedInputQty < recipe.inputQty && (
                      <button
                        type="button"
                        data-testid="factory-buy-supply-btn"
                        disabled={s1.coins < supplyOffer.costCoins}
                        onClick={() => {
                          audioEngine.playClick();
                          setWorldState((prev) => buyStage2Supply(prev, supplyOffer.itemId));
                        }}
                        className="mt-2 inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        Beli Bahan ({supplyOffer.costCoins} Koin)
                      </button>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-sky-300 uppercase">Hasil Produksi</div>
                    <div className="mt-1 font-bold text-white">
                      {recipe.outputQty}x {outputDef?.name ?? recipe.outputItemId}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      Stok Jadi di Tas: <strong className="text-sky-300">{ownedOutputQty}</strong> · Nilai Jual ~{recipe.sellPriceCoins} Koin
                    </div>
                  </div>
                </div>

                {/* Active & Completed Production Orders */}
                <div className="mt-4 space-y-2.5">
                  {activeOrder && (
                    <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs">
                      <div className="flex justify-between font-bold text-amber-300">
                        <span>Mesin Sedang Memproduksi: {recipe.name}</span>
                        <span className="font-mono-num">{Math.round(activeOrder.progress * 100)}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full bg-orange-400 transition-all"
                          style={{ width: `${activeOrder.progress * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {completedOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="flex items-center justify-between rounded-xl border border-emerald-500/50 bg-emerald-950/30 p-3 text-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-emerald-200">
                        <PackageCheck className="h-4 w-4 text-emerald-400" />
                        <span>
                          Siap Diambil: {recipe.outputQty}x {outputDef?.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        data-testid="collect-production-btn"
                        onClick={() => {
                          audioEngine.playLevelUp();
                          setWorldState((prev) => collectStage2Production(prev, ord.id));
                        }}
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400"
                      >
                        Ambil Hasil
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    data-testid="start-production-btn"
                    disabled={Boolean(activeOrder) || ownedInputQty < recipe.inputQty}
                    onClick={() => {
                      audioEngine.playBuild();
                      setWorldState((prev) => startStage2Production(prev, recipe.id));
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    <Factory className="h-4 w-4" />
                    Mulai Produksi ({recipe.durationSeconds} dtk)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFactoryStationId(null)}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Locked Stage 3 Preview Modal (Strictly Locked!) */}
      {stage3PreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
          role="dialog"
          aria-modal="true"
          data-testid="stage3-preview-modal"
        >
          <div className="animate-pop-in w-full max-w-md rounded-2xl border border-slate-600 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-600 bg-slate-800">
                  <Lock className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-amber-300 uppercase">
                    TERKUNCI · Dalam Pengembangan
                  </div>
                  <h3 className="text-lg font-extrabold text-white">
                    Stage 3: Kota Digital Tanpa Batas
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStage3PreviewOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-300">
              Terminal Kereta Cepat Masa Depan menandai perbatasan menuju era Smart City & Glokalisasi Digital (Stage 3). Saat ini gerbang Stage 3 masih <strong className="text-amber-300">TERKUNCI</strong> dan sedang disiapkan untuk pembaruan mendatang. Teruskan eksplorasi dan tuntaskan seluruh misi Stage 1 serta Stage 2!
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setStage3PreviewOpen(false)}
                className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700"
              >
                Kembali ke Kota Industri
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NPC Dialogue & Quest Modal */}
      {activeNpcModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
          data-testid="npc-dialogue-modal"
        >
          <div className="animate-pop-in w-full max-w-lg rounded-2xl border border-sky-500/40 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              {activeNpcModal.characterId ? (
                <img
                  src={CHARACTERS[activeNpcModal.characterId].avatarSrc}
                  alt={activeNpcModal.name}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 shrink-0 rounded-xl border border-slate-700 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/15">
                  <MessageCircle className="h-8 w-8 text-amber-300" />
                </div>
              )}
              <div className="flex-1">
                <div className="text-xs font-semibold text-amber-300">{activeNpcModal.role}</div>
                <h3 className="text-xl font-extrabold text-white">{activeNpcModal.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveNpcModal(null)}
                aria-label="Tutup Dialog NPC"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-relaxed text-slate-200">
              "{activeNpcModal.dialogue}"
            </p>

            <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3.5 text-xs text-emerald-200">
              <div className="font-bold text-emerald-300">
                Petunjuk & Peran di Stage {worldState.activeStage}:
              </div>
              <p className="mt-1">{activeNpcModal.missionHint}</p>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              {npcGiverQuest && (
                <button
                  type="button"
                  data-testid="npc-accept-quest-btn"
                  onClick={() => {
                    audioEngine.playCorrect();
                    setWorldState((prev) => acceptActiveStageQuest(prev, npcGiverQuest.id));
                    setActiveNpcModal(null);
                  }}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-emerald-400"
                >
                  Ambil Misi: {npcGiverQuest.title}
                </button>
              )}

              {npcChallenge && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveNpcModal(null);
                    setChallengeResult(null);
                    setActiveChallenge(npcChallenge);
                  }}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                >
                  Jawab Studi Kasus Sosiologi
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveNpcModal(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Placed Building Upgrade & Inspection Modal */}
      {activeBuildingInspect && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
          data-testid="building-inspect-modal"
        >
          {(() => {
            const def = BUILDING_CATALOG.find((b) => b.id === activeBuildingInspect.buildingId);
            if (!def) return null;
            const upCost = Math.round(def.cost * (activeBuildingInspect.level === 1 ? 0.75 : 1.15));
            return (
              <div className="animate-pop-in w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-900 p-6 shadow-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-amber-300">
                      Bangunan Kota · Level {activeBuildingInspect.level}/3
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{def.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveBuildingInspectId(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {activeBuildingInspect.isConstructing ? (
                  <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3.5 text-xs">
                    <div className="font-bold text-amber-300">
                      Pekerja sedang membangun ({Math.round(activeBuildingInspect.constructionProgress * 100)}%)
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${activeBuildingInspect.constructionProgress * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-3 text-sm text-slate-200">{def.functionDesc}</p>
                    <div className="mt-3 rounded-xl border border-sky-500/30 bg-sky-950/40 p-3 text-xs text-sky-200">
                      <strong>Kaitan Sosiologi:</strong> {def.globalizationLink}
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      {activeBuildingInspect.level < 3 ? (
                        <button
                          type="button"
                          data-testid="modal-upgrade-building-btn"
                          disabled={s1.coins < upCost}
                          onClick={() => handleUpgradeBuilding(activeBuildingInspect.id)}
                          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold ${
                            s1.coins >= upCost
                              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <ArrowUpCircle className="h-4 w-4" />
                          Upgrade Level {activeBuildingInspect.level + 1} ({upCost} Koin)
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-300">
                          <CheckCircle2 className="h-4 w-4" /> Sudah Level Maksimal!
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Landmark Inspection Modal */}
      {activeLandmark && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="animate-pop-in w-full max-w-md rounded-2xl border border-emerald-500/40 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-300">Landmark Kota Nusantara</div>
                <h3 className="text-lg font-extrabold text-white">{activeLandmark.label}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveLandmark(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-200">{activeLandmark.description}</p>
            <div className="mt-3 rounded-xl border border-sky-500/30 bg-sky-950/40 p-3.5 text-xs text-sky-200">
              <strong className="text-sky-300">Analisis Sosiologi: </strong>
              {activeLandmark.sociologyNote}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveLandmark(null)}
                className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                Lanjutkan Eksplorasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sociological Challenge Modal (Stage 1 & Stage 2) */}
      {activeChallenge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="animate-pop-in w-full max-w-2xl rounded-2xl border border-amber-500/40 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <img
                src={CHARACTERS[activeChallenge.speaker].avatarSrc}
                alt={CHARACTERS[activeChallenge.speaker].name}
                referrerPolicy="no-referrer"
                className="h-14 w-14 rounded-xl border border-slate-700 object-cover"
              />
              <div>
                <div className="text-xs font-semibold text-amber-300">
                  {CHARACTERS[activeChallenge.speaker].name} · {CHARACTERS[activeChallenge.speaker].theory}
                </div>
                <h3 className="text-lg font-bold text-white">{activeChallenge.title}</h3>
              </div>
            </div>

            <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-sm leading-relaxed text-slate-200">
              {activeChallenge.scenario}
            </p>

            <div className="mt-4 space-y-2.5">
              {activeChallenge.options.map((opt) => {
                const picked = challengeResult?.option.id === opt.id;
                let styleClass =
                  'border-slate-700 bg-slate-800/80 text-slate-100 hover:border-amber-400/60';
                if (challengeResult) {
                  if (opt.isCorrect) {
                    styleClass = 'border-emerald-500 bg-emerald-500/15 text-emerald-100';
                  } else if (picked && !opt.isCorrect) {
                    styleClass = 'border-rose-500 bg-rose-500/15 text-rose-100';
                  } else {
                    styleClass = 'border-slate-800 bg-slate-900/50 text-slate-400';
                  }
                }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={challengeResult !== null}
                    onClick={() => handleAnswerChallenge(opt)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors ${styleClass}`}
                  >
                    <span className="font-mono-num font-bold text-amber-300">{opt.id}.</span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {challengeResult && (
              <div className="mt-4 space-y-3 rounded-xl border border-slate-700 bg-slate-950 p-4">
                <div
                  className={`text-sm font-bold ${
                    challengeResult.option.isCorrect ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {challengeResult.option.isCorrect
                    ? 'Keputusan Tepat! Kota Nusantara Melangkah Maju'
                    : 'Kurang Tepat — Perhatikan Dampak Sosialnya'}
                </div>
                <p className="text-xs leading-relaxed text-slate-200">
                  {challengeResult.option.explanation}
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playClick();
                      setActiveChallenge(null);
                      setChallengeResult(null);
                    }}
                    className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
                  >
                    Lanjutkan Penjelajahan 3D
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reward Celebration Modal (Multi-category unlocks, blueprints, titles, & milestones) */}
      {s1.lastRewardCelebration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
          role="dialog"
          aria-modal="true"
          data-testid="reward-celebration-modal"
        >
          <div className="animate-pop-in w-full max-w-lg rounded-2xl border border-amber-400/60 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-400/50 bg-amber-500/20">
                <Trophy className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-wider text-amber-300 uppercase">
                  Hadiah & Penghargaan Terbuka!
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  {s1.lastRewardCelebration.sourceTitle}
                </h3>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl border border-sky-500/30 bg-sky-950/40 p-3">
                <div className="text-slate-400">Pengalaman</div>
                <div className="font-mono-num text-base font-extrabold text-sky-300">
                  +{s1.lastRewardCelebration.xp} XP
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/40 p-3">
                <div className="text-slate-400">Kas Kota</div>
                <div className="font-mono-num text-base font-extrabold text-amber-300">
                  +{s1.lastRewardCelebration.coins} Koin
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              {s1.lastRewardCelebration.newLevel && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/35 px-3.5 py-2 font-bold text-emerald-200">
                  Naik Level ke Level {s1.lastRewardCelebration.newLevel}!
                </div>
              )}

              {s1.lastRewardCelebration.unlockedItemId && (
                <div className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-slate-200">
                  <span className="font-bold text-sky-300">Item Tas: </span>
                  {getItemDefById(s1.lastRewardCelebration.unlockedItemId)?.name ??
                    s1.lastRewardCelebration.unlockedItemId}{' '}
                  (x{s1.lastRewardCelebration.unlockedItemQty ?? 1})
                </div>
              )}

              {s1.lastRewardCelebration.unlockedCustomizationIds.length > 0 && (
                <div className="rounded-xl border border-pink-500/40 bg-pink-950/25 p-3">
                  <div className="mb-1.5 font-bold text-pink-300">
                    Gaya & Busana Baru di Studio Karakter:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s1.lastRewardCelebration.unlockedCustomizationIds.map((cid) => (
                      <span
                        key={cid}
                        className="rounded-lg border border-pink-400/40 bg-slate-950 px-2 py-1 text-[11px] font-semibold text-white"
                      >
                        {CUSTOMIZATION_ITEMS.find((c) => c.id === cid)?.name ?? cid}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {s1.lastRewardCelebration.unlockedBlueprintId && (
                <div className="rounded-xl border border-orange-500/40 bg-orange-950/30 px-3.5 py-2.5 text-orange-200">
                  <span className="font-bold text-orange-300">Cetak Biru Bangunan Baru: </span>
                  {BUILDING_CATALOG.find(
                    (b) => b.id === s1.lastRewardCelebration?.unlockedBlueprintId
                  )?.name ?? s1.lastRewardCelebration.unlockedBlueprintId}
                </div>
              )}

              {s1.lastRewardCelebration.unlockedTitleId && (
                <div className="rounded-xl border border-purple-500/40 bg-purple-950/30 px-3.5 py-2.5 text-purple-200">
                  <span className="font-bold text-purple-300">Gelar Kehormatan Terbuka: </span>
                  {PLAYER_TITLES.find((t) => t.id === s1.lastRewardCelebration?.unlockedTitleId)?.name ??
                    s1.lastRewardCelebration.unlockedTitleId}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                data-testid="dismiss-reward-celebration-btn"
                onClick={() => {
                  audioEngine.playClick();
                  setWorldState((prev) => dismissMultiStageCelebration(prev));
                }}
                className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400"
              >
                Lanjutkan Bertualang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {paused && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="animate-pop-in w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center shadow-2xl">
            <h2 className="text-2xl font-extrabold text-white">Permainan Dijeda</h2>
            <p className="mt-2 text-xs text-slate-300">
              Progres Stage 1 & Stage 2 tersimpan otomatis ke browser.
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setPaused(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 text-sm font-bold text-slate-950 hover:bg-amber-400"
              >
                <Play className="h-4 w-4" /> Lanjutkan Bermain
              </button>
              <button
                type="button"
                onClick={handleResetProgress}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/50 text-sm font-bold text-rose-200 hover:bg-rose-900/60"
              >
                <RotateCcw className="h-4 w-4" /> Reset Progres Dunia Nusantara
              </button>
              <button
                type="button"
                onClick={onBackDashboard}
                className="flex h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-sm font-semibold text-slate-200 hover:bg-slate-700"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
