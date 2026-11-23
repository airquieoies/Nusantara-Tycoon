import { BUILDING_CATALOG } from './data/bermainData';
import { clamp } from './rules';
import {
  CHARACTER_PRESETS,
  CharacterAppearance,
  CUSTOMIZATION_ITEMS,
  DEFAULT_CHARACTER_APPEARANCE,
  PLAYER_TITLES,
  QuestEventType,
  STAGE1_ITEMS,
  STAGE1_QUESTS,
} from './stage1Data';
import {
  addItemToInventory,
  addXpAndCoins,
  calculateOpenWorldIncome,
  collectNusantaraArtifact,
  collectWorldPickup,
  createInitialStage1State,
  deliverToSpot,
  discoverDistrict,
  dismissRewardCelebration,
  equipPlayerTitle,
  evaluateAchievements,
  getTrackedQuestDetails,
  hasInventoryItem,
  InventorySlot,
  loadStage1FromStorage,
  PlacedBuildingInstance,
  QuestProgress,
  randomizePlayerAppearance,
  recordInteriorEntered,
  recordShipBoarded,
  recordVehicleDriven,
  removeItemFromInventory,
  resetPlayerAppearance,
  RewardCelebrationPayload,
  Stage1Notification,
  Stage1OpenWorldState,
  startBuildingConstruction,
  tickBuildingConstructions,
  triggerQuestEvent,
  updatePlayerAppearance,
  upgradePlacedBuilding,
  useInventoryItem,
  xpNeededForLevel,
  acceptQuest,
} from './stage1WorldLogic';
import {
  STAGE2_ACHIEVEMENTS,
  STAGE2_COLLECTIBLES,
  STAGE2_COLLECTION_MILESTONES,
  STAGE2_DELIVERY_SPOTS,
  STAGE2_DISTRICTS,
  STAGE2_ITEMS,
  STAGE2_MARKET_SUPPLIES,
  STAGE2_PRODUCTION_RECIPES,
  STAGE2_QUESTS,
  STAGE2_WORLD_PICKUPS,
  Stage2DistrictId,
  Stage2QuestEventType,
} from './stage2Data';
import {
  STAGE3_ACHIEVEMENTS,
  STAGE3_ACTIVITY_STATIONS,
  STAGE3_COLLECTIBLES,
  STAGE3_COLLECTION_MILESTONES,
  STAGE3_DELIVERY_SPOTS,
  STAGE3_DISTRICTS,
  STAGE3_ELEVATOR_PADS,
  STAGE3_ITEMS,
  STAGE3_MARKET_SUPPLIES,
  STAGE3_QUESTS,
  STAGE3_WORLD_PICKUPS,
  Stage3DistrictId,
} from './stage3Data';
import {
  IndustrialBalanceMetrics,
  ProductionOrderState,
  SmartCityMetrics,
  Stage3ActivityKind,
} from './types';

export const MULTI_STAGE_SAVE_KEY = 'nusantara_tycoon_global_v2';

export interface Stage2OpenWorldState {
  discoveredDistricts: Stage2DistrictId[];
  quests: Record<string, QuestProgress>;
  trackedQuestId: string | null;
  collectedPickups: string[];
  collectibles: string[];
  completedDeliveries: string[];
  claimedMilestones: string[];
  achievements: string[];
  placedBuildings: PlacedBuildingInstance[];
  productionOrders: ProductionOrderState[];
  industrialMetrics: IndustrialBalanceMetrics;
  sensorInspected: boolean;
  bioFilterInstalledCount: number;
  totalProducedUnits: number;
  totalSoldUnits: number;
  reputation: number;
  happiness: number;
  welfare: number;
  score: number;
  stats: {
    buildingsBuilt: number;
    buildingsUpgraded: number;
    questsCompleted: number;
    vehiclesDriven: number;
    shipsBoarded: number;
    interiorsEntered: number;
    collectiblesFound: number;
  };
  playerPos: { x: number; y: number; z: number; facingYaw: number };
}

export interface Stage3OpenWorldState {
  discoveredDistricts: Stage3DistrictId[];
  quests: Record<string, QuestProgress>;
  trackedQuestId: string | null;
  collectedPickups: string[];
  collectibles: string[];
  completedDeliveries: string[];
  completedActivities: Stage3ActivityKind[];
  activityCounts: Partial<Record<Stage3ActivityKind, number>>;
  usedElevatorCount: number;
  claimedMilestones: string[];
  achievements: string[];
  placedBuildings: PlacedBuildingInstance[];
  smartCityMetrics: SmartCityMetrics;
  reputation: number;
  happiness: number;
  welfare: number;
  score: number;
  stats: {
    buildingsBuilt: number;
    buildingsUpgraded: number;
    questsCompleted: number;
    vehiclesDriven: number;
    interiorsEntered: number;
    collectiblesFound: number;
  };
  playerPos: { x: number; y: number; z: number; facingYaw: number };
}

export interface MultiStageWorldState {
  version: 2;
  displayName: string;
  activeStage: 1 | 2 | 3;
  unlockedStages: (1 | 2 | 3)[];
  stage1: Stage1OpenWorldState;
  stage2: Stage2OpenWorldState;
  stage3: Stage3OpenWorldState;
  lastUpdatedAt: number;
}

export function createInitialStage2State(): Stage2OpenWorldState {
  const quests: Record<string, QuestProgress> = {};
  for (const q of STAGE2_QUESTS) {
    quests[q.id] = {
      status: q.id === 's2-q-main-1' ? 'active' : 'available',
      stepIndex: 0,
    };
  }

  return {
    discoveredDistricts: ['s2-transportasi'],
    quests,
    trackedQuestId: 's2-q-main-1',
    collectedPickups: [],
    collectibles: [],
    completedDeliveries: [],
    claimedMilestones: [],
    achievements: [],
    placedBuildings: [],
    productionOrders: [],
    industrialMetrics: {
      industrialProduction: 34,
      employment: 48,
      economicGrowth: 42,
      tradePerformance: 40,
      workerWelfare: 46,
      environmentalQuality: 54,
      infrastructureQuality: 45,
      publicSatisfaction: 56,
    },
    sensorInspected: false,
    bioFilterInstalledCount: 0,
    totalProducedUnits: 0,
    totalSoldUnits: 0,
    reputation: 46,
    happiness: 58,
    welfare: 50,
    score: 25,
    stats: {
      buildingsBuilt: 0,
      buildingsUpgraded: 0,
      questsCompleted: 0,
      vehiclesDriven: 0,
      shipsBoarded: 0,
      interiorsEntered: 0,
      collectiblesFound: 0,
    },
    playerPos: { x: 56.0, y: 0.72, z: 0.0, facingYaw: -Math.PI / 2 },
  };
}

export function createInitialStage3State(): Stage3OpenWorldState {
  const quests: Record<string, QuestProgress> = {};
  for (const q of STAGE3_QUESTS) {
    quests[q.id] = {
      status: q.id === 'q-s3-1' ? 'active' : 'available',
      stepIndex: 0,
    };
  }

  return {
    discoveredDistricts: ['s3-transit-hub'],
    quests,
    trackedQuestId: 'q-s3-1',
    collectedPickups: [],
    collectibles: [],
    completedDeliveries: [],
    completedActivities: [],
    activityCounts: {},
    usedElevatorCount: 0,
    claimedMilestones: [],
    achievements: [],
    placedBuildings: [],
    smartCityMetrics: {
      economicGrowth: 48,
      digitalDevelopment: 52,
      employment: 50,
      publicSatisfaction: 58,
      environmentalQuality: 60,
      renewableEnergy: 46,
      transportationEfficiency: 50,
      researchDevelopment: 45,
      infrastructureQuality: 54,
    },
    reputation: 52,
    happiness: 60,
    welfare: 54,
    score: 40,
    stats: {
      buildingsBuilt: 0,
      buildingsUpgraded: 0,
      questsCompleted: 0,
      vehiclesDriven: 0,
      interiorsEntered: 0,
      collectiblesFound: 0,
    },
    playerPos: { x: 0, y: 0, z: -64, facingYaw: 0 },
  };
}

export function createInitialMultiStageState(displayName = 'Wali Kota Muda'): MultiStageWorldState {
  return {
    version: 2,
    displayName,
    activeStage: 1,
    unlockedStages: [1, 2, 3],
    stage1: createInitialStage1State(),
    stage2: createInitialStage2State(),
    stage3: createInitialStage3State(),
    lastUpdatedAt: Date.now(),
  };
}

export function getItemDefById(itemId: string) {
  return (
    STAGE1_ITEMS.find((i) => i.id === itemId) ??
    STAGE2_ITEMS.find((i) => i.id === itemId) ??
    STAGE3_ITEMS.find((i) => i.id === itemId) ??
    null
  );
}

function grantGlobalCustomizations(
  state: MultiStageWorldState,
  ids: (string | undefined)[]
): { nextState: MultiStageWorldState; newlyUnlocked: string[] } {
  const set = new Set(state.stage1.unlockedCustomizationIds);
  const newlyUnlocked: string[] = [];
  for (const id of ids) {
    if (!id) continue;
    if (CUSTOMIZATION_ITEMS.some((c) => c.id === id) && !set.has(id)) {
      set.add(id);
      newlyUnlocked.push(id);
    }
  }
  if (newlyUnlocked.length === 0) return { nextState: state, newlyUnlocked };
  const unlockedCustomizationIds = Array.from(set);
  const unlockedOutfits = CUSTOMIZATION_ITEMS.filter(
    (c) => c.slot === 'jacket' && unlockedCustomizationIds.includes(c.id)
  ).map((c) => c.id);
  const unlockedHats = CUSTOMIZATION_ITEMS.filter(
    (c) => c.slot === 'hat' && unlockedCustomizationIds.includes(c.id)
  ).map((c) => c.id);
  return {
    newlyUnlocked,
    nextState: {
      ...state,
      stage1: {
        ...state.stage1,
        unlockedCustomizationIds,
        unlockedOutfits,
        unlockedHats,
      },
    },
  };
}

function withGlobalNotif(
  state: MultiStageWorldState,
  type: Stage1Notification['type'],
  message: string
): MultiStageWorldState {
  return {
    ...state,
    lastUpdatedAt: Date.now(),
    stage1: {
      ...state.stage1,
      lastNotification: { id: Date.now() + Math.floor(Math.random() * 1000), type, message },
    },
  };
}

function withStage1Patch(
  state: MultiStageWorldState,
  nextS1: Stage1OpenWorldState
): MultiStageWorldState {
  return {
    ...state,
    stage1: nextS1,
    lastUpdatedAt: Date.now(),
  };
}

export function recalculateIndustrialMetrics(s2: Stage2OpenWorldState): IndustrialBalanceMetrics {
  let factoryPower = 0;
  let logisticsInfra = 0;
  let welfareBoost = 0;
  let envBoost = 0;
  let tradeBoost = 0;
  let pollutionPenalty = 0;

  for (const inst of s2.placedBuildings) {
    if (inst.isConstructing) continue;
    const def = BUILDING_CATALOG.find((b) => b.id === inst.buildingId);
    if (!def) continue;
    const mult = inst.level === 1 ? 1 : inst.level === 2 ? 1.45 : 1.9;
    if (def.category === 'industri') {
      factoryPower += 9 * mult;
      pollutionPenalty += Math.max(0, -def.effects.hpKota * 0.9) * mult;
    }
    if (def.category === 'perdagangan') {
      tradeBoost += 8 * mult;
      logisticsInfra += 7 * mult;
    }
    if (def.category === 'teknologi') {
      logisticsInfra += 9 * mult;
      if (def.id === 'pembangkit-listrik') pollutionPenalty += 3 * mult;
    }
    if (def.category === 'masyarakat') {
      welfareBoost += 10 * mult;
      if (def.id === 'instalasi-pengolah-air' || def.id === 'taman-kota') {
        envBoost += 14 * mult;
      }
    }
    if (def.category === 'budaya') {
      envBoost += 11 * mult;
      welfareBoost += 5 * mult;
    }
  }

  const productionBonus = s2.totalProducedUnits * 4;
  const soldBonus = s2.totalSoldUnits * 5;
  const k3Delivered = s2.completedDeliveries.includes('s2-del-klinik') ? 16 : 0;
  const bioFilterScore = s2.bioFilterInstalledCount * 20;
  const sensorBonus = s2.sensorInspected ? 4 : 0;

  const industrialProduction = clamp(Math.round(34 + factoryPower + productionBonus), 0, 100);
  const employment = clamp(
    Math.round(46 + factoryPower * 0.8 + tradeBoost * 0.4 + logisticsInfra * 0.35),
    0,
    100
  );
  const tradePerformance = clamp(
    Math.round(38 + tradeBoost + soldBonus + s2.completedDeliveries.length * 4),
    0,
    100
  );
  const workerWelfare = clamp(
    Math.round(44 + welfareBoost + k3Delivered + (s2.welfare - 50) * 0.5 - factoryPower * 0.22),
    0,
    100
  );
  const environmentalQuality = clamp(
    Math.round(58 + envBoost + bioFilterScore + sensorBonus - pollutionPenalty - s2.totalProducedUnits * 2.5),
    5,
    100
  );
  const infrastructureQuality = clamp(
    Math.round(44 + logisticsInfra + s2.stats.buildingsUpgraded * 7),
    0,
    100
  );
  const economicGrowth = clamp(
    Math.round((industrialProduction * 0.38 + tradePerformance * 0.42 + employment * 0.2)),
    0,
    100
  );
  const publicSatisfaction = clamp(
    Math.round(
      workerWelfare * 0.34 +
        environmentalQuality * 0.34 +
        economicGrowth * 0.16 +
        infrastructureQuality * 0.16
    ),
    0,
    100
  );

  return {
    industrialProduction,
    employment,
    economicGrowth,
    tradePerformance,
    workerWelfare,
    environmentalQuality,
    infrastructureQuality,
    publicSatisfaction,
  };
}

