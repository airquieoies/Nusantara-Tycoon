import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyCharacterPreset,
  buyStage2Supply,
  collectStage2Artifact,
  collectStage2Pickup,
  collectStage2Production,
  createInitialMultiStageState,
  deliverOrSellStage2,
  discoverStage2District,
  getIndustrialBalanceLevel,
  mergeOfflineAndOnlineState,
  recalculateIndustrialMetrics,
  recordStage2InteriorEntered,
  recordStage2LandmarkInspected,
  recordStage2ShipBoarded,
  startStage2BuildingConstruction,
  startStage2Production,
  tickStage2BuildingConstructions,
  tickStage2Production,
  travelBetweenStages,
  triggerStage2QuestEvent,
  upgradeStage2PlacedBuilding,
} from './multiStageLogic';
import {
  STAGE2_COLLECTIBLES,
  STAGE2_ENTERABLE_BUILDINGS,
  STAGE2_QUESTS,
} from './stage2Data';
import {
  buildStage2WorldColliders,
  findNearestStage2Interactable,
  getStage2BoardedShipId,
  getStage2EnterableBuildingAt,
  stage2GroundHeightAt,
  stepStage2PlayerPhysics,
  validateStage2BuildingPlacement,
} from './stage2Physics';
import { hasInventoryItem } from './stage1WorldLogic';
import { Player3DState } from './world3dPhysics';

test('Stage 2 ground height, arched river bridges, and return ship deck geometry work accurately', () => {
  // Normal land
  assert.equal(stage2GroundHeightAt(0, 0), 0);
  // Industrial river channel vs arched west & south bridges
  assert.ok(stage2GroundHeightAt(-58, 40) < -0.2);
  assert.ok(stage2GroundHeightAt(-58, 28) > 1.2); // West bridge arch
  assert.ok(stage2GroundHeightAt(10, 73.5) > 1.2); // South bridge arch
  assert.ok(stage2GroundHeightAt(-20, 73.5) < -0.2); // River east-west channel
  // Harbor pier and return ship deck
  assert.ok(stage2GroundHeightAt(66, 0) > 0.7);
  assert.ok(stage2GroundHeightAt(75, 8.5) >= 2.0);
  assert.equal(getStage2BoardedShipId(75, 8.5, 2.05), 'ship-stage1-return');
});

test('All 8 Stage 2 enterable buildings have walkable doorways through colliders', () => {
  const colliders = buildStage2WorldColliders([]);
  for (const b of STAGE2_ENTERABLE_BUILDINGS) {
    let startX = b.x;
    let startZ = b.z;
    let forwardInput = 0;
    let rightInput = 0;
    let yaw = 0;

    if (b.doorSide === 'south') {
      startZ = b.z + b.halfD + 1.1;
      yaw = Math.PI; // forward moves toward -Z
      forwardInput = 1;
    } else if (b.doorSide === 'north') {
      startZ = b.z - b.halfD - 1.1;
      yaw = 0; // forward moves toward +Z
      forwardInput = 1;
    } else if (b.doorSide === 'east') {
      startX = b.x + b.halfW + 1.1;
      yaw = -Math.PI / 2; // forward moves toward -X
      forwardInput = 1;
    } else {
      startX = b.x - b.halfW - 1.1;
      yaw = Math.PI / 2; // forward moves toward +X
      forwardInput = 1;
    }

    let p: Player3DState = {
      x: startX,
      y: stage2GroundHeightAt(startX, startZ),
      z: startZ,
      vx: 0,
      vy: 0,
      vz: 0,
      facingYaw: yaw,
      grounded: true,
      speed: 0,
      walkCycle: 0,
    };

    for (let i = 0; i < 32; i++) {
      p = stepStage2PlayerPhysics(
        p,
        { forward: forwardInput, right: rightInput, jump: false, sprint: false },
        yaw,
        colliders,
        0.04
      );
    }

    const entered = getStage2EnterableBuildingAt(p.x, p.z);
    assert.equal(
      entered?.id,
      b.id,
      `Expected player to walk smoothly through ${b.doorSide} door into ${b.id}`
    );
  }
});

