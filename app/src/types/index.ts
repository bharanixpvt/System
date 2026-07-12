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
  | 'recovery';

export type QuestType = 'daily' | 'main' | 'side' | 'recovery' | 'boss';
export type QuestStatus = 'active' | 'completed' | 'failed' | 'expired';
export type QuestCategory = 'strength' | 'agility' | 'mobility' | 'endurance' | 'combat' | 'focus' | 'discipline' | 'recovery' | 'general';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary' | 'mythic';
export type AchievementType = 'visible' | 'hidden' | 'secret';

export type DungeonType = 'beginner' | 'agility' | 'endurance' | 'boss';
export type DungeonStatus = 'locked' | 'available' | 'completed';

export type TrainingPathName = 'strength' | 'agility' | 'mobility' | 'endurance' | 'selfDefense';

export type ShopItemCategory = 'utility' | 'theme' | 'animation' | 'customization' | 'widget' | 'title_cosmetic';

export type ScreenName =
  | 'opening'
  | 'onboarding'
  | 'dashboard'
  | 'stats'
  | 'quests'
  | 'training'
  | 'dungeon'
  | 'inventory'
  | 'shop'
  | 'analytics'
  | 'settings'
  | 'evaluation';

export interface BossDungeonEvent {
  id: string;
  name: string;
  description: string;
  expiresAt: Date;
  xpReward: number;
  coinReward: number;
}

// ============================================================
// Core Data Models
// ============================================================

export interface PlayerProfile {
  id: string;
  name: string;
  age: number;
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
  goals?: string[];
  sleepQuality?: number;
  maxPushups?: number;
  maxPlank?: number;
  combatTrainingStatus?: 'locked' | 'accepted' | 'held' | 'declined';
  combatPromptAfter?: Date;
  streakShieldActive?: boolean;
  xpAmplifierActive?: boolean;
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
  trainingPath?: TrainingPathName;
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
  path: TrainingPathName;
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
}

export interface TrainingPath {
  name: TrainingPathName;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  tier: number;
  maxTier: number;
  progress: number;
  exercises: TrainingExercise[];
  currentExerciseIndex: number;
  unlocked: boolean;
  completed: boolean;
}

export interface TrainingExercise {
  name: string;
  tier: number;
  difficulty: number;
  description: string;
  sets: number;
  reps: number;
  restSeconds: number;
  unlocked: boolean;
  completed: boolean;
  path: TrainingPathName;
}

export interface SelfDefenseStage {
  stage: number;
  name: string;
  description: string;
  techniques: string[];
  completed: boolean;
  progress: number;
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
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'danger' | 'level_up' | 'rank_up';
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
  trainingPaths: TrainingPath[];
}

export const RANK_LEVEL_RANGES: Record<Rank, { min: number; max: number; color: string }> = {
  'E Rank': { min: 1, max: 10, color: '#6B7280' },
  'D Rank': { min: 11, max: 25, color: '#22C55E' },
  'C Rank': { min: 26, max: 45, color: '#3B82F6' },
  'B Rank': { min: 46, max: 70, color: '#8B5CF6' },
  'A Rank': { min: 71, max: 100, color: '#F59E0B' },
  'S Rank': { min: 101, max: 150, color: '#EF4444' },
  'SS Rank': { min: 151, max: 250, color: '#EC4899' },
  'SSS Rank': { min: 251, max: 400, color: '#F97316' },
  'National Level': { min: 401, max: 600, color: '#06B6D4' },
  'Monarch Level': { min: 601, max: 850, color: '#EAB308' },
  'Shadow Monarch': { min: 851, max: 999, color: '#4FD8FF' },
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
  focus: { displayName: 'Focus', description: 'Mental concentration, discipline', color: '#3A8DFF', icon: 'Target' },
  reaction: { displayName: 'Reaction', description: 'Response speed, reflexes', color: '#F97316', icon: 'Gauge' },
  combat: { displayName: 'Combat', description: 'Defensive movement and technique', color: '#8B5CF6', icon: 'Shield' },
  mobility: { displayName: 'Mobility', description: 'Range of motion, flexibility', color: '#06B6D4', icon: 'Move' },
  discipline: { displayName: 'Discipline', description: 'Consistency, willpower', color: '#EC4899', icon: 'Lock' },
  recovery: { displayName: 'Recovery', description: 'Rest quality, fatigue management', color: '#4FD8FF', icon: 'BatteryCharging' },
};

export const DEFAULT_DAILY_QUESTS = [
  { name: 'Hydration Protocol', description: 'Drink 3L of water throughout the day', category: 'general' as QuestCategory, xpReward: 15, requirement: 'Water' },
  { name: 'Mobility Ritual', description: 'Complete 10-minute morning mobility session', category: 'mobility' as QuestCategory, xpReward: 25, requirement: 'Mobility' },
  { name: 'Strength Maintenance', description: 'Complete a Strength Path training session', category: 'strength' as QuestCategory, xpReward: 50, requirement: 'Strength training' },
  { name: 'Mental Fortress', description: 'Meditate for 10 minutes', category: 'focus' as QuestCategory, xpReward: 15, requirement: 'Meditation' },
  { name: 'Knowledge Acquisition', description: 'Read for 20+ minutes', category: 'focus' as QuestCategory, xpReward: 30, requirement: 'Reading' },
  { name: 'Digital Discipline', description: 'No porn today — maintain streak', category: 'discipline' as QuestCategory, xpReward: 40, requirement: 'Porn-free' },
  { name: 'Screen Limit', description: 'Stay under screen time limit', category: 'discipline' as QuestCategory, xpReward: 25, requirement: 'Screen time' },
  { name: 'Recovery Protocol', description: 'Sleep before 11 PM', category: 'recovery' as QuestCategory, xpReward: 20, requirement: 'Sleep' },
  { name: 'Endurance Base', description: 'Walk 10,000 steps', category: 'endurance' as QuestCategory, xpReward: 30, requirement: 'Steps' },
  { name: 'Combat Practice', description: 'Shadow boxing — 3 rounds', category: 'combat' as QuestCategory, xpReward: 35, requirement: 'Shadow boxing' },
];