export function getIndustrialBalanceLevel(m: IndustrialBalanceMetrics): {
  label: string;
  tone: 'emerald' | 'amber' | 'rose';
  average: number;
} {
  const avg = Math.round(
    (m.industrialProduction +
      m.employment +
      m.economicGrowth +
      m.tradePerformance +
      m.workerWelfare +
      m.environmentalQuality +
      m.infrastructureQuality +
      m.publicSatisfaction) /
      8
  );
  if (m.environmentalQuality < 40 || m.workerWelfare < 42) {
    return { label: 'Ketimpangan / Polusi Tinggi', tone: 'rose', average: avg };
  }
  if (avg >= 72 && m.environmentalQuality >= 60 && m.workerWelfare >= 62) {
    return { label: 'Kota Industri Seimbang & Tangguh', tone: 'emerald', average: avg };
  }
  return { label: 'Industri Berkembang (Perlu Penyeimbang)', tone: 'amber', average: avg };
}

function evaluateStage2Achievements(state: MultiStageWorldState): MultiStageWorldState {
  const s2 = state.stage2;
  const newlyUnlocked: string[] = [];
  const check = (id: string, cond: boolean) => {
    if (cond && !s2.achievements.includes(id)) newlyUnlocked.push(id);
  };

  check('s2-ach-explorer', s2.discoveredDistricts.length >= STAGE2_DISTRICTS.length);
  check('s2-ach-producer', s2.totalProducedUnits >= 1);
  check(
    's2-ach-supply-chain',
    s2.completedDeliveries.includes('s2-del-gudang') &&
      s2.completedDeliveries.includes('s2-del-grosir')
  );
  check(
    's2-ach-worker-ally',
    s2.quests['s2-q-main-4']?.status === 'completed' && s2.industrialMetrics.workerWelfare >= 60
  );
  check(
    's2-ach-eco-guardian',
    s2.quests['s2-q-main-6']?.status === 'completed' && s2.industrialMetrics.environmentalQuality >= 58
  );
  check('s2-ach-fleet-driver', s2.stats.vehiclesDriven >= 1);
  check('s2-ach-industrial-builder', s2.stats.buildingsBuilt >= 2 && s2.stats.buildingsUpgraded >= 1);

  const allMainDone = STAGE2_QUESTS.filter((q) => q.kind === 'main').every(
    (q) => s2.quests[q.id]?.status === 'completed'
  );
  check('s2-ach-hero', allMainDone);

  if (newlyUnlocked.length === 0) return state;

  let xpSum = 0;
  let coinSum = 0;
  const titles: string[] = [];
  for (const id of newlyUnlocked) {
    const def = STAGE2_ACHIEVEMENTS.find((a) => a.id === id);
    if (def) {
      xpSum += def.xpReward;
      coinSum += def.coinReward;
      titles.push(def.title);
    }
  }

  const nextS1 = addXpAndCoins(state.stage1, xpSum, coinSum);
  return withGlobalNotif(
    {
      ...state,
      stage1: nextS1,
      stage2: {
        ...s2,
        achievements: [...s2.achievements, ...newlyUnlocked],
      },
    },
    'success',
    `Pencapaian Stage 2 Terbuka: ${titles.join(', ')} (+${xpSum} XP, +${coinSum} Koin)`
  );
}

export function triggerStage2QuestEvent(
  state: MultiStageWorldState,
  eventType: Stage2QuestEventType,
  targetId: string
): MultiStageWorldState {
  let next = state;
  let updated = false;

  for (const qDef of STAGE2_QUESTS) {
    const prog = next.stage2.quests[qDef.id];
    if (!prog || prog.status !== 'active') continue;
    const step = qDef.steps[prog.stepIndex];
    if (!step) continue;

    const matchTarget = step.targetId === '*' || step.targetId === targetId;
    if (step.eventType !== eventType || !matchTarget) continue;

    if (
      step.requiredItemToConsume &&
      !hasInventoryItem(next.stage1.inventory, step.requiredItemToConsume)
    ) {
      continue;
    }

    let nextInventory = next.stage1.inventory;
    if (step.requiredItemToConsume) {
      nextInventory = removeItemFromInventory(nextInventory, step.requiredItemToConsume, 1);
    }

    const nextStepIdx = prog.stepIndex + 1;
    if (nextStepIdx >= qDef.steps.length) {
      if (qDef.rewards.itemId) {
        nextInventory = addItemToInventory(
          nextInventory,
          qDef.rewards.itemId,
          qDef.rewards.itemQty ?? 1
        );
      }

      const granted = grantGlobalCustomizations(
        { ...next, stage1: { ...next.stage1, inventory: nextInventory } },
        qDef.rewards.unlockCustomizationIds ?? []
      );
      next = granted.nextState;

      let unlockedBlueprints = next.stage1.unlockedBlueprints;
      let unlockedBlueprintId: string | undefined;
      if (
        qDef.rewards.unlockBlueprintId &&
        !unlockedBlueprints.includes(qDef.rewards.unlockBlueprintId)
      ) {
        unlockedBlueprints = [...unlockedBlueprints, qDef.rewards.unlockBlueprintId];
        unlockedBlueprintId = qDef.rewards.unlockBlueprintId;
      }

      let unlockedTitles = next.stage1.unlockedTitles;
      let unlockedTitleId: string | undefined;
      if (qDef.rewards.unlockTitleId && !unlockedTitles.includes(qDef.rewards.unlockTitleId)) {
        unlockedTitles = [...unlockedTitles, qDef.rewards.unlockTitleId];
        unlockedTitleId = qDef.rewards.unlockTitleId;
      }

      const nextQuests: Record<string, QuestProgress> = {
        ...next.stage2.quests,
        [qDef.id]: { status: 'completed', stepIndex: qDef.steps.length },
      };

      const allMainDone = STAGE2_QUESTS.filter((q) => q.kind === 'main').every(
        (q) => nextQuests[q.id]?.status === 'completed'
      );
      if (allMainDone && !unlockedTitles.includes('title-arsitek-industri')) {
        unlockedTitles = [...unlockedTitles, 'title-arsitek-industri'];
        unlockedTitleId = unlockedTitleId ?? 'title-arsitek-industri';
      }

      let nextTracked = next.stage2.trackedQuestId;
      if (qDef.kind === 'main') {
        const nextMain = STAGE2_QUESTS.find(
          (q) =>
            q.kind === 'main' &&
            q.order === qDef.order + 1 &&
            nextQuests[q.id]?.status === 'available'
        );
        if (nextMain) {
          nextQuests[nextMain.id] = { status: 'active', stepIndex: 0 };
          nextTracked = nextMain.id;
        } else {
          const anyActive = Object.entries(nextQuests).find(([, p]) => p.status === 'active');
          nextTracked = anyActive ? anyActive[0] : null;
        }
      } else if (nextTracked === qDef.id) {
        const anyActive = Object.entries(nextQuests).find(([, p]) => p.status === 'active');
        nextTracked = anyActive ? anyActive[0] : null;
      }

      const updatedS2: Stage2OpenWorldState = {
        ...next.stage2,
        quests: nextQuests,
        trackedQuestId: nextTracked,
        reputation: clamp(next.stage2.reputation + qDef.rewards.reputation, 0, 100),
        happiness: clamp(next.stage2.happiness + qDef.rewards.happiness, 0, 100),
        welfare: clamp(next.stage2.welfare + qDef.rewards.welfare, 0, 100),
        score: clamp(next.stage2.score + 12, 0, 500),
        stats: {
          ...next.stage2.stats,
          questsCompleted: next.stage2.stats.questsCompleted + 1,
        },
      };
      updatedS2.industrialMetrics = recalculateIndustrialMetrics(updatedS2);

      const withXpS1 = addXpAndCoins(
        {
          ...next.stage1,
          unlockedBlueprints,
          unlockedTitles,
        },
        qDef.rewards.xp,
        qDef.rewards.coins
      );

      const celebration: RewardCelebrationPayload = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        sourceTitle: qDef.title,
        sourceKind: 'quest',
        xp: qDef.rewards.xp,
        coins: qDef.rewards.coins,
        unlockedCustomizationIds: granted.newlyUnlocked,
        unlockedBlueprintId,
        unlockedTitleId,
        unlockedItemId: qDef.rewards.itemId,
        unlockedItemQty: qDef.rewards.itemQty,
      };

      next = withGlobalNotif(
        {
          ...next,
          stage1: {
            ...withXpS1,
            lastRewardCelebration: celebration,
          },
          stage2: updatedS2,
        },
        'success',
        `Misi Stage 2 Selesai: ${qDef.title}! (+${qDef.rewards.xp} XP, +${qDef.rewards.coins} Koin)`
      );
      updated = true;
    } else {
      next = withGlobalNotif(
        {
          ...next,
          stage1: { ...next.stage1, inventory: nextInventory },
          stage2: {
            ...next.stage2,
            quests: {
              ...next.stage2.quests,
              [qDef.id]: { status: 'active', stepIndex: nextStepIdx },
            },
          },
        },
        'info',
        `Tahap Misi Selesai! Lanjut: ${qDef.steps[nextStepIdx].description}`
      );
      updated = true;
    }
  }

  return updated ? evaluateStage2Achievements(next) : next;
}

export function discoverStage2District(
  state: MultiStageWorldState,
  districtId: Stage2DistrictId
): MultiStageWorldState {
  let next = state;
  if (!state.stage2.discoveredDistricts.includes(districtId)) {
    const def = STAGE2_DISTRICTS.find((d) => d.id === districtId);
    const xp = def?.discoveryXp ?? 40;
    const nextS1 = addXpAndCoins(state.stage1, xp, 30);
    next = withGlobalNotif(
      {
        ...state,
        stage1: nextS1,
        stage2: {
          ...state.stage2,
          discoveredDistricts: [...state.stage2.discoveredDistricts, districtId],
        },
      },
      'info',
      `Kawasan Stage 2 Ditemukan: ${def?.name ?? districtId}! (+${xp} XP)`
    );
  }
  next = triggerStage2QuestEvent(next, 'visit_district', districtId);
  return evaluateStage2Achievements(next);
}

export function acceptStage2Quest(
  state: MultiStageWorldState,
  questId: string
): MultiStageWorldState {
  const existing = state.stage2.quests[questId];
  const def = STAGE2_QUESTS.find((q) => q.id === questId);
  if (!def || !existing || existing.status !== 'available') return state;
  return withGlobalNotif(
    {
      ...state,
      stage2: {
        ...state.stage2,
        quests: {
          ...state.stage2.quests,
          [questId]: { status: 'active', stepIndex: 0 },
        },
        trackedQuestId: questId,
      },
    },
    'info',
    `Misi Stage 2 Dimulai: ${def.title}`
  );
}

export function collectStage2Pickup(
  state: MultiStageWorldState,
  pickupId: string
): MultiStageWorldState {
  if (state.stage2.collectedPickups.includes(pickupId)) return state;
  const def = STAGE2_WORLD_PICKUPS.find((p) => p.id === pickupId);
  if (!def) return state;

  const nextInv = addItemToInventory(state.stage1.inventory, def.itemId, 1);
  const nextS1 = addXpAndCoins({ ...state.stage1, inventory: nextInv }, 30, 20);
  let next = withGlobalNotif(
    {
      ...state,
      stage1: nextS1,
      stage2: {
        ...state.stage2,
        collectedPickups: [...state.stage2.collectedPickups, pickupId],
      },
    },
    'success',
    `Diambil: ${def.label} (+30 XP)`
  );
  next = triggerStage2QuestEvent(next, 'collect_item', def.itemId);
  return evaluateStage2Achievements(next);
}

