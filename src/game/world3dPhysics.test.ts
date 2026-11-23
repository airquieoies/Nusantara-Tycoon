import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialCityState, placeBuilding } from './rules';
import {
  buildWorldColliders,
  createInitialCameraState,
  createInitialPlayerState,
  findNearestBuildPad,
  findNearestInteractable,
  getStageCrowdPatrols,
  getStageLandmarks,
  getStageNpcs,
  getStageSceneryBuildings,
  groundHeightAt,
  PIER_HEIGHT,
  PLAYER_RADIUS,
  PORTAL_POSITION,
  SPRINT_SPEED,
  stepPlayerPhysics,
  tileToWorld,
  updateThirdPersonCamera,
  WALK_SPEED,
  WORLD_MAX_X,
  WORLD_MAX_Z,
  WORLD_MIN_X,
  WORLD_MIN_Z,
} from './world3dPhysics';

test('WASD movement and Shift sprint move player relative to camera yaw', () => {
  const state = createInitialCityState(1);
  const colliders = buildWorldColliders(state.grid, 1);
  let player = createInitialPlayerState();
  const camYaw = Math.PI / 2;

  for (let i = 0; i < 25; i++) {
    player = stepPlayerPhysics(
      player,
      { forward: 1, right: 0, sprint: false, jump: false },
      camYaw,
      colliders,
      0.02
    );
  }
  const walkDist = player.x - createInitialPlayerState().x;
  assert.ok(Math.abs(walkDist - WALK_SPEED * 0.5) < 0.05);

  let sprintPlayer = createInitialPlayerState();
  for (let i = 0; i < 25; i++) {
    sprintPlayer = stepPlayerPhysics(
      sprintPlayer,
      { forward: 1, right: 0, sprint: true, jump: false },
      camYaw,
      colliders,
      0.02
    );
  }
  const sprintDist = sprintPlayer.x - createInitialPlayerState().x;
  assert.ok(sprintDist > walkDist * 1.6 && Math.abs(sprintDist - SPRINT_SPEED * 0.5) < 0.1);
});

test('Space triggers jump and gravity returns player smoothly to ground', () => {
  const state = createInitialCityState(1);
  const colliders = buildWorldColliders(state.grid, 1);
  let player = createInitialPlayerState();
  const camYaw = Math.PI / 2;

  player = stepPlayerPhysics(
    player,
    { forward: 0, right: 0, sprint: false, jump: true },
    camYaw,
    colliders,
    0.02
  );
  assert.equal(player.grounded, false);
  assert.ok(player.y > 0.1);

  let maxY = player.y;
  for (let i = 0; i < 60; i++) {
    player = stepPlayerPhysics(
      player,
      { forward: 0, right: 0, sprint: false, jump: false },
      camYaw,
      colliders,
      0.02
    );
    if (player.y > maxY) maxY = player.y;
  }

  assert.ok(maxY > 1.2);
  assert.equal(player.grounded, true);
  assert.equal(player.y, 0);
});

test('Player cannot penetrate static landmarks or placed buildings across stages', () => {
  let state = createInitialCityState(1);
  state = placeBuilding(state, 2, 2, 'pasar-tradisional');
  const colliders = buildWorldColliders(state.grid, 1);
  const placedCenter = tileToWorld(2, 2);

  let player = createInitialPlayerState();
  player.x = placedCenter.x - 4.0;
  player.z = placedCenter.z;

  for (let i = 0; i < 60; i++) {
    player = stepPlayerPhysics(
      player,
      { forward: 1, right: 0, sprint: true, jump: false },
      Math.PI / 2,
      colliders,
      0.02
    );
  }

  const buildingBox = colliders.find((c) => c.id === 'bldg-2-2');
  assert.ok(buildingBox);
  assert.ok(player.x <= buildingBox.minX - PLAYER_RADIUS + 0.02);

  // Stage 2 Factory Landmark collision
  const s2Colliders = buildWorldColliders(state.grid, 2);
  const factory = getStageLandmarks(2).find((l) => l.kind === 'factory')!;
  let fPlayer = createInitialPlayerState();
  fPlayer.x = factory.x + factory.halfW + 2.0;
  fPlayer.z = factory.z;
  for (let i = 0; i < 40; i++) {
    fPlayer = stepPlayerPhysics(
      fPlayer,
      { forward: -1, right: 0, sprint: false, jump: false },
      Math.PI / 2,
      s2Colliders,
      0.02
    );
  }
  assert.ok(fPlayer.x >= factory.x + factory.halfW + PLAYER_RADIUS - 0.02);
});

