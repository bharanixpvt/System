// ============================================================
// SYSTEM — Personal Operating System
// Core Type Definitions
// ============================================================

export type Rank =
  | 'E Rank'
  | 'D Rank'
  | 'C Rank'
  | 'B Rank'
  | 'A Rank'
  | 'S Rank'
  | 'SS Rank'
  | 'SSS Rank'
  | 'National Level'
  | 'Monarch Level'
  | 'Shadow Monarch';

export type StatName =
  | 'strength'
  | 'agility'
  | 'endurance'
  | 'focus'
  | 'reaction'
  | 'combat'
  | 'mobility'
  | 'discipline'
  | 'recovery'
  | 'balance'
  | 'technique'
  | 'coordination'
  | 'awareness'
  | 'mentalFortitude'
  | 'potential'
  | 'systemAffinity'
  | 'confidence';

export type QuestType = 'daily' | 'main' | 'side' | 'recovery' | 'boss' | 'hidden';
export type QuestStatus = 'active' | 'completed' | 'failed' | 'expired';
export type QuestCategory =
  | 'strength'
  | 'agility'
  | 'mobility'
  | 'endurance'
  | 'combat'
  | 'focus'
  | 'discipline'
  | 'recovery'
  | 'reaction'
  | 'balance'
  | 'coordination'
  | 'nutrition'
  | 'general';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary' | 'mythic';
export type AchievementType = 'visible' | 'hidden' | 'secret';

export type DungeonType = 'beginner' | 'agility' | 'endurance' | 'boss';
export type DungeonStatus = 'locked' | 'available' | 'completed' | 'expired';

export type ShopItemCategory = 'utility' | 'theme' | 'animation' | 'customization' | 'widget' | 'title_cosmetic' | 'upskill';

export type ScreenName =
  | 'opening'
  | 'onboarding'
  | 'dashboard'
  | 'stats'
  | 'quests'
  | 'dungeon'
  | 'inventory'
  | 'shop'
  | 'analytics'
  | 'settings'
  | 'evaluation';

// ============================================================
// Onboarding Data Models
// ============================================================

export type LifeSituation =
  | 'Student'
  | 'College Student'
  | 'Working Professional'
  | 'Business Owner'
  | 'Freelancer'
  | 'Other';

export type EquipmentOption =
  | 'Bodyweight Only'
  | 'Resistance Band'
  | 'Pull-up Bar'
  | 'Jump Rope'
  | 'Dumbbells'
  | 'Gym Membership'
  | 'Other';

export type FitnessLevelOption = 'Beginner' | 'Intermediate' | 'Advanced';

export interface DailyScheduleConfig {
  wakeTime: string;
  sleepTime: string;
  workHours: string;
  preferredTrainingTime: string;
}

export interface OnboardingData {
  preferredName: string;
  age: number;
  dateOfBirth: string;
  gender: 'male' | 'female';
  weightKg: number;
  heightCm: number;
  bodyFatPercent: number;
  country: string;
  language: string;
  timezone: string;
  purpose?: string;
  lifeSituation: LifeSituation;
  availableTimeMinutes: number;
  goals: string[];
  equipment: EquipmentOption[];
  fitnessLevel: FitnessLevelOption;
  limitations: string;
  injuries?: string[];
  schedule: DailyScheduleConfig;
}

// ============================================================
// Core Data Models
// ============================================================

export interface PlayerProfile {
  id: string;
  name: string;
  age: number;
  dateOfBirth?: string; // ISO date string YYYY-MM-DD
  gender: string;
  weight: number;
  height: number;
  bodyFat: number;
  fitnessLevel: number;
  scanDate: Date;
  totalLevel: number;
  totalXP: number;
  xpToNextLevel: number;
  currentRank: Rank;
  coins: number;
  streak: number;
  maxStreak: number;
  fatigue: number;
  attributePoints: number;
  skillPoints: number;
  lastLoginDate?: Date;
  nextEvaluationDate?: Date;
  pornFreeStreak: number;
  maxPornFreeStreak: number;
  screenTimeLimit: number;
  lastScreenTimeLog?: Date;
  todayScreenTime: number;
  goals: string[];
  sleepQuality?: number;
  maxPushups?: number;
  maxPlank?: number;
  combatTrainingStatus?: 'locked' | 'accepted' | 'held' | 'declined';
  combatPromptAfter?: Date;
  streakShieldActive?: boolean;
  xpAmplifierActive?: boolean;
  
