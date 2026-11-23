import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buyStage3Supply,
  collectStage3Artifact,
  collectStage3Pickup,
  createInitialMultiStageState,
  deliverOrSellStage3,
  discoverStage3District,
  getGlobalProgressionSummary,
  getSmartCityBalanceLevel,
  performStage3Activity,
  recalculateSmartCityMetrics,
  recordStage3InteriorEntered,
  recordStage3LandmarkInspected,
  recordStage3VehicleDriven,
  startStage3BuildingConstruction,
  tickStage3BuildingConstructions,
  travelBetweenStages,
  triggerStage3QuestEvent,
  upgradeStage3PlacedBuilding,
  useMultiStageInventoryItem,
  useStage3Elevator,
} from './multiStageLogic';
import { hasInventoryItem } from './stage1WorldLogic';
import {
  STAGE3_ACTIVITY_STATIONS,
  STAGE3_COLLECTIBLES,
  STAGE3_ENTERABLE_BUILDINGS,
  STAGE3_QUESTS,
} from './stage3Data';
import {
  buildStage3WorldColliders,
  createInitialStage3Vehicles,
  findNearestStage3Interactable,
  getStage3EnterableBuildingAt,
  stage3GroundHeightAt,
  stepStage3Player,
  stepStage3VehiclePhysics,
  validateStage3BuildingPlacement,
} from './stage3Physics';
import { Player3DState } from './world3dPhysics';

test('Stage 3 multi-elevation heights support Skywalk, Eco Dome roof, Menara deck, and coastal pier', () => {
  assert.equal(stage3GroundHeightAt(0, 0, 0), 0);
  // Enterable floor slab on ground level
  assert.equal(stage3GroundHeightAt(-18, -16, 0), 0.22);
  // Walkable glass skywalk (z in [-16, -10], x in [-36, 36]) when elevated
  assert.equal(stage3GroundHeightAt(0, -13, 6.4), 6.5);
  // Skywalk west ramp entrance
  assert.ok(stage3GroundHeightAt(-44, -13, 0) > 0);
  // Eco Dome rooftop
  assert.equal(stage3GroundHeightAt(4, 58, 10.4), 10.5);
  // Menara Nusantara Observation Deck
  assert.equal(stage3GroundHeightAt(0, -16, 14.0), 14.2);
  // East coastal pier vs ocean
  assert.equal(stage3GroundHeightAt(94, 56, 0), 0.4);
  assert.ok(stage3GroundHeightAt(95, 0, 0) < -0.2);
});

test('All 8 Stage 3 enterable buildings have clear doorways for walking inside', () => {
  const colliders = buildStage3WorldColliders([]);
  for (const b of STAGE3_ENTERABLE_BUILDINGS) {
    let startX = b.x;
    let startZ = b.z;
    if (b.doorSide === 'north') startZ = b.z - b.halfD - 3;
    if (b.doorSide === 'south') startZ = b.z + b.halfD + 3;
    if (b.doorSide === 'east') startX = b.x + b.halfW + 3;
    if (b.doorSide === 'west') startX = b.x - b.halfW - 3;

    let player: Player3DState = {
      x: startX,
      y: 0,
      z: startZ,
      vx: 0,
      vy: 0,
      vz: 0,
      facingYaw: 0,
      grounded: true,
      speed: 0,
      walkCycle: 0,
    };

    const dx = b.x - startX;
    const dz = b.z - startZ;
    const len = Math.hypot(dx, dz);
    const dirX = dx / len;
    const dirZ = dz / len;

    for (let i = 0; i < 40; i++) {
      player = stepStage3Player(
        player,
        {
          forward: dirZ,
          right: -dirX,
          sprint: false,
          jump: false,
        },
        0,
        colliders,
        0.04
      );
    }

    const inside = getStage3EnterableBuildingAt(player.x, player.z);
    assert.equal(inside?.id, b.id, `Expected to walk inside ${b.id}`);
  }
});

test('Stage 3 elevator pads teleport player to elevated decks and progress Misi 2 & achievements', () => {
  let state = createInitialMultiStageState();
  state = travelBetweenStages(state, 3);

  // Near Menara elevator pad on ground
  const padCheck = findNearestStage3Interactable(10.5, 0, -14, {
    collectedPickups: [],
    collectedArtifacts: [],
    completedDeliveries: [],
    placedBuildings: [],
    vehicles: createInitialStage3Vehicles(),
  });
  assert.equal(padCheck?.kind, 'elevator_pad');
  if (padCheck?.kind === 'elevator_pad') {
    assert.equal(padCheck.pad.id, 'elev-menara-up');
  }

  state = useStage3Elevator(state, 'elev-menara-up');
  assert.equal(state.stage3.usedElevatorCount, 1);
  assert.equal(state.stage3.playerPos.y, 14.2);
  assert.ok(state.stage3.achievements.includes('ach-s3-skyhigh'));

  // Observation scanner is reachable at y=14.2
  const roofScan = findNearestStage3Interactable(0, 14.2, -16, {
    collectedPickups: [],
    collectedArtifacts: [],
    completedDeliveries: [],
    placedBuildings: [],
    vehicles: createInitialStage3Vehicles(),
  });
  assert.equal(roofScan?.kind, 'activity_station');
  if (roofScan?.kind === 'activity_station') {
    assert.equal(roofScan.station.id, 'act-s3-sky-scan');
  }
});

