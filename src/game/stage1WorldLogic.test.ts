import test from 'node:test';
import assert from 'node:assert/strict';
import {
  acceptQuest,
  addXpAndCoins,
  calculateOpenWorldIncome,
  collectNusantaraArtifact,
  collectWorldPickup,
  createInitialStage1State,
  deliverToSpot,
  discoverDistrict,
  dismissRewardCelebration,
  equipCosmetic,
  equipPlayerTitle,
  getTrackedQuestDetails,
  hasInventoryItem,
  isBlueprintUnlocked,
  loadStage1FromStorage,
  randomizePlayerAppearance,
  recordInteriorEntered,
  recordShipBoarded,
  recordVehicleDriven,
  resetPlayerAppearance,
  resetStage1Storage,
  saveStage1ToStorage,
  STAGE1_SAVE_KEY,
  startBuildingConstruction,
  tickBuildingConstructions,
  triggerQuestEvent,
  updatePlayerAppearance,
  upgradePlacedBuilding,
  useInventoryItem,
  xpNeededForLevel,
} from './stage1WorldLogic';
import {
  DEFAULT_CHARACTER_APPEARANCE,
  STAGE1_COLLECTIBLES,
  STAGE1_ENTERABLE_BUILDINGS,
  STAGE1_WARDROBE_MIRROR_SPOT,
} from './stage1Data';
import {
  buildStage1WorldColliders,
  createInitialVehicles,
  findNearestStage1Interactable,
  getStage1BoardedShipId,
  getStage1CrowdPatrols,
  getStage1EnterableBuildingAt,
  getStage1Npcs,
  getStage1SceneryBuildings,
  stage1GroundHeightAt,
  stepStage1PlayerPhysics,
  stepVehiclePhysics,
  validateFreeBuildingPlacement,
} from './stage1Physics';
import { Player3DState } from './world3dPhysics';

test('initial Stage 1 state starts at level 1 with active first main quest', () => {
  const s = createInitialStage1State();
  assert.equal(s.playerLevel, 1);
  assert.equal(s.coins, 720);
  assert.equal(s.quests['q-main-1'].status, 'active');
  assert.equal(s.trackedQuestId, 'q-main-1');
  assert.equal(hasInventoryItem(s.inventory, 'kopi-rempah'), true);
});

test('XP gain levels up player and unlocks engineer outfit at level 2', () => {
  let s = createInitialStage1State();
  const needed = xpNeededForLevel(1);
  s = addXpAndCoins(s, needed + 15, 50);
  assert.equal(s.playerLevel, 2);
  assert.equal(s.xp, 15);
  assert.equal(s.coins, 770);
  assert.equal(s.unlockedOutfits.includes('rompi-insinyur'), true);
});

test('Main Quest 1 full flow awards Blangkon Batik and auto-activates Main Quest 2', () => {
  let s = createInitialStage1State();
  s = triggerQuestEvent(s, 'talk_npc', 'npc-aditya');
  assert.equal(s.quests['q-main-1'].stepIndex, 1);

  s = discoverDistrict(s, 'pasar-tradisional');
  assert.equal(s.discoveredDistricts.includes('pasar-tradisional'), true);
  assert.equal(s.quests['q-main-1'].stepIndex, 2);

  s = discoverDistrict(s, 'pelabuhan');
  assert.equal(s.quests['q-main-1'].stepIndex, 3);

  s = triggerQuestEvent(s, 'talk_npc', 'npc-aditya');
  assert.equal(s.quests['q-main-1'].status, 'completed');
  assert.equal(s.unlockedHats.includes('blangkon-batik'), true);
  assert.equal(s.quests['q-main-2'].status, 'active');
  assert.equal(s.trackedQuestId, 'q-main-2');
  assert.equal(getTrackedQuestDetails(s)?.quest.id, 'q-main-2');
});

