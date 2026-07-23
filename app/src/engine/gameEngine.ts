// ============================================================
// SYSTEM — Game Engine (SYSTEM v3)
// Dynamic Quest Engine, Stat Progressive Disclosure, Upskills
// ============================================================

import type {
  Rank,
  StatName,
  PlayerProfile,
  PlayerStat,
  Quest,
  Achievement,
  Title,
  Upskill,
  QuestCategory,
} from '@/types';
import { RANK_ORDER, RANK_LEVEL_RANGES, STAT_CONFIG } from '@/types';

// ============================================================
// XP & Leveling Engine
// ============================================================

export function calculateXPToNextLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.08) + 50);
}

export function calculateLevelFromTotalXP(totalXP: number): { level: number; currentXP: number; xpToNext: number } {
  let level = 1;
  let remainingXP = totalXP;
  
  while (remainingXP >= calculateXPToNextLevel(level)) {
    remainingXP -= calculateXPToNextLevel(level);
    level++;
  }
  
  return {
    level,
    currentXP: remainingXP,
    xpToNext: calculateXPToNextLevel(level),
  };
}

export function addXP(profile: PlayerProfile, amount: number): { 
  profile: PlayerProfile; 
  leveledUp: boolean; 
  newLevel?: number; 
  oldLevel: number;
  rewards: string[];
} {
  const oldLevel = profile.totalLevel;
  profile.totalXP += amount;
  
  const { level, xpToNext } = calculateLevelFromTotalXP(profile.totalXP);
  profile.totalLevel = level;
  profile.xpToNextLevel = xpToNext;
  
  const leveledUp = level > oldLevel;
  const rewards: string[] = [];
  
  if (leveledUp) {
    const levelsGained = level - oldLevel;
    profile.attributePoints += levelsGained * 2;
    profile.skillPoints += levelsGained;
    rewards.push(`+${levelsGained * 2} Attribute Points`);
    rewards.push(`+${levelsGained} Skill Point`);
    
    // System evolution: Check if new stats unlock with higher levels
    const autoUnlockedStats = checkLevelStatUnlocks(profile.totalLevel);
    autoUnlockedStats.forEach((st) => {
      if (!profile.unlockedStats.includes(st)) {
        profile.unlockedStats.push(st);
        rewards.push(`Unlocked Attribute: ${STAT_CONFIG[st]?.displayName || st}`);
      }
    });
  }
  
  return { profile, leveledUp, newLevel: leveledUp ? level : undefined, oldLevel, rewards };
}

// ============================================================
// Rank System
// ============================================================

export function getRankForLevel(level: number): Rank {
  const ranks = Object.entries(RANK_LEVEL_RANGES);
  for (const [rank, range] of ranks) {
    if (level >= range.min && level <= range.max) {
      return rank as Rank;
    }
  }
  return 'Shadow Monarch';
}

export function getNextRank(currentRank: Rank): Rank | null {
  const idx = RANK_ORDER.indexOf(currentRank);
  if (idx < RANK_ORDER.length - 1) {
    return RANK_ORDER[idx + 1];
  }
  return null;
}

export function getRankProgress(level: number, rank: Rank): number {
  const range = RANK_LEVEL_RANGES[rank];
  if (!range) return 100;
  const progress = ((level - range.min) / (range.max - range.min)) * 100;
  return Math.min(100, Math.max(0, progress));
}

export function isEligibleForEvaluation(profile: PlayerProfile): boolean {
  if (!profile.nextEvaluationDate) return true;
  return new Date() >= new Date(profile.nextEvaluationDate);
}

// ============================================================
// Progressive Disclosure & Goal-to-Stat Mapper
// ============================================================

