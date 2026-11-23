import { BUILDING_CATALOG } from './data/bermainData';
import { clamp } from './rules';
import {
  BODY_TYPES,
  CharacterAppearance,
  COLLECTION_MILESTONES,
  CUSTOMIZATION_ITEMS,
  DEFAULT_CHARACTER_APPEARANCE,
  DistrictId,
  EYE_COLORS,
  EYE_SHAPES,
  EYEBROW_STYLES,
  FACE_PRESETS,
  HAIR_COLORS,
  MOUTH_PRESETS,
  NOSE_PRESETS,
  PLAYER_TITLES,
  QuestEventType,
  SKIN_TONES,
  STAGE1_ACHIEVEMENTS,
  STAGE1_COLLECTIBLES,
  STAGE1_DELIVERY_SPOTS,
  STAGE1_DISTRICTS,
  STAGE1_ITEMS,
  STAGE1_QUESTS,
  STAGE1_WORLD_PICKUPS,
} from './stage1Data';
import { CityIndicators } from './types';

export const STAGE1_SAVE_KEY = 'nusantara_tycoon_stage1_openworld_v1';

export type QuestStatus = 'available' | 'active' | 'completed';

export interface QuestProgress {
  status: QuestStatus;
  stepIndex: number;
}

export interface InventorySlot {
  itemId: string;
  qty: number;
}

export interface PlacedBuildingInstance {
  id: string;
  buildingId: string;
  x: number;
  z: number;
  rotationY: number;
  level: 1 | 2 | 3;
  constructionProgress: number; // 0..1
  isConstructing: boolean;
  builtAtMs: number;
}

export interface Stage1Stats {
  buildingsBuilt: number;
  buildingsUpgraded: number;
  questsCompleted: number;
  vehiclesDriven: number;
  shipsBoarded: number;
  interiorsEntered: number;
  collectiblesFound: number;
}

export interface Stage1Settings {
  dayNightAuto: boolean;
  timeOfDay: number; // 0..1 (0.34 = sunny late morning, 0.78 = evening, 0.92 = night)
  cameraSensitivity: number;
}

export interface Stage1Notification {
  id: number;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export interface RewardCelebrationPayload {
  id: number;
  sourceTitle: string;
  sourceKind: 'quest' | 'milestone' | 'level' | 'achievement';
  xp: number;
  coins: number;
  unlockedCustomizationIds: string[];
  unlockedBlueprintId?: string;
  unlockedTitleId?: string;
  unlockedItemId?: string;
  unlockedItemQty?: number;
  newLevel?: number;
}

export interface Stage1OpenWorldState {
  version: 1;
  playerLevel: number;
  xp: number;
  xpToNext: number;
  coins: number;
  score: number;
  reputation: number; // 0..100
  happiness: number; // 0..100
  welfare: number; // 0..100
  scienceProgress: number; // 0..100
  culturePreservation: number; // 0..100
  indicators: CityIndicators;
  discoveredDistricts: DistrictId[];
  quests: Record<string, QuestProgress>;
  trackedQuestId: string | null;
  inventory: InventorySlot[];
  collectedPickups: string[];
  collectibles: string[];
  completedDeliveries: string[];
  unlockedOutfits: string[];
  unlockedHats: string[];
  equippedOutfit: string;
  equippedHat: string;
  appearance: CharacterAppearance;
  unlockedCustomizationIds: string[];
  unlockedBlueprints: string[];
  unlockedTitles: string[];
  equippedTitle: string;
  claimedMilestones: string[];
  achievements: string[];
  placedBuildings: PlacedBuildingInstance[];
  resolvedChallengeIds: string[];
  stats: Stage1Stats;
  settings: Stage1Settings;
  playerPos: { x: number; y: number; z: number; facingYaw: number };
  lastNotification: Stage1Notification | null;
  lastRewardCelebration: RewardCelebrationPayload | null;
}

export function xpNeededForLevel(level: number): number {
  return 100 + (level - 1) * 65;
}

function getDefaultUnlockedCustomizationIds(): string[] {
  return CUSTOMIZATION_ITEMS.filter((i) => i.unlockedByDefault).map((i) => i.id);
}

function syncLegacyCosmetics(
  unlockedIds: string[],
  appearance: CharacterAppearance
): {
  unlockedOutfits: string[];
  unlockedHats: string[];
  equippedOutfit: string;
  equippedHat: string;
} {
  const unlockedOutfits = CUSTOMIZATION_ITEMS.filter(
    (i) => i.slot === 'jacket' && unlockedIds.includes(i.id)
  ).map((i) => i.id);
  const unlockedHats = CUSTOMIZATION_ITEMS.filter(
    (i) => i.slot === 'hat' && unlockedIds.includes(i.id)
  ).map((i) => i.id);

  return {
    unlockedOutfits,
    unlockedHats,
    equippedOutfit: appearance.jacketId,
    equippedHat: appearance.hatId,
  };
}

function grantCustomizationIds(
  current: string[],
  toAdd: (string | undefined)[]
): { nextIds: string[]; newlyUnlocked: string[] } {
  const set = new Set(current);
  const newlyUnlocked: string[] = [];
  for (const id of toAdd) {
    if (!id) continue;
    const valid = CUSTOMIZATION_ITEMS.some((c) => c.id === id);
    if (valid && !set.has(id)) {
      set.add(id);
      newlyUnlocked.push(id);
    }
  }
  return { nextIds: Array.from(set), newlyUnlocked };
}

export function createInitialStage1State(): Stage1OpenWorldState {
  const quests: Record<string, QuestProgress> = {};
  for (const q of STAGE1_QUESTS) {
    quests[q.id] = {
      status: q.id === 'q-main-1' ? 'active' : 'available',
      stepIndex: 0,
    };
  }

  const defaultUnlocked = getDefaultUnlockedCustomizationIds();
  const appearance: CharacterAppearance = { ...DEFAULT_CHARACTER_APPEARANCE };
  const legacy = syncLegacyCosmetics(defaultUnlocked, appearance);

  return {
    version: 1,
    playerLevel: 1,
    xp: 0,
    xpToNext: xpNeededForLevel(1),
    coins: 720,
    score: 18,
    reputation: 42,
    happiness: 64,
    welfare: 60,
    scienceProgress: 32,
    culturePreservation: 55,
    indicators: {
      ekonomiGlobal: 38,
      iptek: 30,
      kearifanLokal: 52,
      hpKota: 88,
    },
    discoveredDistricts: ['pusat-kota'],
    quests,
    trackedQuestId: 'q-main-1',
    inventory: [{ itemId: 'kopi-rempah', qty: 1 }],
    collectedPickups: [],
    collectibles: [],
    completedDeliveries: [],
    ...legacy,
    appearance,
    unlockedCustomizationIds: defaultUnlocked,
    unlockedBlueprints: [],
    unlockedTitles: PLAYER_TITLES.filter((t) => t.unlockedByDefault).map((t) => t.id),
    equippedTitle: 'title-wali-pemula',
    claimedMilestones: [],
    achievements: [],
    placedBuildings: [],
    resolvedChallengeIds: [],
    stats: {
      buildingsBuilt: 0,
      buildingsUpgraded: 0,
      questsCompleted: 0,
      vehiclesDriven: 0,
      shipsBoarded: 0,
      interiorsEntered: 0,
      collectiblesFound: 0,
    },
    settings: {
      dayNightAuto: false,
      timeOfDay: 0.34,
      cameraSensitivity: 1.0,
    },
    playerPos: { x: -7.5, y: 0, z: 0.4, facingYaw: Math.PI / 2 },
    lastNotification: null,
    lastRewardCelebration: null,
  };
}

function withNotif(
  state: Stage1OpenWorldState,
  type: Stage1Notification['type'],
  message: string
): Stage1OpenWorldState {
  return {
    ...state,
    lastNotification: { id: Date.now() + Math.floor(Math.random() * 1000), type, message },
  };
}

function makeCelebration(
  payload: Omit<RewardCelebrationPayload, 'id'>
): RewardCelebrationPayload {
  return {
    id: Date.now() + Math.floor(Math.random() * 10000),
    ...payload,
  };
}

export function dismissRewardCelebration(
  state: Stage1OpenWorldState
): Stage1OpenWorldState {
  if (!state.lastRewardCelebration) return state;
  return { ...state, lastRewardCelebration: null };
}

export function isBlueprintUnlocked(
  state: Stage1OpenWorldState,
  buildingId: string
): boolean {
  const def = BUILDING_CATALOG.find((b) => b.id === buildingId);
  if (!def) return false;
  if (!def.requiresBlueprintUnlock) return true;
  return state.unlockedBlueprints.includes(buildingId);
}

export function addXpAndCoins(
  state: Stage1OpenWorldState,
  xpGain: number,
  coinGain: number
): Stage1OpenWorldState {
  let xp = state.xp + Math.max(0, xpGain);
  let level = state.playerLevel;
  let xpToNext = state.xpToNext;
  let leveledUp = false;

  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    xpToNext = xpNeededForLevel(level);
    leveledUp = true;
  }