test('Stage 2 supply purchase, factory production, collection, and wholesale market sale work end-to-end', () => {
  let s = createInitialMultiStageState();
  s = travelBetweenStages(s, 2);
  const startCoins = s.stage1.coins;

  // Buy raw cotton supply
  s = buyStage2Supply(s, 'kapas-serat');
  assert.equal(s.stage1.coins, startCoins - 45);
  assert.equal(hasInventoryItem(s.stage1.inventory, 'kapas-serat'), true);

  // Start production at Textile Factory
  s = startStage2Production(s, 'rec-tekstil');
  assert.equal(hasInventoryItem(s.stage1.inventory, 'kapas-serat'), false);
  assert.equal(s.stage2.productionOrders.length, 1);
  assert.equal(s.stage2.productionOrders[0].completed, false);

  // Tick until complete
  for (let i = 0; i < 16; i++) {
    s = tickStage2Production(s, 0.5);
  }
  assert.equal(s.stage2.productionOrders[0].completed, true);

  // Collect finished textile (yields 2x)
  s = collectStage2Production(s, s.stage2.productionOrders[0].id);
  assert.equal(s.stage2.productionOrders.length, 0);
  const slot = s.stage1.inventory.find((i) => i.itemId === 'tekstil-nusantara');
  assert.equal(slot?.qty, 2);
  assert.equal(s.stage2.totalProducedUnits, 2);

  // Deliver to Warehouse then sell at Pasar Grosir
  s = deliverOrSellStage2(s, 's2-del-gudang');
  s = deliverOrSellStage2(s, 's2-del-grosir');
  assert.equal(s.stage2.totalSoldUnits, 2);
  assert.equal(s.stage2.completedDeliveries.includes('s2-del-gudang'), true);
  assert.equal(s.stage2.completedDeliveries.includes('s2-del-grosir'), true);
});

test('Industrial Balance 8 metrics reflect factory pollution vs K3 & bio-filter mitigation', () => {
  let s = createInitialMultiStageState();
  s = travelBetweenStages(s, 2);
  // Give enough coins to build factories & mitigation buildings
  s = { ...s, stage1: { ...s.stage1, coins: 4000 } };

  // Build 3 heavy factories without mitigation
  s = startStage2BuildingConstruction(s, 'pabrik-industri', -72, -16, 0);
  s = startStage2BuildingConstruction(s, 'pabrik-industri', -72, -32, 0);
  s = startStage2BuildingConstruction(s, 'pabrik-industri', -72, -48, 0);
  for (let i = 0; i < 24; i++) {
    s = tickStage2BuildingConstructions(s, 0.5);
  }

  const pollutedMetrics = recalculateIndustrialMetrics(s.stage2);
  const pollutedStatus = getIndustrialBalanceLevel(pollutedMetrics);
  assert.ok(pollutedMetrics.industrialProduction >= 60);
  assert.ok(pollutedMetrics.environmentalQuality < 45);
  assert.equal(pollutedStatus.tone, 'rose');

  // Mitigate with K3 delivery, Bio-Filter installation, Water Treatment, and Worker Housing
  s = collectStage2Pickup(s, 's2-pk-k3');
  s = deliverOrSellStage2(s, 's2-del-klinik');
  s = collectStage2Pickup(s, 's2-pk-filter');
  s = deliverOrSellStage2(s, 's2-del-limbah');
  s = startStage2BuildingConstruction(s, 'instalasi-pengolah-air', -34, 40, 0);
  s = startStage2BuildingConstruction(s, 'fasilitas-daur-ulang', -34, 56, 0);
  s = startStage2BuildingConstruction(s, 'perumahan-pekerja', 16, 2, 0);
  s = startStage2BuildingConstruction(s, 'gudang-logistik-besar', 16, 42, 0);
  for (let i = 0; i < 24; i++) {
    s = tickStage2BuildingConstructions(s, 0.5);
  }
  // Upgrade worker housing & water treatment to Level 2 to fully offset 3 heavy factories
  const housing = s.stage2.placedBuildings.find((b) => b.buildingId === 'perumahan-pekerja');
  const waterPlant = s.stage2.placedBuildings.find((b) => b.buildingId === 'instalasi-pengolah-air');
  if (housing) s = upgradeStage2PlacedBuilding(s, housing.id);
  if (waterPlant) s = upgradeStage2PlacedBuilding(s, waterPlant.id);

  const balancedStatus = getIndustrialBalanceLevel(s.stage2.industrialMetrics);
  assert.ok(s.stage2.industrialMetrics.environmentalQuality >= 60);
  assert.ok(s.stage2.industrialMetrics.workerWelfare >= 62);
  assert.equal(balancedStatus.tone, 'emerald');
});

