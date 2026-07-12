// ============================================================
// SYSTEM — Zustand Game Store
// Central state management for all game data
// ============================================================

import { create } from 'zustand';
import type {
  PlayerProfile,
  PlayerStat,
  Quest,
  WorkoutLog,
  Achievement,
  Title,
  InventoryItem,
  HistoryEntry,
  SystemSettings,
  Dungeon,
  TrainingPath,
  EvaluationResult,
  StatName,
  ScreenName,
  Notification,
  ShopItem,
  QuestCategory,
  QuestType,
  BossDungeonEvent,
} from '@/types';
import {
  createDefaultStats,
  createDefaultAchievements,
  createDefaultTitles,
  createDefaultDungeons,
  createDefaultTrainingPaths,
  createDefaultShopItems,
  generateDailyQuests,
  generateSideQuests,
  createDefaultMainQuests,
  addXP,
  addStatXP,
  getRankForLevel,
  getNextRank,
  checkStreak,
} from '@/engine/gameEngine';
import {
  getProfile,
  saveProfile,
  getStats,
  saveStats,
  getQuests,
  saveQuests,
  getWorkouts,
  saveWorkout,
  getAchievements,
  saveAchievements,
  getTitles,
  saveTitles,
  getInventory,
  saveInventoryItem,
  getHistory,
  addHistoryEntry,
  getSettings,
  saveSettings,
  getDungeons,
  saveDungeons,
  getTrainingPaths,
  saveTrainingPaths,
  exportAllData,
  importAllData,
  resetAllData,
} from '@/db';
import { playQuestCompleted, playLevelUp, playAchievement, playRankUp, playPenalty, playNotification, playBossAlert } from '@/lib/audio';
import { evaluateSchedule, getNextScheduleOnComplete, SCHEDULE_CONFIGS } from '@/engine/scheduler';

// ============================================================
// Store State Interface
// ============================================================

interface SystemState {
  // Data
  profile: PlayerProfile | null;
  stats: PlayerStat[];
  quests: Quest[];
  workouts: WorkoutLog[];
  achievements: Achievement[];
  titles: Title[];
  inventory: InventoryItem[];
  history: HistoryEntry[];
  settings: SystemSettings | null;
  dungeons: Dungeon[];
  trainingPaths: TrainingPath[];
  evaluations: EvaluationResult[];
  shopItems: ShopItem[];
  notifications: Notification[];
  
  // UI State
  currentScreen: ScreenName;
  previousScreen: ScreenName | null;
  isLoading: boolean;
  isInitialized: boolean;
  penaltyZone: boolean;
  systemMessage: string | null;
  showLevelUp: boolean;
  showRankUp: boolean;
  showAchievement: boolean;
  showSystemNotification: string | null;
  activeBossDungeon: BossDungeonEvent | null;
  showCinematicBossNotification: boolean;
  dungeonTimerBonusSeconds: number;
  dungeonDifficultyReduction: number;
  
  // Actions
  initialize: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  loadAllData: () => Promise<void>;
  
  // Quest Actions
  completeQuest: (questId: string) => Promise<void>;
  failQuest: (questId: string) => Promise<void>;
  generateDailyQuests: () => Promise<void>;
  saveCustomQuest: (quest: Partial<Quest> & { name: string; description: string; category: QuestCategory }) => Promise<void>;
  deleteCustomQuest: (questId: string) => Promise<void>;
  
  // Training Actions
  logWorkout: (workout: WorkoutLog) => Promise<void>;
  completeTrainingExercise: (pathName: string, exerciseIndex: number) => Promise<void>;
  
  // Stat Actions
  addStatXP: (statName: StatName, amount: number) => Promise<void>;
  
  // Dungeon Actions
  enterDungeon: (dungeonId: string) => Promise<void>;
  completeDungeon: (dungeonId: string, timeMinutes: number, increaseDifficulty?: boolean) => Promise<void>;
  summonBossDungeon: () => void;
  dismissBossDungeon: () => void;
  dismissPenaltyZone: () => void;
  checkBossDungeonSchedule: () => Promise<void>;
  forceUnlockBossDungeon: () => Promise<void>;
  dismissCinematicBossNotification: () => void;
  setCombatTrainingStatus: (status: 'accepted' | 'held' | 'declined') => Promise<void>;
  useQuestUtility: (questId: string, itemId: string) => Promise<void>;
  activateUtility: (itemId: string) => Promise<void>;
  consumeDungeonAids: () => void;
  
  // Shop/Inventory
  purchaseItem: (itemId: string) => Promise<void>;
  equipItem: (itemId: string) => Promise<void>;
  equipTitle: (titleId: string) => Promise<void>;
  
  // Achievements
  checkAchievements: () => Promise<void>;
  
  // Wellness
  logPornFreeDay: (clean: boolean) => Promise<void>;
  logScreenTime: (minutes: number) => Promise<void>;
  
  // Evaluation
  submitEvaluation: (scores: Record<string, number>, passed: boolean) => Promise<void>;
  
  // Navigation
  navigateTo: (screen: ScreenName) => void;
  goBack: () => void;
  
  // Settings
  updateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  
  // Export/Import
  exportData: () => Promise<string>;
  importData: (data: Record<string, unknown>) => Promise<void>;
  resetSystem: () => Promise<void>;
  
  // Notifications
  dismissNotification: (id: string) => void;
  addNotification: (notification: Notification) => void;
  