  // SYSTEM v3 Additions
  availableTimeMinutes: number;
  lifeSituation: LifeSituation;
  equipment: EquipmentOption[];
  fitnessExperience: FitnessLevelOption;
  limitations: string;
  schedule: DailyScheduleConfig;
  country: string;
  language: string;
  timezone: string;
  unlockedStats: StatName[];
  unlockedUpskills: string[];
}

export interface PlayerStat {
  name: StatName;
  displayName: string;
  description: string;
  level: number;
  xp: number;
  xpToNext: number;
  rank: Rank;
  color: string;
  icon: string;
  unlocked: boolean;
}

export interface Quest {
  id: string;
  type: QuestType;
  name: string;
  description: string;
  status: QuestStatus;
  xpReward: number;
  coinReward: number;
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  category: QuestCategory;
  requirement?: string;
  penaltyXP?: number;
  isGenerated?: boolean;
  isCustom?: boolean;
  isSystemQuest?: boolean;
  canReduceXP?: boolean;
  xpReductionPercent?: number;
  upskillRequired?: string;
  isArchived?: boolean;
  estimatedMinutes?: number;
}

export interface ExerciseLog {
  name: string;
  sets: number;
  reps: number;
  bandResistance?: string;
  notes: string;
  pr: boolean;
  weight?: number;
}

export interface WorkoutLog {
  id: string;
  date: Date;
  path: string;
  pathDisplayName: string;
  exercises: ExerciseLog[];
  totalXP: number;
  difficulty: number;
  duration: number;
  rpe: number;
  notes?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: AchievementTier;
  unlockedAt?: Date;
  unlocked: boolean;
  hidden: boolean;
  progress: number;
  maxProgress: number;
  condition: string;
}

export interface Title {
  id: string;
  name: string;
  description: string;
  equipped: boolean;
  unlockedAt?: Date;
  unlocked: boolean;
  bonus: string;
  tier: AchievementTier;
  condition: string;
}

export interface InventoryItem {
  id: string;
  type: ShopItemCategory;
  name: string;
  description: string;
  cost: number;
  purchasedAt?: Date;
  equipped: boolean;
  quantity?: number;
  rewardOnly?: boolean;
}

export interface HistoryEntry {
  id: string;
  date: Date;
  action: string;
  xpChange: number;
  coinChange: number;
  statChanges: Partial<Record<StatName, number>>;
  type: string;
  details?: string;
}

export interface SystemSettings {
  audioEnabled: boolean;
  audioVolume: number;
  notificationsEnabled: boolean;
  theme: string;
  reduceMotion: boolean;
  screenTimeLimit: number;
  evalReminderDays: number;
  gymEquipmentEnabled: boolean;
  lastExportDate?: Date;
  playerName?: string;
  onboardingComplete: boolean;
  systemPaused?: boolean;
  ruthlessModeEnabled?: boolean;
}

export interface Dungeon {
  id: string;
  name: string;
  type: DungeonType;
  description: string;
  difficulty: number;
  color: string;
  estimatedMinutes: number;
  xpReward: number;
  coinReward: number;
  status: DungeonStatus;
  exercises: string[];
  requirements?: string;
  unlockedAt?: Date;
  completedAt?: Date;
  bestTime?: number;
  difficultyOffset?: number;
}

export interface Upskill {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  unlocksStats: StatName[];
  unlocksQuestsDescription: string;
  unlocked: boolean;
}

export interface ShopItem {
  id: string;
  type: ShopItemCategory;
  name: string;
  description: string;
  cost: number;
  preview: string;
  purchased: boolean;
  effect?: string;
  secret?: boolean;
  upskillId?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'danger' | 'level_up' | 'rank_up' | 'ruthless';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  autoDismiss: boolean;
}

export interface EvaluationResult {
  id: string;
  date: Date;
  rank: Rank;
  passed: boolean;
  scores: Record<string, number>;
  notes?: string;
  nextEvalDate: Date;
}

export interface DigitalWellness {
  pornFreeDays: number;
  pornRelapses: number;
  currentPornStreak: number;
  maxPornStreak: number;
  screenTimeLimit: number;
  todayScreenTime: number;
  screenTimeHistory: ScreenTimeEntry[];
  focusSessionsToday: number;
  totalFocusMinutesToday: number;
}

export interface ScreenTimeEntry {
  date: Date;
  minutes: number;
}

export interface GameState {
  isPaused: boolean;
  currentScreen: ScreenName;
  previousScreen: ScreenName | null;
  activeDungeon: string | null;
  activeTraining: string | null;
  penaltyZone: boolean;
  systemMessage: string | null;
  showLevelUp: boolean;
  showRankUp: boolean;
  showAchievement: boolean;
  levelUpData: LevelUpData | null;
  rankUpData: RankUpData | null;
  achievementData: AchievementUnlockData | null;
}

export interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  rewards: string[];
}

export interface RankUpData {
  oldRank: Rank;
  newRank: Rank;
}

export interface AchievementUnlockData {
  achievement: Achievement;
}

export interface ExportData {
  version: string;
  exportedAt: string;
  profile: PlayerProfile;
  stats: PlayerStat[];
  quests: Quest[];
  workouts: WorkoutLog[];
  achievements: Achievement[];
  titles: Title[];
  inventory: InventoryItem[];
  history: HistoryEntry[];
  settings: SystemSettings;
  dungeons: Dungeon[];
}

export const RANK_LEVEL_RANGES: Record<Rank, { min: number; max: number; color: string }> = {
  'E Rank': { min: 1, max: 10, color: '#6B7280' },
  'D Rank': { min: 11, max: 25, color: '#22C55E' },
  'C Rank': { min: 26, max: 45, color: '#64748B' },
  'B Rank': { min: 46, max: 70, color: '#8B5CF6' },
  'A Rank': { min: 71, max: 100, color: '#F59E0B' },
  'S Rank': { min: 101, max: 150, color: '#EF4444' },
  'SS Rank': { min: 151, max: 250, color: '#EC4899' },
  'SSS Rank': { min: 251, max: 400, color: '#F97316' },
  'National Level': { min: 401, max: 600, color: '#06B6D4' },
  'Monarch Level': { min: 601, max: 850, color: '#EAB308' },
  'Shadow Monarch': { min: 851, max: 999, color: '#CBD5E1' },
};

export const RANK_ORDER: Rank[] = [
  'E Rank',
  'D Rank',
  'C Rank',
  'B Rank',
  'A Rank',
  'S Rank',
  'SS Rank',
  'SSS Rank',
  'National Level',
  'Monarch Level',
  'Shadow Monarch',
];

export const STAT_CONFIG: Record<StatName, { displayName: string; description: string; color: string; icon: string }> = {
  strength: { displayName: 'Strength', description: 'Physical power, push/pull capacity', color: '#EF4444', icon: 'Dumbbell' },
  agility: { displayName: 'Agility', description: 'Speed, reaction, change of direction', color: '#FBBF24', icon: 'Zap' },
  endurance: { displayName: 'Endurance', description: 'Stamina, cardiovascular capacity', color: '#4ADE80', icon: 'Heart' },
  focus: { displayName: 'Focus', description: 'Mental concentration, discipline', color: '#64748B', icon: 'Target' },
  reaction: { displayName: 'Reaction', description: 'Response speed, reflexes', color: '#F97316', icon: 'Gauge' },
  combat: { displayName: 'Combat', description: 'Defensive movement and technique', color: '#8B5CF6', icon: 'Shield' },
  mobility: { displayName: 'Mobility', description: 'Range of motion, flexibility', color: '#06B6D4', icon: 'Move' },
  discipline: { displayName: 'Discipline', description: 'Consistency, willpower', color: '#EC4899', icon: 'Lock' },
  recovery: { displayName: 'Recovery', description: 'Rest quality, fatigue management', color: '#CBD5E1', icon: 'BatteryCharging' },
  balance: { displayName: 'Balance', description: 'Proprioception, core stability, physical control', color: '#10B981', icon: 'Scale' },
  technique: { displayName: 'Technique', description: 'Form accuracy and mechanical efficiency', color: '#3B82F6', icon: 'CheckCircle2' },
  coordination: { displayName: 'Coordination', description: 'Neuromuscular sync and kinetic chain timing', color: '#8B5CF6', icon: 'Activity' },
  awareness: { displayName: 'Awareness', description: 'Spatial perception and situational clarity', color: '#06B6D4', icon: 'Eye' },
  mentalFortitude: { displayName: 'Mental Fortitude', description: 'Pain tolerance, resilience under pressure', color: '#F43F5E', icon: 'BrainCircuit' },
  potential: { displayName: 'Potential', description: 'Latent capacity to absorb higher training loads', color: '#EAB308', icon: 'Sparkles' },
  systemAffinity: { displayName: 'System Affinity', description: 'Harmonic alignment with SYSTEM directives', color: '#A855F7', icon: 'Cpu' },
  confidence: { displayName: 'Confidence', description: 'Unwavering self-assurance and posture', color: '#F97316', icon: 'Flame' },
};