test('Full Stage 2 main quest chain (1 through 8) completes and awards Arsitek Industri title', () => {
  let s = createInitialMultiStageState();
  s = travelBetweenStages(s, 2);
  s = { ...s, stage1: { ...s.stage1, coins: 5000 } };

  // Quest 1
  s = triggerStage2QuestEvent(s, 'talk_npc', 's2-npc-aditya');
  s = discoverStage2District(s, 's2-industri');
  s = triggerStage2QuestEvent(s, 'talk_npc', 's2-npc-mandor');
  assert.equal(s.stage2.quests['s2-q-main-1'].status, 'completed');
  assert.equal(s.stage2.quests['s2-q-main-2'].status, 'active');

  // Quest 2
  s = collectStage2Pickup(s, 's2-pk-kapas');
  s = startStage2Production(s, 'rec-tekstil');
  for (let i = 0; i < 16; i++) s = tickStage2Production(s, 0.5);
  s = collectStage2Production(s, s.stage2.productionOrders[0].id);
  assert.equal(s.stage2.quests['s2-q-main-2'].status, 'completed');
  assert.equal(s.stage2.quests['s2-q-main-3'].status, 'active');

  // Quest 3 (we still have 2x textile; deliver one to warehouse, sell one at grosir)
  s = triggerStage2QuestEvent(s, 'talk_npc', 's2-npc-naya');
  s = deliverOrSellStage2(s, 's2-del-gudang');
  s = deliverOrSellStage2(s, 's2-del-grosir');
  assert.equal(s.stage2.quests['s2-q-main-3'].status, 'completed');
  assert.equal(s.stage2.quests['s2-q-main-4'].status, 'active');

  // Quest 4
  s = triggerStage2QuestEvent(s, 'talk_npc', 's2-npc-pekerja');
  s = collectStage2Pickup(s, 's2-pk-k3');
  s = deliverOrSellStage2(s, 's2-del-klinik');
  assert.equal(s.stage2.quests['s2-q-main-4'].status, 'completed');
  assert.equal(s.stage2.quests['s2-q-main-5'].status, 'active');

  // Quest 5
  s = startStage2BuildingConstruction(s, 'pabrik-tekstil', 16, -18, 0);
  for (let i = 0; i < 24; i++) s = tickStage2BuildingConstructions(s, 0.5);
  const builtId = s.stage2.placedBuildings[0].id;
  s = upgradeStage2PlacedBuilding(s, builtId);
  s = recordStage2InteriorEntered(s, 's2-int-balai-industri');
  assert.equal(s.stage2.quests['s2-q-main-5'].status, 'completed');
  assert.equal(s.stage2.quests['s2-q-main-6'].status, 'active');

  // Quest 6
  s = triggerStage2QuestEvent(s, 'talk_npc', 's2-npc-laras');
  s = recordStage2LandmarkInspected(s, 'lm-s2-sungai-sensor');
  s = collectStage2Pickup(s, 's2-pk-filter');
  s = deliverOrSellStage2(s, 's2-del-limbah');
  assert.equal(s.stage2.quests['s2-q-main-6'].status, 'completed');
  assert.equal(s.stage2.quests['s2-q-main-7'].status, 'active');

  // Quest 7
  s = collectStage2Pickup(s, 's2-pk-pangan');
  s = startStage2Production(s, 'rec-pangan');
  for (let i = 0; i < 16; i++) s = tickStage2Production(s, 0.5);
  s = collectStage2Production(s, s.stage2.productionOrders[0].id);
  s = deliverOrSellStage2(s, 's2-del-grosir');
  assert.equal(s.stage2.quests['s2-q-main-7'].status, 'completed');
  assert.equal(s.stage2.quests['s2-q-main-8'].status, 'active');

  // Quest 8
  s = recordStage2LandmarkInspected(s, 'lm-s2-stage3-terminal');
  s = recordStage2ShipBoarded(s, 'ship-stage1-return');
  s = triggerStage2QuestEvent(s, 'talk_npc', 's2-npc-aditya');

  const mainQuests = STAGE2_QUESTS.filter((q) => q.kind === 'main');
  for (const mq of mainQuests) {
    assert.equal(s.stage2.quests[mq.id].status, 'completed', `${mq.id} should be completed`);
  }
  assert.equal(s.stage1.unlockedTitles.includes('title-arsitek-industri'), true);
  assert.equal(s.stage2.achievements.includes('s2-ach-hero'), true);
});