export function getVisibleStatsForGoals(goals: string[] = [], unlockedUpskills: string[] = []): StatName[] {
  const baseStats: Set<StatName> = new Set(['strength', 'recovery', 'discipline']);

  goals.forEach((goal) => {
    const g = goal.toLowerCase();
    if (g.includes('strong') || g.includes('muscle')) {
      baseStats.add('strength');
    }
    if (g.includes('health') || g.includes('sleep')) {
      baseStats.add('recovery');
    }
    if (g.includes('porn') || g.includes('screen') || g.includes('discipline')) {
      baseStats.add('discipline');
    }
    if (g.includes('focus') || g.includes('confident')) {
      baseStats.add('focus');
    }
    if (g.includes('fast') || g.includes('agility')) {
      baseStats.add('agility');
    }
    if (g.includes('defense') || g.includes('self defense')) {
      baseStats.add('combat');
    }
    if (g.includes('balance')) {
      baseStats.add('balance');
    }
  });

  // Upskill unlocks
  if (unlockedUpskills.includes('reaction-analysis')) baseStats.add('reaction');
  if (unlockedUpskills.includes('advanced-self-defense')) baseStats.add('combat');
  if (unlockedUpskills.includes('movement-mastery')) {
    baseStats.add('balance');
    baseStats.add('coordination');
    baseStats.add('mobility');
  }
  if (unlockedUpskills.includes('focus-protocol')) baseStats.add('mentalFortitude');
  if (unlockedUpskills.includes('nutrition-analysis')) baseStats.add('recovery');

  return Array.from(baseStats);
}

export function checkLevelStatUnlocks(level: number): StatName[] {
  const unlocks: StatName[] = [];
  if (level >= 5) unlocks.push('mobility');
  if (level >= 10) unlocks.push('awareness');
  if (level >= 15) unlocks.push('technique');
  if (level >= 20) unlocks.push('mentalFortitude');
  if (level >= 30) unlocks.push('potential');
  if (level >= 50) unlocks.push('systemAffinity');
  return unlocks;
}

export function createDefaultStats(unlockedStats: StatName[] = ['strength', 'recovery', 'discipline', 'focus']): PlayerStat[] {
  return (Object.keys(STAT_CONFIG) as StatName[]).map((name) => ({
    name,
    ...STAT_CONFIG[name],
    level: 1,
    xp: 0,
    xpToNext: calculateXPToNextLevel(1),
    rank: 'E Rank' as Rank,
    unlocked: unlockedStats.includes(name),
  }));
}

export function addStatXP(stat: PlayerStat, amount: number): { stat: PlayerStat; leveledUp: boolean } {
  stat.xp += amount;
  
  while (stat.xp >= stat.xpToNext && stat.level < 100) {
    stat.xp -= stat.xpToNext;
    stat.level++;
    stat.xpToNext = calculateXPToNextLevel(stat.level);
    stat.rank = getRankForLevel(stat.level);
  }
  
  return { stat, leveledUp: false };
}

// ============================================================
// Upskills System
// ============================================================

export const DEFAULT_UPSKILLS: Upskill[] = [
  {
    id: 'reaction-analysis',
    name: 'Reaction Analysis',
    description: 'Unlocks neural speed evaluation, reaction stats, and high-frequency reflex missions.',
    cost: 200,
    icon: 'Gauge',
    unlocksStats: ['reaction'],
    unlocksQuestsDescription: 'Unlocks Reaction Speed Missions & Fast-twitch Drills',
    unlocked: false,
  },
  {
    id: 'advanced-self-defense',
    name: 'Advanced Self-Defense',
    description: 'Unlocks tactical movement, guard positioning, and combat stats.',
    cost: 250,
    icon: 'Shield',
    unlocksStats: ['combat'],
    unlocksQuestsDescription: 'Unlocks Combat Awareness & Defensive Footwork Missions',
    unlocked: false,
  },
  {
    id: 'movement-mastery',
    name: 'Movement Mastery',
    description: 'Unlocks proprioceptive kinetic balance, coordination stats, and balance trials.',
    cost: 220,
    icon: 'Scale',
    unlocksStats: ['balance', 'coordination', 'mobility'],
    unlocksQuestsDescription: 'Unlocks Balance & Dynamic Coordination Quests',
    unlocked: false,
  },
  {
    id: 'nutrition-analysis',
    name: 'Nutrition & Recovery Protocol',
    description: 'Unlocks metabolic recovery suggestions, hydration logging, and dietary rituals.',
    cost: 180,
    icon: 'BatteryCharging',
    unlocksStats: ['recovery'],
    unlocksQuestsDescription: 'Unlocks Hydration Protocols & Recovery Missions',
    unlocked: false,
  },
  {
    id: 'focus-protocol',
    name: 'Focus Protocol',
    description: 'Unlocks mental fortitude analytics, deep work missions, and digital detox challenges.',
    cost: 200,
    icon: 'Target',
    unlocksStats: ['mentalFortitude'],
    unlocksQuestsDescription: 'Unlocks Deep Concentration & Digital Detox Quests',
    unlocked: false,
  },
];