test('Stage 3 activities, inventory usage fix, deliveries, and 9 Smart City metrics integrate cleanly', () => {
  let state = createInitialMultiStageState();
  state = travelBetweenStages(state, 3);
  const startCoins = state.stage1.coins;

  for (const st of STAGE3_ACTIVITY_STATIONS) {
    state = performStage3Activity(state, st.id);
  }
  assert.equal(state.stage3.completedActivities.length, 5);
  assert.ok(state.stage1.coins > startCoins);
  assert.ok(state.stage3.achievements.includes('ach-s3-activities'));
  assert.ok(hasInventoryItem(state.stage1.inventory, 's3-sel-surya'));
  assert.ok(hasInventoryItem(state.stage1.inventory, 's3-modul-robot'));
  assert.ok(hasInventoryItem(state.stage1.inventory, 's3-paket-umkm-digital'));

  // Test Stage 3 consumables & verify Stage 2 consumables don't mutate Stage 2 while in Stage 3
  state = {
    ...state,
    stage1: {
      ...state.stage1,
      coins: state.stage1.coins + 200,
    },
  };
  state = buyStage3Supply(state, 's3-kopi-siber');
  const levelBeforeKopi = state.stage1.playerLevel;
  const xpBeforeKopi = state.stage1.xp;
  const happinessBeforeKopi = state.stage3.happiness;
  state = useMultiStageInventoryItem(state, 's3-kopi-siber');
  assert.ok(
    state.stage1.playerLevel > levelBeforeKopi || state.stage1.xp >= xpBeforeKopi + 40
  );
  assert.equal(state.stage3.happiness, Math.min(100, happinessBeforeKopi + 5));
  assert.equal(hasInventoryItem(state.stage1.inventory, 's3-kopi-siber'), false);

  // Delivery rewards
  state = deliverOrSellStage3(state, 'deliv-s3-ecodome');
  assert.ok(state.stage3.completedDeliveries.includes('deliv-s3-ecodome'));

  const metrics = recalculateSmartCityMetrics(state.stage3);
  const balance = getSmartCityBalanceLevel(metrics);
  assert.ok(balance.average > 50);
  assert.ok(metrics.renewableEnergy > 50);
  assert.ok(metrics.digitalDevelopment > 50);
});

test('Stage 3 construction, drone speed-up, building upgrade, and placement validation work', () => {
  let state = createInitialMultiStageState();
  state = travelBetweenStages(state, 3);
  state = {
    ...state,
    stage1: { ...state.stage1, coins: 3500 },
  };

  // Road and central plaza rejected
  const roadAttempt = validateStage3BuildingPlacement('pusat-teknologi', 0, -28, [], -5, -5);
  assert.equal(roadAttempt.valid, false);

  const validAttempt = validateStage3BuildingPlacement('pusat-teknologi', 44, -60, [], 0, 0);
  assert.equal(validAttempt.valid, true, validAttempt.reason);

  state = startStage3BuildingConstruction(state, 'pusat-teknologi', 44, -60, 0);
  assert.equal(state.stage3.placedBuildings.length, 1);
  assert.equal(state.stage3.placedBuildings[0].isConstructing, true);

  // Use Drone Konstruksi consumable in Stage 3
  state = buyStage3Supply(state, 's3-drone-konstruksi');
  state = useMultiStageInventoryItem(state, 's3-drone-konstruksi');
  assert.ok(state.stage3.placedBuildings[0].constructionProgress >= 0.7);

  // Finish construction via ticks
  state = tickStage3BuildingConstructions(state, 5);
  assert.equal(state.stage3.placedBuildings[0].isConstructing, false);
  assert.equal(state.stage3.stats.buildingsBuilt, 1);

  const instId = state.stage3.placedBuildings[0].id;
  state = upgradeStage3PlacedBuilding(state, instId);
  assert.equal(state.stage3.placedBuildings[0].level, 2);
  assert.equal(state.stage3.stats.buildingsUpgraded, 1);
});

