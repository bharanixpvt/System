// ============================================================
// SYSTEM — Zustand Game Store (SYSTEM v3)
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
  EvaluationResult,
  StatName,
  ScreenName,
  Notification,
  ShopItem,
  QuestCategory,
  QuestType,
  OnboardingData,
} from '@/types';
import {
  createDefaultStats,
  createDefaultAchievements,
  createDefaultTitles,
  createDefaultDungeons,
  generateDailyQuests,
  createDefaultMainQuests,
  addXP,
  addStatXP,
  getRankForLevel,
  calculateXPToNextLevel,
  getVisibleStatsForGoals,
  DEFAULT_UPSKILLS,
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
  getHistory,
  getSettings,
  saveSettings,
  getDungeons,
  saveDungeons,
  exportAllData,
  importAllData,
  resetAllData,
} from '@/db';
import { playQuestCompleted, playLevelUp, playAchievement, playPenalty, playNotification } from '@/lib/audio';
import { DEFAULT_UTILITY_ITEMS } from '@/engine/gameEngine';

const defaultSettings: SystemSettings = {
  audioEnabled: true,
  audioVolume: 0.8,
  notificationsEnabled: true,
  theme: 'monarch-dark',
  reduceMotion: false,
  screenTimeLimit: 240,
  evalReminderDays: 30,
  gymEquipmentEnabled: false,
  onboardingComplete: false,
  ruthlessModeEnabled: true,
};

interface SystemState {
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
  evaluations: EvaluationResult[];
  shopItems: ShopItem[];
  notifications: Notification[];
  
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
  dungeonTimerBonusSeconds: number;
  dungeonDifficultyReduction: number;
  
  initialize: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  loadAllData: () => Promise<void>;
  
  // Quest Actions
  completeQuest: (questId: string) => Promise<void>;
  undoCompleteQuest: (questId: string) => Promise<void>;
  failQuest: (questId: string) => Promise<void>;
  generateDailyQuests: () => Promise<void>;
  saveCustomQuest: (quest: Partial<Quest> & { name: string; description: string; category: QuestCategory }) => Promise<void>;
  deleteCustomQuest: (questId: string) => Promise<void>;
  deleteSystemQuest: (questId: string) => Promise<void>;
  reduceQuestXP: (questId: string, newXP: number) => Promise<void>;
  
  // Level & Progression
  voluntarilyReduceLevel: (targetLevel: number) => Promise<void>;
  purchaseUpskill: (upskillId: string) => Promise<void>;
  
  // Workout
  logWorkout: (workout: WorkoutLog) => Promise<void>;
  
  // Stat Actions
  addStatXP: (statName: StatName, amount: number) => Promise<void>;
  
  // Dungeon Actions
  enterDungeon: (dungeonId: string) => Promise<void>;
  completeDungeon: (dungeonId: string, timeMinutes: number, increaseDifficulty?: boolean) => Promise<void>;
  dismissPenaltyZone: () => void;
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
  
  // Settings & System
  updateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  updateProfile: (profile: Pick<PlayerProfile, 'name' | 'height' | 'weight' | 'bodyFat'> & { age?: number; dateOfBirth?: string }) => Promise<void>;
  toggleSystemPause: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (data: Record<string, unknown>) => Promise<void>;
  resetSystem: () => Promise<void>;
  dismissNotification: (id: string) => void;
  addNotification: (notification: Notification) => void;
  setSystemMessage: (msg: string | null) => void;
  clearLevelUp: () => void;
  clearRankUp: () => void;
  clearAchievement: () => void;
}

