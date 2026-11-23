export type AppScreen = 'title' | 'dashboard' | 'belajar' | 'bermain' | 'berlatih';

export type CharacterId = 'aditya' | 'laras' | 'naya';

export type CharacterMood = 'senang' | 'optimis' | 'waspada' | 'kritis' | 'bangga' | 'terkejut';

export interface CharacterProfile {
  id: CharacterId;
  name: string;
  title: string;
  theory: string;
  profession: string;
  personality: string;
  focus: string;
  signatureQuote: string;
  avatarSrc: string;
  fullBodySrc: string;
  accentHex: string;
  badgeBgClass: string;
  borderClass: string;
  textAccentClass: string;
}

export type BuildingCategory =
  | 'perdagangan'
  | 'industri'
  | 'teknologi'
  | 'masyarakat'
  | 'budaya';

export type StageNumber = 1 | 2 | 3;

export interface BuildingEffects {
  ekonomiGlobal: number;
  iptek: number;
  kearifanLokal: number;
  hpKota: number;
  incomePerTick: number;
  scoreBonus: number;
}

export interface BuildingDefinition {
  id: string;
  name: string;
  category: BuildingCategory;
  minStage: StageNumber;
  cost: number;
  functionDesc: string;
  globalizationLink: string;
  effects: BuildingEffects;
  iconKey: string;
  colorPrimary: string;
  colorRoof: string;
  heightLevel: number;
  requiresBlueprintUnlock?: boolean;
  unlockHint?: string;
}

export type TileTerrain = 'land' | 'road' | 'water' | 'park_base';

export interface CityTile {
  row: number;
  col: number;
  terrain: TileTerrain;
  buildingId: string | null;
  builtAtTick: number;
}

export interface CityIndicators {
  ekonomiGlobal: number; // 0 - 100
  iptek: number;         // 0 - 100
  kearifanLokal: number; // 0 - 100
  hpKota: number;        // 0 - 100
}

export interface ChallengeOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  isCorrect: boolean;
  explanation: string;
  reactionCharacter: CharacterId;
  reactionText: string;
  delta: {
    score: number;
    money: number;
    ekonomiGlobal: number;
    iptek: number;
    kearifanLokal: number;
    hpKota: number;
  };
}

export interface StageChallenge {
  id: string;
  stage: StageNumber;
  title: string;
  scenario: string;
  speaker: CharacterId;
  options: ChallengeOption[];
}

export interface StageConfig {
  stage: StageNumber;
  name: string;
  eraLabel: string;
  subtitle: string;
  themeBgClass: string;
  accentColor: string;
  referenceImage: string;
  timeLimitSeconds: number;
  missions: string[];
  requiredBuildingsCount: number;
  requiredCategoryHints: BuildingCategory[];
  targetScoreForStage: number;
  introSpeaker: CharacterId;
  introMessage: string;
}

export type PlayOutcome = 'playing' | 'paused' | 'stage_clear' | 'victory' | 'gameover';

export interface CityGameState {
  stage: StageNumber;
  highestUnlockedStage: StageNumber;
  money: number;
  score: number;
  indicators: CityIndicators;
  grid: CityTile[][];
  tick: number;
  timeRemaining: number;
  resolvedChallengeIds: string[];
  completedMissionIndices: number[];
  outcome: PlayOutcome;
  outcomeReason: string;
  activeDialogue: {
    character: CharacterId;
    mood: CharacterMood;
    text: string;
  };
  lastNotification: {
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
    id: number;
  } | null;
}

export interface FlashcardItem {
  id: string;
  frontTitle: string;
  frontPrompt: string;
  backExplanation: string;
  everydayExample: string;
}

export interface ScholarDefinition {
  scholar: string;
  yearOrWork: string;
  definition: string;
}

export interface TimelinePhase {
  id: string;
  era: string;
  periodLabel: string;
  summary: string;
  drivers: string[];
  nusantaraContext: string;
  stageRefImage: string;
}

export interface WorldSystemTier {
  id: 'core' | 'semi-periphery' | 'periphery';
  name: string;
  role: string;
  characteristics: string[];
  examples: string;
  inequalityImpact: string;
}

export interface BelajarModule {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  expReward: number;
  leadCharacter: CharacterId;
  characterNote: string;
  coreSummary: string;
  keyPoints: { heading: string; detail: string; example: string }[];
  scholarDefinitions?: ScholarDefinition[];
  flashcards: FlashcardItem[];
  hasTimeline?: boolean;
  hasWorldSystem?: boolean;
}

export interface HotsQuestion {
  id: number;
  topicTag: string;
  speaker: CharacterId;
  scenario: string;
  question: string;
  options: {
    label: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctLabel: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  distractorNotes: string;
}

export type VehicleKind =
  | 'bicycle'
  | 'cart'
  | 'boat'
  | 'delivery_truck'
  | 'cargo_truck'
  | 'industrial_bus'
  | 'forklift'
  | 'ev_car'
  | 'autonomous_taxi'
  | 'ev_moto'
  | 'future_bus'
  | 'courier_pod';

export interface IndustrialBalanceMetrics {
  industrialProduction: number; // 0..100
  employment: number;           // 0..100
  economicGrowth: number;       // 0..100
  tradePerformance: number;     // 0..100
  workerWelfare: number;        // 0..100
  environmentalQuality: number; // 0..100
  infrastructureQuality: number;// 0..100
  publicSatisfaction: number;   // 0..100
}

export interface SmartCityMetrics {
  economicGrowth: number;           // 0..100
  digitalDevelopment: number;       // 0..100
  employment: number;               // 0..100
  publicSatisfaction: number;       // 0..100
  environmentalQuality: number;     // 0..100
  renewableEnergy: number;          // 0..100
  transportationEfficiency: number; // 0..100
  researchDevelopment: number;      // 0..100
  infrastructureQuality: number;    // 0..100
}

export type Stage3ActivityKind =
  | 'smart_grid'
  | 'robotics_lab'
  | 'ecommerce_dispatch'
  | 'ev_circuit'
  | 'observation_scan';

export interface ProductionRecipeDef {
  id: string;
  factoryId: string;
  factoryName: string;
  name: string;
  inputItemId: string;
  inputQty: number;
  outputItemId: string;
  outputQty: number;
  durationSeconds: number;
  sellPriceCoins: number;
  xpReward: number;
  pollutionDelta: number;
}

export interface ProductionOrderState {
  id: string;
  recipeId: string;
  factoryId: string;
  progress: number; // 0..1
  completed: boolean;
}