  const levelUnlocks: string[] = [];
  if (level >= 2) {
    levelUnlocks.push('rompi-insinyur', 'hair-ikal-alami', 'acc-bros-emblem');
  }
  if (level >= 3) {
    levelUnlocks.push('hair-ombak-panjang');
  }

  const granted = grantCustomizationIds(state.unlockedCustomizationIds, levelUnlocks);
  const legacy = syncLegacyCosmetics(granted.nextIds, state.appearance);

  let next: Stage1OpenWorldState = {
    ...state,
    playerLevel: level,
    xp,
    xpToNext,
    coins: Math.max(0, state.coins + coinGain),
    unlockedCustomizationIds: granted.nextIds,
    ...legacy,
  };

  if (leveledUp) {
    if (granted.newlyUnlocked.length > 0 && !next.lastRewardCelebration) {
      next = {
        ...next,
        lastRewardCelebration: makeCelebration({
          sourceTitle: `Naik ke Level ${level}!`,
          sourceKind: 'level',
          xp: Math.max(0, xpGain),
          coins: Math.max(0, coinGain),
          unlockedCustomizationIds: granted.newlyUnlocked,
          newLevel: level,
        }),
      };
    }
    return withNotif(next, 'success', `Naik Level! Kamu sekarang Level ${level}!`);
  }
  return next;
}

export function addItemToInventory(
  inventory: InventorySlot[],
  itemId: string,
  qty = 1
): InventorySlot[] {
  const existing = inventory.find((s) => s.itemId === itemId);
  if (existing) {
    return inventory.map((s) => (s.itemId === itemId ? { ...s, qty: s.qty + qty } : s));
  }
  return [...inventory, { itemId, qty }];
}

export function removeItemFromInventory(
  inventory: InventorySlot[],
  itemId: string,
  qty = 1
): InventorySlot[] {
  return inventory
    .map((s) => (s.itemId === itemId ? { ...s, qty: s.qty - qty } : s))
    .filter((s) => s.qty > 0);
}

export function hasInventoryItem(inventory: InventorySlot[], itemId: string): boolean {
  return inventory.some((s) => s.itemId === itemId && s.qty > 0);
}

