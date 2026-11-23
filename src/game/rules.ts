import { BUILDING_CATALOG, STAGE_CHALLENGES, STAGE_CONFIGS } from './data/bermainData';
import { DYNAMIC_DIALOGUES } from './data/characters';
import {
  BuildingDefinition,
  ChallengeOption,
  CityGameState,
  CityTile,
  StageNumber,
  TileTerrain,
} from './types';

export const GRID_SIZE = 7;

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function createInitialGrid(stage: StageNumber): CityTile[][] {
  const grid: CityTile[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: CityTile[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      let terrain: TileTerrain = 'land';
      // Cross roads through row 3 and col 3 for clear isometric city layout
      if (r === 3 || c === 3) {
        terrain = 'road';
      } else if (stage === 1 && (c === 6 || (r === 0 && c >= 4))) {
        // Coastal shoreline on the eastern edge in Stage 1
        terrain = 'water';
      } else if (stage === 3 && r === 2 && c === 4) {
        terrain = 'park_base';
      }
      row.push({
        row: r,
        col: c,
        terrain,
        buildingId: null,
        builtAtTick: 0,
      });
    }
    grid.push(row);
  }
  return grid;
}

export function createInitialCityState(stage: StageNumber = 1): CityGameState {
  const config = STAGE_CONFIGS[stage];
  return {
    stage,
    highestUnlockedStage: stage,
    money: stage === 1 ? 650 : stage === 2 ? 950 : 1250,
    score: stage === 1 ? 10 : stage === 2 ? 32 : 56,
    indicators: {
      ekonomiGlobal: stage === 1 ? 35 : stage === 2 ? 52 : 68,
      iptek: stage === 1 ? 28 : stage === 2 ? 48 : 66,
      kearifanLokal: stage === 1 ? 45 : stage === 2 ? 55 : 65,
      hpKota: 85,
    },
    grid: createInitialGrid(stage),
    tick: 0,
    timeRemaining: config.timeLimitSeconds,
    resolvedChallengeIds: [],
    completedMissionIndices: [],
    outcome: 'playing',
    outcomeReason: '',
    activeDialogue: {
      character: config.introSpeaker,
      mood: 'optimis',
      text: config.introMessage,
    },
    lastNotification: null,
  };
}

export function countPlacedBuildings(grid: CityTile[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const tile of row) {
      if (tile.buildingId) count += 1;
    }
  }
  return count;
}

export function getPlacedBuildingsList(grid: CityTile[][]): BuildingDefinition[] {
  const result: BuildingDefinition[] = [];
  for (const row of grid) {
    for (const tile of row) {
      if (tile.buildingId) {
        const b = BUILDING_CATALOG.find((item) => item.id === tile.buildingId);
        if (b) result.push(b);
      }
    }
  }
  return result;
}

export function calculateCityIncomePerTick(grid: CityTile[][]): number {
  const placed = getPlacedBuildingsList(grid);
  const baseIncome = 10;
  return baseIncome + placed.reduce((acc, b) => acc + b.effects.incomePerTick, 0);
}

export function getBalanceSpread(indicators: CityGameState['indicators']): number {
  const vals = [indicators.ekonomiGlobal, indicators.iptek, indicators.kearifanLokal];
  return Math.max(...vals) - Math.min(...vals);
}

export function isBalanceCritical(indicators: CityGameState['indicators']): boolean {
  return (
    indicators.ekonomiGlobal <= 10 ||
    indicators.iptek <= 10 ||
    indicators.kearifanLokal <= 10 ||
    getBalanceSpread(indicators) >= 65
  );
}