export function buyStage2Supply(
  state: MultiStageWorldState,
  itemId: string
): MultiStageWorldState {
  const offer = STAGE2_MARKET_SUPPLIES.find((o) => o.itemId === itemId);
  if (!offer) return state;
  if (state.stage1.coins < offer.costCoins) {
    return withGlobalNotif(
      state,
      'error',
      `Butuh ${offer.costCoins} Koin untuk membeli ${offer.name}.`
    );
  }
  const nextInv = addItemToInventory(state.stage1.inventory, offer.itemId, offer.qty);
  let next = withGlobalNotif(
    {
      ...state,
      stage1: {
        ...state.stage1,
        coins: state.stage1.coins - offer.costCoins,
        inventory: nextInv,
      },
    },
    'success',
    `Membeli ${offer.name} (${offer.qty}x) seharga ${offer.costCoins} Koin.`
  );
  next = triggerStage2QuestEvent(next, 'collect_item', offer.itemId);
  return next;
}

export function collectStage2Artifact(
  state: MultiStageWorldState,
  collectibleId: string
): MultiStageWorldState {
  if (state.stage2.collectibles.includes(collectibleId)) return state;
  const def = STAGE2_COLLECTIBLES.find((c) => c.id === collectibleId);
  if (!def) return state;

  const nextCollectibles = [...state.stage2.collectibles, collectibleId];
  const nextCount = nextCollectibles.length;

  const directUnlocks: string[] = [];
  const claimedMilestones = [...state.stage2.claimedMilestones];
  let unlockedBlueprints = [...state.stage1.unlockedBlueprints];
  let unlockedTitles = [...state.stage1.unlockedTitles];
  let milestoneXp = 0;
  let milestoneCoins = 0;
  let milestoneSummary = '';
  let milestoneBlueprint: string | undefined;
  let milestoneTitleUnlock: string | undefined;

  for (const m of STAGE2_COLLECTION_MILESTONES) {
    if (nextCount >= m.requiredCount && !claimedMilestones.includes(m.id)) {
      claimedMilestones.push(m.id);
      milestoneXp += m.xpReward;
      milestoneCoins += m.coinReward;
      milestoneSummary = m.title;
      if (m.unlockCustomizationIds) directUnlocks.push(...m.unlockCustomizationIds);
      if (m.unlockBlueprintId && !unlockedBlueprints.includes(m.unlockBlueprintId)) {
        unlockedBlueprints.push(m.unlockBlueprintId);
        milestoneBlueprint = m.unlockBlueprintId;
      }
      if (m.unlockTitleId && !unlockedTitles.includes(m.unlockTitleId)) {
        unlockedTitles.push(m.unlockTitleId);
        milestoneTitleUnlock = m.unlockTitleId;
      }
    }
  }

  const granted = grantGlobalCustomizations(state, directUnlocks);
  let nextState = granted.nextState;
  const nextS1 = addXpAndCoins(
    {
      ...nextState.stage1,
      unlockedBlueprints,
      unlockedTitles,
    },
    def.xpReward + milestoneXp,
    def.coinReward + milestoneCoins
  );

  const nextS2: Stage2OpenWorldState = {
    ...nextState.stage2,
    collectibles: nextCollectibles,
    claimedMilestones,
    score: clamp(nextState.stage2.score + 8, 0, 500),
    stats: {
      ...nextState.stage2.stats,
      collectiblesFound: nextCount,
    },
  };
  nextS2.industrialMetrics = recalculateIndustrialMetrics(nextS2);

  nextState = {
    ...nextState,
    stage1: milestoneSummary
      ? {
          ...nextS1,
          lastRewardCelebration: {
            id: Date.now() + Math.floor(Math.random() * 10000),
            sourceTitle: `Milestone Stage 2: ${milestoneSummary}`,
            sourceKind: 'milestone',
            xp: def.xpReward + milestoneXp,
            coins: def.coinReward + milestoneCoins,
            unlockedCustomizationIds: granted.newlyUnlocked,
            unlockedBlueprintId: milestoneBlueprint,
            unlockedTitleId: milestoneTitleUnlock,
          },
        }
      : nextS1,
    stage2: nextS2,
  };

  nextState = withGlobalNotif(
    nextState,
    'success',
    milestoneSummary
      ? `${def.name} & Milestone ${milestoneSummary} terbuka!`
      : `Koleksi Era Industri ${def.rarity}: ${def.name} ditemukan! (+${def.xpReward} XP)`
  );
  nextState = triggerStage2QuestEvent(nextState, 'collect_artifact', collectibleId);
  return evaluateStage2Achievements(nextState);
}

export function startStage2Production(
  state: MultiStageWorldState,
  recipeId: string
): MultiStageWorldState {
  const recipe = STAGE2_PRODUCTION_RECIPES.find((r) => r.id === recipeId);
  if (!recipe) return state;

  const activeForFactory = state.stage2.productionOrders.find(
    (o) => o.factoryId === recipe.factoryId && !o.completed
  );
  if (activeForFactory) {
    return withGlobalNotif(
      state,
      'warning',
      `${recipe.factoryName} sedang memproses produksi! Tunggu sebentar.`
    );
  }

  const slot = state.stage1.inventory.find((s) => s.itemId === recipe.inputItemId);
  if (!slot || slot.qty < recipe.inputQty) {
    const inputDef = getItemDefById(recipe.inputItemId);
    return withGlobalNotif(
      state,
      'warning',
      `Bahan baku kurang! Butuh ${recipe.inputQty}x ${inputDef?.name ?? recipe.inputItemId}.`
    );
  }

  const nextInv = removeItemFromInventory(state.stage1.inventory, recipe.inputItemId, recipe.inputQty);
  const order: ProductionOrderState = {
    id: `ord-${Date.now()}-${state.stage2.productionOrders.length + 1}`,
    recipeId: recipe.id,
    factoryId: recipe.factoryId,
    progress: 0.05,
    completed: false,
  };

  let next = withGlobalNotif(
    {
      ...state,
      stage1: { ...state.stage1, inventory: nextInv },
      stage2: {
        ...state.stage2,
        productionOrders: [...state.stage2.productionOrders, order],
      },
    },
    'info',
    `Produksi dimulai: ${recipe.name} di ${recipe.factoryName}!`
  );
  next = triggerStage2QuestEvent(next, 'start_production', recipe.id);
  return evaluateStage2Achievements(next);
}

export function tickStage2Production(
  state: MultiStageWorldState,
  dtSeconds: number
): MultiStageWorldState {
  const hasActive = state.stage2.productionOrders.some((o) => !o.completed);
  if (!hasActive) return state;

  // Built factories & upgrades speed up manufacturing output cleanly
  const builtFactories = state.stage2.placedBuildings.filter(
    (b) =>
      !b.isConstructing &&
      ['pabrik-tekstil', 'pabrik-pangan', 'pabrik-industri', 'pabrik-elektronik'].includes(
        b.buildingId
      )
  );
  const speedMult = 1 + builtFactories.length * 0.14;
  let anyJustCompleted = false;

  const updatedOrders = state.stage2.productionOrders.map((ord) => {
    if (ord.completed) return ord;
    const recipe = STAGE2_PRODUCTION_RECIPES.find((r) => r.id === ord.recipeId);
    const dur = recipe?.durationSeconds ?? 7;
    const nextProg = Math.min(1, ord.progress + (dtSeconds * speedMult) / dur);
    if (nextProg >= 1) {
      anyJustCompleted = true;
      return { ...ord, progress: 1, completed: true };
    }
    return { ...ord, progress: nextProg };
  });

  const nextState: MultiStageWorldState = {
    ...state,
    stage2: {
      ...state.stage2,
      productionOrders: updatedOrders,
    },
  };
  return anyJustCompleted
    ? withGlobalNotif(nextState, 'success', 'Produksi Pabrik selesai! Ambil barang jadi di Panel Mesin [E].')
    : nextState;
}

export function collectStage2Production(
  state: MultiStageWorldState,
  orderId: string
): MultiStageWorldState {
  const ord = state.stage2.productionOrders.find((o) => o.id === orderId);
  if (!ord || !ord.completed) return state;
  const recipe = STAGE2_PRODUCTION_RECIPES.find((r) => r.id === ord.recipeId);
  if (!recipe) return state;

  const nextInv = addItemToInventory(state.stage1.inventory, recipe.outputItemId, recipe.outputQty);
  const nextS1 = addXpAndCoins({ ...state.stage1, inventory: nextInv }, recipe.xpReward, 0);

  const nextS2: Stage2OpenWorldState = {
    ...state.stage2,
    productionOrders: state.stage2.productionOrders.filter((o) => o.id !== orderId),
    totalProducedUnits: state.stage2.totalProducedUnits + recipe.outputQty,
    score: clamp(state.stage2.score + 6, 0, 500),
  };
  nextS2.industrialMetrics = recalculateIndustrialMetrics(nextS2);

  const outDef = getItemDefById(recipe.outputItemId);
  let next = withGlobalNotif(
    {
      ...state,
      stage1: nextS1,
      stage2: nextS2,
    },
    'success',
    `Diambil: ${recipe.outputQty}x ${outDef?.name ?? recipe.outputItemId} (+${recipe.xpReward} XP)`
  );
  next = triggerStage2QuestEvent(next, 'collect_production', recipe.id);
  return evaluateStage2Achievements(next);
}

export function deliverOrSellStage2(
  state: MultiStageWorldState,
  spotId: string
): MultiStageWorldState {
  const spot = STAGE2_DELIVERY_SPOTS.find((s) => s.id === spotId);
  if (!spot) return state;

  const matchedItemId = spot.acceptedItemIds.find((id) => hasInventoryItem(state.stage1.inventory, id));
  if (!matchedItemId) {
    const names = spot.acceptedItemIds.map((id) => getItemDefById(id)?.name ?? id).join(' atau ');
    return withGlobalNotif(
      state,
      'warning',
      `Kamu perlu membawa ${names} terlebih dahulu sebelum bertransaksi di sini.`
    );
  }

  const nextInv = removeItemFromInventory(state.stage1.inventory, matchedItemId, 1);
  const isCommercialSale = spot.id === 's2-del-grosir';
  const isWarehouse = spot.id === 's2-del-gudang';
  const isLimbah = spot.id === 's2-del-limbah';
  const isKlinik = spot.id === 's2-del-klinik';

  const completedDeliveries = state.stage2.completedDeliveries.includes(spotId)
    ? state.stage2.completedDeliveries
    : [...state.stage2.completedDeliveries, spotId];

  const nextS2: Stage2OpenWorldState = {
    ...state.stage2,
    completedDeliveries,
    bioFilterInstalledCount: isLimbah
      ? state.stage2.bioFilterInstalledCount + 1
      : state.stage2.bioFilterInstalledCount,
    totalSoldUnits:
      isCommercialSale || isWarehouse
        ? state.stage2.totalSoldUnits + 1
        : state.stage2.totalSoldUnits,
    welfare: clamp(state.stage2.welfare + (isKlinik ? 14 : 4), 0, 100),
    happiness: clamp(state.stage2.happiness + (isLimbah || isKlinik ? 10 : 5), 0, 100),
    reputation: clamp(state.stage2.reputation + 6, 0, 100),
    score: clamp(state.stage2.score + 8, 0, 500),
  };
  nextS2.industrialMetrics = recalculateIndustrialMetrics(nextS2);

  const nextS1 = addXpAndCoins({ ...state.stage1, inventory: nextInv }, 55, spot.sellRewardCoins);
  const itemDef = getItemDefById(matchedItemId);

  let next = withGlobalNotif(
    {
      ...state,
      stage1: nextS1,
      stage2: nextS2,
    },
    'success',
    isCommercialSale
      ? `Terjual ke Pasar Grosir: ${itemDef?.name ?? matchedItemId} (+${spot.sellRewardCoins} Koin, +55 XP)!`
      : `Berhasil diserahkan: ${itemDef?.name ?? matchedItemId} di ${spot.label}!`
  );

  next = triggerStage2QuestEvent(next, isCommercialSale ? 'sell_goods' : 'deliver_item', spotId);
  return evaluateStage2Achievements(next);
}