test('Pickups, deliveries, consumables, artifacts, and cosmetics work end-to-end', () => {
  let s = createInitialStage1State();
  // Activate side quest & complete main quest 1 -> 2 chain quickly
  s = triggerQuestEvent(s, 'talk_npc', 'npc-aditya');
  s = discoverDistrict(s, 'pasar-tradisional');
  s = discoverDistrict(s, 'pelabuhan');
  s = triggerQuestEvent(s, 'talk_npc', 'npc-aditya');

  // Quest 2 flow
  s = triggerQuestEvent(s, 'talk_npc', 'npc-laras');
  s = collectWorldPickup(s, 'pk-cengkih');
  assert.equal(hasInventoryItem(s.inventory, 'karung-cengkih'), true);
  s = collectWorldPickup(s, 'pk-batik');
  assert.equal(s.quests['q-main-2'].stepIndex, 3);

  // Delivery consumes karung-cengkih
  s = deliverToSpot(s, 'delivery-pasar-utama');
  assert.equal(hasInventoryItem(s.inventory, 'karung-cengkih'), false);
  assert.equal(s.quests['q-main-2'].stepIndex, 4);

  s = triggerQuestEvent(s, 'talk_npc', 'npc-laras');
  assert.equal(s.quests['q-main-2'].status, 'completed');
  assert.equal(s.unlockedOutfits.includes('batik-saudagar'), true);

  // Equip unlocked cosmetic
  s = equipCosmetic(s, 'outfit', 'batik-saudagar');
  assert.equal(s.equippedOutfit, 'batik-saudagar');
  s = equipCosmetic(s, 'hat', 'blangkon-batik');
  assert.equal(s.equippedHat, 'blangkon-batik');

  // Consumable kopi-rempah adds happiness + XP
  const beforeHappy = s.happiness;
  s = useInventoryItem(s, 'kopi-rempah');
  assert.ok(s.happiness >= beforeHappy);

  // Collect artifact & side quest
  s = acceptQuest(s, 'q-side-2');
  s = discoverDistrict(s, 'wisata-alam');
  s = collectNusantaraArtifact(s, 'col-topeng-barong');
  assert.equal(s.collectibles.includes('col-topeng-barong'), true);
  assert.equal(s.quests['q-side-2'].status, 'completed');
  assert.equal(s.unlockedHats.includes('caping-petualang'), true);
});

test('Free building placement validation, construction progress, palu speed-up, and Lv 1->3 upgrades', () => {
  let s = createInitialStage1State();
  s = addXpAndCoins(s, 0, 1500);

  // Reject central road
  assert.equal(
    validateFreeBuildingPlacement('pasar-tradisional', 0, 0, s.placedBuildings, -7, 0).valid,
    false
  );
  // Reject river channel
  assert.equal(
    validateFreeBuildingPlacement('taman-kota', -58, 10, s.placedBuildings, 0, 0).valid,
    false
  );
  // Reject non-port in ocean
  assert.equal(
    validateFreeBuildingPlacement('pasar-tradisional', 65, 20, s.placedBuildings, 0, 0).valid,
    false
  );
  // Accept port on east coast
  assert.equal(
    validateFreeBuildingPlacement('pelabuhan-nusantara', 54, -20, s.placedBuildings, 0, 0).valid,
    true
  );
  // Accept standard building on open city land
  assert.equal(
    validateFreeBuildingPlacement('pasar-tradisional', 10, 14, s.placedBuildings, 0, 0).valid,
    true
  );

  const coinsBefore = s.coins;
  s = startBuildingConstruction(s, 'pasar-tradisional', 10, 14, Math.PI / 2);
  assert.equal(s.placedBuildings.length, 1);
  assert.equal(s.placedBuildings[0].isConstructing, true);
  assert.ok(s.coins < coinsBefore);

  // Palu arsitek without construction refunds, with construction speeds up
  s = collectWorldPickup(s, 'pk-palu-1');
  const progBefore = s.placedBuildings[0].constructionProgress;
  s = useInventoryItem(s, 'palu-arsitek');
  assert.ok(s.placedBuildings[0].constructionProgress > progBefore);

  // Tick until complete
  s = tickBuildingConstructions(s, 10);
  assert.equal(s.placedBuildings[0].isConstructing, false);
  assert.equal(s.placedBuildings[0].constructionProgress, 1);
  assert.equal(s.stats.buildingsBuilt, 1);

  const lv1Income = calculateOpenWorldIncome(s);
  const instId = s.placedBuildings[0].id;
  s = upgradePlacedBuilding(s, instId);
  assert.equal(s.placedBuildings[0].level, 2);
  const lv2Income = calculateOpenWorldIncome(s);
  assert.ok(lv2Income > lv1Income);

  s = upgradePlacedBuilding(s, instId);
  assert.equal(s.placedBuildings[0].level, 3);
  assert.ok(calculateOpenWorldIncome(s) > lv2Income);
});