export function placeBuilding(
  state: CityGameState,
  row: number,
  col: number,
  buildingId: string
): CityGameState {
  if (state.outcome !== 'playing') return state;

  const building = BUILDING_CATALOG.find((b) => b.id === buildingId);
  if (!building) return state;

  const notifId = state.tick + Date.now();

  if (building.minStage > state.stage) {
    return {
      ...state,
      lastNotification: {
        type: 'warning',
        message: `${building.name} baru terbuka di Stage ${building.minStage}.`,
        id: notifId,
      },
    };
  }

  const tile = state.grid[row]?.[col];
  if (!tile) return state;

  if (tile.terrain === 'road') {
    return {
      ...state,
      lastNotification: {
        type: 'error',
        message: 'Jalan raya tidak dapat dibangun gedung! Pilih petak lahan kosong.',
        id: notifId,
      },
    };
  }

  if (tile.terrain === 'water' && building.id !== 'pelabuhan-nusantara') {
    return {
      ...state,
      lastNotification: {
        type: 'error',
        message: 'Petak perairan hanya cocok untuk Pelabuhan Dagang!',
        id: notifId,
      },
    };
  }

  if (tile.buildingId !== null) {
    return {
      ...state,
      lastNotification: {
        type: 'error',
        message: 'Petak ini sudah terisi bangunan lain.',
        id: notifId,
      },
    };
  }

  if (state.money < building.cost) {
    return {
      ...state,
      lastNotification: {
        type: 'error',
        message: `Dana tidak mencukupi! Butuh ${building.cost} Koin untuk membangun ${building.name}.`,
        id: notifId,
      },
    };
  }

  const newGrid = state.grid.map((r, rIdx) =>
    r.map((cell, cIdx) =>
      rIdx === row && cIdx === col
        ? { ...cell, buildingId: building.id, builtAtTick: state.tick }
        : cell
    )
  );

  const nextIndicators = {
    ekonomiGlobal: clamp(state.indicators.ekonomiGlobal + building.effects.ekonomiGlobal, 0, 100),
    iptek: clamp(state.indicators.iptek + building.effects.iptek, 0, 100),
    kearifanLokal: clamp(state.indicators.kearifanLokal + building.effects.kearifanLokal, 0, 100),
    hpKota: clamp(state.indicators.hpKota + building.effects.hpKota, 0, 100),
  };

  let dialogue: CityGameState['activeDialogue'] = DYNAMIC_DIALOGUES.buildCivic;
  if (building.category === 'perdagangan') dialogue = DYNAMIC_DIALOGUES.buildTrade;
  else if (building.category === 'industri') dialogue = DYNAMIC_DIALOGUES.buildIndustry;
  else if (building.category === 'teknologi') dialogue = DYNAMIC_DIALOGUES.buildTech;
  else if (building.category === 'budaya') dialogue = DYNAMIC_DIALOGUES.buildCulture;

  if (nextIndicators.hpKota <= 35) {
    dialogue = DYNAMIC_DIALOGUES.lowHpWarning;
  } else if (getBalanceSpread(nextIndicators) >= 40) {
    dialogue = DYNAMIC_DIALOGUES.imbalanceWarning;
  }

  const nextState: CityGameState = {
    ...state,
    money: state.money - building.cost,
    score: clamp(state.score + building.effects.scoreBonus, 0, 200),
    indicators: nextIndicators,
    grid: newGrid,
    activeDialogue: dialogue,
    lastNotification: {
      type: 'success',
      message: `${building.name} berhasil dibangun! (+${building.effects.scoreBonus} Skor)`,
      id: notifId,
    },
  };

  return evaluateStageAndOutcome(nextState);
}

export function resolveChallengeOption(
  state: CityGameState,
  challengeId: string,
  option: ChallengeOption
): CityGameState {
  if (state.outcome !== 'playing') return state;
  if (state.resolvedChallengeIds.includes(challengeId)) return state;

  const nextIndicators = {
    ekonomiGlobal: clamp(state.indicators.ekonomiGlobal + option.delta.ekonomiGlobal, 0, 100),
    iptek: clamp(state.indicators.iptek + option.delta.iptek, 0, 100),
    kearifanLokal: clamp(state.indicators.kearifanLokal + option.delta.kearifanLokal, 0, 100),
    hpKota: clamp(state.indicators.hpKota + option.delta.hpKota, 0, 100),
  };

  const nextState: CityGameState = {
    ...state,
    money: Math.max(0, state.money + option.delta.money),
    score: clamp(state.score + option.delta.score, 0, 200),
    indicators: nextIndicators,
    resolvedChallengeIds: [...state.resolvedChallengeIds, challengeId],
    activeDialogue: {
      character: option.reactionCharacter,
      mood: option.isCorrect ? 'bangga' : 'waspada',
      text: option.reactionText,
    },
    lastNotification: {
      type: option.isCorrect ? 'success' : 'error',
      message: option.isCorrect
        ? `Keputusan Tepat! +${option.delta.score} Skor & +${option.delta.money} Koin.`
        : `Kurang Tepat! HP Kota ${option.delta.hpKota}%.`,
      id: state.tick + Date.now(),
    },
  };

  return evaluateStageAndOutcome(nextState);
}

export function stepSimulationTick(state: CityGameState): CityGameState {
  if (state.outcome !== 'playing') return state;

  const nextTick = state.tick + 1;
  const nextTime = Math.max(0, state.timeRemaining - 1);

  // Every 5 seconds collect city economy income
  let nextMoney = state.money;
  if (nextTick % 5 === 0) {
    nextMoney += calculateCityIncomePerTick(state.grid);
  }

  // Gentle penalty every 12 seconds if city balance is severely skewed
  let nextHp = state.indicators.hpKota;
  if (nextTick % 12 === 0 && getBalanceSpread(state.indicators) >= 48) {
    nextHp = clamp(nextHp - 3, 0, 100);
  }

  const updated: CityGameState = {
    ...state,
    tick: nextTick,
    timeRemaining: nextTime,
    money: nextMoney,
    indicators: {
      ...state.indicators,
      hpKota: nextHp,
    },
  };

  return evaluateStageAndOutcome(updated);
}