export function evaluateAchievements(state: Stage1OpenWorldState): Stage1OpenWorldState {
  const newlyUnlocked: string[] = [];

  const check = (id: string, condition: boolean) => {
    if (condition && !state.achievements.includes(id)) {
      newlyUnlocked.push(id);
    }
  };

  check('ach-explorer', state.discoveredDistricts.length >= 5);
  check('ach-citizen-friend', state.stats.questsCompleted >= 3);
  check(
    'ach-market-master',
    state.quests['q-main-2']?.status === 'completed' && state.coins >= 900
  );
  check('ach-culture-keeper', state.collectibles.length >= 4);
  check(
    'ach-city-builder',
    state.stats.buildingsBuilt >= 2 && state.stats.buildingsUpgraded >= 1
  );
  check(
    'ach-harbor-adventurer',
    state.stats.shipsBoarded >= 1 && state.quests['q-main-3']?.status === 'completed'
  );
  check('ach-sailor', state.stats.vehiclesDriven >= 1);

  const mainDone = STAGE1_QUESTS.filter((q) => q.kind === 'main').every(
    (q) => state.quests[q.id]?.status === 'completed'
  );
  check('ach-hero', mainDone);

  if (newlyUnlocked.length === 0) return state;

  let next = {
    ...state,
    achievements: [...state.achievements, ...newlyUnlocked],
  };

  let bonusXp = 0;
  let bonusCoins = 0;
  const titles: string[] = [];
  for (const id of newlyUnlocked) {
    const def = STAGE1_ACHIEVEMENTS.find((a) => a.id === id);
    if (def) {
      bonusXp += def.xpReward;
      bonusCoins += def.coinReward;
      titles.push(def.title);
    }
  }

  next = addXpAndCoins(next, bonusXp, bonusCoins);
  return withNotif(
    next,
    'success',
    `Pencapaian Terbuka: ${titles.join(', ')} (+${bonusXp} XP, +${bonusCoins} Koin)`
  );
}

export function discoverDistrict(
  state: Stage1OpenWorldState,
  districtId: DistrictId
): Stage1OpenWorldState {
  let next = state;
  if (!state.discoveredDistricts.includes(districtId)) {
    const def = STAGE1_DISTRICTS.find((d) => d.id === districtId);
    const xp = def?.discoveryXp ?? 35;

    const granted = grantCustomizationIds(
      state.unlockedCustomizationIds,
      districtId === 'wisata-alam' ? ['caping-petualang'] : []
    );
    const legacy = syncLegacyCosmetics(granted.nextIds, state.appearance);

    next = {
      ...state,
      discoveredDistricts: [...state.discoveredDistricts, districtId],
      unlockedCustomizationIds: granted.nextIds,
      ...legacy,
    };
    next = addXpAndCoins(next, xp, 25);
    next = withNotif(next, 'info', `Kawasan Ditemukan: ${def?.name ?? districtId}! (+${xp} XP)`);
  }
  next = triggerQuestEvent(next, 'visit_district', districtId);
  return evaluateAchievements(next);
}

export function acceptQuest(state: Stage1OpenWorldState, questId: string): Stage1OpenWorldState {
  const existing = state.quests[questId];
  const def = STAGE1_QUESTS.find((q) => q.id === questId);
  if (!def || !existing || existing.status !== 'available') return state;

  const next: Stage1OpenWorldState = {
    ...state,
    quests: {
      ...state.quests,
      [questId]: { status: 'active', stepIndex: 0 },
    },
    trackedQuestId: questId,
  };
  return withNotif(next, 'info', `Misi Baru Dimulai: ${def.title}`);
}