test('Stage 3 remains strictly locked and cross-stage travel preserves Stage 1 & global cosmetics', () => {
  let s = createInitialMultiStageState();
  // Customize avatar via preset in Stage 1
  s = applyCharacterPreset(s, 'preset-pelaut');
  const stage1Coins = s.stage1.coins;
  s = {
    ...s,
    stage1: { ...s.stage1, collectibles: ['col-batik-pesisir'] },
  };

  // Attempt to travel to Stage 3 -> must be rejected and remain on Stage 1
  const blocked = travelBetweenStages(s, 3);
  assert.equal(blocked.activeStage, 1);
  assert.equal(blocked.unlockedStages.includes(3 as never), false);

  // Travel to Stage 2 -> shared coins & appearance preserved
  s = travelBetweenStages(s, 2);
  assert.equal(s.activeStage, 2);
  assert.equal(s.stage1.coins, stage1Coins);
  assert.equal(s.stage1.appearance.shirtId, 'shirt-tenun-biru');
  assert.equal(s.stage1.collectibles.includes('col-batik-pesisir'), true);

  // Stage 3 buildings cannot be placed in Stage 2
  const stage3Placement = validateStage2BuildingPlacement('kawasan-internasional', 16, -16, [], 0, 0);
  assert.equal(stage3Placement.valid, false);
  assert.match(stage3Placement.reason, /Terkunci/i);

  // Locked Stage 3 terminal emits locked_stage3 interactable
  const nearLockedTerminal = findNearestStage2Interactable(-4, -74, {
    collectedPickups: [],
    collectedArtifacts: ['s2-col-maket-rel-cepat'],
    completedDeliveries: [],
    placedBuildings: [],
    vehicles: [],
  });
  assert.equal(nearLockedTerminal?.kind, 'locked_stage3');

  // Collect all 15 Stage 2 artifacts without dropping Stage 1 artifacts
  for (const col of STAGE2_COLLECTIBLES) {
    s = collectStage2Artifact(s, col.id);
  }
  assert.equal(s.stage2.collectibles.length, 15);
  assert.equal(s.stage1.collectibles.length, 1);

  // Travel back to Stage 1 -> Stage 2 progress & Stage 1 progress both remain intact
  s = travelBetweenStages(s, 1);
  assert.equal(s.activeStage, 1);
  assert.equal(s.stage2.collectibles.length, 15);
});

test('mergeOfflineAndOnlineState never loses higher XP, quests, titles, or collectibles', () => {
  const local = createInitialMultiStageState('AdityaLocal');
  let remote = createInitialMultiStageState('AdityaCloud');
  remote = travelBetweenStages(remote, 2);
  remote = collectStage2Artifact(remote, 's2-col-roda-gigi');
  remote = {
    ...remote,
    stage1: {
      ...remote.stage1,
      playerLevel: 4,
      coins: 1950,
      unlockedTitles: [...remote.stage1.unlockedTitles, 'title-perintis-industri'],
    },
  };

  const merged = mergeOfflineAndOnlineState(local, remote);
  assert.equal(merged.stage1.playerLevel, 4);
  assert.equal(merged.stage1.coins, 1950);
  assert.equal(merged.stage1.unlockedTitles.includes('title-perintis-industri'), true);
  assert.equal(merged.stage2.collectibles.includes('s2-col-roda-gigi'), true);
  assert.deepEqual(merged.unlockedStages, [1, 2]);
});