  // SYSTEM
  setSystemMessage: (msg: string | null) => void;
  clearLevelUp: () => void;
  clearRankUp: () => void;
  clearAchievement: () => void;
}

interface OnboardingData {
  name: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  bodyFat: number;
  fitnessLevel: number;
  sleepQuality: number;
  maxPushups: number;
  maxPlank: number;
  bandStrength: string;
  pornFrequency: string;
  screenTime: number;
  goals: string[];
}

// ============================================================
// Default Settings
// ============================================================

const defaultSettings: SystemSettings = {
  audioEnabled: true,
  audioVolume: 0.15,
  notificationsEnabled: true,
  theme: 'default',
  reduceMotion: false,
  screenTimeLimit: 240,
  evalReminderDays: 3,
  gymEquipmentEnabled: false,
  onboardingComplete: false,
  bossDungeonPenaltyEnabled: true,
};

// ============================================================
// Store Implementation
// ============================================================

export const useGameStore = create<SystemState>((set, get) => ({
  // Initial State
  profile: null,
  stats: [],
  quests: [],
  workouts: [],
  achievements: [],
  titles: [],
  inventory: [],
  history: [],
  settings: null,
  dungeons: [],
  trainingPaths: [],
  evaluations: [],
  shopItems: createDefaultShopItems(),
  notifications: [],
  
  currentScreen: 'opening',
  previousScreen: null,
  isLoading: true,
  isInitialized: false,
  penaltyZone: false,
  systemMessage: null,
  showLevelUp: false,
  showRankUp: false,
  showAchievement: false,
  showSystemNotification: null,
  activeBossDungeon: null,
  showCinematicBossNotification: false,
  dungeonTimerBonusSeconds: 0,
  dungeonDifficultyReduction: 0,
  
  // ============================================================
  // Initialize
  // ============================================================
  
  initialize: async () => {
    set({ isLoading: true });
    try {
      const profile = await getProfile();
      const settings = await getSettings();
      
      if (!profile || !settings?.onboardingComplete) {
        set({ isLoading: false, currentScreen: 'opening' });
        return;
      }
      
      // Load all data
      const [stats, quests, workouts, achievements, titles, inventory, history, dungeons, trainingPaths] = 
        await Promise.all([
          getStats(),
          getQuests(),
          getWorkouts(),
          getAchievements(),
          getTitles(),
          getInventory(),
          getHistory(),
          getDungeons(),
          getTrainingPaths(),
        ]);
      
      // Check streak
      const streakCheck = checkStreak(profile.lastLoginDate);
      if (streakCheck.reset) {
        profile.streak = 0;
        await saveProfile(profile);
      }
      
      // Update last login
      profile.lastLoginDate = new Date();
      // Migration for existing players: begin the optional combat check-in one week from now.
      if (!profile.combatTrainingStatus) {
        profile.combatTrainingStatus = 'locked';
        profile.combatPromptAfter = new Date(Date.now() + 7 * 86400000);
      }
      await saveProfile(profile);
      
      // Generate daily quests if needed
      const todayStr = new Date().toISOString().split('T')[0];
      const hasTodayQuests = quests.some(q => q.type === 'daily' && q.id.includes(todayStr));
      let updatedQuests = quests;
      if (!hasTodayQuests) {
        const dailyQuests = generateDailyQuests(profile);
        const sideQuests = generateSideQuests(profile);
        updatedQuests = [...quests.filter(q => q.type !== 'daily' || q.status === 'active'), ...dailyQuests, ...sideQuests];
        await saveQuests(updatedQuests);
      }
      
      set({
        profile,
        stats: stats.length > 0 ? stats : createDefaultStats(),
        quests: updatedQuests,
        workouts,
        achievements: achievements.length > 0 ? achievements : createDefaultAchievements(),
        titles: titles.length > 0 ? titles : createDefaultTitles(),
        inventory,
        history,
        settings: settings || defaultSettings,
        dungeons: dungeons.length > 0 ? dungeons : createDefaultDungeons(),
        trainingPaths: trainingPaths.length > 0 ? trainingPaths : createDefaultTrainingPaths(),
        currentScreen: 'dashboard',
        isLoading: false,
        isInitialized: true,
        penaltyZone: updatedQuests.filter(q => q.status === 'failed').length >= 3,
      });

      // Evaluate boss dungeon schedule
      await get().checkBossDungeonSchedule();
      
    } catch (error) {
      console.error('Initialization error:', error);
      set({ isLoading: false, currentScreen: 'opening' });
    }
  },
  
  // ============================================================
  // Onboarding
  // ============================================================
  
  completeOnboarding: async (data: OnboardingData) => {
    const now = new Date();
    const nextEval = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const profile: PlayerProfile = {
      id: 'player',
      name: data.name,
      age: data.age,
      gender: data.gender,
      weight: data.weight,
      height: data.height,
      bodyFat: data.bodyFat,
      fitnessLevel: data.fitnessLevel,
      scanDate: now,
      totalLevel: 1,
      totalXP: 0,
      xpToNextLevel: 150,
      currentRank: 'E Rank',
      coins: 100,
      streak: 0,
      maxStreak: 0,
      fatigue: 10,
      attributePoints: 0,
      skillPoints: 0,
      lastLoginDate: now,
      nextEvaluationDate: nextEval,
      pornFreeStreak: 0,
      maxPornFreeStreak: 0,
      screenTimeLimit: data.screenTime || 240,
      todayScreenTime: 0,
      goals: data.goals,
      sleepQuality: data.sleepQuality,
      maxPushups: data.maxPushups,
      maxPlank: data.maxPlank,
      combatPromptAfter: new Date(now.getTime() + 7 * 86400000),
      lastBossDungeonDate: undefined,
      nextBossDungeonDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      bossDungeonStatus: 'locked',
    };
    
    // Calculate initial stats based on onboarding
    const stats = createDefaultStats();
    
    // Adjust stats based on fitness level
    const fitnessMultiplier = data.fitnessLevel / 5;
    stats.forEach(stat => {
      stat.level = Math.max(1, Math.round(stat.level * fitnessMultiplier));
      stat.xpToNext = 100 * Math.pow(stat.level, 1.08) + 50;
      stat.rank = getRankForLevel(stat.level);
    });
    
    const quests = [...generateDailyQuests(data), ...generateSideQuests(data), ...createDefaultMainQuests()];
    const achievements = createDefaultAchievements();
    const titles = createDefaultTitles();
    const dungeons = createDefaultDungeons();
    const trainingPaths = createDefaultTrainingPaths();
    const settings: SystemSettings = { ...defaultSettings, onboardingComplete: true, playerName: data.name, screenTimeLimit: data.screenTime || 240, bossDungeonPenaltyEnabled: true };
    
    await Promise.all([
      saveProfile(profile),
      saveStats(stats),
      saveQuests(quests),
      saveAchievements(achievements),
      saveTitles(titles),
      saveDungeons(dungeons),
      saveTrainingPaths(trainingPaths),
      saveSettings(settings),
    ]);
    
    // Add history entry
    await addHistoryEntry({
      id: `hist-${Date.now()}`,
      date: now,
      action: 'Initial System Scan Complete',
      xpChange: 0,
      coinChange: 100,
      statChanges: {},
      type: 'onboarding',
      details: `Player ${data.name} initialized at Level 1`,
    });
    
    set({
      profile,
      stats,
      quests,
      achievements,
      titles,
      dungeons,
      trainingPaths,
      settings,
      currentScreen: 'dashboard',
      isInitialized: true,
    });
  },
  
  // ============================================================
  // Load All Data
  // ============================================================
  
  loadAllData: async () => {
    const [profile, stats, quests, workouts, achievements, titles, inventory, history, settings, dungeons, trainingPaths] = 
      await Promise.all([
        getProfile(),
        getStats(),
        getQuests(),
        getWorkouts(),
        getAchievements(),
        getTitles(),
        getInventory(),
        getHistory(),
        getSettings(),
        getDungeons(),
        getTrainingPaths(),
      ]);
    
    set({
      profile: profile || get().profile,
      stats: stats.length > 0 ? stats : get().stats,
      quests,
      workouts,
      achievements: achievements.length > 0 ? achievements : get().achievements,
      titles: titles.length > 0 ? titles : get().titles,
      inventory,
      history,
      settings: settings || get().settings,
      dungeons: dungeons.length > 0 ? dungeons : get().dungeons,
      trainingPaths: trainingPaths.length > 0 ? trainingPaths : get().trainingPaths,
    });
  },
  
  // ============================================================
  // Quest Actions
  // ============================================================
  
  completeQuest: async (questId: string) => {
    const state = get();
    if (!state.profile) return;
    
    const quest = state.quests.find(q => q.id === questId);
    if (!quest || quest.status !== 'active') return;
    
    quest.status = 'completed';
    quest.completedAt = new Date();
    
    // Award XP
    const reward = state.profile.xpAmplifierActive ? quest.xpReward * 2 : quest.xpReward;
    const xpResult = addXP(state.profile, reward);
    const updatedProfile = xpResult.profile;
    updatedProfile.xpAmplifierActive = false;
    updatedProfile.coins += quest.coinReward;
    
    // Update streak
    updatedProfile.streak += 1;
    if (updatedProfile.streak > updatedProfile.maxStreak) {
      updatedProfile.maxStreak = updatedProfile.streak;
    }
    
    // Check rank
    const newRank = getRankForLevel(updatedProfile.totalLevel);
    const rankChanged = newRank !== updatedProfile.currentRank;
    if (rankChanged) {
      updatedProfile.currentRank = newRank;
    }
    
    // Add history
    const historyEntry: HistoryEntry = {
      id: `hist-${Date.now()}`,
      date: new Date(),
      action: `Quest Completed: ${quest.name}`,
      xpChange: reward,
      coinChange: quest.coinReward,
      statChanges: {},
      type: 'quest_complete',
      details: quest.description,
    };
    
    await Promise.all([
      saveProfile(updatedProfile),
      saveQuests(state.quests.map(q => q.id === questId ? quest : q)),
      addHistoryEntry(historyEntry),
    ]);
    
    playQuestCompleted();
    
    set({
      profile: updatedProfile,
      quests: state.quests.map(q => q.id === questId ? quest : q),
      history: [historyEntry, ...state.history],
      showLevelUp: xpResult.leveledUp,
      showRankUp: rankChanged,
      systemMessage: `SYSTEM: ${quest.name} completed. +${reward} XP.`,
    });
    
    // Check achievements after quest complete
    await get().checkAchievements();
  },
  
  failQuest: async (questId: string) => {
    const state = get();
    const quest = state.quests.find(q => q.id === questId);
    if (!quest) return;
    
    quest.status = 'failed';
    
    // Apply penalty
    if (!state.profile) return;
    const shielded = state.profile.streakShieldActive;
    const penaltyXP = shielded ? 0 : Math.floor(quest.xpReward * 0.5);
    state.profile.totalXP = Math.max(0, state.profile.totalXP - penaltyXP);
    if (!shielded) state.profile.streak = 0;
    state.profile.streakShieldActive = false;
    
    await Promise.all([
      saveProfile(state.profile),
      saveQuests(state.quests.map(q => q.id === questId ? quest : q)),
    ]);
    
    playPenalty();
    
    set({
      profile: state.profile,
      quests: state.quests.map(q => q.id === questId ? quest : q),
      penaltyZone: true,
      systemMessage: shielded ? 'SYSTEM: Streak Shield absorbed this failure.' : `SYSTEM: Quest failed. -${penaltyXP} XP. Streak reset.`,
    });
  },
  
  generateDailyQuests: async () => {
    const dailyQuests = generateDailyQuests(get().profile || undefined);
    const sideQuests = generateSideQuests(get().profile || undefined);
    const allQuests = [...get().quests.filter(q => q.type !== 'daily'), ...dailyQuests, ...sideQuests];
    await saveQuests(allQuests);
    set({ quests: allQuests });
  },

  saveCustomQuest: async (draft) => {
    const state = get();
    const existing = draft.id ? state.quests.find(q => q.id === draft.id) : undefined;
    const quest: Quest = {
      id: existing?.id || `custom-${Date.now()}`,
      type: (draft.type || 'side') as QuestType,
      name: draft.name,
      description: draft.description,
      category: draft.category,
      status: existing?.status || 'active',
      xpReward: Number(draft.xpReward || 25),
      coinReward: Number(draft.coinReward || 10),
      createdAt: existing?.createdAt || new Date(),
      expiresAt: draft.expiresAt || existing?.expiresAt || new Date(Date.now() + 7 * 86400000),
      isCustom: true,
      trainingPath: draft.trainingPath,
    };
    await saveQuests(existing ? state.quests.map(q => q.id === quest.id ? quest : q) : [...state.quests, quest]);
    set({ quests: existing ? state.quests.map(q => q.id === quest.id ? quest : q) : [...state.quests, quest] });
  },

  deleteCustomQuest: async (questId) => {
    const state = get();
    const quest = state.quests.find(q => q.id === questId);
    if (!quest?.isCustom) return;
    const { deleteQuest } = await import('@/db');
    await deleteQuest(questId);
    set({ quests: state.quests.filter(q => q.id !== questId) });
  },
  
  // ============================================================
  // Training Actions
  // ============================================================
  
  logWorkout: async (workout: WorkoutLog) => {
    const state = get();
    if (!state.profile) return;
    
    await saveWorkout(workout);
    
    // Award XP
    const xpResult = addXP(state.profile, workout.totalXP);
    xpResult.profile.coins += Math.floor(workout.totalXP / 5);
    
    const historyEntry: HistoryEntry = {
      id: `hist-${Date.now()}`,
      date: new Date(),
      action: `Training: ${workout.pathDisplayName}`,
      xpChange: workout.totalXP,
      coinChange: Math.floor(workout.totalXP / 5),
      statChanges: {},
      type: 'workout',
      details: `${workout.exercises.length} exercises, ${workout.duration}min`,
    };
    
    await Promise.all([
      saveProfile(xpResult.profile),
      addHistoryEntry(historyEntry),
    ]);
    
    if (xpResult.leveledUp) playLevelUp();
    
    set({
      profile: xpResult.profile,
      workouts: [workout, ...state.workouts],
      history: [historyEntry, ...state.history],
      showLevelUp: xpResult.leveledUp,
      systemMessage: `SYSTEM: Training complete. +${workout.totalXP} XP.`,
    });
    
    await get().checkAchievements();
  },
  
  completeTrainingExercise: async (pathName: string, exerciseIndex: number) => {
    const state = get();
    const paths = state.trainingPaths.map(p => {
      if (p.name === pathName) {
        const updatedExercises = [...p.exercises];
        if (updatedExercises[exerciseIndex]) {
          updatedExercises[exerciseIndex] = { ...updatedExercises[exerciseIndex], completed: true };
        }
        // Unlock next exercise
        if (updatedExercises[exerciseIndex + 1]) {
          updatedExercises[exerciseIndex + 1] = { ...updatedExercises[exerciseIndex + 1], unlocked: true };
        }
        const completedCount = updatedExercises.filter(e => e.completed).length;
        const progress = Math.round((completedCount / updatedExercises.length) * 100);
        return { ...p, exercises: updatedExercises, progress, currentExerciseIndex: Math.min(exerciseIndex + 1, updatedExercises.length - 1) };
      }
      return p;
    });
    
    await saveTrainingPaths(paths);
    set({ trainingPaths: paths });
  },
  
  // ============================================================
  // Stat Actions
  // ============================================================
  
  addStatXP: async (statName: StatName, amount: number) => {
    const state = get();
    const stats = state.stats.map(s => {
      if (s.name === statName) {
        const result = addStatXP({ ...s }, amount);
        return result.stat;
      }
      return s;
    });
    
    await saveStats(stats);
    set({ stats });
  },
  
  // ============================================================
  // Dungeon Actions
  // ============================================================
  
  enterDungeon: async (_dungeonId: string) => {
    // Could track active dungeon state here
    set({ systemMessage: `SYSTEM: Entering Dungeon...` });
  },
  
  completeDungeon: async (dungeonId: string, timeMinutes: number, increaseDifficulty?: boolean) => {
    const state = get();
    if (!state.profile) return;
    
    const dungeon = state.dungeons.find(d => d.id === dungeonId);
    if (!dungeon) return;
    
    dungeon.status = 'completed';
    dungeon.completedAt = new Date();
    if (increaseDifficulty) {
      dungeon.difficultyOffset = (dungeon.difficultyOffset || 0) + 1;
    }
    dungeon.bestTime = Math.min(dungeon.bestTime || Infinity, timeMinutes);
    
    // Bonus XP for speed
    const speedBonus = Math.max(0, Math.round((dungeon.estimatedMinutes - timeMinutes) * 2));
    const totalXP = dungeon.xpReward + speedBonus;
    
    const xpResult = addXP(state.profile, totalXP);
    xpResult.profile.coins += dungeon.coinReward;
    
    if (dungeonId === 'dungeon-weekly-boss') {
      const completionSchedule = getNextScheduleOnComplete(
        SCHEDULE_CONFIGS['weekly-boss-dungeon'],
        new Date()
      );
      xpResult.profile.bossDungeonStatus = completionSchedule.status;
      xpResult.profile.lastBossDungeonDate = completionSchedule.lastOccurrence;
      xpResult.profile.nextBossDungeonDate = completionSchedule.nextOccurrence;
    }
    
    const historyEntry: HistoryEntry = {
      id: `hist-${Date.now()}`,
      date: new Date(),
      action: `Dungeon Cleared: ${dungeon.name}`,
      xpChange: totalXP,
      coinChange: dungeon.coinReward,
      statChanges: {},
      type: 'dungeon_complete',
      details: `${timeMinutes}min clear time`,
    };
    
    await Promise.all([
      saveProfile(xpResult.profile),
      saveDungeons(state.dungeons.map(d => d.id === dungeonId ? dungeon : d)),
      addHistoryEntry(historyEntry),
    ]);
    
    playAchievement();
    
    set({
      profile: xpResult.profile,
      dungeons: state.dungeons.map(d => d.id === dungeonId ? dungeon : d),
      history: [historyEntry, ...state.history],
      showLevelUp: xpResult.leveledUp,
      systemMessage: `SYSTEM: ${dungeon.name} cleared. +${totalXP} XP rewarded.`,
    });
    
    await get().checkAchievements();
  },

  summonBossDungeon: () => {
    const event: BossDungeonEvent = {
      id: `boss-${Date.now()}`,
      name: 'Rift Guardian',
      description: 'An unstable gate has opened. Clear the encounter before it collapses.',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      xpReward: 150,
      coinReward: 60,
    };
    set({ activeBossDungeon: event });
  },

  dismissBossDungeon: () => set({ activeBossDungeon: null }),
  dismissPenaltyZone: () => set({ penaltyZone: false }),

  setCombatTrainingStatus: async (status) => {
    const profile = get().profile;
    if (!profile) return;
    const nextPrompt = new Date(Date.now() + 7 * 86400000);
    const updated = { ...profile, combatTrainingStatus: status, combatPromptAfter: status === 'accepted' ? undefined : nextPrompt };
    await saveProfile(updated);
    set({ profile: updated, systemMessage: status === 'accepted' ? 'SYSTEM: Combat training unlocked. Train responsibly.' : 'SYSTEM: Combat training deferred. Your body-building plan remains active.' });
  },
  
  // ============================================================
  // Shop / Inventory
  // ============================================================
  
  purchaseItem: async (itemId: string) => {
    const state = get();
    if (!state.profile) return;
    
    const item = state.shopItems.find(i => i.id === itemId);
    if (!item || (item.type !== 'utility' && item.purchased) || state.profile.coins < item.cost) return;
    
    state.profile.coins -= item.cost;
    item.purchased = item.type !== 'utility';
    
    const existing = state.inventory.find(i => i.id === item.id);
    const inventoryItem: InventoryItem = {
      id: item.id,
      type: item.type,
      name: item.name,
      description: item.description,
      cost: item.cost,
      purchasedAt: new Date(),
      equipped: false,
      quantity: (existing?.quantity || 0) + 1,
    };
    
    await Promise.all([
      saveProfile(state.profile),
      saveInventoryItem(inventoryItem),
    ]);
    
    set({
      profile: state.profile,
      shopItems: state.shopItems.map(i => i.id === itemId ? item : i),
      inventory: existing ? state.inventory.map(i => i.id === item.id ? inventoryItem : i) : [...state.inventory, inventoryItem],
      systemMessage: `SYSTEM: ${item.name} purchased.`,
    });
  },
  
  equipItem: async (itemId: string) => {
    const inventory = get().inventory.map(i => ({
      ...i,
      equipped: i.id === itemId ? !i.equipped : false,
    }));
    await Promise.all(inventory.map(i => saveInventoryItem(i)));
    set({ inventory });
  },

  useQuestUtility: async (questId, itemId) => {
    const state = get(); const quest = state.quests.find(q => q.id === questId); const item = state.inventory.find(i => i.id === itemId);
    if (!quest || !item || (item.quantity || 1) < 1 || quest.status !== 'active') return;
    const valid = (itemId === 'day-pass' && ['daily', 'side'].includes(quest.type)) || (itemId === 'recovery-pass' && quest.category === 'recovery') || (itemId === 'focus-token' && quest.category === 'focus');
    if (!valid) return;
    const skipped = { ...quest, status: 'completed' as const, completedAt: new Date() };
    const depleted = { ...item, quantity: (item.quantity || 1) - 1 };
    const quests = state.quests.map(q => q.id === questId ? skipped : q);
    const inventory = state.inventory.map(i => i.id === itemId ? depleted : i);
    await Promise.all([saveQuests(quests), saveInventoryItem(depleted)]);
    set({ quests, inventory, systemMessage: `SYSTEM: ${item.name} used. Quest bypassed safely; no rewards granted.` });
  },

  activateUtility: async (itemId) => {
    const state = get(); const item = state.inventory.find(i => i.id === itemId); if (!item || (item.quantity || 1) < 1 || !state.profile) return;
    const depleted = { ...item, quantity: (item.quantity || 1) - 1 };
    const inventory = state.inventory.map(i => i.id === itemId ? depleted : i);
    const profile = { ...state.profile };
    if (itemId === 'streak-shield') profile.streakShieldActive = true;
    if (itemId === 'xp-amplifier') profile.xpAmplifierActive = true;
    if (itemId === 'xp-catalyst') {
      profile.xpAmplifierActive = true;
      profile.coins += 25; // Bonus coins alongside amplifier
    }
    if (itemId === 'second-wind') profile.fatigue = Math.max(0, profile.fatigue - 20);
    if (itemId === 'vitality-elixir') {
      profile.fatigue = Math.max(0, profile.fatigue - 50);
      state.dismissPenaltyZone();
    }
    if (itemId === 'temporal-accelerator') {
      // Typecast to any to allow dynamic profile parameters
      (profile as any).dungeonTimerPermanentBonusSeconds = ((profile as any).dungeonTimerPermanentBonusSeconds || 0) + 30;
    }
    await Promise.all([saveProfile(profile), saveInventoryItem(depleted)]);
    if (itemId === 'boss-beacon') await get().forceUnlockBossDungeon();
    set({ profile, inventory, dungeonTimerBonusSeconds: itemId === 'time-crystal' ? state.dungeonTimerBonusSeconds + 120 : state.dungeonTimerBonusSeconds, dungeonDifficultyReduction: itemId === 'dungeon-scout' ? state.dungeonDifficultyReduction + 1 : state.dungeonDifficultyReduction, systemMessage: `SYSTEM: ${item.name} activated.` });
  },

  consumeDungeonAids: () => set({ dungeonTimerBonusSeconds: 0, dungeonDifficultyReduction: 0 }),
  
  equipTitle: async (titleId: string) => {
    const titles = get().titles.map(t => ({
      ...t,
      equipped: t.id === titleId ? !t.equipped : false,
    }));
    await saveTitles(titles);
    set({ titles });
  },
  
  // ============================================================
  // Achievements
  // ============================================================
  
  checkAchievements: async () => {
    const state = get();
    const profile = state.profile;
    if (!profile) return;
    
    const workouts = state.workouts.length;
    const dungeons = state.dungeons.filter(d => d.status === 'completed').length;
    
    const updatedAchievements = state.achievements.map(ach => {
      if (ach.unlocked) return ach;
      
      let shouldUnlock = false;
      
      switch (ach.condition) {
        case 'first_workout':
          shouldUnlock = workouts >= 1;
          break;
        case 'streak_7':
          shouldUnlock = profile.streak >= 7;
          break;
        case 'streak_30':
          shouldUnlock = profile.streak >= 30;
          break;
        case 'dungeons_10':
          shouldUnlock = dungeons >= 10;
          break;
        case 'rank_c':
          shouldUnlock = profile.totalLevel >= 26;
          break;
        case 'rank_b':
          shouldUnlock = profile.totalLevel >= 46;
          break;
        case 'porn_free_30':
          shouldUnlock = profile.pornFreeStreak >= 30;
          break;
        case 'porn_free_90':
          shouldUnlock = profile.pornFreeStreak >= 90;
          break;
        case 'porn_free_365':
          shouldUnlock = profile.pornFreeStreak >= 365;
          break;
      }
      
      if (shouldUnlock) {
        return { ...ach, unlocked: true, unlockedAt: new Date() };
      }
      return ach;
    });
    
    const newUnlocks = updatedAchievements.filter(a => a.unlocked && !state.achievements.find(oa => oa.id === a.id)?.unlocked);
    
    if (newUnlocks.length > 0) {
      await saveAchievements(updatedAchievements);
      playAchievement();
      
      const unlockNames = newUnlocks.map(a => a.name).join(', ');
      set({
        achievements: updatedAchievements,
        showAchievement: true,
        systemMessage: `SYSTEM: Achievement Unlocked — ${unlockNames}`,
      });
    }
  },
  
  // ============================================================
  // Wellness
  // ============================================================
  
  logPornFreeDay: async (clean: boolean) => {
    const state = get();
    if (!state.profile) return;
    
    if (clean) {
      state.profile.pornFreeStreak += 1;
      if (state.profile.pornFreeStreak > state.profile.maxPornFreeStreak) {
        state.profile.maxPornFreeStreak = state.profile.pornFreeStreak;
      }
      // Award XP
      const xpResult = addXP(state.profile, 40);
      xpResult.profile.coins += 10;
      
      await saveProfile(xpResult.profile);
      set({ profile: xpResult.profile, showLevelUp: xpResult.leveledUp });
    } else {
      state.profile.pornFreeStreak = 0;
      await saveProfile(state.profile);
      set({ profile: state.profile });
    }
    
    await get().checkAchievements();
  },
  
  logScreenTime: async (minutes: number) => {
    const state = get();
    if (!state.profile) return;
    
    state.profile.todayScreenTime = minutes;
    const limit = state.settings?.screenTimeLimit || 240;
    
    if (minutes <= limit) {
      const xpResult = addXP(state.profile, 25);
      await saveProfile(xpResult.profile);
      set({ profile: xpResult.profile, showLevelUp: xpResult.leveledUp });
    }
    
    await saveProfile(state.profile);
    set({ profile: state.profile });
  },
  
  // ============================================================
  // Evaluation
  // ============================================================
  
  submitEvaluation: async (scores: Record<string, number>, passed: boolean) => {
    const state = get();
    if (!state.profile) return;
    
    const evalResult: EvaluationResult = {
      id: `eval-${Date.now()}`,
      date: new Date(),
      rank: state.profile.currentRank,
      passed,
      scores,
      nextEvalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    
    if (passed) {
      const nextRank = getNextRank(state.profile.currentRank);
      if (nextRank) {
        state.profile.currentRank = nextRank;
        playRankUp();
      }
    }
    
    state.profile.nextEvaluationDate = evalResult.nextEvalDate;
    
    await Promise.all([
      saveProfile(state.profile),
      // Save evaluation would go here
    ]);
    
    set({
      profile: state.profile,
      evaluations: [evalResult, ...state.evaluations],
      showRankUp: passed,
      systemMessage: passed 
        ? `SYSTEM: Evaluation passed. Rank promoted to ${state.profile.currentRank}.`
        : 'SYSTEM: Evaluation not passed. Continue training. Next evaluation in 30 days.',
    });
  },
  
  // ============================================================
  // Navigation
  // ============================================================
  
  navigateTo: (screen: ScreenName) => {
    const state = get();
    set({ previousScreen: state.currentScreen, currentScreen: screen });
  },
  
  goBack: () => {
    const state = get();
    if (state.previousScreen) {
      set({ currentScreen: state.previousScreen, previousScreen: null });
    }
  },
  
  // ============================================================
  // Settings
  // ============================================================
  
  updateSettings: async (newSettings: Partial<SystemSettings>) => {
    const state = get();
    const updated = { ...state.settings, ...newSettings } as SystemSettings;
    await saveSettings(updated);
    set({ settings: updated });
  },
  
  // ============================================================
  // Export / Import
  // ============================================================
  
  exportData: async () => {
    const data = await exportAllData();
    const { encryptData } = await import('@/lib/encryption');
    const encrypted = encryptData(data as Record<string, unknown>);
    
    const { downloadSystemFile } = await import('@/lib/encryption');
    downloadSystemFile(encrypted);
    
    return encrypted;
  },
  
  importData: async (data: Record<string, unknown>) => {
    await importAllData(data);
    await get().loadAllData();
    set({ systemMessage: 'SYSTEM: Data restored successfully.' });
  },
  
  resetSystem: async () => {
    await resetAllData();
    set({
      profile: null,
      stats: [],
      quests: [],
      workouts: [],
      achievements: [],
      titles: [],
      inventory: [],
      history: [],
      dungeons: [],
      trainingPaths: [],
      currentScreen: 'opening',
      isInitialized: false,
    });
  },
  
  // ============================================================
  // Notifications
  // ============================================================
  
  dismissNotification: (id: string) => {
    set({ notifications: get().notifications.filter(n => n.id !== id) });
  },
  
  addNotification: (notification: Notification) => {
    playNotification();
    set({ notifications: [notification, ...get().notifications].slice(0, 20) });
  },
  
  // ============================================================
  // SYSTEM
  // ============================================================
  
  setSystemMessage: (msg: string | null) => {
    set({ systemMessage: msg });
  },
  
  clearLevelUp: () => set({ showLevelUp: false }),
  clearRankUp: () => set({ showRankUp: false }),
  clearAchievement: () => set({ showAchievement: false }),

  checkBossDungeonSchedule: async () => {
    const state = get();
    if (!state.profile || !state.settings?.onboardingComplete) return;

    const now = new Date();
    
    // 1. If not initialized, initialize schedule
    if (!state.profile.nextBossDungeonDate) {
      const updatedProfile = {
        ...state.profile,
        nextBossDungeonDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        bossDungeonStatus: 'locked' as const,
        lastBossDungeonDate: undefined,
      };
      
      const hasBossDungeon = state.dungeons.some(d => d.id === 'dungeon-weekly-boss');
      let updatedDungeons = state.dungeons;
      if (!hasBossDungeon) {
        // Add the weekly boss dungeon if missing
        const newBoss = {
          id: 'dungeon-weekly-boss',
          name: 'Weekly Boss Dungeon',
          type: 'boss' as const,
          description: 'An elite evaluation of your physical power. Appears only on weekends.',
          difficulty: 5,
          color: '#EF4444',
          estimatedMinutes: 35,
          xpReward: 500,
          coinReward: 150,
          status: 'locked' as const,
          exercises: [
            '50 Push-ups (intensity check)',
            '3-minute Plank Hold (core test)',
            '100 Bodyweight Squats (leg endurance)',
            'Reaction Drill x10 (neuromuscular check)',
            '15-minute Shadow Boxing / Flow'
          ],
          requirements: 'Unlocks on weekends when scheduled'
        };
        updatedDungeons = [...state.dungeons, newBoss];
        await saveDungeons(updatedDungeons);
      }

      await saveProfile(updatedProfile);
      set({ profile: updatedProfile, dungeons: updatedDungeons });
      return;
    }

    // Ensure the weekly boss dungeon exists in the local state/DB
    const hasBossDungeon = state.dungeons.some(d => d.id === 'dungeon-weekly-boss');
    let currentDungeons = state.dungeons;
    if (!hasBossDungeon) {
      const newBoss = {
        id: 'dungeon-weekly-boss',
        name: 'Weekly Boss Dungeon',
        type: 'boss' as const,
        description: 'An elite evaluation of your physical power. Appears only on weekends.',
        difficulty: 5,
        color: '#EF4444',
        estimatedMinutes: 35,
        xpReward: 500,
        coinReward: 150,
        status: state.profile.bossDungeonStatus || 'locked',
        exercises: [
          '50 Push-ups (intensity check)',
          '3-minute Plank Hold (core test)',
          '100 Bodyweight Squats (leg endurance)',
          'Reaction Drill x10 (neuromuscular check)',
          '15-minute Shadow Boxing / Flow'
        ],
        requirements: 'Unlocks on weekends when scheduled'
      };
      currentDungeons = [...state.dungeons, newBoss];
      await saveDungeons(currentDungeons);
    }

    // 2. Evaluate schedule
    const currentScheduleInput = {
      lastOccurrence: state.profile.lastBossDungeonDate ? new Date(state.profile.lastBossDungeonDate) : undefined,
      nextOccurrence: new Date(state.profile.nextBossDungeonDate),
      status: state.profile.bossDungeonStatus || 'locked',
    };

    const evaluation = evaluateSchedule(
      SCHEDULE_CONFIGS['weekly-boss-dungeon'],
      currentScheduleInput,
      now
    );

    if (evaluation.didUnlock || evaluation.didExpire) {
      const updatedProfile = { ...state.profile };
      updatedProfile.bossDungeonStatus = evaluation.status;
      updatedProfile.lastBossDungeonDate = evaluation.lastOccurrence;
      updatedProfile.nextBossDungeonDate = evaluation.nextOccurrence;

      const updatedDungeons = currentDungeons.map(d => {
        if (d.id === 'dungeon-weekly-boss') {
          return { ...d, status: evaluation.status };
        }
        return d;
      });

      // Apply penalty if expired
      if (evaluation.didExpire) {
        let penaltyXP = 0;
        if (state.settings?.bossDungeonPenaltyEnabled) {
          updatedProfile.streak = 0;
          penaltyXP = Math.floor(500 * 0.5); // 50% of the 500 XP reward
          updatedProfile.totalXP = Math.max(0, updatedProfile.totalXP - penaltyXP);
          playPenalty();
          set({ penaltyZone: true });
        }
        
        await addHistoryEntry({
          id: `hist-boss-expire-${Date.now()}`,
          date: now,
          action: 'Weekly Boss Dungeon Expired',
          xpChange: -penaltyXP,
          coinChange: 0,
          statChanges: {},
          type: 'dungeon_expire',
          details: 'Evaluation window collapsed. Penalty applied.',
        });
      }

      if (evaluation.didUnlock) {
        playBossAlert();
      }

      await Promise.all([
        saveProfile(updatedProfile),
        saveDungeons(updatedDungeons),
      ]);

      set({
        profile: updatedProfile,
        dungeons: updatedDungeons,
        showCinematicBossNotification: evaluation.didUnlock ? true : state.showCinematicBossNotification,
      });
    }
  },

  forceUnlockBossDungeon: async () => {
    const state = get();
    if (!state.profile) return;

    const now = new Date();
    const updatedProfile = {
      ...state.profile,
      bossDungeonStatus: 'available' as const,
      nextBossDungeonDate: now, // the 24 hours window starts now
    };

    // Ensure weekly boss exists
    const hasBossDungeon = state.dungeons.some(d => d.id === 'dungeon-weekly-boss');
    let currentDungeons = state.dungeons;
    if (!hasBossDungeon) {
      const newBoss = {
        id: 'dungeon-weekly-boss',
        name: 'Weekly Boss Dungeon',
        type: 'boss' as const,
        description: 'An elite evaluation of your physical power. Appears only on weekends.',
        difficulty: 5,
        color: '#EF4444',
        estimatedMinutes: 35,
        xpReward: 500,
        coinReward: 150,
        status: 'available' as const,
        exercises: [
          '50 Push-ups (intensity check)',
          '3-minute Plank Hold (core test)',
          '100 Bodyweight Squats (leg endurance)',
          'Reaction Drill x10 (neuromuscular check)',
          '15-minute Shadow Boxing / Flow'
        ],
        requirements: 'Unlocks on weekends when scheduled'
      };
      currentDungeons = [...state.dungeons, newBoss];
    }

    const updatedDungeons = currentDungeons.map(d => {
      if (d.id === 'dungeon-weekly-boss') {
        return { ...d, status: 'available' as const };
      }
      return d;
    });

    await Promise.all([
      saveProfile(updatedProfile),
      saveDungeons(updatedDungeons),
    ]);

    playBossAlert();

    set({
      profile: updatedProfile,
      dungeons: updatedDungeons,
      showCinematicBossNotification: true,
    });
  },

  dismissCinematicBossNotification: () => {
    set({ showCinematicBossNotification: false });
  },
}));