// ============================================================
// DYNAMIC QUEST GENERATOR ENGINE
// ============================================================

export function generateDailyQuests(profile?: PlayerProfile | null): Quest[] {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const availableTime = profile?.availableTimeMinutes || 30;
  const goals = profile?.goals || ['Get Stronger', 'Improve Health'];
  const equipment = profile?.equipment || ['Bodyweight Only'];
  const upskills = profile?.unlockedUpskills || [];

  const quests: Quest[] = [];

  // Core Goal Driven Quests
  if (goals.some(g => g.toLowerCase().includes('strong') || g.toLowerCase().includes('muscle'))) {
    if (equipment.includes('Resistance Band')) {
      quests.push({
        id: `sys-quest-band-pushups-${Date.now()}`,
        type: 'daily',
        name: 'Resistance Push-Up Protocol',
        description: '3 sets of Band-Resisted Push-ups (8-12 reps). Maintain strict control.',
        status: 'active',
        xpReward: 40,
        coinReward: 15,
        createdAt: now,
        expiresAt,
        category: 'strength',
        requirement: '3 Sets Push-ups',
        isGenerated: true,
        isSystemQuest: true,
        canReduceXP: true,
        estimatedMinutes: Math.min(15, availableTime),
      });
    } else {
      quests.push({
        id: `sys-quest-pushups-${Date.now()}`,
        type: 'daily',
        name: 'Daily Strength Mission',
        description: 'Complete 3 sets of bodyweight push-ups to failure with 60s rest.',
        status: 'active',
        xpReward: 35,
        coinReward: 12,
        createdAt: now,
        expiresAt,
        category: 'strength',
        requirement: 'Bodyweight Push-ups',
        isGenerated: true,
        isSystemQuest: true,
        canReduceXP: true,
        estimatedMinutes: Math.min(10, availableTime),
      });
    }
  }

  // Health / Recovery Quest
  quests.push({
    id: `sys-quest-hydration-${Date.now()}`,
    type: 'daily',
    name: 'Hydration & Vitality Protocol',
    description: 'Drink at least 3 Liters of water today to flush metabolic waste.',
    status: 'active',
    xpReward: 20,
    coinReward: 8,
    createdAt: now,
    expiresAt,
    category: 'recovery',
    requirement: '3L Water',
    isGenerated: true,
    isSystemQuest: true,
    canReduceXP: true,
    estimatedMinutes: 5,
  });

  // Digital Discipline
  if (goals.some(g => g.toLowerCase().includes('porn') || g.toLowerCase().includes('screen') || g.toLowerCase().includes('discipline'))) {
    quests.push({
      id: `sys-quest-porn-free-${Date.now()}`,
      type: 'daily',
      name: 'Digital Discipline Mission',
      description: 'Zero exposure to explicit content or mind-numbing infinite scrolls.',
      status: 'active',
      xpReward: 50,
      coinReward: 20,
      createdAt: now,
      expiresAt,
      category: 'discipline',
      requirement: 'Porn-Free & Screen Boundary',
      isGenerated: true,
      isSystemQuest: true,
      canReduceXP: true,
      estimatedMinutes: 5,
    });
  }

  // Time budget scaling
  if (availableTime >= 45) {
    quests.push({
      id: `sys-quest-mobility-${Date.now()}`,
      type: 'daily',
      name: 'Kinetic Mobility Ritual',
      description: '10 minutes of hip openers, shoulder dislocates, and spinal flow.',
      status: 'active',
      xpReward: 30,
      coinReward: 10,
      createdAt: now,
      expiresAt,
      category: 'mobility',
      requirement: '10m Mobility Flow',
      isGenerated: true,
      isSystemQuest: true,
      canReduceXP: true,
      estimatedMinutes: 10,
    });
  }

  if (availableTime >= 60) {
    quests.push({
      id: `sys-quest-core-${Date.now()}`,
      type: 'daily',
      name: 'Core Fortress Hold',
      description: 'Accumulate 3 total minutes in a solid forearm plank.',
      status: 'active',
      xpReward: 35,
      coinReward: 15,
      createdAt: now,
      expiresAt,
      category: 'endurance',
      requirement: '3m Plank Accumulation',
      isGenerated: true,
      isSystemQuest: true,
      canReduceXP: true,
      estimatedMinutes: 10,
    });
  }

  // Upskill Hidden Quests
  if (upskills.includes('reaction-analysis')) {
    quests.push({
      id: `sys-quest-reaction-${Date.now()}`,
      type: 'hidden',
      name: 'Hidden Reflex Drill',
      description: 'Execute 5 minutes of fast light-reaction catch drills.',
      status: 'active',
      xpReward: 60,
      coinReward: 25,
      createdAt: now,
      expiresAt,
      category: 'reaction',
      requirement: 'Sub-300ms Reflexes',
      isGenerated: true,
      isSystemQuest: true,
      canReduceXP: true,
      upskillRequired: 'reaction-analysis',
      estimatedMinutes: 5,
    });
  }

  if (upskills.includes('movement-mastery')) {
    quests.push({
      id: `sys-quest-balance-${Date.now()}`,
      type: 'hidden',
      name: 'Secret Balance Trial',
      description: 'Single-leg eyes-closed balance hold (45s per leg).',
      status: 'active',
      xpReward: 55,
      coinReward: 22,
      createdAt: now,
      expiresAt,
      category: 'balance',
      requirement: 'Single-leg Hold',
      isGenerated: true,
      isSystemQuest: true,
      canReduceXP: true,
      upskillRequired: 'movement-mastery',
      estimatedMinutes: 5,
    });
  }

  return quests;
}