export function startStage2BuildingConstruction(
  state: MultiStageWorldState,
  buildingId: string,
  x: number,
  z: number,
  rotationY: number
): MultiStageWorldState {
  const def = BUILDING_CATALOG.find((b) => b.id === buildingId);
  if (!def) return state;
  if (def.minStage > 2) {
    return withGlobalNotif(
      state,
      'warning',
      `${def.name} baru tersedia pada Stage 3: Kota Digital Tanpa Batas (Terkunci).`
    );
  }
  if (def.requiresBlueprintUnlock && !state.stage1.unlockedBlueprints.includes(def.id)) {
    return withGlobalNotif(
      state,
      'warning',
      `Cetak biru ${def.name} masih terkunci! ${def.unlockHint ?? 'Selesaikan misi terlebih dahulu.'}`
    );
  }
  if (state.stage1.coins < def.cost) {
    return withGlobalNotif(state, 'error', `Koin tidak cukup! Butuh ${def.cost} Koin untuk ${def.name}.`);
  }

  const instance: PlacedBuildingInstance = {
    id: `s2-binst-${Date.now()}-${state.stage2.placedBuildings.length + 1}`,
    buildingId: def.id,
    x: Number(x.toFixed(2)),
    z: Number(z.toFixed(2)),
    rotationY,
    level: 1,
    constructionProgress: 0.08,
    isConstructing: true,
    builtAtMs: Date.now(),
  };

  return withGlobalNotif(
    {
      ...state,
      stage1: { ...state.stage1, coins: state.stage1.coins - def.cost },
      stage2: {
        ...state.stage2,
        placedBuildings: [...state.stage2.placedBuildings, instance],
      },
    },
    'info',
    `Konstruksi ${def.name} di Kota Industri dimulai!`
  );
}

function finalizeStage2CompletedBuildings(
  state: MultiStageWorldState,
  buildingIds: string[]
): MultiStageWorldState {
  let next = state;
  for (const bId of buildingIds) {
    const def = BUILDING_CATALOG.find((b) => b.id === bId || b.name === bId);
    if (!def) continue;
    const nextS1 = addXpAndCoins(next.stage1, 75, 0);
    const nextS2: Stage2OpenWorldState = {
      ...next.stage2,
      score: clamp(next.stage2.score + def.effects.scoreBonus, 0, 500),
      reputation: clamp(next.stage2.reputation + 5, 0, 100),
      happiness: clamp(next.stage2.happiness + Math.max(2, Math.floor(def.effects.hpKota / 2)), 0, 100),
      welfare: clamp(next.stage2.welfare + (def.category === 'masyarakat' ? 8 : 3), 0, 100),
      stats: {
        ...next.stage2.stats,
        buildingsBuilt: next.stage2.stats.buildingsBuilt + 1,
      },
    };
    nextS2.industrialMetrics = recalculateIndustrialMetrics(nextS2);
    next = withGlobalNotif(
      { ...next, stage1: nextS1, stage2: nextS2 },
      'success',
      `${def.name} selesai dibangun dan beroperasi di Stage 2! (+75 XP)`
    );
    next = triggerStage2QuestEvent(next, 'build_facility', def.id);
  }
  return evaluateStage2Achievements(next);
}

export function tickStage2BuildingConstructions(
  state: MultiStageWorldState,
  dtSeconds: number
): MultiStageWorldState {
  const constructing = state.stage2.placedBuildings.some((b) => b.isConstructing);
  if (!constructing) return state;

  const rate = 1 / 10;
  const completedIds: string[] = [];
  const updated = state.stage2.placedBuildings.map((b) => {
    if (!b.isConstructing) return b;
    const prog = Math.min(1, b.constructionProgress + dtSeconds * rate);
    if (prog >= 1) {
      completedIds.push(b.buildingId);
      return { ...b, constructionProgress: 1, isConstructing: false };
    }
    return { ...b, constructionProgress: prog };
  });

  const next: MultiStageWorldState = {
    ...state,
    stage2: { ...state.stage2, placedBuildings: updated },
  };
  return completedIds.length > 0 ? finalizeStage2CompletedBuildings(next, completedIds) : next;
}

export function upgradeStage2PlacedBuilding(
  state: MultiStageWorldState,
  instanceId: string
): MultiStageWorldState {
  const target = state.stage2.placedBuildings.find((b) => b.id === instanceId);
  if (!target || target.isConstructing || target.level >= 3) return state;
  const def = BUILDING_CATALOG.find((b) => b.id === target.buildingId);
  if (!def) return state;

  const upgradeCost = Math.round(def.cost * (target.level === 1 ? 0.75 : 1.15));
  if (state.stage1.coins < upgradeCost) {
    return withGlobalNotif(
      state,
      'error',
      `Butuh ${upgradeCost} Koin untuk meningkatkan ${def.name} ke Level ${target.level + 1}.`
    );
  }

  const nextLevel = (target.level + 1) as 2 | 3;
  const nextS1 = addXpAndCoins(
    { ...state.stage1, coins: state.stage1.coins - upgradeCost },
    80,
    0
  );
  const nextS2: Stage2OpenWorldState = {
    ...state.stage2,
    placedBuildings: state.stage2.placedBuildings.map((b) =>
      b.id === instanceId ? { ...b, level: nextLevel } : b
    ),
    score: clamp(state.stage2.score + 10, 0, 500),
    reputation: clamp(state.stage2.reputation + 5, 0, 100),
    happiness: clamp(state.stage2.happiness + 5, 0, 100),
    stats: {
      ...state.stage2.stats,
      buildingsUpgraded: state.stage2.stats.buildingsUpgraded + 1,
    },
  };
  nextS2.industrialMetrics = recalculateIndustrialMetrics(nextS2);

  let next = withGlobalNotif(
    { ...state, stage1: nextS1, stage2: nextS2 },
    'success',
    `${def.name} ditingkatkan ke Level ${nextLevel}! (+80 XP)`
  );
  next = triggerStage2QuestEvent(next, 'upgrade_facility', def.id);
  return evaluateStage2Achievements(next);
}

export function calculateStage2Income(state: MultiStageWorldState): number {
  let income = 24;
  for (const inst of state.stage2.placedBuildings) {
    if (inst.isConstructing) continue;
    const def = BUILDING_CATALOG.find((b) => b.id === inst.buildingId);
    if (!def) continue;
    const mult = inst.level === 1 ? 1 : inst.level === 2 ? 1.55 : 2.15;
    income += Math.round(def.effects.incomePerTick * mult);
  }
  return income;
}

export function calculateStage3Income(state: MultiStageWorldState): number {
  let income = 42;
  for (const inst of state.stage3.placedBuildings) {
    if (inst.isConstructing) continue;
    const def = BUILDING_CATALOG.find((b) => b.id === inst.buildingId);
    if (!def) continue;
    const mult = inst.level === 1 ? 1 : inst.level === 2 ? 1.6 : 2.25;
    income += Math.round(def.effects.incomePerTick * mult);
  }
  return income;
}

export function calculateMultiStageIncome(state: MultiStageWorldState): number {
  if (state.activeStage === 1) return calculateOpenWorldIncome(state.stage1);
  if (state.activeStage === 2) return calculateStage2Income(state);
  return calculateStage3Income(state);
}

export function recalculateSmartCityMetrics(s3: Stage3OpenWorldState): SmartCityMetrics {
  let ecoGrowthBoost = 0;
  let digitalBoost = 0;
  let employBoost = 0;
  let envBoost = 0;
  let renewBoost = 0;
  let transitBoost = 0;
  let rdBoost = 0;
  let infraBoost = 0;

  for (const inst of s3.placedBuildings) {
    if (inst.isConstructing) continue;
    const def = BUILDING_CATALOG.find((b) => b.id === inst.buildingId);
    if (!def) continue;
    const mult = inst.level === 1 ? 1 : inst.level === 2 ? 1.4 : 1.85;
    if (def.category === 'teknologi') {
      digitalBoost += 9 * mult;
      infraBoost += 7 * mult;
      if (def.id === 'pembangkit-surya') renewBoost += 14 * mult;
      if (def.id === 'lab-robotika' || def.id === 'pusat-teknologi') rdBoost += 12 * mult;
      if (def.id === 'hub-transit-otonom') transitBoost += 13 * mult;
    }
    if (def.category === 'perdagangan') {
      ecoGrowthBoost += 9 * mult;
      employBoost += 7 * mult;
      digitalBoost += 4 * mult;
    }
    if (def.category === 'industri') {
      ecoGrowthBoost += 8 * mult;
      employBoost += 9 * mult;
      envBoost -= 3 * mult;
    }
    if (def.category === 'masyarakat') {
      infraBoost += 7 * mult;
      envBoost += 6 * mult;
      if (def.id === 'apartemen-eko') renewBoost += 6 * mult;
    }
    if (def.category === 'budaya') {
      envBoost += 12 * mult;
      renewBoost += 6 * mult;
    }
  }

  for (const [kind, rawCount] of Object.entries(s3.activityCounts)) {
    const count = Math.min(4, rawCount ?? 0);
    const st = STAGE3_ACTIVITY_STATIONS.find((a) => a.kind === kind);
    if (!st || count <= 0) continue;
    ecoGrowthBoost += (st.metricEffects.economicGrowth ?? 0) * count * 0.65;
    digitalBoost += (st.metricEffects.digitalDevelopment ?? 0) * count * 0.65;
    employBoost += (st.metricEffects.employment ?? 0) * count * 0.65;
    envBoost += (st.metricEffects.environmentalQuality ?? 0) * count * 0.65;
    renewBoost += (st.metricEffects.renewableEnergy ?? 0) * count * 0.65;
    transitBoost += (st.metricEffects.transportationEfficiency ?? 0) * count * 0.65;
    rdBoost += (st.metricEffects.researchDevelopment ?? 0) * count * 0.65;
    infraBoost += (st.metricEffects.infrastructureQuality ?? 0) * count * 0.65;
  }

  const questDone = s3.stats.questsCompleted;
  const upgradeBonus = s3.stats.buildingsUpgraded * 5;
  const distBonus = s3.discoveredDistricts.length * 2;
  const delivBonus = s3.completedDeliveries.length * 4;

  const digitalDevelopment = clamp(Math.round(50 + digitalBoost + questDone * 2.5 + distBonus * 0.4), 0, 100);
  const renewableEnergy = clamp(Math.round(46 + renewBoost + s3.completedDeliveries.length * 3), 0, 100);
  const environmentalQuality = clamp(Math.round(58 + envBoost + renewableEnergy * 0.14), 5, 100);
  const transportationEfficiency = clamp(
    Math.round(50 + transitBoost + s3.stats.vehiclesDriven * 4 + s3.usedElevatorCount * 1.5),
    0,
    100
  );
  const researchDevelopment = clamp(
    Math.round(45 + rdBoost + s3.collectibles.length * 1.6 + questDone * 2),
    0,
    100
  );
  const infrastructureQuality = clamp(Math.round(54 + infraBoost + upgradeBonus + distBonus * 0.5), 0, 100);
  const employment = clamp(Math.round(50 + employBoost + questDone * 1.8 + delivBonus * 0.6), 0, 100);
  const economicGrowth = clamp(
    Math.round(46 + ecoGrowthBoost + delivBonus + digitalDevelopment * 0.12),
    0,
    100
  );
  const publicSatisfaction = clamp(
    Math.round(
      s3.happiness * 0.35 +
        environmentalQuality * 0.18 +
        infrastructureQuality * 0.18 +
        transportationEfficiency * 0.14 +
        economicGrowth * 0.15
    ),
    0,
    100
  );

  return {
    economicGrowth,
    digitalDevelopment,
    employment,
    publicSatisfaction,
    environmentalQuality,
    renewableEnergy,
    transportationEfficiency,
    researchDevelopment,
    infrastructureQuality,
  };
}

export function getSmartCityBalanceLevel(m: SmartCityMetrics): {
  label: string;
  tone: 'emerald' | 'amber' | 'rose';
  average: number;
} {
  const avg = Math.round(
    (m.economicGrowth +
      m.digitalDevelopment +
      m.employment +
      m.publicSatisfaction +
      m.environmentalQuality +
      m.renewableEnergy +
      m.transportationEfficiency +
      m.researchDevelopment +
      m.infrastructureQuality) /
      9
  );
  if (m.environmentalQuality < 42 || m.publicSatisfaction < 45) {
    return { label: 'Kesenjangan Digital / Tekanan Ekologis', tone: 'rose', average: avg };
  }
  if (avg >= 74 && m.renewableEnergy >= 62 && m.digitalDevelopment >= 66) {
    return { label: 'Metropolis Cerdas & Berkelanjutan', tone: 'emerald', average: avg };
  }
  return { label: 'Kota Digital Berkembang', tone: 'amber', average: avg };
}