test('Player walks onto main harbor pier and stops before falling off pier end', () => {
  const state = createInitialCityState(1);
  const colliders = buildWorldColliders(state.grid, 1);
  let player = createInitialPlayerState();
  player.x = 18.0;
  player.z = 0.0;

  for (let i = 0; i < 200; i++) {
    player = stepPlayerPhysics(
      player,
      { forward: 1, right: 0, sprint: true, jump: false },
      Math.PI / 2,
      colliders,
      0.02
    );
  }

  assert.ok(player.x > 30 && player.x < 41.0);
  assert.ok(Math.abs(groundHeightAt(player.x, player.z) - PIER_HEIGHT) < 0.05);
  assert.ok(Math.abs(player.y - PIER_HEIGHT) < 0.05);
});

test('Organic build pads, stage NPCs, and Stage Portal Gate interactables detect cleanly', () => {
  const state = createInitialCityState(1);
  const padPos = tileToWorld(2, 4);
  const found = findNearestBuildPad(padPos.x + 0.5, padPos.z - 0.5, state.grid);
  assert.ok(found);
  assert.equal(found.row, 2);
  assert.equal(found.col, 4);

  // Portal Gate detection in Stage 1 & Stage 2
  const nearPortal = findNearestInteractable(PORTAL_POSITION.x, PORTAL_POSITION.z + 2.0, state.grid, 1);
  assert.ok(nearPortal && nearPortal.kind === 'portal');

  // Aditya NPC detection & era-specific mission hints across all 3 stages
  for (const s of [1, 2, 3] as const) {
    const npcs = getStageNpcs(s);
    const aditya = npcs.find((n) => n.characterId === 'aditya');
    const laras = npcs.find((n) => n.characterId === 'laras');
    const naya = npcs.find((n) => n.characterId === 'naya');
    assert.ok(aditya && laras && naya);
    assert.ok(aditya.dialogue.length > 20 && laras.missionHint.length > 15);
  }
});

test('Third-person camera stays behind player and above terrain', () => {
  const state = createInitialCityState(1);
  const colliders = buildWorldColliders(state.grid, 1);
  const player = createInitialPlayerState();
  let cam = createInitialCameraState(player);
  cam.pitch = 0.3;

  for (let i = 0; i < 20; i++) {
    cam = updateThirdPersonCamera(cam, player, colliders, 0.016);
  }

  assert.ok(cam.x < player.x - 4);
  assert.ok(cam.y > player.y + 1.5);
});