export function triggerQuestEvent(
  state: Stage1OpenWorldState,
  eventType: QuestEventType,
  targetId: string
): Stage1OpenWorldState {
  let next = state;
  let updated = false;

  for (const qDef of STAGE1_QUESTS) {
    const prog = next.quests[qDef.id];
    if (!prog || prog.status !== 'active') continue;
    const step = qDef.steps[prog.stepIndex];
    if (!step) continue;

    const matchTarget = step.targetId === '*' || step.targetId === targetId;
    if (step.eventType !== eventType || !matchTarget) continue;

    if (step.requiredItemToConsume && !hasInventoryItem(next.inventory, step.requiredItemToConsume)) {
      continue;
    }

    let nextInventory = next.inventory;
    if (step.requiredItemToConsume) {
      nextInventory = removeItemFromInventory(nextInventory, step.requiredItemToConsume, 1);
    }

    const nextStepIdx = prog.stepIndex + 1;
    if (nextStepIdx >= qDef.steps.length) {
      // Complete Quest & grant full multi-category rewards
      if (qDef.rewards.itemId) {
        nextInventory = addItemToInventory(
          nextInventory,
          qDef.rewards.itemId,
          qDef.rewards.itemQty ?? 1
        );
      }

      const granted = grantCustomizationIds(next.unlockedCustomizationIds, [
        qDef.rewards.unlockCosmeticId,
        ...(qDef.rewards.unlockCustomizationIds ?? []),
      ]);
      const legacy = syncLegacyCosmetics(granted.nextIds, next.appearance);

      let unlockedBlueprints = next.unlockedBlueprints;
      let unlockedBlueprintId: string | undefined;
      if (
        qDef.rewards.unlockBlueprintId &&
        !unlockedBlueprints.includes(qDef.rewards.unlockBlueprintId)
      ) {
        unlockedBlueprints = [...unlockedBlueprints, qDef.rewards.unlockBlueprintId];
        unlockedBlueprintId = qDef.rewards.unlockBlueprintId;
      }

      let unlockedTitles = next.unlockedTitles;
      let unlockedTitleId: string | undefined;
      if (qDef.rewards.unlockTitleId && !unlockedTitles.includes(qDef.rewards.unlockTitleId)) {
        unlockedTitles = [...unlockedTitles, qDef.rewards.unlockTitleId];
        unlockedTitleId = qDef.rewards.unlockTitleId;
      }

      const nextQuests: Record<string, QuestProgress> = {
        ...next.quests,
        [qDef.id]: { status: 'completed', stepIndex: qDef.steps.length },
      };

      // Check if all 5 main quests are now completed -> ensure Arsitek Utama title
      const allMainDone = STAGE1_QUESTS.filter((q) => q.kind === 'main').every(
        (q) => nextQuests[q.id]?.status === 'completed'
      );
      if (allMainDone && !unlockedTitles.includes('title-arsitek-utama')) {
        unlockedTitles = [...unlockedTitles, 'title-arsitek-utama'];
        unlockedTitleId = unlockedTitleId ?? 'title-arsitek-utama';
      }

      // Auto-activate next main quest if this was a main quest
      let nextTracked = next.trackedQuestId;
      if (qDef.kind === 'main') {
        const nextMain = STAGE1_QUESTS.find(
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

      next = {
        ...next,
        quests: nextQuests,
        trackedQuestId: nextTracked,
        inventory: nextInventory,
        unlockedCustomizationIds: granted.nextIds,
        unlockedBlueprints,
        unlockedTitles,
        ...legacy,
        reputation: clamp(next.reputation + qDef.rewards.reputation, 0, 100),
        happiness: clamp(next.happiness + qDef.rewards.happiness, 0, 100),
        welfare: clamp(next.welfare + qDef.rewards.welfare, 0, 100),
        score: clamp(next.score + 10, 0, 500),
        indicators: {
          ...next.indicators,
          hpKota: clamp(next.indicators.hpKota + 4, 0, 100),
        },
        stats: {
          ...next.stats,
          questsCompleted: next.stats.questsCompleted + 1,
        },
      };
      next = addXpAndCoins(next, qDef.rewards.xp, qDef.rewards.coins);
      next = {
        ...next,
        lastRewardCelebration: makeCelebration({
          sourceTitle: qDef.title,
          sourceKind: 'quest',
          xp: qDef.rewards.xp,
          coins: qDef.rewards.coins,
          unlockedCustomizationIds: granted.newlyUnlocked,
          unlockedBlueprintId,
          unlockedTitleId,
          unlockedItemId: qDef.rewards.itemId,
          unlockedItemQty: qDef.rewards.itemQty,
        }),
      };
      next = withNotif(
        next,
        'success',
        `Misi Selesai: ${qDef.title}! (+${qDef.rewards.xp} XP, +${qDef.rewards.coins} Koin)`
      );
      updated = true;
    } else {
      next = {
        ...next,
        inventory: nextInventory,
        quests: {
          ...next.quests,
          [qDef.id]: { status: 'active', stepIndex: nextStepIdx },
        },
      };
      next = withNotif(
        next,
        'info',
        `Tahap Misi Selesai! Lanjut: ${qDef.steps[nextStepIdx].description}`
      );
      updated = true;
    }
  }

  return updated ? evaluateAchievements(next) : next;
}

export function collectWorldPickup(
  state: Stage1OpenWorldState,
  pickupId: string
): Stage1OpenWorldState {
  if (state.collectedPickups.includes(pickupId)) return state;
  const def = STAGE1_WORLD_PICKUPS.find((p) => p.id === pickupId);
  if (!def) return state;

  let next: Stage1OpenWorldState = {
    ...state,
    collectedPickups: [...state.collectedPickups, pickupId],
    inventory: addItemToInventory(state.inventory, def.itemId, 1),
  };
  next = addXpAndCoins(next, 25, 15);
  next = withNotif(next, 'success', `Diambil: ${def.label} (+25 XP)`);
  next = triggerQuestEvent(next, 'collect_item', def.itemId);
  return evaluateAchievements(next);
}

export function collectNusantaraArtifact(
  state: Stage1OpenWorldState,
  collectibleId: string
): Stage1OpenWorldState {
  if (state.collectibles.includes(collectibleId)) return state;
  const def = STAGE1_COLLECTIBLES.find((c) => c.id === collectibleId);
  if (!def) return state;

  const nextCollectibles = [...state.collectibles, collectibleId];
  const nextCount = nextCollectibles.length;

  const directUnlocks: string[] = [];
  if (nextCount >= 2) directUnlocks.push('batik-saudagar');
  if (nextCount >= 5) directUnlocks.push('jubah-budayawan');

  let claimedMilestones = [...state.claimedMilestones];
  let unlockedBlueprints = [...state.unlockedBlueprints];
  let unlockedTitles = [...state.unlockedTitles];
  let milestoneXp = 0;
  let milestoneCoins = 0;
  let milestoneTitleSummary = '';
  let milestoneBlueprint: string | undefined;
  let milestoneTitleUnlock: string | undefined;

  for (const m of COLLECTION_MILESTONES) {
    if (nextCount >= m.requiredCount && !claimedMilestones.includes(m.id)) {
      claimedMilestones.push(m.id);
      milestoneXp += m.xpReward;
      milestoneCoins += m.coinReward;
      milestoneTitleSummary = m.title;
      if (m.unlockCustomizationIds) {
        directUnlocks.push(...m.unlockCustomizationIds);
      }
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

  const granted = grantCustomizationIds(state.unlockedCustomizationIds, directUnlocks);
  const legacy = syncLegacyCosmetics(granted.nextIds, state.appearance);

  let next: Stage1OpenWorldState = {
    ...state,
    collectibles: nextCollectibles,
    claimedMilestones,
    unlockedCustomizationIds: granted.nextIds,
    unlockedBlueprints,
    unlockedTitles,
    ...legacy,
    culturePreservation: clamp(state.culturePreservation + def.cultureBonus, 0, 100),
    indicators: {
      ...state.indicators,
      kearifanLokal: clamp(state.indicators.kearifanLokal + Math.ceil(def.cultureBonus / 2), 0, 100),
    },
    score: clamp(state.score + 6, 0, 500),
    stats: {
      ...state.stats,
      collectiblesFound: nextCount,
    },
  };

  next = addXpAndCoins(next, def.xpReward + milestoneXp, def.coinReward + milestoneCoins);

  if (milestoneTitleSummary) {
    next = {
      ...next,
      lastRewardCelebration: makeCelebration({
        sourceTitle: `Milestone Koleksi: ${milestoneTitleSummary}`,
        sourceKind: 'milestone',
        xp: def.xpReward + milestoneXp,
        coins: def.coinReward + milestoneCoins,
        unlockedCustomizationIds: granted.newlyUnlocked,
        unlockedBlueprintId: milestoneBlueprint,
        unlockedTitleId: milestoneTitleUnlock,
      }),
    };
    next = withNotif(
      next,
      'success',
      `${def.name} & Milestone ${milestoneTitleSummary} terbuka! (+${def.xpReward + milestoneXp} XP)`
    );
  } else {
    next = withNotif(
      next,
      'success',
      `Koleksi ${def.rarity}: ${def.name} ditemukan! (+${def.xpReward} XP, +${def.coinReward} Koin)`
    );
  }

  next = triggerQuestEvent(next, 'collect_artifact', collectibleId);
  return evaluateAchievements(next);
}

export function deliverToSpot(
  state: Stage1OpenWorldState,
  spotId: string
): Stage1OpenWorldState {
  if (state.completedDeliveries.includes(spotId)) return state;
  const spot = STAGE1_DELIVERY_SPOTS.find((s) => s.id === spotId);
  if (!spot) return state;

  if (!hasInventoryItem(state.inventory, spot.requiredItemId)) {
    const itemDef = STAGE1_ITEMS.find((i) => i.id === spot.requiredItemId);
    return withNotif(
      state,
      'warning',
      `Kamu perlu membawa ${itemDef?.name ?? spot.requiredItemId} terlebih dahulu.`
    );
  }

  let next: Stage1OpenWorldState = {
    ...state,
    completedDeliveries: [...state.completedDeliveries, spotId],
    welfare: clamp(state.welfare + 6, 0, 100),
    happiness: clamp(state.happiness + 5, 0, 100),
  };
  next = addXpAndCoins(next, 45, 70);
  next = triggerQuestEvent(next, 'deliver_item', spotId);
  return evaluateAchievements(next);
}

export function useInventoryItem(
  state: Stage1OpenWorldState,
  itemId: string
): Stage1OpenWorldState {
  if (!hasInventoryItem(state.inventory, itemId)) return state;
  const itemDef = STAGE1_ITEMS.find((i) => i.id === itemId);
  if (!itemDef || itemDef.category !== 'consumable') return state;

  let next: Stage1OpenWorldState = {
    ...state,
    inventory: removeItemFromInventory(state.inventory, itemId, 1),
  };

  if (itemId === 'kopi-rempah') {
    next = {
      ...next,
      happiness: clamp(next.happiness + 4, 0, 100),
    };
    next = addXpAndCoins(next, 25, 0);
    return withNotif(next, 'success', 'Kopi Rempah diminum! (+25 XP, +4 Kebahagiaan)');
  }

  if (itemId === 'kompas-nakhoda') {
    next = {
      ...next,
      reputation: clamp(next.reputation + 3, 0, 100),
      scienceProgress: clamp(next.scienceProgress + 4, 0, 100),
    };
    next = addXpAndCoins(next, 35, 0);
    return withNotif(next, 'success', 'Kompas Nakhoda digunakan! (+35 XP, +3 Reputasi)');
  }

  if (itemId === 'palu-arsitek') {
    const hasConstructing = next.placedBuildings.some((b) => b.isConstructing);
    if (!hasConstructing) {
      return withNotif(state, 'warning', 'Belum ada proyek bangunan yang sedang dibangun.');
    }
    let finishedName = '';
    const updated = next.placedBuildings.map((b) => {
      if (!b.isConstructing) return b;
      const nextProg = Math.min(1, b.constructionProgress + 0.5);
      const done = nextProg >= 1;
      if (done) {
        finishedName = BUILDING_CATALOG.find((c) => c.id === b.buildingId)?.name ?? b.buildingId;
      }
      return {
        ...b,
        constructionProgress: nextProg,
        isConstructing: !done,
      };
    });
    next = { ...next, placedBuildings: updated };
    if (finishedName) {
      next = finalizeCompletedBuildings(next, [finishedName]);
    }
    return withNotif(next, 'success', 'Palu Arsitek mempercepat pembangunan kota!');
  }

  return next;
}

export function equipCosmetic(
  state: Stage1OpenWorldState,
  kind: 'outfit' | 'hat',
  cosmeticId: string
): Stage1OpenWorldState {
  if (!state.unlockedCustomizationIds.includes(cosmeticId)) {
    return state;
  }
  if (kind === 'outfit') {
    return updatePlayerAppearance(state, { jacketId: cosmeticId }, { triggerQuest: true });
  }
  return updatePlayerAppearance(state, { hatId: cosmeticId }, { triggerQuest: true });
}

export function updatePlayerAppearance(
  state: Stage1OpenWorldState,
  patch: Partial<CharacterAppearance>,
  options: { triggerQuest?: boolean } = { triggerQuest: true }
): Stage1OpenWorldState {
  const unlocked = state.unlockedCustomizationIds;
  const candidate: CharacterAppearance = {
    ...state.appearance,
    ...patch,
  };

  // Validate wearable slot items against unlockedCustomizationIds
  const checkSlotItem = (
    val: string,
    slot: (typeof CUSTOMIZATION_ITEMS)[number]['slot'],
    fallback: string
  ) => {
    const item = CUSTOMIZATION_ITEMS.find((i) => i.id === val && i.slot === slot);
    if (!item || !unlocked.includes(item.id)) return fallback;
    return val;
  };

  const validated: CharacterAppearance = {
    facePreset: FACE_PRESETS.some((f) => f.id === candidate.facePreset)
      ? candidate.facePreset
      : state.appearance.facePreset,
    skinTone: SKIN_TONES.some((s) => s.id === candidate.skinTone)
      ? candidate.skinTone
      : state.appearance.skinTone,
    eyeShape: EYE_SHAPES.some((e) => e.id === candidate.eyeShape)
      ? candidate.eyeShape
      : state.appearance.eyeShape,
    eyeColor: EYE_COLORS.some((c) => c.id === candidate.eyeColor)
      ? candidate.eyeColor
      : state.appearance.eyeColor,
    eyebrowStyle: EYEBROW_STYLES.some((b) => b.id === candidate.eyebrowStyle)
      ? candidate.eyebrowStyle
      : state.appearance.eyebrowStyle,
    nosePreset: NOSE_PRESETS.some((n) => n.id === candidate.nosePreset)
      ? candidate.nosePreset
      : state.appearance.nosePreset,
    mouthPreset: MOUTH_PRESETS.some((m) => m.id === candidate.mouthPreset)
      ? candidate.mouthPreset
      : state.appearance.mouthPreset,
    hairColor: HAIR_COLORS.some((h) => h.id === candidate.hairColor)
      ? candidate.hairColor
      : state.appearance.hairColor,
    bodyType: BODY_TYPES.some((b) => b.id === candidate.bodyType)
      ? candidate.bodyType
      : state.appearance.bodyType,
    hairstyle: checkSlotItem(candidate.hairstyle, 'hairstyle', state.appearance.hairstyle),
    shirtId: checkSlotItem(candidate.shirtId, 'shirt', state.appearance.shirtId),
    jacketId: checkSlotItem(candidate.jacketId, 'jacket', state.appearance.jacketId),
    pantsId: checkSlotItem(candidate.pantsId, 'pants', state.appearance.pantsId),
    shoeId: checkSlotItem(candidate.shoeId, 'shoes', state.appearance.shoeId),
    hatId: checkSlotItem(candidate.hatId, 'hat', state.appearance.hatId),
    glassesId: checkSlotItem(candidate.glassesId, 'glasses', state.appearance.glassesId),
    bagId: checkSlotItem(candidate.bagId, 'bag', state.appearance.bagId),
    accessoryId: checkSlotItem(candidate.accessoryId, 'accessory', state.appearance.accessoryId),
  };

  const legacy = syncLegacyCosmetics(unlocked, validated);
  let next: Stage1OpenWorldState = {
    ...state,
    appearance: validated,
    ...legacy,
  };
  next = withNotif(next, 'info', 'Tampilan karakter 3D diperbarui dan disimpan.');
  if (options.triggerQuest !== false) {
    next = triggerQuestEvent(next, 'customize_avatar', '*');
  }
  return evaluateAchievements(next);
}

export function randomizeUnlockedAppearance(
  unlockedCustomizationIds: string[],
  rng: () => number = Math.random
): CharacterAppearance {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length) % arr.length];
  const pickSlot = (slot: (typeof CUSTOMIZATION_ITEMS)[number]['slot'], fallback: string) => {
    const opts = CUSTOMIZATION_ITEMS.filter(
      (i) => i.slot === slot && unlockedCustomizationIds.includes(i.id)
    );
    return opts.length > 0 ? pick(opts).id : fallback;
  };

  return {
    facePreset: pick(FACE_PRESETS).id,
    skinTone: pick(SKIN_TONES).id,
    eyeShape: pick(EYE_SHAPES).id,
    eyeColor: pick(EYE_COLORS).id,
    eyebrowStyle: pick(EYEBROW_STYLES).id,
    nosePreset: pick(NOSE_PRESETS).id,
    mouthPreset: pick(MOUTH_PRESETS).id,
    hairColor: pick(HAIR_COLORS).id,
    bodyType: pick(BODY_TYPES).id,
    hairstyle: pickSlot('hairstyle', DEFAULT_CHARACTER_APPEARANCE.hairstyle),
    shirtId: pickSlot('shirt', DEFAULT_CHARACTER_APPEARANCE.shirtId),
    jacketId: pickSlot('jacket', DEFAULT_CHARACTER_APPEARANCE.jacketId),
    pantsId: pickSlot('pants', DEFAULT_CHARACTER_APPEARANCE.pantsId),
    shoeId: pickSlot('shoes', DEFAULT_CHARACTER_APPEARANCE.shoeId),
    hatId: pickSlot('hat', DEFAULT_CHARACTER_APPEARANCE.hatId),
    glassesId: pickSlot('glasses', DEFAULT_CHARACTER_APPEARANCE.glassesId),
    bagId: pickSlot('bag', DEFAULT_CHARACTER_APPEARANCE.bagId),
    accessoryId: pickSlot('accessory', DEFAULT_CHARACTER_APPEARANCE.accessoryId),
  };
}

export function randomizePlayerAppearance(
  state: Stage1OpenWorldState,
  rng: () => number = Math.random
): Stage1OpenWorldState {
  const randomApp = randomizeUnlockedAppearance(state.unlockedCustomizationIds, rng);
  return updatePlayerAppearance(state, randomApp, { triggerQuest: true });
}

export function resetPlayerAppearance(state: Stage1OpenWorldState): Stage1OpenWorldState {
  return updatePlayerAppearance(state, DEFAULT_CHARACTER_APPEARANCE, { triggerQuest: false });
}

export function equipPlayerTitle(
  state: Stage1OpenWorldState,
  titleId: string
): Stage1OpenWorldState {
  if (!state.unlockedTitles.includes(titleId)) return state;
  const def = PLAYER_TITLES.find((t) => t.id === titleId);
  if (!def) return state;
  return withNotif({ ...state, equippedTitle: titleId }, 'info', `Gelar aktif diubah ke: ${def.name}`);
}

export function startBuildingConstruction(
  state: Stage1OpenWorldState,
  buildingId: string,
  x: number,
  z: number,
  rotationY: number
): Stage1OpenWorldState {
  const def = BUILDING_CATALOG.find((b) => b.id === buildingId);
  if (!def || def.minStage > 1) return state;

  if (!isBlueprintUnlocked(state, buildingId)) {
    return withNotif(
      state,
      'warning',
      `Cetak biru ${def.name} masih terkunci! ${def.unlockHint ?? 'Selesaikan misi terlebih dahulu.'}`
    );
  }

  if (state.coins < def.cost) {
    return withNotif(state, 'error', `Koin tidak cukup! Butuh ${def.cost} Koin untuk ${def.name}.`);
  }

  const instance: PlacedBuildingInstance = {
    id: `binst-${Date.now()}-${state.placedBuildings.length + 1}`,
    buildingId: def.id,
    x: Number(x.toFixed(2)),
    z: Number(z.toFixed(2)),
    rotationY,
    level: 1,
    constructionProgress: 0.08,
    isConstructing: true,
    builtAtMs: Date.now(),
  };

  const next: Stage1OpenWorldState = {
    ...state,
    coins: state.coins - def.cost,
    placedBuildings: [...state.placedBuildings, instance],
  };

  return withNotif(
    next,
    'info',
    `Proyek ${def.name} dimulai! Pekerja sedang membangun di lokasi.`
  );
}

function finalizeCompletedBuildings(
  state: Stage1OpenWorldState,
  newlyCompletedIds: string[]
): Stage1OpenWorldState {
  let next = state;
  for (const bId of newlyCompletedIds) {
    const def = BUILDING_CATALOG.find((b) => b.id === bId || b.name === bId);
    if (!def) continue;

    const granted = grantCustomizationIds(next.unlockedCustomizationIds, ['rompi-insinyur']);
    const legacy = syncLegacyCosmetics(granted.nextIds, next.appearance);

    next = {
      ...next,
      unlockedCustomizationIds: granted.nextIds,
      ...legacy,
      score: clamp(next.score + def.effects.scoreBonus, 0, 500),
      reputation: clamp(next.reputation + 4, 0, 100),
      happiness: clamp(next.happiness + Math.max(2, Math.floor(def.effects.hpKota / 2)), 0, 100),
      welfare: clamp(next.welfare + 4, 0, 100),
      scienceProgress: clamp(next.scienceProgress + def.effects.iptek, 0, 100),
      culturePreservation: clamp(
        next.culturePreservation + Math.max(0, def.effects.kearifanLokal),
        0,
        100
      ),
      indicators: {
        ekonomiGlobal: clamp(next.indicators.ekonomiGlobal + def.effects.ekonomiGlobal, 0, 100),
        iptek: clamp(next.indicators.iptek + def.effects.iptek, 0, 100),
        kearifanLokal: clamp(next.indicators.kearifanLokal + def.effects.kearifanLokal, 0, 100),
        hpKota: clamp(next.indicators.hpKota + def.effects.hpKota, 0, 100),
      },
      stats: {
        ...next.stats,
        buildingsBuilt: next.stats.buildingsBuilt + 1,
      },
    };
    next = addXpAndCoins(next, 60, 0);
    next = triggerQuestEvent(next, 'build_facility', def.id);
    next = withNotif(next, 'success', `${def.name} selesai dibangun dan mulai beroperasi! (+60 XP)`);
  }
  return evaluateAchievements(next);
}

export function tickBuildingConstructions(
  state: Stage1OpenWorldState,
  dtSeconds: number
): Stage1OpenWorldState {
  const constructing = state.placedBuildings.some((b) => b.isConstructing);
  if (!constructing) return state;

  const rate = 1 / 11; // ~11 seconds to finish construction naturally
  const completedBuildingIds: string[] = [];

  const updated = state.placedBuildings.map((b) => {
    if (!b.isConstructing) return b;
    const prog = Math.min(1, b.constructionProgress + dtSeconds * rate);
    if (prog >= 1) {
      completedBuildingIds.push(b.buildingId);
      return { ...b, constructionProgress: 1, isConstructing: false };
    }
    return { ...b, constructionProgress: prog };
  });

  let next = { ...state, placedBuildings: updated };
  if (completedBuildingIds.length > 0) {
    next = finalizeCompletedBuildings(next, completedBuildingIds);
  }
  return next;
}

export function upgradePlacedBuilding(
  state: Stage1OpenWorldState,
  instanceId: string
): Stage1OpenWorldState {
  const target = state.placedBuildings.find((b) => b.id === instanceId);
  if (!target || target.isConstructing || target.level >= 3) return state;

  const def = BUILDING_CATALOG.find((b) => b.id === target.buildingId);
  if (!def) return state;

  const upgradeCost = Math.round(def.cost * (target.level === 1 ? 0.75 : 1.15));
  if (state.coins < upgradeCost) {
    return withNotif(
      state,
      'error',
      `Butuh ${upgradeCost} Koin untuk meningkatkan ${def.name} ke Level ${target.level + 1}.`
    );
  }

  const nextLevel = (target.level + 1) as 2 | 3;
  let next: Stage1OpenWorldState = {
    ...state,
    coins: state.coins - upgradeCost,
    placedBuildings: state.placedBuildings.map((b) =>
      b.id === instanceId ? { ...b, level: nextLevel } : b
    ),
    score: clamp(state.score + 8, 0, 500),
    reputation: clamp(state.reputation + 5, 0, 100),
    happiness: clamp(nextLevel === 3 ? state.happiness + 6 : state.happiness + 4, 0, 100),
    indicators: {
      ekonomiGlobal: clamp(
        state.indicators.ekonomiGlobal + Math.ceil(def.effects.ekonomiGlobal * 0.5),
        0,
        100
      ),
      iptek: clamp(state.indicators.iptek + Math.ceil(def.effects.iptek * 0.5), 0, 100),
      kearifanLokal: clamp(
        state.indicators.kearifanLokal + Math.max(2, Math.ceil(def.effects.kearifanLokal * 0.5)),
        0,
        100
      ),
      hpKota: clamp(state.indicators.hpKota + 4, 0, 100),
    },
    stats: {
      ...state.stats,
      buildingsUpgraded: state.stats.buildingsUpgraded + 1,
    },
  };

  next = addXpAndCoins(next, 70, 0);
  next = triggerQuestEvent(next, 'upgrade_facility', def.id);
  next = withNotif(next, 'success', `${def.name} ditingkatkan ke Level ${nextLevel}! (+70 XP)`);
  return evaluateAchievements(next);
}

export function calculateOpenWorldIncome(state: Stage1OpenWorldState): number {
  let income = 14;
  for (const inst of state.placedBuildings) {
    if (inst.isConstructing) continue;
    const def = BUILDING_CATALOG.find((b) => b.id === inst.buildingId);
    if (!def) continue;
    const mult = inst.level === 1 ? 1 : inst.level === 2 ? 1.55 : 2.15;
    income += Math.round(def.effects.incomePerTick * mult);
  }
  return income;
}

export function recordShipBoarded(
  state: Stage1OpenWorldState,
  shipId: string
): Stage1OpenWorldState {
  const granted = grantCustomizationIds(state.unlockedCustomizationIds, ['topi-nakhoda']);
  const legacy = syncLegacyCosmetics(granted.nextIds, state.appearance);

  let next: Stage1OpenWorldState = {
    ...state,
    unlockedCustomizationIds: granted.nextIds,
    ...legacy,
    stats: {
      ...state.stats,
      shipsBoarded: state.stats.shipsBoarded + 1,
    },
  };
  next = triggerQuestEvent(next, 'board_ship', shipId);
  return evaluateAchievements(next);
}

export function recordInteriorEntered(
  state: Stage1OpenWorldState,
  interiorId: string
): Stage1OpenWorldState {
  let next: Stage1OpenWorldState = {
    ...state,
    stats: {
      ...state.stats,
      interiorsEntered: state.stats.interiorsEntered + 1,
    },
  };
  next = triggerQuestEvent(next, 'enter_interior', interiorId);
  return evaluateAchievements(next);
}

export function recordVehicleDriven(
  state: Stage1OpenWorldState,
  vehicleId: string
): Stage1OpenWorldState {
  let next: Stage1OpenWorldState = {
    ...state,
    stats: {
      ...state.stats,
      vehiclesDriven: state.stats.vehiclesDriven + 1,
    },
  };
  next = triggerQuestEvent(next, 'drive_vehicle', vehicleId);
  return evaluateAchievements(next);
}

export function getTrackedQuestDetails(state: Stage1OpenWorldState) {
  const qId =
    state.trackedQuestId && state.quests[state.trackedQuestId]?.status === 'active'
      ? state.trackedQuestId
      : Object.entries(state.quests).find(([, p]) => p.status === 'active')?.[0] ?? null;

  if (!qId) return null;
  const def = STAGE1_QUESTS.find((q) => q.id === qId);
  const prog = state.quests[qId];
  if (!def || !prog) return null;
  const step = def.steps[prog.stepIndex] ?? def.steps[def.steps.length - 1];
  return { quest: def, progress: prog, step };
}

export function saveStage1ToStorage(state: Stage1OpenWorldState): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STAGE1_SAVE_KEY, JSON.stringify(state));
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function loadStage1FromStorage(): Stage1OpenWorldState | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(STAGE1_SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Stage1OpenWorldState>;
    if (parsed.version !== 1 || !parsed.quests || !parsed.indicators) return null;
    const base = createInitialStage1State();

    // Backward-compatible merge of unlocked customization items, outfits, hats, & appearance
    const mergedUnlocked = Array.from(
      new Set([
        ...base.unlockedCustomizationIds,
        ...(parsed.unlockedCustomizationIds ?? []),
        ...(parsed.unlockedOutfits ?? []),
        ...(parsed.unlockedHats ?? []),
      ])
    );

    const mergedAppearance: CharacterAppearance = {
      ...base.appearance,
      ...(parsed.appearance ?? {}),
    };
    if (!parsed.appearance?.jacketId && parsed.equippedOutfit) {
      mergedAppearance.jacketId = parsed.equippedOutfit;
    }
    if (!parsed.appearance?.hatId && parsed.equippedHat) {
      mergedAppearance.hatId = parsed.equippedHat;
    }

    const legacy = syncLegacyCosmetics(mergedUnlocked, mergedAppearance);

    return {
      ...base,
      ...parsed,
      quests: { ...base.quests, ...parsed.quests },
      stats: { ...base.stats, ...parsed.stats },
      settings: { ...base.settings, ...parsed.settings },
      indicators: { ...base.indicators, ...parsed.indicators },
      appearance: mergedAppearance,
      unlockedCustomizationIds: mergedUnlocked,
      unlockedBlueprints: parsed.unlockedBlueprints ?? base.unlockedBlueprints,
      unlockedTitles: Array.from(
        new Set([...base.unlockedTitles, ...(parsed.unlockedTitles ?? [])])
      ),
      equippedTitle: parsed.equippedTitle ?? base.equippedTitle,
      claimedMilestones: parsed.claimedMilestones ?? base.claimedMilestones,
      lastRewardCelebration: null,
      ...legacy,
      playerPos: {
        x: typeof parsed.playerPos?.x === 'number' ? parsed.playerPos.x : base.playerPos.x,
        y: typeof parsed.playerPos?.y === 'number' ? parsed.playerPos.y : base.playerPos.y,
        z: typeof parsed.playerPos?.z === 'number' ? parsed.playerPos.z : base.playerPos.z,
        facingYaw:
          typeof parsed.playerPos?.facingYaw === 'number'
            ? parsed.playerPos.facingYaw
            : base.playerPos.facingYaw,
      },
    };
  } catch {
    return null;
  }
}

export function resetStage1Storage(): Stage1OpenWorldState {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STAGE1_SAVE_KEY);
    }
  } catch {
    // ignore
  }
  return createInitialStage1State();
}