function evaluateStage3Achievements(state: MultiStageWorldState): MultiStageWorldState {
  const s3 = state.stage3;
  const newlyUnlocked: string[] = [];
  const check = (id: string, cond: boolean) => {
    if (cond && !s3.achievements.includes(id)) newlyUnlocked.push(id);
  };

  check('ach-s3-arrive', state.activeStage === 3 || s3.discoveredDistricts.length >= 2);
  check('ach-s3-districts', s3.discoveredDistricts.length >= STAGE3_DISTRICTS.length);
  check('ach-s3-skyhigh', s3.usedElevatorCount >= 1);
  check('ach-s3-activities', s3.completedActivities.length >= 3);
  check('ach-s3-ev-driver', s3.stats.vehiclesDriven >= 1);
  check('ach-s3-builder', s3.stats.buildingsBuilt >= 3);

  const stage3CostumesUnlocked = CUSTOMIZATION_ITEMS.filter(
    (c) => c.stageTag === 3 && state.stage1.unlockedCustomizationIds.includes(c.id)
  ).length;
  check('ach-s3-costume-fan', stage3CostumesUnlocked >= 5);

  const allMainDone = STAGE3_QUESTS.filter((q) => q.kind === 'main').every(
    (q) => s3.quests[q.id]?.status === 'completed'
  );
  check('ach-s3-all-missions', allMainDone);

  if (newlyUnlocked.length === 0) return state;

  let xpSum = 0;
  let coinSum = 0;
  const titles: string[] = [];
  for (const id of newlyUnlocked) {
    const def = STAGE3_ACHIEVEMENTS.find((a) => a.id === id);
    if (def) {
      xpSum += def.xpReward;
      coinSum += def.coinReward;
      titles.push(def.title);
    }
  }

  const nextS1 = addXpAndCoins(state.stage1, xpSum, coinSum);
  return withGlobalNotif(
    {
      ...state,
      stage1: nextS1,
      stage3: {
        ...s3,
        achievements: [...s3.achievements, ...newlyUnlocked],
      },
    },
    'success',
    `Pencapaian Stage 3 Terbuka: ${titles.join(', ')} (+${xpSum} XP, +${coinSum} Koin)`
  );
}

export function triggerStage3QuestEvent(
  state: MultiStageWorldState,
  eventType: QuestEventType,
  targetId: string
): MultiStageWorldState {
  let next = state;
  let updated = false;

  for (const qDef of STAGE3_QUESTS) {
    const prog = next.stage3.quests[qDef.id];
    if (!prog || prog.status !== 'active') continue;
    const step = qDef.steps[prog.stepIndex];
    if (!step) continue;

    const matchTarget = step.targetId === '*' || step.targetId === targetId;
    if (step.eventType !== eventType || !matchTarget) continue;

    if (
      step.requiredItemToConsume &&
      !hasInventoryItem(next.stage1.inventory, step.requiredItemToConsume)
    ) {
      continue;
    }

    let nextInventory = next.stage1.inventory;
    if (step.requiredItemToConsume) {
      nextInventory = removeItemFromInventory(nextInventory, step.requiredItemToConsume, 1);
    }

    const nextStepIdx = prog.stepIndex + 1;
    if (nextStepIdx >= qDef.steps.length) {
      if (qDef.rewards.itemId) {
        nextInventory = addItemToInventory(
          nextInventory,
          qDef.rewards.itemId,
          qDef.rewards.itemQty ?? 1
        );
      }

      const granted = grantGlobalCustomizations(
        { ...next, stage1: { ...next.stage1, inventory: nextInventory } },
        qDef.rewards.unlockCustomizationIds ?? []
      );
      next = granted.nextState;

      let unlockedBlueprints = next.stage1.unlockedBlueprints;
      let unlockedBlueprintId: string | undefined;
      if (
        qDef.rewards.unlockBlueprintId &&
        !unlockedBlueprints.includes(qDef.rewards.unlockBlueprintId)
      ) {
        unlockedBlueprints = [...unlockedBlueprints, qDef.rewards.unlockBlueprintId];
        unlockedBlueprintId = qDef.rewards.unlockBlueprintId;
      }

      let unlockedTitles = next.stage1.unlockedTitles;
      let unlockedTitleId: string | undefined;
      if (qDef.rewards.unlockTitleId && !unlockedTitles.includes(qDef.rewards.unlockTitleId)) {
        unlockedTitles = [...unlockedTitles, qDef.rewards.unlockTitleId];
        unlockedTitleId = qDef.rewards.unlockTitleId;
      }

      const nextQuests: Record<string, QuestProgress> = {
        ...next.stage3.quests,
        [qDef.id]: { status: 'completed', stepIndex: qDef.steps.length },
      };

      const allMainDone = STAGE3_QUESTS.filter((q) => q.kind === 'main').every(
        (q) => nextQuests[q.id]?.status === 'completed'
      );
      if (allMainDone && !unlockedTitles.includes('title-penjaga-masa-depan')) {
        unlockedTitles = [...unlockedTitles, 'title-penjaga-masa-depan'];
        unlockedTitleId = unlockedTitleId ?? 'title-penjaga-masa-depan';
      }

      let nextTracked = next.stage3.trackedQuestId;
      if (qDef.kind === 'main') {
        const nextMain = STAGE3_QUESTS.find(
          (q) =>
            q.kind === 'main' &&
            q.order === qDef.order + 1 &&
            nextQuests[q.id]?.status === 'available'
        );
        if (nextMain) {
          nextQuests[nextMain.id] = { status: 'active', stepIndex: 0 };
          nextTracked = nextMain.id;
        } else {
          const anyActive = Object.entries(nextQuests).find(([, p]) => p.status === 'active');
          nextTracked = anyActive ? anyActive[0] : null;
        }
      } else if (nextTracked === qDef.id) {
        const anyActive = Object.entries(nextQuests).find(([, p]) => p.status === 'active');
        nextTracked = anyActive ? anyActive[0] : null;
      }

      const updatedS3: Stage3OpenWorldState = {
        ...next.stage3,
        quests: nextQuests,
        trackedQuestId: nextTracked,
        reputation: clamp(next.stage3.reputation + qDef.rewards.reputation, 0, 100),
        happiness: clamp(next.stage3.happiness + qDef.rewards.happiness, 0, 100),
        welfare: clamp(next.stage3.welfare + qDef.rewards.welfare, 0, 100),
        score: clamp(next.stage3.score + 16, 0, 600),
        stats: {
          ...next.stage3.stats,
          questsCompleted: next.stage3.stats.questsCompleted + 1,
        },
      };
      updatedS3.smartCityMetrics = recalculateSmartCityMetrics(updatedS3);

      const withXpS1 = addXpAndCoins(
        {
          ...next.stage1,
          unlockedBlueprints,
          unlockedTitles,
        },
        qDef.rewards.xp,
        qDef.rewards.coins
      );

      const celebration: RewardCelebrationPayload = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        sourceTitle: qDef.title,
        sourceKind: 'quest',
        xp: qDef.rewards.xp,
        coins: qDef.rewards.coins,
        unlockedCustomizationIds: granted.newlyUnlocked,
        unlockedBlueprintId,
        unlockedTitleId,
        unlockedItemId: qDef.rewards.itemId,
        unlockedItemQty: qDef.rewards.itemQty,
      };

      next = withGlobalNotif(
        {
          ...next,
          stage1: {
            ...withXpS1,
            lastRewardCelebration: celebration,
          },
          stage3: updatedS3,
        },
        'success',
        `Misi Stage 3 Selesai: ${qDef.title}! (+${qDef.rewards.xp} XP, +${qDef.rewards.coins} Koin)`
      );
      updated = true;
    } else {
      next = withGlobalNotif(
        {
          ...next,
          stage1: { ...next.stage1, inventory: nextInventory },
          stage3: {
            ...next.stage3,
            quests: {
              ...next.stage3.quests,
              [qDef.id]: { status: 'active', stepIndex: nextStepIdx },
            },
          },
        },
        'info',
        `Tahap Misi Selesai! Lanjut: ${qDef.steps[nextStepIdx].description}`
      );
      updated = true;
    }
  }

  return updated ? evaluateStage3Achievements(next) : next;
}

export function discoverStage3District(
  state: MultiStageWorldState,
  districtId: Stage3DistrictId
): MultiStageWorldState {
  let next = state;
  if (!state.stage3.discoveredDistricts.includes(districtId)) {
    const def = STAGE3_DISTRICTS.find((d) => d.id === districtId);
    const xp = def?.discoveryXp ?? 50;
    const nextS1 = addXpAndCoins(state.stage1, xp, 40);
    const nextS3: Stage3OpenWorldState = {
      ...state.stage3,
      discoveredDistricts: [...state.stage3.discoveredDistricts, districtId],
    };
    nextS3.smartCityMetrics = recalculateSmartCityMetrics(nextS3);
    next = withGlobalNotif(
      { ...state, stage1: nextS1, stage3: nextS3 },
      'info',
      `Distrik Stage 3 Ditemukan: ${def?.name ?? districtId}! (+${xp} XP)`
    );
  }
  next = triggerStage3QuestEvent(next, 'visit_district', districtId);
  return evaluateStage3Achievements(next);
}

export function acceptStage3Quest(
  state: MultiStageWorldState,
  questId: string
): MultiStageWorldState {
  const existing = state.stage3.quests[questId];
  const def = STAGE3_QUESTS.find((q) => q.id === questId);
  if (!def || !existing || existing.status !== 'available') return state;
  return withGlobalNotif(
    {
      ...state,
      stage3: {
        ...state.stage3,
        quests: {
          ...state.stage3.quests,
          [questId]: { status: 'active', stepIndex: 0 },
        },
        trackedQuestId: questId,
      },
    },
    'info',
    `Misi Stage 3 Dimulai: ${def.title}`
  );
}

export function collectStage3Pickup(
  state: MultiStageWorldState,
  pickupId: string
): MultiStageWorldState {
  if (state.stage3.collectedPickups.includes(pickupId)) return state;
  const def = STAGE3_WORLD_PICKUPS.find((p) => p.id === pickupId);
  if (!def) return state;

  const nextInv = addItemToInventory(state.stage1.inventory, def.itemId, 1);
  const nextS1 = addXpAndCoins({ ...state.stage1, inventory: nextInv }, 40, 30);
  let next = withGlobalNotif(
    {
      ...state,
      stage1: nextS1,
      stage3: {
        ...state.stage3,
        collectedPickups: [...state.stage3.collectedPickups, pickupId],
      },
    },
    'success',
    `Diambil: ${def.label} (+40 XP)`
  );
  next = triggerStage3QuestEvent(next, 'collect_item', def.itemId);
  return evaluateStage3Achievements(next);
}

export function buyStage3Supply(
  state: MultiStageWorldState,
  itemId: string
): MultiStageWorldState {
  const offer = STAGE3_MARKET_SUPPLIES.find((o) => o.itemId === itemId);
  if (!offer) return state;
  if (state.stage1.coins < offer.costCoins) {
    return withGlobalNotif(
      state,
      'error',
      `Butuh ${offer.costCoins} Koin untuk membeli ${offer.label}.`
    );
  }
  const nextInv = addItemToInventory(state.stage1.inventory, offer.itemId, 1);
  let next = withGlobalNotif(
    {
      ...state,
      stage1: {
        ...state.stage1,
        coins: state.stage1.coins - offer.costCoins,
        inventory: nextInv,
      },
    },
    'success',
    `Membeli ${offer.label} seharga ${offer.costCoins} Koin.`
  );
  next = triggerStage3QuestEvent(next, 'collect_item', offer.itemId);
  return evaluateStage3Achievements(next);
}