test('Dense scenery buildings and autonomous crowd patrols maintain clear pads, roads, NPCs, and solid collisions across Stages 1-3', () => {
  const state = createInitialCityState(1);
  const spawn = createInitialPlayerState();

  for (const stage of [1, 2, 3] as const) {
    const scenery = getStageSceneryBuildings(stage);
    const patrols = getStageCrowdPatrols(stage);
    const colliders = buildWorldColliders(state.grid, stage);
    const npcs = getStageNpcs(stage);

    assert.ok(scenery.length >= 28, `Stage ${stage} expected >= 28 scenery buildings`);
    assert.ok(patrols.length >= 10, `Stage ${stage} expected >= 10 crowd patrols`);

    for (const sc of scenery) {
      if (sc.kind === 'pocket_park') continue;

      // Never cover player spawn
      const spawnGapX = Math.max(0, Math.abs(spawn.x - sc.x) - sc.halfW);
      const spawnGapZ = Math.max(0, Math.abs(spawn.z - sc.z) - sc.halfD);
      assert.ok(Math.hypot(spawnGapX, spawnGapZ) > 1.5, `Scenery ${sc.id} overlaps spawn`);

      // Never block Portal Gate
      const portalGapX = Math.max(0, Math.abs(PORTAL_POSITION.x - sc.x) - sc.halfW);
      const portalGapZ = Math.max(0, Math.abs(PORTAL_POSITION.z - sc.z) - sc.halfD);
      assert.ok(Math.hypot(portalGapX, portalGapZ) > 2.2, `Scenery ${sc.id} blocks portal`);

      // Never overlap any named NPC
      for (const npc of npcs) {
        const npcGapX = Math.max(0, Math.abs(npc.x - sc.x) - sc.halfW);
        const npcGapZ = Math.max(0, Math.abs(npc.z - sc.z) - sc.halfD);
        assert.ok(Math.hypot(npcGapX, npcGapZ) > 0.7, `Scenery ${sc.id} overlaps NPC ${npc.id}`);
      }

      // Never overlap any 7x7 non-road Build Pad center
      for (const row of state.grid) {
        for (const tile of row) {
          if (tile.terrain === 'road') continue;
          const pos = tileToWorld(tile.row, tile.col);
          const padX = tile.terrain === 'water' ? 23.2 : pos.x;
          const padGapX = Math.max(0, Math.abs(padX - sc.x) - sc.halfW);
          const padGapZ = Math.max(0, Math.abs(pos.z - sc.z) - sc.halfD);
          assert.ok(
            Math.hypot(padGapX, padGapZ) > 1.25,
            `Stage ${stage} scenery ${sc.id} overlaps pad (${tile.row},${tile.col})`
          );
        }
      }
    }

    // Verify all crowd patrol waypoints stay within valid playable world bounds
    for (const p of patrols) {
      assert.ok(p.waypoints.length >= 2);
      for (const wp of p.waypoints) {
        assert.ok(wp.x >= WORLD_MIN_X && wp.x <= WORLD_MAX_X, `${p.id} x out of bounds`);
        assert.ok(wp.z >= WORLD_MIN_Z && wp.z <= WORLD_MAX_Z, `${p.id} z out of bounds`);
      }
    }

    // Verify scenery building collider stops player movement (e.g. first inner house/shop/tower)
    const testTarget = scenery.find((s) => s.x > -26 && s.kind !== 'pocket_park')!;
    const box = colliders.find((c) => c.id === testTarget.id);
    assert.ok(box, `Collider missing for ${testTarget.id}`);
    let p = createInitialPlayerState();
    p.x = testTarget.x - testTarget.halfW - 2.0;
    p.z = testTarget.z;
    for (let i = 0; i < 45; i++) {
      p = stepPlayerPhysics(p, { forward: 1, right: 0, sprint: false, jump: false }, Math.PI / 2, colliders, 0.02);
    }
    assert.ok(p.x <= box.minX - PLAYER_RADIUS + 0.02, `Player penetrated scenery ${testTarget.id}`);
  }
});

test('Stage 1 Living City Upgrade includes diverse citizen roles, pier landmarks, and interactive NPCs', () => {
  const state = createInitialCityState(1);
  const patrols = getStageCrowdPatrols(1);
  assert.ok(patrols.length >= 20, `Expected >= 20 Stage 1 patrols, got ${patrols.length}`);

  const roles = new Set(patrols.map((p) => p.role));
  for (const requiredRole of ['shopkeeper', 'buyer', 'child', 'tourist', 'porter', 'fisher'] as const) {
    assert.ok(roles.has(requiredRole), `Missing Stage 1 crowd role: ${requiredRole}`);
  }

  const npcs = getStageNpcs(1);
  for (const id of ['npc-pedagang-kain', 'npc-pedagang-kuliner', 'npc-nelayan', 'npc-wisatawan']) {
    const found = npcs.find((n) => n.id === id);
    assert.ok(found, `Missing Stage 1 NPC: ${id}`);
  }
  const nelayan = npcs.find((n) => n.id === 'npc-nelayan')!;
  assert.ok(Math.abs(groundHeightAt(nelayan.x, nelayan.z) - PIER_HEIGHT) < 0.02);

  const nearRania = findNearestInteractable(6.2, 4.4, state.grid, 1);
  assert.ok(nearRania && nearRania.kind === 'npc' && nearRania.npc.id === 'npc-wisatawan');

  const landmarks = getStageLandmarks(1);
  assert.ok(landmarks.some((l) => l.id === 'lm-derek-pelabuhan' && l.kind === 'harbor_crane'));
  assert.ok(landmarks.some((l) => l.id === 'lm-anjungan-kapal' && l.kind === 'ship_dock'));

  for (const npc of npcs) {
    for (const lm of landmarks) {
      const gapX = Math.max(0, Math.abs(npc.x - lm.x) - lm.halfW);
      const gapZ = Math.max(0, Math.abs(npc.z - lm.z) - lm.halfD);
      assert.ok(Math.hypot(gapX, gapZ) > 0.5, `NPC ${npc.id} overlaps landmark ${lm.id}`);
    }
  }

  const nearCrane = findNearestInteractable(30.6, -1.0, state.grid, 1);
  assert.ok(nearCrane && nearCrane.kind === 'landmark' && nearCrane.landmark.id === 'lm-derek-pelabuhan');
});