export function createDefaultAchievements(): Achievement[] {
  return [
    { id: 'ach-first-blood', name: 'First Blood', description: 'Complete your first SYSTEM quest', tier: 'bronze', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'first_workout' },
    { id: 'ach-streak-master', name: 'Streak Master', description: 'Maintain a 7-day streak', tier: 'bronze', unlocked: false, hidden: false, progress: 0, maxProgress: 7, condition: 'streak_7' },
    { id: 'ach-iron-will', name: 'Iron Will', description: 'Maintain a 30-day streak', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 30, condition: 'streak_30' },
    { id: 'ach-monarch-discipline', name: 'Monarch Discipline', description: 'Maintain a 90-day streak', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 90, condition: 'streak_90' },
    { id: 'ach-dungeon-cleared', name: 'Dungeon Master', description: 'Clear 10 Dungeons', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 10, condition: 'dungeons_10' },
    { id: 'ach-c-rank', name: 'Rising Hunter', description: 'Reach C Rank', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'rank_c' },
    { id: 'ach-shadow-walker', name: 'Shadow Walker', description: '30 days porn-free', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 30, condition: 'porn_free_30' },
    { id: 'ach-the-unbreakable', name: 'The Unbreakable', description: '90 days porn-free', tier: 'platinum', unlocked: false, hidden: false, progress: 0, maxProgress: 90, condition: 'porn_free_90' },
    { id: 'ach-hunter', name: 'Hunter', description: 'Reach B Rank', tier: 'platinum', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'rank_b' },
    { id: 'ach-monarch', name: 'Monarch', description: 'Reach Monarch Level', tier: 'mythic', unlocked: false, hidden: true, progress: 0, maxProgress: 1, condition: 'rank_monarch' },
    { id: 'ach-shadow-monarch', name: 'Shadow Monarch', description: 'Reach the pinnacle — Shadow Monarch', tier: 'mythic', unlocked: false, hidden: true, progress: 0, maxProgress: 1, condition: 'rank_shadow_monarch' },
  ];
}