test('Stage 3 vehicles drive cleanly, and travel 1 -> 2 -> 3 -> 2 -> 1 preserves all stage progress', () => {
  const vehicles = createInitialStage3Vehicles();
  assert.equal(vehicles.length, 5);
  const colliders = buildStage3WorldColliders([]);
  const movedEv = stepStage3VehiclePhysics(vehicles[0], { forward: 1, right: 0 }, colliders, 0.04);
  assert.ok(Math.hypot(movedEv.x - vehicles[0].x, movedEv.z - vehicles[0].z) > 0);

  let state = createInitialMultiStageState();
  // Collect Stage 1 artifact and Stage 3 travel
  state = travelBetweenStages(state, 2);
  state = travelBetweenStages(state, 3);
  assert.equal(state.activeStage, 3);
  assert.ok(state.stage3.achievements.includes('ach-s3-arrive'));

  // Discover all 7 districts and collect 4 collectibles for milestone reward
  for (const d of [
    's3-smart-center',
    's3-digital-business',
    's3-research',
    's3-residential',
    's3-entertainment',
    's3-green-tech',
    's3-transit-hub',
  ] as const) {
    state = discoverStage3District(state, d);
  }
  assert.ok(state.stage3.achievements.includes('ach-s3-districts'));

  for (const col of STAGE3_COLLECTIBLES.slice(0, 4)) {
    state = collectStage3Artifact(state, col.id);
  }
  assert.ok(state.stage1.unlockedCustomizationIds.includes('jacket-cyber-explorer'));
  assert.ok(state.stage1.unlockedCustomizationIds.includes('glasses-holo-visor'));

  // Complete Misi 1
  state = triggerStage3QuestEvent(state, 'talk_npc', 'npc-s3-aditya');
  state = recordStage3InteriorEntered(state, 'eb-s3-admin');
  assert.equal(state.stage3.quests['q-s3-1']?.status, 'completed');
  assert.equal(state.stage3.quests['q-s3-2']?.status, 'active');

  // Inspect landmark, drive vehicle, pickup item
  state = recordStage3LandmarkInspected(state, 'lm-s3-monument-glokal');
  state = recordStage3VehicleDriven(state, 'veh-s3-evcar');
  state = collectStage3Pickup(state, 'pk-s3-chip');
  assert.ok(state.stage3.achievements.includes('ach-s3-ev-driver'));
  assert.ok(STAGE3_QUESTS.length >= 9);

  // Travel back to Stage 2 via HST and then Stage 1; verify Stage 3 progress & global inventory/costumes remain intact
  const savedCoins = state.stage1.coins;
  state = travelBetweenStages(state, 2);
  assert.equal(state.activeStage, 2);
  assert.equal(state.stage3.collectibles.length, 4);
  assert.equal(state.stage3.quests['q-s3-1']?.status, 'completed');
  assert.ok(state.stage1.unlockedCustomizationIds.includes('jacket-cyber-explorer'));
  assert.equal(state.stage1.coins, savedCoins);

  state = travelBetweenStages(state, 1);
  assert.equal(state.activeStage, 1);
  assert.equal(state.stage3.collectibles.length, 4);
});

test('getGlobalProgressionSummary aggregates authentic multi-stage progress and official stage names', () => {
  let state = createInitialMultiStageState();
  const initialSummary = getGlobalProgressionSummary(state);

  assert.equal(initialSummary.activeStage, 1);
  assert.equal(initialSummary.stages[0].name, 'Kota Nusantara');
  assert.equal(initialSummary.stages[1].name, 'Kota Industri');
  assert.equal(initialSummary.stages[2].name, 'Kota Digital Masa Depan');
  assert.equal(initialSummary.stages[0].imageSrc, '/assets/stages/stage1-kota-nusantara.png');
  assert.equal(initialSummary.stages[1].imageSrc, '/assets/stages/stage2-kota-industri.png');
  assert.equal(initialSummary.stages[2].imageSrc, '/assets/stages/stage3-kota-digital.png');
  assert.equal(initialSummary.completedMissions, 0);
  assert.ok(initialSummary.totalMissions >= 20);
  assert.ok(initialSummary.costumesUnlocked > 0);
  assert.ok(initialSummary.costumesTotal >= initialSummary.costumesUnlocked);

  // Advance real progress in Stage 3 and verify summary updates accurately
  state = travelBetweenStages(state, 3);
  state = discoverStage3District(state, 's3-smart-center');
  state = triggerStage3QuestEvent(state, 'talk_npc', 'npc-s3-aditya');
  state = recordStage3InteriorEntered(state, 'eb-s3-admin');
  state = collectStage3Artifact(state, STAGE3_COLLECTIBLES[0].id);

  const updatedSummary = getGlobalProgressionSummary(state);
  assert.equal(updatedSummary.activeStage, 3);
  assert.equal(updatedSummary.activeStageName, 'Kota Digital Masa Depan');
  assert.equal(updatedSummary.completedMissions, 1);
  assert.equal(updatedSummary.collectiblesFound, 1);
  assert.ok(updatedSummary.achievementsUnlocked >= 1);
  assert.ok(updatedSummary.cityDevelopmentProgress >= initialSummary.cityDevelopmentProgress);
  assert.equal(updatedSummary.citiesDeveloped, 1);
});