test('Stage 1 physics supports all 9 enterable doorways, wardrobe mirror, dense city, ship gangway boarding, arched bridges, hill, and boat sailing', () => {
  const colliders = buildStage1WorldColliders([]);
  assert.equal(STAGE1_ENTERABLE_BUILDINGS.length, 9);
  assert.ok(getStage1SceneryBuildings().length >= 80);
  assert.ok(getStage1CrowdPatrols().length >= 18);
  assert.ok(getStage1Npcs().length >= 16);

  // Check all 9 enterable buildings have unobstructed walkable doorway entry
  for (const b of STAGE1_ENTERABLE_BUILDINGS) {
    let startX = b.x;
    let startZ = b.z;
    let fwd = 1;
    let yaw = 0;

    if (b.doorSide === 'south') {
      startZ = b.z + b.halfD + 1.2;
      yaw = Math.PI; // -Z moves north into south door
    } else if (b.doorSide === 'north') {
      startZ = b.z - b.halfD - 1.2;
      yaw = 0; // +Z moves south into north door
    } else if (b.doorSide === 'east') {
      startX = b.x + b.halfW + 1.2;
      yaw = -Math.PI / 2; // -X moves west into east door
    } else if (b.doorSide === 'west') {
      startX = b.x - b.halfW - 1.2;
      yaw = Math.PI / 2; // +X moves east into west door
    }

    let p: Player3DState = {
      x: startX,
      y: 0,
      z: startZ,
      vx: 0,
      vy: 0,
      vz: 0,
      facingYaw: yaw,
      grounded: true,
      speed: 0,
      walkCycle: 0,
    };

    for (let i = 0; i < 30; i++) {
      p = stepStage1PlayerPhysics(
        p,
        { forward: fwd, right: 0, sprint: false, jump: false },
        yaw,
        colliders,
        0.04
      );
    }

    const inside = getStage1EnterableBuildingAt(p.x, p.z);
    assert.equal(inside?.id, b.id, `Should walk smoothly into ${b.label}`);
    assert.equal(p.y, 0.22);
  }

  // Check ship gangway boarding onto Kapal Pinisi deck & raised stern deck
  assert.ok(stage1GroundHeightAt(73.5, 4.7) > 1.25); // Gangway ramp
  assert.equal(stage1GroundHeightAt(76.0, 8.5), 2.15); // Main deck
  assert.equal(stage1GroundHeightAt(66.5, 8.5), 3.25); // Upper stern deck
  assert.equal(getStage1BoardedShipId(76.0, 8.5, 2.15), 'ship-pinisi');

  // Check arched river bridges and Bukit Wisata elevation
  assert.ok(stage1GroundHeightAt(-58.0, 0.0) > 1.4); // West bridge crest
  assert.ok(stage1GroundHeightAt(0.0, 56.0) > 1.4); // South bridge crest
  assert.equal(stage1GroundHeightAt(-90.0, -54.0), 4.6); // Bukit Wisata summit

  // Check Boat physics sailing east toward Pulau Mercusuar
  const vehicles = createInitialVehicles();
  let boat = vehicles.find((v) => v.def.id === 'veh-perahu-1')!;
  const startBoatX = boat.x;
  for (let i = 0; i < 40; i++) {
    boat = stepVehiclePhysics(boat, { forward: 1, right: 0 }, colliders, 0.04);
  }
  assert.ok(boat.x > startBoatX + 10);
  assert.equal(boat.y, -0.15);

  // Check Wardrobe Mirror interactable inside Butik Busana
  const nearMirror = findNearestStage1Interactable(
    STAGE1_WARDROBE_MIRROR_SPOT.x - 0.8,
    STAGE1_WARDROBE_MIRROR_SPOT.z,
    {
      collectedPickups: [],
      collectedArtifacts: [],
      completedDeliveries: [],
      placedBuildings: [],
      vehicles,
    }
  );
  assert.equal(nearMirror?.kind, 'wardrobe_mirror');
});

test('15 collectibles trigger 4 milestones, unlock blueprints & Kurator Agung title, and celebrate rewards', () => {
  assert.equal(STAGE1_COLLECTIBLES.length, 15);
  let s = createInitialStage1State();

  for (let i = 0; i < 4; i++) {
    s = collectNusantaraArtifact(s, STAGE1_COLLECTIBLES[i].id);
  }
  assert.equal(s.claimedMilestones.includes('mile-25'), true);
  assert.equal(s.unlockedCustomizationIds.includes('glasses-cendekia'), true);

  for (let i = 4; i < 8; i++) {
    s = collectNusantaraArtifact(s, STAGE1_COLLECTIBLES[i].id);
  }
  assert.equal(s.claimedMilestones.includes('mile-50'), true);
  assert.equal(isBlueprintUnlocked(s, 'gapura-batik'), true);
  assert.equal(s.lastRewardCelebration?.sourceKind, 'milestone');

  for (let i = 8; i < 15; i++) {
    s = collectNusantaraArtifact(s, STAGE1_COLLECTIBLES[i].id);
  }
  assert.equal(s.collectibles.length, 15);
  assert.equal(s.claimedMilestones.includes('mile-75'), true);
  assert.equal(s.claimedMilestones.includes('mile-100'), true);
  assert.equal(s.unlockedTitles.includes('title-kurator-agung'), true);
  assert.equal(isBlueprintUnlocked(s, 'monumen-rempah'), true);
});