export function evaluateStageAndOutcome(state: CityGameState): CityGameState {
  if (state.outcome !== 'playing') return state;

  // Check Defeat conditions first
  if (state.indicators.hpKota <= 0) {
    return {
      ...state,
      outcome: 'gameover',
      outcomeReason: 'HP Kota mencapai 0 karena kesejahteraan warga dan lingkungan terabaikan.',
    };
  }

  if (isBalanceCritical(state.indicators)) {
    return {
      ...state,
      outcome: 'gameover',
      outcomeReason:
        'Indeks Keseimbangan Sosial mencapai kondisi kritis akibat ketimpangan ekstrem antar-aspek globalisasi.',
    };
  }

  if (state.timeRemaining <= 0) {
    return {
      ...state,
      outcome: 'gameover',
      outcomeReason: `Waktu pembangunan Stage ${state.stage} habis sebelum seluruh target kota tercapai.`,
    };
  }

  const config = STAGE_CONFIGS[state.stage];
  const stageChallenges = STAGE_CHALLENGES.filter((c) => c.stage === state.stage);
  const allChallengesResolved = stageChallenges.every((c) =>
    state.resolvedChallengeIds.includes(c.id)
  );
  const placedCount = countPlacedBuildings(state.grid);

  if (
    placedCount >= config.requiredBuildingsCount &&
    allChallengesResolved &&
    state.score >= config.targetScoreForStage
  ) {
    // Time bonus on stage completion
    const timeBonus = Math.min(15, Math.floor(state.timeRemaining / 20));
    const finalScore = state.score + timeBonus;

    if (state.stage < 3) {
      return {
        ...state,
        score: finalScore,
        highestUnlockedStage: Math.max(state.highestUnlockedStage, state.stage + 1) as StageNumber,
        outcome: 'stage_clear',
        outcomeReason: `Stage ${state.stage} (${config.name}) berhasil diselesaikan dengan bonus kecepatan +${timeBonus} Skor!`,
        activeDialogue: DYNAMIC_DIALOGUES.stageUp,
      };
    }

    // Stage 3 complete -> check Victory conditions (score >= 70, good balance, HP > 0)
    if (finalScore >= 70 && state.indicators.hpKota > 0) {
      return {
        ...state,
        score: finalScore,
        outcome: 'victory',
        outcomeReason:
          'Selamat! Kota Nusantara berhasil berevolusi menjadi Kota Digital Modern yang makmur, hijau, dan tetap berjati diri Nusantara!',
        activeDialogue: DYNAMIC_DIALOGUES.victory,
      };
    }
  }

  return state;
}

export function advanceToNextStage(state: CityGameState): CityGameState {
  if (state.stage >= 3) return state;
  const nextStage = (state.stage + 1) as StageNumber;
  const nextConfig = STAGE_CONFIGS[nextStage];

  // Expand terrain gently for next stage while keeping existing player buildings!
  const nextGrid = state.grid.map((row, r) =>
    row.map((tile, c) => {
      if (nextStage === 3 && tile.terrain === 'water' && tile.buildingId === null && r === 0) {
        return { ...tile, terrain: 'land' as TileTerrain };
      }
      if (nextStage === 3 && r === 2 && c === 4 && tile.buildingId === null) {
        return { ...tile, terrain: 'park_base' as TileTerrain };
      }
      return tile;
    })
  );

  return {
    ...state,
    stage: nextStage,
    highestUnlockedStage: Math.max(state.highestUnlockedStage, nextStage) as StageNumber,
    money: state.money + 380,
    timeRemaining: nextConfig.timeLimitSeconds,
    grid: nextGrid,
    outcome: 'playing',
    outcomeReason: '',
    activeDialogue: {
      character: nextConfig.introSpeaker,
      mood: 'optimis',
      text: nextConfig.introMessage,
    },
    lastNotification: {
      type: 'info',
      message: `Selamat datang di Stage ${nextStage}: ${nextConfig.name}! (+380 Koin Anggaran Era Baru)`,
      id: state.tick + Date.now(),
    },
  };
}

export function computeHotsEvaluation(correctCount: number, totalCount: number): {
  score: number;
  percentage: number;
  badgeTitle: string;
  summaryMessage: string;
} {
  const safeTotal = Math.max(1, totalCount);
  const percentage = Math.round((correctCount / safeTotal) * 100);
  const score = percentage;

  if (score >= 90) {
    return {
      score,
      percentage,
      badgeTitle: 'Sosiolog Muda Visioner (Peringkat Utama)',
      summaryMessage:
        'Analisis HOTS luar biasa! Kamu menguasai seluruh teori globalisasi sekaligus strategi glokalisasi secara seimbang.',
    };
  }
  if (score >= 70) {
    return {
      score,
      percentage,
      badgeTitle: 'Arsitek Glokalisasi Nusantara',
      summaryMessage:
        'Pemahaman sosiologimu sudah kuat. Terus perdalam analisis ketimpangan sistem dunia dan mitigasi dampak negatif globalisasi.',
    };
  }
  if (score >= 50) {
    return {
      score,
      percentage,
      badgeTitle: 'Peneliti Sosial Berkembang',
      summaryMessage:
        'Dasar konsep globalisasi sudah terlihat. Ulas kembali Mode Belajar untuk membedakan perspektif teori dan dampak sosial budaya.',
    };
  }
  return {
    score,
    percentage,
    badgeTitle: 'Perintis Studi Globalisasi',
    summaryMessage:
      'Jangan menyerah! Pelajari kembali flashcards di Mode Belajar agar analisis studi kasus HOTS semakin tajam.',
  };
}