export function collectStage3Artifact(
  state: MultiStageWorldState,
  collectibleId: string
): MultiStageWorldState {
  if (state.stage3.collectibles.includes(collectibleId)) return state;
  const def = STAGE3_COLLECTIBLES.find((c) => c.id === collectibleId);
  if (!def) return state;

  const nextCollectibles = [...state.stage3.collectibles, collectibleId];
  const nextCount = nextCollectibles.length;

  const directUnlocks: string[] = [];
  const claimedMilestones = [...state.stage3.claimedMilestones];
  let unlockedBlueprints = [...state.stage1.unlockedBlueprints];
  let unlockedTitles = [...state.stage1.unlockedTitles];
  let milestoneXp = 0;
  let milestoneCoins = 0;
  let milestoneSummary = '';
  let milestoneBlueprint: string | undefined;
  let milestoneTitleUnlock: string | undefined;

  for (const m of STAGE3_COLLECTION_MILESTONES) {
    if (nextCount >= m.requiredCount && !claimedMilestones.includes(m.id)) {
      claimedMilestones.push(m.id);
      milestoneXp += m.xpReward;
      milestoneCoins += m.coinReward;
      milestoneSummary = m.title;
      if (m.unlockCustomizationIds) directUnlocks.push(...m.unlockCustomizationIds);
      if (m.unlockBlueprintId && !unlockedBlueprints.includes(m.unlockBlueprintId)) {
        unlockedBlueprints.push(m.unlockBlueprintId);
        milestoneBlueprint = m.unlockBlueprintId;
      }
      if (m.unlockTitleId && !unlockedTitles.includes(m.unlockTitleId)) {
        unlockedTitles.push(m.unlockTitleId);
        milestoneTitleUnlock = m.unlockTitleId;
      }
    }
  }

  const granted = grantGlobalCustomizations(state, directUnlocks);
  let nextState = granted.nextState;
  const nextS1 = addXpAndCoins(
    {
      ...nextState.stage1,
      unlockedBlueprints,
      unlockedTitles,
    },
    def.xpReward + milestoneXp,
    def.coinReward + milestoneCoins
  );

  const nextS3: Stage3OpenWorldState = {
    ...nextState.stage3,
    collectibles: nextCollectibles,
    claimedMilestones,
    score: clamp(nextState.stage3.score + 10, 0, 600),
    stats: {
      ...nextState.stage3.stats,
      collectiblesFound: nextCount,
    },
  };
  nextS3.smartCityMetrics = recalculateSmartCityMetrics(nextS3);

  nextState = {
    ...nextState,
    stage1: milestoneSummary
      ? {
          ...nextS1,
          lastRewardCelebration: {
            id: Date.now() + Math.floor(Math.random() * 10000),
            sourceTitle: `Milestone Stage 3: ${milestoneSummary}`,
            sourceKind: 'milestone',
            xp: def.xpReward + milestoneXp,
            coins: def.coinReward + milestoneCoins,
            unlockedCustomizationIds: granted.newlyUnlocked,
            unlockedBlueprintId: milestoneBlueprint,
            unlockedTitleId: milestoneTitleUnlock,
          },
        }
      : nextS1,
    stage3: nextS3,
  };

  nextState = withGlobalNotif(
    nextState,
    'success',
    milestoneSummary
      ? `${def.name} & Milestone ${milestoneSummary} terbuka!`
      : `Koleksi Kota Masa Depan (${def.rarity}): ${def.name} ditemukan! (+${def.xpReward} XP)`
  );
  nextState = triggerStage3QuestEvent(nextState, 'collect_artifact', collectibleId);
  return evaluateStage3Achievements(nextState);
}

export function performStage3Activity(
  state: MultiStageWorldState,
  stationId: string
): MultiStageWorldState {
  const station = STAGE3_ACTIVITY_STATIONS.find((s) => s.id === stationId || s.kind === stationId);
  if (!station) return state;

  let nextInv = state.stage1.inventory;
  if (station.outputItemId) {
    nextInv = addItemToInventory(nextInv, station.outputItemId, 1);
  }
  const nextS1 = addXpAndCoins({ ...state.stage1, inventory: nextInv }, station.rewardXp, station.rewardCoins);

  const completedActivities = state.stage3.completedActivities.includes(station.kind)
    ? state.stage3.completedActivities
    : [...state.stage3.completedActivities, station.kind];
  const prevCount = state.stage3.activityCounts[station.kind] ?? 0;

  const nextS3: Stage3OpenWorldState = {
    ...state.stage3,
    completedActivities,
    activityCounts: {
      ...state.stage3.activityCounts,
      [station.kind]: prevCount + 1,
    },
    happiness: clamp(state.stage3.happiness + 4, 0, 100),
    reputation: clamp(state.stage3.reputation + 4, 0, 100),
    score: clamp(state.stage3.score + 10, 0, 600),
  };
  nextS3.smartCityMetrics = recalculateSmartCityMetrics(nextS3);

  let next = withGlobalNotif(
    {
      ...state,
      stage1: nextS1,
      stage3: nextS3,
    },
    'success',
    `${station.name} berhasil dijalankan! (+${station.rewardCoins} Koin, +${station.rewardXp} XP)`
  );
  next = triggerStage3QuestEvent(next, 'complete_activity', station.kind);
  return evaluateStage3Achievements(next);
}

export function useStage3Elevator(
  state: MultiStageWorldState,
  padId: string
): MultiStageWorldState {
  const pad = STAGE3_ELEVATOR_PADS.find((p) => p.id === padId);
  if (!pad) return state;

  const nextS3: Stage3OpenWorldState = {
    ...state.stage3,
    usedElevatorCount: state.stage3.usedElevatorCount + 1,
    playerPos: {
      x: pad.destX,
      y: pad.toY,
      z: pad.destZ,
      facingYaw: state.stage3.playerPos.facingYaw,
    },
  };
  nextS3.smartCityMetrics = recalculateSmartCityMetrics(nextS3);

  let next = withGlobalNotif(
    { ...state, stage3: nextS3 },
    'info',
    `${pad.label}: ${pad.targetLabel}`
  );
  next = triggerStage3QuestEvent(next, 'use_elevator', pad.id);
  return evaluateStage3Achievements(next);
}

export function deliverOrSellStage3(
  state: MultiStageWorldState,
  spotId: string
): MultiStageWorldState {
  const spot = STAGE3_DELIVERY_SPOTS.find((s) => s.id === spotId);
  if (!spot) return state;

  const matched = spot.acceptedItems.find((a) => hasInventoryItem(state.stage1.inventory, a.itemId));
  if (!matched) {
    const names = spot.acceptedItems.map((a) => getItemDefById(a.itemId)?.name ?? a.itemId).join(' atau ');
    return withGlobalNotif(
      state,
      'warning',
      `Kamu perlu membawa ${names} terlebih dahulu sebelum menyetor ke ${spot.label}.`
    );
  }

  const nextInv = removeItemFromInventory(state.stage1.inventory, matched.itemId, 1);
  const completedDeliveries = state.stage3.completedDeliveries.includes(spotId)
    ? state.stage3.completedDeliveries
    : [...state.stage3.completedDeliveries, spotId];
  const nextS1 = addXpAndCoins({ ...state.stage1, inventory: nextInv }, matched.xpReward, matched.payoutCoins);
  const nextS3: Stage3OpenWorldState = {
    ...state.stage3,
    completedDeliveries,
    reputation: clamp(state.stage3.reputation + 5, 0, 100),
    welfare: clamp(state.stage3.welfare + 4, 0, 100),
    score: clamp(state.stage3.score + 8, 0, 600),
  };
  nextS3.smartCityMetrics = recalculateSmartCityMetrics(nextS3);

  const itemDef = getItemDefById(matched.itemId);
  let next = withGlobalNotif(
    { ...state, stage1: nextS1, stage3: nextS3 },
    'success',
    `Disetorkan ke ${spot.label}: ${itemDef?.name ?? matched.itemId} (+${matched.payoutCoins} Koin, +${matched.xpReward} XP)`
  );
  next = triggerStage3QuestEvent(next, 'deliver_item', spotId);
  return evaluateStage3Achievements(next);
}

export function startStage3BuildingConstruction(
  state: MultiStageWorldState,
  buildingId: string,
  x: number,
  z: number,
  rotationY: number
): MultiStageWorldState {
  const def = BUILDING_CATALOG.find((b) => b.id === buildingId);
  if (!def) return state;
  if (def.requiresBlueprintUnlock && !state.stage1.unlockedBlueprints.includes(def.id)) {
    return withGlobalNotif(
      state,
      'warning',
      `Cetak biru ${def.name} masih terkunci! ${def.unlockHint ?? 'Selesaikan misi atau koleksi terlebih dahulu.'}`
    );
  }
  if (state.stage1.coins < def.cost) {
    return withGlobalNotif(state, 'error', `Koin tidak cukup! Butuh ${def.cost} Koin untuk ${def.name}.`);
  }

  const instance: PlacedBuildingInstance = {
    id: `s3-binst-${Date.now()}-${state.stage3.placedBuildings.length + 1}`,
    buildingId: def.id,
    x: Number(x.toFixed(2)),
    z: Number(z.toFixed(2)),
    rotationY,
    level: 1,
    constructionProgress: 0.1,
    isConstructing: true,
    builtAtMs: Date.now(),
  };

  return withGlobalNotif(
    {
      ...state,
      stage1: { ...state.stage1, coins: state.stage1.coins - def.cost },
      stage3: {
        ...state.stage3,
        placedBuildings: [...state.stage3.placedBuildings, instance],
      },
    },
    'info',
    `Konstruksi ${def.name} di Kota Digital dimulai!`
  );
}

function finalizeStage3CompletedBuildings(
  state: MultiStageWorldState,
  buildingIds: string[]
): MultiStageWorldState {
  let next = state;
  for (const bId of buildingIds) {
    const def = BUILDING_CATALOG.find((b) => b.id === bId || b.name === bId);
    if (!def) continue;
    const nextS1 = addXpAndCoins(next.stage1, 90, 0);
    const nextS3: Stage3OpenWorldState = {
      ...next.stage3,
      score: clamp(next.stage3.score + def.effects.scoreBonus, 0, 600),
      reputation: clamp(next.stage3.reputation + 5, 0, 100),
      happiness: clamp(next.stage3.happiness + Math.max(2, Math.floor(def.effects.hpKota / 2)), 0, 100),
      welfare: clamp(next.stage3.welfare + 5, 0, 100),
      stats: {
        ...next.stage3.stats,
        buildingsBuilt: next.stage3.stats.buildingsBuilt + 1,
      },
    };
    nextS3.smartCityMetrics = recalculateSmartCityMetrics(nextS3);
    next = withGlobalNotif(
      { ...next, stage1: nextS1, stage3: nextS3 },
      'success',
      `${def.name} selesai dibangun dan aktif di Stage 3! (+90 XP)`
    );
    next = triggerStage3QuestEvent(next, 'build_facility', def.id);
  }
  return evaluateStage3Achievements(next);
}

export function tickStage3BuildingConstructions(
  state: MultiStageWorldState,
  dtSeconds: number
): MultiStageWorldState {
  const constructing = state.stage3.placedBuildings.some((b) => b.isConstructing);
  if (!constructing) return state;

  const rate = 1 / 9;
  const completedIds: string[] = [];
  const updated = state.stage3.placedBuildings.map((b) => {
    if (!b.isConstructing) return b;
    const prog = Math.min(1, b.constructionProgress + dtSeconds * rate);
    if (prog >= 1) {
      completedIds.push(b.buildingId);
      return { ...b, constructionProgress: 1, isConstructing: false };
    }
    return { ...b, constructionProgress: prog };
  });

  const next: MultiStageWorldState = {
    ...state,
    stage3: { ...state.stage3, placedBuildings: updated },
  };
  return completedIds.length > 0 ? finalizeStage3CompletedBuildings(next, completedIds) : next;
}

export function upgradeStage3PlacedBuilding(
  state: MultiStageWorldState,
  instanceId: string
): MultiStageWorldState {
  const target = state.stage3.placedBuildings.find((b) => b.id === instanceId);
  if (!target || target.isConstructing || target.level >= 3) return state;
  const def = BUILDING_CATALOG.find((b) => b.id === target.buildingId);
  if (!def) return state;

  const upgradeCost = Math.round(def.cost * (target.level === 1 ? 0.75 : 1.15));
  if (state.stage1.coins < upgradeCost) {
    return withGlobalNotif(
      state,
      'error',
      `Butuh ${upgradeCost} Koin untuk meningkatkan ${def.name} ke Level ${target.level + 1}.`
    );
  }

  const nextLevel = (target.level + 1) as 2 | 3;
  const nextS1 = addXpAndCoins({ ...state.stage1, coins: state.stage1.coins - upgradeCost }, 95, 0);
  const nextS3: Stage3OpenWorldState = {
    ...state.stage3,
    placedBuildings: state.stage3.placedBuildings.map((b) =>
      b.id === instanceId ? { ...b, level: nextLevel } : b
    ),
    score: clamp(state.stage3.score + 12, 0, 600),
    reputation: clamp(state.stage3.reputation + 5, 0, 100),
    happiness: clamp(state.stage3.happiness + 5, 0, 100),
    stats: {
      ...state.stage3.stats,
      buildingsUpgraded: state.stage3.stats.buildingsUpgraded + 1,
    },
  };
  nextS3.smartCityMetrics = recalculateSmartCityMetrics(nextS3);

  let next = withGlobalNotif(
    { ...state, stage1: nextS1, stage3: nextS3 },
    'success',
    `${def.name} ditingkatkan ke Level ${nextLevel}! (+95 XP)`
  );
  next = triggerStage3QuestEvent(next, 'upgrade_facility', def.id);
  return evaluateStage3Achievements(next);
}