export function createDefaultTitles(): Title[] {
  return [
    { id: 'title-beginner', name: 'The Beginner', description: 'Starting title given to all Players', equipped: true, unlocked: true, bonus: 'None', tier: 'bronze', condition: 'initial_scan' },
    { id: 'title-disciplined', name: 'Disciplined', description: 'Maintained a 7-day streak', equipped: false, unlocked: false, bonus: '+5% Discipline XP', tier: 'bronze', condition: 'streak_7' },
    { id: 'title-iron-arms', name: 'Iron Arms', description: 'Completed 50 push-ups', equipped: false, unlocked: false, bonus: '+5% Strength XP', tier: 'silver', condition: 'pushups_50' },
    { id: 'title-swift', name: 'Swift Runner', description: 'Sub-300ms reaction time', equipped: false, unlocked: false, bonus: '+5% Agility XP', tier: 'silver', condition: 'reaction_300' },
    { id: 'title-steel-core', name: 'Steel Core', description: '3-minute plank holder', equipped: false, unlocked: false, bonus: '+5% Endurance XP', tier: 'silver', condition: 'plank_180' },
    { id: 'title-dungeon-conqueror', name: 'Dungeon Conqueror', description: 'Cleared 10 Dungeons', equipped: false, unlocked: false, bonus: '+10% Dungeon XP', tier: 'gold', condition: 'dungeons_10' },
    { id: 'title-elite', name: 'Elite Athlete', description: 'Reached C Rank', equipped: false, unlocked: false, bonus: '+10% All XP', tier: 'gold', condition: 'rank_c' },
    { id: 'title-hunter', name: 'Hunter', description: 'Reached B Rank', equipped: false, unlocked: false, bonus: '+15% All XP', tier: 'platinum', condition: 'rank_b' },
    { id: 'title-shadow-monarch', name: 'Shadow Monarch', description: 'Reached the pinnacle', equipped: false, unlocked: false, bonus: '+25% All XP', tier: 'mythic', condition: 'rank_shadow_monarch' },
  ];
}

export function checkAchievementUnlock(
  achievement: Achievement,
  profile: PlayerProfile,
  _stats: PlayerStat[],
  workouts: number,
  dungeons: number
): boolean {
  if (achievement.unlocked) return false;
  
  const condition = achievement.condition;
  
  if (condition === 'first_workout' && workouts >= 1) return true;
  if (condition === 'streak_7' && profile.streak >= 7) return true;
  if (condition === 'streak_30' && profile.streak >= 30) return true;
  if (condition === 'streak_90' && profile.streak >= 90) return true;
  if (condition === 'dungeons_10' && dungeons >= 10) return true;
  if (condition === 'rank_c' && RANK_ORDER.indexOf(profile.currentRank) >= RANK_ORDER.indexOf('C Rank')) return true;
  if (condition === 'rank_b' && RANK_ORDER.indexOf(profile.currentRank) >= RANK_ORDER.indexOf('B Rank')) return true;
  if (condition === 'rank_monarch' && profile.currentRank === 'Monarch Level') return true;
  if (condition === 'rank_shadow_monarch' && profile.currentRank === 'Shadow Monarch') return true;
  if (condition === 'porn_free_30' && profile.pornFreeStreak >= 30) return true;
  if (condition === 'porn_free_90' && profile.pornFreeStreak >= 90) return true;
  if (condition === 'porn_free_365' && profile.pornFreeStreak >= 365) return true;
  
  return false;
}

// ============================================================
// Dungeon Engine
// ============================================================

export function createDefaultDungeons(): Dungeon[] {
  return [
    {
      id: 'dungeon-beginner-1',
      name: 'Beginner Dungeon',
      type: 'beginner',
      description: 'Entry-level challenge to test basic fitness. Complete a series of foundational exercises.',
      difficulty: 1,
      color: '#64748B',
      estimatedMinutes: 15,
      xpReward: 150,
      coinReward: 30,
      status: 'available',
      exercises: ['10 Push-ups', '20 Bodyweight Squats', '30-second Plank', 'Band Rows x10', 'Mobility Flow'],
    },
    {
      id: 'dungeon-agility-1',
      name: 'Agility Dungeon',
      type: 'agility',
      description: 'Test speed, reaction, and footwork with dynamic movement challenges.',
      difficulty: 2,
      color: '#FBBF24',
      estimatedMinutes: 20,
      xpReward: 300,
      coinReward: 60,
      status: 'available',
      exercises: ['Reaction Drill x5', 'Footwork Patterns 3min', 'Single-leg Balance 30s each', 'Lateral Shuffles x20', 'Sprint Starts x5'],
    },
    {
      id: 'dungeon-endurance-1',
      name: 'Endurance Dungeon',
      type: 'endurance',
      description: 'Push cardiovascular limits with a sustained high-intensity circuit.',
      difficulty: 3,
      color: '#EF4444',
      estimatedMinutes: 30,
      xpReward: 400,
      coinReward: 80,
      status: 'available',
      exercises: ['Burpees x15', 'Mountain Climbers x30', 'Jump Squats x20', 'High Knees 1min', 'Band Circuit x3 rounds'],
    },
    {
      id: 'dungeon-boss-1',
      name: 'Boss Dungeon',
      type: 'boss',
      description: 'A permanent rank-scaled trial. Its difficulty rises with your rank, culminating at Prime.',
      difficulty: 1,
      color: '#EF4444',
      estimatedMinutes: 45,
      xpReward: 800,
      coinReward: 200,
      status: 'locked',
      exercises: ['Max Push-ups', 'Max Plank Hold', 'Max Squats in 2min', 'Reaction Test', 'Shadow Boxing 3 rounds', 'Agility Circuit'],
      requirements: 'Requires one Boss Beacon from the Store',
    },
  ];
}