test('Avatar customization validates locks, randomizes, resets, equips titles, gates blueprints, and completes q-side-5', () => {
  let s = createInitialStage1State();
  s = addXpAndCoins(s, 0, 2000);

  // Blueprint locked initially
  assert.equal(isBlueprintUnlocked(s, 'gapura-batik'), false);
  const blockedBuild = startBuildingConstruction(s, 'gapura-batik', 10, 14, 0);
  assert.equal(blockedBuild.placedBuildings.length, 0);

  // Locked customization item is rejected safely
  s = updatePlayerAppearance(s, {
    hairstyle: 'hair-konde-nusantara', // locked initially
    shirtId: 'shirt-batik-sogan', // unlocked by default
    skinTone: 'kulit-nusantara',
  });
  assert.equal(s.appearance.hairstyle, DEFAULT_CHARACTER_APPEARANCE.hairstyle);
  assert.equal(s.appearance.shirtId, 'shirt-batik-sogan');
  assert.equal(s.appearance.skinTone, 'kulit-nusantara');

  // Randomize & reset
  s = randomizePlayerAppearance(s, () => 0.42);
  s = resetPlayerAppearance(s);
  assert.deepEqual(s.appearance, DEFAULT_CHARACTER_APPEARANCE);

  // Full q-side-5 flow -> multi-category unlock celebration + gapura-batik unlocked
  s = acceptQuest(s, 'q-side-5');
  s = recordInteriorEntered(s, 'int-butik-busana');
  assert.equal(s.quests['q-side-5'].stepIndex, 1);

  s = updatePlayerAppearance(s, { shirtId: 'shirt-batik-sogan' }, { triggerQuest: true });
  assert.equal(s.quests['q-side-5'].stepIndex, 2);

  s = triggerQuestEvent(s, 'inspect_landmark', 'lm-tugu-alun');
  assert.equal(s.quests['q-side-5'].status, 'completed');
  assert.equal(s.unlockedCustomizationIds.includes('shirt-kebaya-merah'), true);
  assert.equal(s.unlockedCustomizationIds.includes('hair-ombak-panjang'), true);
  assert.equal(s.unlockedCustomizationIds.includes('glasses-cendekia'), true);
  assert.equal(s.unlockedTitles.includes('title-penata-gaya'), true);
  assert.equal(isBlueprintUnlocked(s, 'gapura-batik'), true);
  assert.equal(s.lastRewardCelebration?.unlockedBlueprintId, 'gapura-batik');

  s = dismissRewardCelebration(s);
  assert.equal(s.lastRewardCelebration, null);

  // Equip unlocked title and place unlocked blueprint building
  s = equipPlayerTitle(s, 'title-penata-gaya');
  assert.equal(s.equippedTitle, 'title-penata-gaya');
  const builtGapura = startBuildingConstruction(s, 'gapura-batik', 10, 14, 0);
  assert.equal(builtGapura.placedBuildings.length, 1);
});

test('Achievements unlock properly and localStorage save/load/reset round-trips appearance, titles, blueprints & legacy saves', () => {
  const store = new Map<string, string>();
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    },
  };

  let s = createInitialStage1State();
  s = recordShipBoarded(s, 'ship-pinisi');
  s = recordInteriorEntered(s, 'int-balai-kota');
  s = recordVehicleDriven(s, 'veh-perahu-1');
  s = updatePlayerAppearance(s, { shirtId: 'shirt-batik-sogan', hatId: 'topi-nakhoda' });
  assert.equal(s.achievements.includes('ach-sailor'), true);
  assert.equal(s.unlockedHats.includes('topi-nakhoda'), true);

  saveStage1ToStorage(s);
  const loaded = loadStage1FromStorage();
  assert.ok(loaded !== null);
  assert.equal(loaded?.achievements.includes('ach-sailor'), true);
  assert.equal(loaded?.stats.shipsBoarded, 1);
  assert.equal(loaded?.appearance.shirtId, 'shirt-batik-sogan');
  assert.equal(loaded?.appearance.hatId, 'topi-nakhoda');

  // Legacy save compatibility (missing appearance / unlockedBlueprints / claimedMilestones)
  const legacyPayload = {
    version: 1,
    quests: s.quests,
    indicators: s.indicators,
    equippedOutfit: 'seragam-walikota',
    equippedHat: 'topi-nakhoda',
    unlockedOutfits: ['seragam-walikota'],
    unlockedHats: ['peci-nusantara', 'topi-nakhoda'],
  };
  store.set(STAGE1_SAVE_KEY, JSON.stringify(legacyPayload));
  const migrated = loadStage1FromStorage();
  assert.ok(migrated !== null);
  assert.equal(migrated?.appearance.hatId, 'topi-nakhoda');
  assert.equal(migrated?.equippedTitle, 'title-wali-pemula');

  const reset = resetStage1Storage();
  assert.equal(reset.achievements.length, 0);
  assert.equal(loadStage1FromStorage(), null);

  delete (globalThis as { window?: unknown }).window;
});
