import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceToNextStage,
  computeHotsEvaluation,
  countPlacedBuildings,
  createInitialCityState,
  placeBuilding,
  resolveChallengeOption,
  stepSimulationTick,
} from './rules';
import { STAGE_CHALLENGES } from './data/bermainData';

test('createInitialCityState initializes Stage 1 with valid resources and empty buildings', () => {
  const state = createInitialCityState(1);
  assert.equal(state.stage, 1);
  assert.equal(state.money, 650);
  assert.equal(state.indicators.hpKota, 85);
  assert.equal(countPlacedBuildings(state.grid), 0);
  assert.equal(state.outcome, 'playing');
});

test('placeBuilding places building on valid land tile and deducts money', () => {
  const initial = createInitialCityState(1);
  const next = placeBuilding(initial, 0, 0, 'pasar-tradisional');
  assert.equal(next.grid[0][0].buildingId, 'pasar-tradisional');
  assert.equal(next.money, 650 - 120);
  assert.ok(next.score > initial.score);
  assert.equal(next.lastNotification?.type, 'success');
});

test('placeBuilding blocks building on road tile and insufficient funds', () => {
  const initial = createInitialCityState(1);
  const onRoad = placeBuilding(initial, 3, 0, 'pasar-tradisional');
  assert.equal(onRoad.grid[3][0].buildingId, null);
  assert.equal(onRoad.lastNotification?.type, 'error');

  const broke = { ...initial, money: 10 };
  const cantAfford = placeBuilding(broke, 0, 0, 'pasar-tradisional');
  assert.equal(cantAfford.grid[0][0].buildingId, null);
  assert.equal(cantAfford.lastNotification?.type, 'error');
});

test('placeBuilding restricts non-port building on water tile and allows pelabuhan on water', () => {
  const initial = createInitialCityState(1);
  const marketOnWater = placeBuilding(initial, 0, 6, 'pasar-tradisional');
  assert.equal(marketOnWater.grid[0][6].buildingId, null);

  const portOnWater = placeBuilding(initial, 0, 6, 'pelabuhan-nusantara');
  assert.equal(portOnWater.grid[0][6].buildingId, 'pelabuhan-nusantara');
});

test('resolving Stage 1 challenges and building 4 facilities triggers stage_clear and unlocks Stage 2', () => {
  let state = createInitialCityState(1);
  state = placeBuilding(state, 0, 0, 'pasar-tradisional');
  state = placeBuilding(state, 0, 6, 'pelabuhan-nusantara');
  state = placeBuilding(state, 1, 1, 'pusat-umkm');
  state = placeBuilding(state, 2, 1, 'museum-budaya');

  const s1Challenges = STAGE_CHALLENGES.filter((c) => c.stage === 1);
  for (const ch of s1Challenges) {
    const correctOpt = ch.options.find((o) => o.isCorrect)!;
    state = resolveChallengeOption(state, ch.id, correctOpt);
  }

  assert.equal(state.outcome, 'stage_clear');
  assert.equal(state.highestUnlockedStage, 2);

  const stage2 = advanceToNextStage(state);
  assert.equal(stage2.stage, 2);
  assert.equal(stage2.outcome, 'playing');
  assert.equal(countPlacedBuildings(stage2.grid), 4);
});

test('defeat triggers when HP Kota reaches 0 or time runs out', () => {
  const initial = createInitialCityState(1);
  const zeroHp = stepSimulationTick({
    ...initial,
    indicators: { ...initial.indicators, hpKota: 0 },
  });
  assert.equal(zeroHp.outcome, 'gameover');

  const timeOut = stepSimulationTick({
    ...initial,
    timeRemaining: 1,
  });
  assert.equal(timeOut.outcome, 'gameover');
});

test('computeHotsEvaluation returns accurate scores and badges', () => {
  const high = computeHotsEvaluation(9, 10);
  assert.equal(high.score, 90);
  assert.match(high.badgeTitle, /Sosiolog Muda Visioner/);

  const mid = computeHotsEvaluation(7, 10);
  assert.equal(mid.score, 70);
  assert.match(mid.badgeTitle, /Arsitek Glokalisasi/);
});