export function recordStage3LandmarkInspected(
  state: MultiStageWorldState,
  landmarkId: string
): MultiStageWorldState {
  let next = triggerStage3QuestEvent(state, 'inspect_landmark', landmarkId);
  return evaluateStage3Achievements(next);
}

export function recordStage3InteriorEntered(
  state: MultiStageWorldState,
  interiorId: string
): MultiStageWorldState {
  let next: MultiStageWorldState = {
    ...state,
    stage3: {
      ...state.stage3,
      stats: {
        ...state.stage3.stats,
        interiorsEntered: state.stage3.stats.interiorsEntered + 1,
      },
    },
  };
  next = triggerStage3QuestEvent(next, 'enter_interior', interiorId);
  return evaluateStage3Achievements(next);
}

export function recordStage3VehicleDriven(
  state: MultiStageWorldState,
  vehicleId: string
): MultiStageWorldState {
  const nextS3: Stage3OpenWorldState = {
    ...state.stage3,
    stats: {
      ...state.stage3.stats,
      vehiclesDriven: state.stage3.stats.vehiclesDriven + 1,
    },
  };
  nextS3.smartCityMetrics = recalculateSmartCityMetrics(nextS3);
  let next: MultiStageWorldState = { ...state, stage3: nextS3 };
  next = triggerStage3QuestEvent(next, 'drive_vehicle', vehicleId);
  return evaluateStage3Achievements(next);
}

export function getTrackedStage3QuestDetails(s3: Stage3OpenWorldState) {
  const qId =
    s3.trackedQuestId && s3.quests[s3.trackedQuestId]?.status === 'active'
      ? s3.trackedQuestId
      : Object.entries(s3.quests).find(([, p]) => p.status === 'active')?.[0] ?? null;
  if (!qId) return null;
  const def = STAGE3_QUESTS.find((q) => q.id === qId);
  const prog = s3.quests[qId];
  if (!def || !prog) return null;
  const step = def.steps[prog.stepIndex] ?? def.steps[def.steps.length - 1];
  return { quest: def, progress: prog, step };
}

export function recordStage2LandmarkInspected(
  state: MultiStageWorldState,
  landmarkId: string
): MultiStageWorldState {
  let next = state;
  if (landmarkId === 'lm-s2-sungai-sensor' && !state.stage2.sensorInspected) {
    const nextS2: Stage2OpenWorldState = {
      ...state.stage2,
      sensorInspected: true,
    };
    nextS2.industrialMetrics = recalculateIndustrialMetrics(nextS2);
    next = { ...state, stage2: nextS2 };
  }
  if (landmarkId === 'lm-s2-stage3-terminal') {
    next = triggerStage2QuestEvent(next, 'inspect_locked_stage3', landmarkId);
  } else {
    next = triggerStage2QuestEvent(next, 'inspect_landmark', landmarkId);
  }
  return evaluateStage2Achievements(next);
}

export function recordStage2ShipBoarded(
  state: MultiStageWorldState,
  shipId: string
): MultiStageWorldState {
  let next: MultiStageWorldState = {
    ...state,
    stage2: {
      ...state.stage2,
      stats: {
        ...state.stage2.stats,
        shipsBoarded: state.stage2.stats.shipsBoarded + 1,
      },
    },
  };
  next = triggerStage2QuestEvent(next, 'board_ship', shipId);
  return evaluateStage2Achievements(next);
}

export function recordStage2InteriorEntered(
  state: MultiStageWorldState,
  interiorId: string
): MultiStageWorldState {
  let next: MultiStageWorldState = {
    ...state,
    stage2: {
      ...state.stage2,
      stats: {
        ...state.stage2.stats,
        interiorsEntered: state.stage2.stats.interiorsEntered + 1,
      },
    },
  };
  next = triggerStage2QuestEvent(next, 'enter_interior', interiorId);
  return evaluateStage2Achievements(next);
}

export function recordStage2VehicleDriven(
  state: MultiStageWorldState,
  vehicleId: string
): MultiStageWorldState {
  let next: MultiStageWorldState = {
    ...state,
    stage2: {
      ...state.stage2,
      stats: {
        ...state.stage2.stats,
        vehiclesDriven: state.stage2.stats.vehiclesDriven + 1,
      },
    },
  };
  next = triggerStage2QuestEvent(next, 'drive_vehicle', vehicleId);
  return evaluateStage2Achievements(next);
}

export function getTrackedStage2QuestDetails(s2: Stage2OpenWorldState) {
  const qId =
    s2.trackedQuestId && s2.quests[s2.trackedQuestId]?.status === 'active'
      ? s2.trackedQuestId
      : Object.entries(s2.quests).find(([, p]) => p.status === 'active')?.[0] ?? null;
  if (!qId) return null;
  const def = STAGE2_QUESTS.find((q) => q.id === qId);
  const prog = s2.quests[qId];
  if (!def || !prog) return null;
  const step = def.steps[prog.stepIndex] ?? def.steps[def.steps.length - 1];
  return { quest: def, progress: prog, step };
}

export function travelBetweenStages(
  state: MultiStageWorldState,
  targetStage: number
): MultiStageWorldState {
  if (targetStage !== 1 && targetStage !== 2 && targetStage !== 3) return state;

  if (targetStage === 3) {
    let next = state;
    if (state.activeStage === 2) {
      next = triggerStage2QuestEvent(next, 'inspect_locked_stage3', 'lm-s2-stage3-terminal');
    }
    const arrivedState: MultiStageWorldState = {
      ...next,
      activeStage: 3,
      unlockedStages: [1, 2, 3],
      stage3: {
        ...next.stage3,
        playerPos: { x: 0, y: 0, z: -64, facingYaw: 0 },
      },
    };
    const evaluated = evaluateStage3Achievements(arrivedState);
    return withGlobalNotif(
      evaluated,
      'success',
      'Tiba di Stage 3: Kota Digital Masa Depan lewat Kereta Cepat Nusantara! Semua kostum & inventaris terbawa.'
    );
  }

  if (targetStage === 2) {
    const granted = grantGlobalCustomizations(state, [
      'hat-helm-proyek',
      'shirt-seragam-pabrik',
      'acc-masker-industri',
    ]);
    const spawnPos =
      state.activeStage === 3
        ? { x: -4.0, y: 0, z: -68.0, facingYaw: 0 }
        : { x: 56.0, y: 0.72, z: 0.0, facingYaw: -Math.PI / 2 };

    return withGlobalNotif(
      {
        ...granted.nextState,
        activeStage: 2,
        stage2: {
          ...granted.nextState.stage2,
          playerPos: spawnPos,
        },
      },
      'success',
      state.activeStage === 3
        ? 'Kembali ke Stage 2: Kota Industri Global dengan Kereta Cepat!'
        : 'Tiba di Stage 2: Kota Industri Global! Kostum & inventaris Anda terbawa utuh.'
    );
  }

  return withGlobalNotif(
    {
      ...state,
      activeStage: 1,
      stage1: {
        ...state.stage1,
        playerPos: { x: 55.5, y: 0.72, z: -3.2, facingYaw: -Math.PI / 2 },
      },
    },
    'success',
    'Kembali berlabuh di Stage 1: Kota Perdagangan Nusantara!'
  );
}

export function updateGlobalAppearance(
  state: MultiStageWorldState,
  patch: Partial<CharacterAppearance>,
  options: { triggerQuest?: boolean } = { triggerQuest: true }
): MultiStageWorldState {
  const nextS1 = updatePlayerAppearance(state.stage1, patch, options);
  let next: MultiStageWorldState = withStage1Patch(state, nextS1);
  if (options.triggerQuest !== false) {
    if (state.activeStage === 2) {
      next = triggerStage2QuestEvent(next, 'customize_avatar', '*');
    } else if (state.activeStage === 3) {
      next = triggerStage3QuestEvent(next, 'customize_avatar', '*');
    }
  }
  return next;
}

export function applyCharacterPreset(
  state: MultiStageWorldState,
  presetId: string
): MultiStageWorldState {
  const preset = CHARACTER_PRESETS.find((p) => p.id === presetId);
  if (!preset) return state;
  const next = updateGlobalAppearance(state, preset.appearance, { triggerQuest: true });
  return withGlobalNotif(next, 'info', `Preset gaya diterapkan: ${preset.name}`);
}

export function randomizeGlobalAppearance(
  state: MultiStageWorldState,
  rng: () => number = Math.random
): MultiStageWorldState {
  const nextS1 = randomizePlayerAppearance(state.stage1, rng);
  let next = withStage1Patch(state, nextS1);
  if (state.activeStage === 2) {
    next = triggerStage2QuestEvent(next, 'customize_avatar', '*');
  } else if (state.activeStage === 3) {
    next = triggerStage3QuestEvent(next, 'customize_avatar', '*');
  }
  return next;
}

export function resetGlobalAppearance(state: MultiStageWorldState): MultiStageWorldState {
  return withStage1Patch(state, resetPlayerAppearance(state.stage1));
}

export function useMultiStageInventoryItem(
  state: MultiStageWorldState,
  itemId: string
): MultiStageWorldState {
  if (state.activeStage === 1) {
    return withStage1Patch(state, useInventoryItem(state.stage1, itemId));
  }

  if (!hasInventoryItem(state.stage1.inventory, itemId)) return state;
  if (itemId === 'kopi-rempah') {
    const nextInv = removeItemFromInventory(state.stage1.inventory, itemId, 1);
    const nextS1 = addXpAndCoins({ ...state.stage1, inventory: nextInv }, 25, 0);
    const nextS2: Stage2OpenWorldState = {
      ...state.stage2,
      happiness: clamp(state.stage2.happiness + 4, 0, 100),
    };
    nextS2.industrialMetrics = recalculateIndustrialMetrics(nextS2);
    return withGlobalNotif(
      { ...state, stage1: nextS1, stage2: nextS2 },
      'success',
      'Kopi Rempah diminum! (+25 XP, +4 Kebahagiaan)'
    );
  }

  if (itemId === 'palu-arsitek') {
    const hasConstructing = state.stage2.placedBuildings.some((b) => b.isConstructing);
    if (!hasConstructing) {
      return withGlobalNotif(state, 'warning', 'Belum ada proyek bangunan Stage 2 yang sedang dibangun.');
    }
    const completedIds: string[] = [];
    const updated = state.stage2.placedBuildings.map((b) => {
      if (!b.isConstructing) return b;
      const nextProg = Math.min(1, b.constructionProgress + 0.5);
      const done = nextProg >= 1;
      if (done) completedIds.push(b.buildingId);
      return { ...b, constructionProgress: nextProg, isConstructing: !done };
    });
    let next: MultiStageWorldState = {
      ...state,
      stage1: {
        ...state.stage1,
        inventory: removeItemFromInventory(state.stage1.inventory, itemId, 1),
      },
      stage2: { ...state.stage2, placedBuildings: updated },
    };
    if (completedIds.length > 0) {
      next = finalizeStage2CompletedBuildings(next, completedIds);
    }
    return withGlobalNotif(next, 'success', 'Palu Arsitek mempercepat pembangunan Stage 2!');
  }

  if (state.activeStage === 3) {
    if (!hasInventoryItem(state.stage1.inventory, itemId)) return state;
    if (itemId === 's3-kopi-siber' || itemId === 'kopi-rempah') {
      const xp = itemId === 's3-kopi-siber' ? 40 : 25;
      const hap = itemId === 's3-kopi-siber' ? 5 : 4;
      const nextInv = removeItemFromInventory(state.stage1.inventory, itemId, 1);
      const nextS1 = addXpAndCoins({ ...state.stage1, inventory: nextInv }, xp, 0);
      const nextS3: Stage3OpenWorldState = {
        ...state.stage3,
        happiness: clamp(state.stage3.happiness + hap, 0, 100),
      };
      nextS3.smartCityMetrics = recalculateSmartCityMetrics(nextS3);
      return withGlobalNotif(
        { ...state, stage1: nextS1, stage3: nextS3 },
        'success',
        `${getItemDefById(itemId)?.name ?? 'Kopi'} dinikmati! (+${xp} XP, +${hap} Kebahagiaan)`
      );
    }

    if (itemId === 's3-drone-konstruksi' || itemId === 'palu-arsitek') {
      const hasConstructing = state.stage3.placedBuildings.some((b) => b.isConstructing);
      if (!hasConstructing) {
        return withGlobalNotif(state, 'warning', 'Belum ada bangunan Stage 3 yang sedang dalam konstruksi.');
      }
      const boost = itemId === 's3-drone-konstruksi' ? 0.65 : 0.5;
      const completedIds: string[] = [];
      const updated = state.stage3.placedBuildings.map((b) => {
        if (!b.isConstructing) return b;
        const nextProg = Math.min(1, b.constructionProgress + boost);
        const done = nextProg >= 1;
        if (done) completedIds.push(b.buildingId);
        return { ...b, constructionProgress: nextProg, isConstructing: !done };
      });
      let next: MultiStageWorldState = {
        ...state,
        stage1: {
          ...state.stage1,
          inventory: removeItemFromInventory(state.stage1.inventory, itemId, 1),
        },
        stage3: { ...state.stage3, placedBuildings: updated },
      };
      if (completedIds.length > 0) {
        next = finalizeStage3CompletedBuildings(next, completedIds);
      }
      return withGlobalNotif(next, 'success', 'Konstruksi Smart City Stage 3 dipercepat!');
    }
  }

  return withStage1Patch(state, useInventoryItem(state.stage1, itemId));
}