export function createDefaultShopItems(): import('@/types').ShopItem[] {
  return [
    { id: 'day-pass', type: 'utility', name: 'Day Pass', description: 'Skip one daily or side quest without XP, coins, or penalties.', effect: 'Use from an active quest card', cost: 45, preview: 'skip', purchased: false },
    { id: 'recovery-pass', type: 'utility', name: 'Recovery Pass', description: 'Resolve one recovery quest with no penalty and no rewards.', effect: 'Use from a recovery quest card', cost: 35, preview: 'recover', purchased: false },
    { id: 'deadline-extender', type: 'utility', name: 'Deadline Extender', description: 'Adds 24 hours to an active quest deadline.', effect: 'Use from an active quest card', cost: 30, preview: 'time', purchased: false },
    { id: 'streak-shield', type: 'utility', name: 'Streak Shield', description: 'The next failed quest keeps your streak intact.', effect: 'Activates when used from Inventory', cost: 80, preview: 'shield', purchased: false },
    { id: 'xp-amplifier', type: 'utility', name: 'XP Amplifier', description: 'Doubles the XP from your next completed quest.', effect: 'Activates when used from Inventory', cost: 95, preview: 'xp', purchased: false },
    { id: 'time-crystal', type: 'utility', name: 'Time Crystal', description: 'Adds 2 minutes to one dungeon timer.', effect: 'Use before starting a dungeon', cost: 70, preview: 'crystal', purchased: false },
    { id: 'boss-beacon', type: 'utility', name: 'Boss Beacon', description: 'Unlocks one entry to the Boss Dungeon.', effect: 'Use from Inventory', cost: 120, preview: 'boss', purchased: false },
  ];
}

export function calculateFatigue(
  recentWorkouts: number,
  sleepQuality: number,
  restDays: number,
  missedQuests: number
): number {
  let fatigue = 0;
  fatigue += recentWorkouts * 8;
  fatigue += (10 - sleepQuality) * 5;
  fatigue -= restDays * 10;
  fatigue += missedQuests * 3;
  return Math.min(100, Math.max(0, fatigue));
}

export function checkStreak(lastLogin: Date | undefined): { maintained: boolean; reset: boolean } {
  if (!lastLogin) return { maintained: false, reset: false };
  
  const now = new Date();
  const last = new Date(lastLogin);
  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return { maintained: true, reset: false };
  if (diffDays <= 2) return { maintained: false, reset: false };
  return { maintained: false, reset: true };
}

export function createDefaultMainQuests(): Quest[] {
  const now = new Date();
  return [
    {
      id: 'main-iron-body',
      type: 'main',
      name: 'The Iron Body',
      description: 'Achieve 50 consecutive push-ups. Chapter 1/5: Reach 20 push-ups.',
      status: 'active',
      xpReward: 200,
      coinReward: 50,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      category: 'strength',
    },
    {
      id: 'main-digital-sovereign',
      type: 'main',
      name: 'Digital Sovereign',
      description: '90 days porn-free. Chapter 1/3: Reach 30 days.',
      status: 'active',
      xpReward: 200,
      coinReward: 50,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      category: 'discipline',
    },
  ];
}