export const useGameStore = create<SystemState>((set, get) => ({
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
  evaluations: [],
  shopItems: DEFAULT_UTILITY_ITEMS,
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
  dungeonTimerBonusSeconds: 0,
  dungeonDifficultyReduction: 0,
  
  initialize: async () => {
    set({ isLoading: true });
    try {
      const profile = await getProfile();
      const settings = await getSettings();
      
      if (!profile || !settings?.onboardingComplete) {
        set({ isLoading: false, currentScreen: 'opening' });
        return;
      }
      
      const [stats, quests, workouts, achievements, titles, inventory, history, dungeons] = 
        await Promise.all([
          getStats(),
          getQuests(),
          getWorkouts(),
          getAchievements(),
          getTitles(),
          getInventory(),
          getHistory(),
          getDungeons(),
        ]);
      
      if (!settings?.systemPaused) {
        const streakCheck = checkStreak(profile.lastLoginDate);
        if (streakCheck.reset) {
          profile.streak = 0;
          await saveProfile(profile);
        }
        profile.lastLoginDate = new Date();
        await saveProfile(profile);
      }
      
      let updatedQuests = quests;
      if (quests.length === 0) {
        updatedQuests = [...generateDailyQuests(profile), ...createDefaultMainQuests()];
        await saveQuests(updatedQuests);
      }
      
      const loadedStats = stats.length > 0 ? stats : createDefaultStats(profile.unlockedStats || ['strength', 'recovery', 'discipline', 'focus']);
      
      set({
        profile,
        stats: loadedStats,
        quests: updatedQuests,
        workouts,
        achievements: achievements.length > 0 ? achievements : createDefaultAchievements(),
        titles: titles.length > 0 ? titles : createDefaultTitles(),
        inventory,
        history,
        settings: settings || defaultSettings,
        dungeons: dungeons.length > 0 ? dungeons : createDefaultDungeons(),
        currentScreen: 'dashboard',
        isInitialized: true,
        isLoading: false,
      });
    } catch (e) {
      console.error('Failed to initialize game store', e);
      set({ isLoading: false, currentScreen: 'opening' });
    }
  },
  
  completeOnboarding: async (data: OnboardingData) => {
    const now = new Date();
    const nextEval = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const initialUnlockedStats = getVisibleStatsForGoals(data.goals, []);

    const profile: PlayerProfile = {
      id: 'player',
      name: data.preferredName,
      age: data.age,
      dateOfBirth: data.dateOfBirth,
      gender: 'Male',
      weight: 70,
      height: 175,
      bodyFat: 18,
      fitnessLevel: data.fitnessLevel === 'Advanced' ? 8 : data.fitnessLevel === 'Intermediate' ? 5 : 2,
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
      screenTimeLimit: 240,
      todayScreenTime: 0,
      goals: data.goals,
      availableTimeMinutes: data.availableTimeMinutes,
      lifeSituation: data.lifeSituation,
      equipment: data.equipment,
      fitnessExperience: data.fitnessLevel,
      limitations: data.limitations,
      schedule: data.schedule,
      country: data.country,
      language: data.language,
      timezone: data.timezone,
      unlockedStats: initialUnlockedStats,
      unlockedUpskills: [],
    };

    const stats = createDefaultStats(initialUnlockedStats);
    const quests = [...generateDailyQuests(profile), ...createDefaultMainQuests()];
    const achievements = createDefaultAchievements();
    const titles = createDefaultTitles();
    const dungeons = createDefaultDungeons();
    const settings: SystemSettings = { ...defaultSettings, onboardingComplete: true, playerName: data.preferredName };

    await Promise.all([
      saveProfile(profile),
      saveStats(stats),
      saveQuests(quests),
      saveAchievements(achievements),
      saveTitles(titles),
      saveDungeons(dungeons),
      saveSettings(settings),
    ]);

    set({
      profile,
      stats,
      quests,
      achievements,
      titles,
      dungeons,
      settings,
      currentScreen: 'dashboard',
      isInitialized: true,
      systemMessage: `SYSTEM SYNCHRONIZATION COMPLETE. Welcome, Player ${data.preferredName}.`,
    });
  },
  
  loadAllData: async () => {
    await get().initialize();
  },
  
  completeQuest: async (questId: string) => {
    const state = get();
    const quest = state.quests.find(q => q.id === questId);
    if (!quest || quest.status === 'completed' || !state.profile) return;
    
    quest.status = 'completed';
    quest.completedAt = new Date();
    
    const xpResult = addXP(state.profile, quest.xpReward);
    xpResult.profile.coins += quest.coinReward;
    
    const updatedQuests = state.quests.map(q => q.id === questId ? quest : q);
    await Promise.all([
      saveProfile(xpResult.profile),
      saveQuests(updatedQuests),
    ]);
    
    playQuestCompleted();
    if (xpResult.leveledUp) playLevelUp();

    set({
      profile: xpResult.profile,
      quests: updatedQuests,
      showLevelUp: xpResult.leveledUp,
      systemMessage: `SYSTEM: Quest "${quest.name}" completed. +${quest.xpReward} XP, +${quest.coinReward} Coins.`,
    });
    
    await get().checkAchievements();
  },
  
  undoCompleteQuest: async (questId: string) => {
    const state = get();
    const quest = state.quests.find(q => q.id === questId);
    if (!quest || quest.status !== 'completed' || !state.profile) return;
    
    quest.status = 'active';
    delete quest.completedAt;
    state.profile.totalXP = Math.max(0, state.profile.totalXP - quest.xpReward);
    state.profile.coins = Math.max(0, state.profile.coins - quest.coinReward);
    
    await Promise.all([
      saveProfile(state.profile),
      saveQuests(state.quests.map(q => q.id === questId ? quest : q)),
    ]);
    
    set({
      profile: state.profile,
      quests: state.quests.map(q => q.id === questId ? quest : q),
      systemMessage: `SYSTEM: Reverted "${quest.name}".`,
    });
  },
  
  failQuest: async (questId: string) => {
    const state = get();
    const quest = state.quests.find(q => q.id === questId);
    if (!quest || !state.profile) return;
    quest.status = 'failed';
    await saveQuests(state.quests.map(q => q.id === questId ? quest : q));
    playPenalty();
    set({
      quests: state.quests.map(q => q.id === questId ? quest : q),
      penaltyZone: true,
      systemMessage: `SYSTEM: Quest failed. Discipline penalty applied.`,
    });
  },

  deleteSystemQuest: async (questId: string) => {
    const state = get();
    if (!state.profile) return;
    const quest = state.quests.find(q => q.id === questId);
    if (!quest) return;
    if (state.profile.coins < 50) {
      set({ showSystemNotification: 'SYSTEM: Insufficient coins. Deleting a SYSTEM quest costs 50 Coins.' });
      return;
    }
    state.profile.coins -= 50;
    const updatedQuests = state.quests.filter(q => q.id !== questId);
    await Promise.all([
      saveProfile(state.profile),
      saveQuests(updatedQuests),
    ]);
    set({
      profile: state.profile,
      quests: updatedQuests,
      systemMessage: `SYSTEM: Quest permanently removed. 50 Coins deducted.`,
    });
  },

  reduceQuestXP: async (questId: string, newXP: number) => {
    const state = get();
    const quest = state.quests.find(q => q.id === questId);
    if (!quest || !quest.canReduceXP) return;
    const clamped = Math.max(1, Math.min(quest.xpReward, newXP));
    quest.xpReward = clamped;
    const updated = state.quests.map(q => q.id === questId ? quest : q);
    await saveQuests(updated);
    set({ quests: updated, systemMessage: `SYSTEM: Quest XP reduced to ${clamped} XP.` });
  },

  voluntarilyReduceLevel: async (targetLevel: number) => {
    const state = get();
    if (!state.profile || targetLevel >= state.profile.totalLevel || targetLevel < 1) return;
    state.profile.totalLevel = targetLevel;
    state.profile.totalXP = Math.round(100 * Math.pow(targetLevel, 1.08));
    state.profile.xpToNextLevel = calculateXPToNextLevel(targetLevel);
    state.profile.currentRank = getRankForLevel(targetLevel);
    await saveProfile(state.profile);
    set({
      profile: state.profile,
      systemMessage: `SYSTEM: Level voluntarily reduced to Lv. ${targetLevel}. Replay progression activated.`,
    });
  },

  purchaseUpskill: async (upskillId: string) => {
    const state = get();
    if (!state.profile) return;
    const upskill = DEFAULT_UPSKILLS.find(u => u.id === upskillId);
    if (!upskill) return;
    if (state.profile.coins < upskill.cost) {
      set({ showSystemNotification: 'SYSTEM: Insufficient coins for Upskill synchronization.' });
      return;
    }
    if (state.profile.unlockedUpskills?.includes(upskillId)) return;

    state.profile.coins -= upskill.cost;
    state.profile.unlockedUpskills = [...(state.profile.unlockedUpskills || []), upskillId];

    upskill.unlocksStats.forEach(st => {
      if (!state.profile!.unlockedStats.includes(st)) {
        state.profile!.unlockedStats.push(st);
      }
    });

    const updatedStats = state.stats.map(s => ({
      ...s,
      unlocked: state.profile!.unlockedStats.includes(s.name),
    }));

    const newQuests = generateDailyQuests(state.profile);
    const updatedQuests = [...state.quests.filter(q => q.type !== 'daily' && q.type !== 'hidden'), ...newQuests];

    await Promise.all([
      saveProfile(state.profile),
      saveStats(updatedStats),
      saveQuests(updatedQuests),
    ]);

    playAchievement();

    set({
      profile: state.profile,
      stats: updatedStats,
      quests: updatedQuests,
      systemMessage: `SYSTEM: Upskill ${upskill.name} synchronized! New capabilities unlocked.`,
    });
  },

  generateDailyQuests: async () => {
    const dailyQuests = generateDailyQuests(get().profile);
    const allQuests = [...get().quests.filter(q => q.type !== 'daily'), ...dailyQuests];
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
    };
    await saveQuests(existing ? state.quests.map(q => q.id === quest.id ? quest : q) : [...state.quests, quest]);
    set({ quests: existing ? state.quests.map(q => q.id === quest.id ? quest : q) : [...state.quests, quest] });
  },

  deleteCustomQuest: async (questId) => {
    const state = get();
    const updated = state.quests.filter(q => q.id !== questId);
    await saveQuests(updated);
    set({ quests: updated });
  },

  logWorkout: async (workout: WorkoutLog) => {
    const state = get();
    if (!state.profile) return;
    await saveWorkout(workout);
    const xpResult = addXP(state.profile, workout.totalXP);
    xpResult.profile.coins += Math.floor(workout.totalXP / 5);
    await saveProfile(xpResult.profile);
    set({ profile: xpResult.profile, workouts: [workout, ...state.workouts] });
  },

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

  enterDungeon: async (_dungeonId: string) => {
    set({ previousScreen: get().currentScreen, currentScreen: 'dungeon' });
  },

  completeDungeon: async (dungeonId: string, _timeMinutes: number) => {
    const state = get();
    const dungeon = state.dungeons.find(d => d.id === dungeonId);
    if (!dungeon || !state.profile) return;
    const xpResult = addXP(state.profile, dungeon.xpReward);
    xpResult.profile.coins += dungeon.coinReward;
    await saveProfile(xpResult.profile);
    set({ profile: xpResult.profile, currentScreen: 'dashboard' });
  },

  dismissPenaltyZone: () => set({ penaltyZone: false }),
  setCombatTrainingStatus: async () => {},
  useQuestUtility: async () => {},
  activateUtility: async () => {},
  consumeDungeonAids: () => {},
  purchaseItem: async (itemId: string) => {
    const state = get();
    if (!state.profile) return;
    const item = DEFAULT_UTILITY_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    if (state.profile.coins < item.cost) {
      set({ showSystemNotification: 'SYSTEM: Insufficient coins for Utility activation.' });
      return;
    }

    state.profile.coins -= item.cost;
    
    if (item.effect === 'penalty_erase') {
      set({ penaltyZone: false });
    } else if (item.effect === 'fatigue_reduce') {
      state.profile.fatigue = Math.max(0, (state.profile.fatigue || 0) - 30);
    } else if (item.effect === 'title_unlock') {
      const newTitle: Title = {
        id: `title-apex-${Date.now()}`,
        name: 'Apex Operator',
        description: 'Synchronized via SYSTEM Utility Repository',
        unlocked: true,
        equipped: false,
        unlockedAt: new Date(),
        bonus: '+5% XP from all quests',
        tier: 'legendary',
        condition: 'Purchased from SYSTEM Repository',
      };
      await saveTitles([...state.titles, newTitle]);
      set({ titles: [...state.titles, newTitle] });
    }

    await saveProfile(state.profile);
    playAchievement();

    set({
      profile: { ...state.profile },
      systemMessage: `SYSTEM: Utility ${item.name} activated!`,
    });
  },
  equipItem: async () => {},
  equipTitle: async () => {},
  checkAchievements: async () => {},
  logPornFreeDay: async () => {},
  logScreenTime: async () => {},
  submitEvaluation: async () => {},

  navigateTo: (screen: ScreenName) => set({ previousScreen: get().currentScreen, currentScreen: screen }),
  goBack: () => {
    const prev = get().previousScreen;
    if (prev) set({ currentScreen: prev, previousScreen: null });
  },

  updateSettings: async (newSettings) => {
    const updated = { ...get().settings, ...newSettings } as SystemSettings;
    await saveSettings(updated);
    set({ settings: updated });
  },

  updateProfile: async (changes) => {
    if (!get().profile) return;
    const updated = { ...get().profile!, ...changes };
    await saveProfile(updated);
    set({ profile: updated, systemMessage: 'SYSTEM: Profile updated.' });
  },

  toggleSystemPause: async () => {
    const s = get().settings;
    if (!s) return;
    const updated = { ...s, systemPaused: !s.systemPaused };
    await saveSettings(updated);
    set({ settings: updated });
  },

  exportData: async () => {
    const data = await exportAllData();
    return JSON.stringify(data);
  },

  importData: async (data) => {
    await importAllData(data);
    await get().loadAllData();
  },

  resetSystem: async () => {
    await resetAllData();
    set({ profile: null, stats: [], quests: [], workouts: [], achievements: [], titles: [], dungeons: [], currentScreen: 'opening', isInitialized: false });
  },

  dismissNotification: (id) => set({ notifications: get().notifications.filter(n => n.id !== id) }),
  addNotification: (n) => {
    playNotification();
    set({ notifications: [n, ...get().notifications].slice(0, 20) });
  },

  setSystemMessage: (msg) => set({ systemMessage: msg }),
  clearLevelUp: () => set({ showLevelUp: false }),
  clearRankUp: () => set({ showRankUp: false }),
  clearAchievement: () => set({ showAchievement: false }),
}));