export function tickMultiStageWorld(
  state: MultiStageWorldState,
  dtSeconds: number
): MultiStageWorldState {
  let next = state;
  const s1Next = tickBuildingConstructions(next.stage1, dtSeconds);
  if (s1Next !== next.stage1) {
    next = { ...next, stage1: s1Next };
  }
  next = tickStage2BuildingConstructions(next, dtSeconds);
  next = tickStage2Production(next, dtSeconds);
  next = tickStage3BuildingConstructions(next, dtSeconds);
  return next;
}

export function acceptActiveStageQuest(
  state: MultiStageWorldState,
  questId: string
): MultiStageWorldState {
  if (questId.startsWith('s2-')) {
    return acceptStage2Quest(state, questId);
  }
  if (questId.startsWith('q-s3-')) {
    return acceptStage3Quest(state, questId);
  }
  return withStage1Patch(state, acceptQuest(state.stage1, questId));
}

export function trackActiveStageQuest(
  state: MultiStageWorldState,
  questId: string
): MultiStageWorldState {
  if (questId.startsWith('s2-')) {
    return {
      ...state,
      stage2: { ...state.stage2, trackedQuestId: questId },
    };
  }
  if (questId.startsWith('q-s3-')) {
    return {
      ...state,
      stage3: { ...state.stage3, trackedQuestId: questId },
    };
  }
  return {
    ...state,
    stage1: { ...state.stage1, trackedQuestId: questId },
  };
}

export function getActiveQuestSummary(state: MultiStageWorldState) {
  if (state.activeStage === 2) {
    return getTrackedStage2QuestDetails(state.stage2);
  }
  if (state.activeStage === 3) {
    return getTrackedStage3QuestDetails(state.stage3);
  }
  return getTrackedQuestDetails(state.stage1);
}

export function dismissMultiStageCelebration(state: MultiStageWorldState): MultiStageWorldState {
  return withStage1Patch(state, dismissRewardCelebration(state.stage1));
}

export function equipMultiStageTitle(
  state: MultiStageWorldState,
  titleId: string
): MultiStageWorldState {
  return withStage1Patch(state, equipPlayerTitle(state.stage1, titleId));
}

export function getCostumeCollectionStats(unlockedCustomizationIds: string[]) {
  const wearable = CUSTOMIZATION_ITEMS;
  const unlockedCount = wearable.filter((c) => unlockedCustomizationIds.includes(c.id)).length;
  const totalCount = wearable.length;
  const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  return { unlockedCount, totalCount, pct };
}

/**
 * Conflict-safe merge of offline local state and server-synced/multiplayer state.
 * Never wipes newer cosmetics, titles, blueprints, collectibles, or higher level/XP.
 */
export function mergeOfflineAndOnlineState(
  local: MultiStageWorldState,
  remote: Partial<MultiStageWorldState>
): MultiStageWorldState {
  const rS1 = remote.stage1;
  const rS2 = remote.stage2;
  const rS3 = remote.stage3;

  const mergedUnlockedCosmetics = Array.from(
    new Set([
      ...local.stage1.unlockedCustomizationIds,
      ...(rS1?.unlockedCustomizationIds ?? []),
    ])
  );
  const mergedBlueprints = Array.from(
    new Set([...local.stage1.unlockedBlueprints, ...(rS1?.unlockedBlueprints ?? [])])
  );
  const mergedTitles = Array.from(
    new Set([...local.stage1.unlockedTitles, ...(rS1?.unlockedTitles ?? [])])
  );

  const pickBestLevel =
    (rS1?.playerLevel ?? 1) > local.stage1.playerLevel
      ? {
          playerLevel: rS1!.playerLevel,
          xp: rS1!.xp,
          xpToNext: rS1!.xpToNext,
        }
      : {
          playerLevel: local.stage1.playerLevel,
          xp: Math.max(local.stage1.xp, rS1?.xp ?? 0),
          xpToNext: xpNeededForLevel(local.stage1.playerLevel),
        };

  const mergedS1Collectibles = Array.from(
    new Set([...local.stage1.collectibles, ...(rS1?.collectibles ?? [])])
  );
  const mergedS2Collectibles = Array.from(
    new Set([...local.stage2.collectibles, ...(rS2?.collectibles ?? [])])
  );
  const mergedS3Collectibles = Array.from(
    new Set([...local.stage3.collectibles, ...(rS3?.collectibles ?? [])])
  );

  const mergeQuests = (
    a: Record<string, QuestProgress>,
    b?: Record<string, QuestProgress>
  ): Record<string, QuestProgress> => {
    const out: Record<string, QuestProgress> = { ...a };
    if (!b) return out;
    for (const [k, qp] of Object.entries(b)) {
      const cur = out[k];
      if (!cur) {
        out[k] = qp;
      } else if (qp.status === 'completed' && cur.status !== 'completed') {
        out[k] = qp;
      } else if (qp.status === 'active' && cur.status === 'available') {
        out[k] = qp;
      } else if (qp.status === cur.status && qp.stepIndex > cur.stepIndex) {
        out[k] = qp;
      }
    }
    return out;
  };

  return {
    ...local,
    displayName: remote.displayName || local.displayName,
    unlockedStages: [1, 2, 3],
    stage1: {
      ...local.stage1,
      ...pickBestLevel,
      coins: Math.max(local.stage1.coins, rS1?.coins ?? 0),
      unlockedCustomizationIds: mergedUnlockedCosmetics,
      unlockedOutfits: CUSTOMIZATION_ITEMS.filter(
        (c) => c.slot === 'jacket' && mergedUnlockedCosmetics.includes(c.id)
      ).map((c) => c.id),
      unlockedHats: CUSTOMIZATION_ITEMS.filter(
        (c) => c.slot === 'hat' && mergedUnlockedCosmetics.includes(c.id)
      ).map((c) => c.id),
      unlockedBlueprints: mergedBlueprints,
      unlockedTitles: mergedTitles,
      collectibles: mergedS1Collectibles,
      quests: mergeQuests(local.stage1.quests, rS1?.quests),
      achievements: Array.from(new Set([...local.stage1.achievements, ...(rS1?.achievements ?? [])])),
    },
    stage2: {
      ...local.stage2,
      collectibles: mergedS2Collectibles,
      quests: mergeQuests(local.stage2.quests, rS2?.quests),
      achievements: Array.from(new Set([...local.stage2.achievements, ...(rS2?.achievements ?? [])])),
    },
    stage3: {
      ...local.stage3,
      collectibles: mergedS3Collectibles,
      quests: mergeQuests(local.stage3.quests, rS3?.quests),
      achievements: Array.from(new Set([...local.stage3.achievements, ...(rS3?.achievements ?? [])])),
    },
    lastUpdatedAt: Math.max(local.lastUpdatedAt, remote.lastUpdatedAt ?? 0),
  };
}

export function saveMultiStageToStorage(state: MultiStageWorldState): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(MULTI_STAGE_SAVE_KEY, JSON.stringify(state));
      // Mirror Stage 1 into legacy key cleanly without deleting Stage 1 compatibility
      window.localStorage.setItem('nusantara_tycoon_stage1_openworld_v1', JSON.stringify(state.stage1));
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function loadMultiStageFromStorage(): MultiStageWorldState {
  const base = createInitialMultiStageState();
  try {
    if (typeof window === 'undefined' || !window.localStorage) return base;
    const raw = window.localStorage.getItem(MULTI_STAGE_SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MultiStageWorldState>;
      if (parsed.version === 2 && parsed.stage1 && parsed.stage2) {
        const s1Base = createInitialStage1State();
        const s2Base = createInitialStage2State();
        const mergedUnlocked = Array.from(
          new Set([
            ...s1Base.unlockedCustomizationIds,
            ...(parsed.stage1.unlockedCustomizationIds ?? []),
          ])
        );
        const mergedAppearance: CharacterAppearance = {
          ...DEFAULT_CHARACTER_APPEARANCE,
          ...(parsed.stage1.appearance ?? {}),
        };
        const mergedS2: Stage2OpenWorldState = {
          ...s2Base,
          ...parsed.stage2,
          quests: { ...s2Base.quests, ...(parsed.stage2.quests ?? {}) },
          stats: { ...s2Base.stats, ...(parsed.stage2.stats ?? {}) },
          industrialMetrics: {
            ...s2Base.industrialMetrics,
            ...(parsed.stage2.industrialMetrics ?? {}),
          },
          playerPos: parsed.stage2.playerPos ?? s2Base.playerPos,
        };
        mergedS2.industrialMetrics = recalculateIndustrialMetrics(mergedS2);

        const s3Base = createInitialStage3State();
        const mergedS3: Stage3OpenWorldState = parsed.stage3
          ? {
              ...s3Base,
              ...parsed.stage3,
              quests: { ...s3Base.quests, ...(parsed.stage3.quests ?? {}) },
              stats: { ...s3Base.stats, ...(parsed.stage3.stats ?? {}) },
              smartCityMetrics: {
                ...s3Base.smartCityMetrics,
                ...(parsed.stage3.smartCityMetrics ?? {}),
              },
              activityCounts: {
                ...s3Base.activityCounts,
                ...(parsed.stage3.activityCounts ?? {}),
              },
              playerPos: parsed.stage3.playerPos ?? s3Base.playerPos,
            }
          : s3Base;
        mergedS3.smartCityMetrics = recalculateSmartCityMetrics(mergedS3);

        return {
          version: 2,
          displayName: parsed.displayName || base.displayName,
          activeStage: parsed.activeStage === 3 ? 3 : parsed.activeStage === 2 ? 2 : 1,
          unlockedStages: [1, 2, 3],
          lastUpdatedAt: parsed.lastUpdatedAt ?? Date.now(),
          stage1: {
            ...s1Base,
            ...parsed.stage1,
            quests: { ...s1Base.quests, ...(parsed.stage1.quests ?? {}) },
            stats: { ...s1Base.stats, ...(parsed.stage1.stats ?? {}) },
            settings: { ...s1Base.settings, ...(parsed.stage1.settings ?? {}) },
            indicators: { ...s1Base.indicators, ...(parsed.stage1.indicators ?? {}) },
            appearance: mergedAppearance,
            unlockedCustomizationIds: mergedUnlocked,
            unlockedOutfits: CUSTOMIZATION_ITEMS.filter(
              (c) => c.slot === 'jacket' && mergedUnlocked.includes(c.id)
            ).map((c) => c.id),
            unlockedHats: CUSTOMIZATION_ITEMS.filter(
              (c) => c.slot === 'hat' && mergedUnlocked.includes(c.id)
            ).map((c) => c.id),
            unlockedTitles: Array.from(
              new Set([...s1Base.unlockedTitles, ...(parsed.stage1.unlockedTitles ?? [])])
            ),
            lastRewardCelebration: null,
          },
          stage2: mergedS2,
          stage3: mergedS3,
        };
      }
    }

    // First-time migration from legacy Stage 1 save key!
    const legacyS1 = loadStage1FromStorage();
    if (legacyS1) {
      return {
        ...base,
        stage1: legacyS1,
      };
    }
  } catch {
    return base;
  }
  return base;
}

export function resetMultiStageStorage(): MultiStageWorldState {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(MULTI_STAGE_SAVE_KEY);
      window.localStorage.removeItem('nusantara_tycoon_stage1_openworld_v1');
    }
  } catch {
    // ignore
  }
  return createInitialMultiStageState();
}

export {
  addItemToInventory,
  collectNusantaraArtifact,
  collectWorldPickup,
  deliverToSpot,
  discoverDistrict,
  evaluateAchievements,
  PLAYER_TITLES,
  recordInteriorEntered,
  recordShipBoarded,
  recordVehicleDriven,
  removeItemFromInventory,
  startBuildingConstruction,
  triggerQuestEvent,
  upgradePlacedBuilding,
};
export type { InventorySlot, PlacedBuildingInstance, QuestProgress, RewardCelebrationPayload, Stage1OpenWorldState };
