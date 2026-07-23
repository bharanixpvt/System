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
  Dungeon,
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

export const DEFAULT_UTILITY_ITEMS: import('@/types').ShopItem[] = [
  { id: 'penalty-eraser', type: 'utility', name: 'Penalty Eraser', description: 'Instantly resets Penalty Zone status and forgives missed quest strikes.', cost: 100, preview: '🛡️ Eraser', purchased: false, effect: 'penalty_erase' },
  { id: 'fatigue-catalyst', type: 'utility', name: 'Fatigue Recovery Catalyst', description: 'Instantly reduces player fatigue by 30% to maintain training capacity.', cost: 80, preview: '⚡ Recovery', purchased: false, effect: 'fatigue_reduce' },
  { id: 'xp-scroll', type: 'utility', name: 'XP Multiplier Scroll (24h)', description: 'Grants +50% bonus XP for all quest completions over the next 24 hours.', cost: 150, preview: '📜 XP Boost', purchased: false, effect: 'xp_boost' },
  { id: 'dungeon-pass', type: 'utility', name: 'Dungeon Re-entry Pass', description: 'Unlocks 1 additional instant dungeon run without rank penalty.', cost: 120, preview: '🔑 Pass', purchased: false, effect: 'dungeon_key' },
  { id: 'monarch-title-scroll', type: 'utility', name: 'Apex Operator Title Scroll', description: 'Unlocks the exclusive "Apex Operator" system title for your profile.', cost: 200, preview: '👑 Title', purchased: false, effect: 'title_unlock' },
  { id: 'willpower-matrix-1', type: 'utility', name: 'Resolute Streak Shield', description: 'Protects your active quest streak from breaking for 24 hours.', cost: 140, preview: '💠 Shield', purchased: false, effect: 'streak_shield' },
  { id: 'time-dilator-1', type: 'utility', name: 'Chronos Time Dilator', description: 'Postpones active daily quest expiration by 6 hours.', cost: 300, preview: '⏳ Chronos', purchased: false, effect: 'quest_postpone' },
  { id: 'void-catalyst-1', type: 'utility', name: 'Void Energy Catalyst', description: 'Exchanges 20% fatigue for 100 instant bonus XP.', cost: 260, preview: '🧪 Void', purchased: false, effect: 'fatigue_to_xp' },
  { id: 'digital-lock-key-1', type: 'utility', name: 'Digital Lockout Key', description: 'Immunizes screen time penalties for 3 full days.', cost: 130, preview: '🔑 Lock', purchased: false, effect: 'screen_time_immune' },
  { id: 'gravity-ring-1', type: 'utility', name: 'Gravity Ring Simulator', description: 'Doubles all Strength XP gains for 48 hours.', cost: 150, preview: '💍 Ring', purchased: false, effect: 'xp_boost_strength' },
  { id: 'aether-tonic-1', type: 'utility', name: 'Aetherial Recovery Tonic', description: 'Instantly clears all player fatigue (resets fatigue to 0%).', cost: 450, preview: '🧪 Aether', purchased: false, effect: 'fatigue_clear' },
  { id: 'monarch-soul-stone-1', type: 'utility', name: 'Monarch Soul Stone', description: 'Unlocks the Mythic "Apex Sovereign" exclusive profile title.', cost: 1200, preview: '🪨 Soul', purchased: false, effect: 'title_unlock_sovereign' },
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

  // Body Fat % Tailored Recomposition Quest
  const bodyFat = profile?.bodyFat ?? 18;
  if (bodyFat >= 20 || goals.some(g => g.toLowerCase().includes('recomposition') || g.toLowerCase().includes('fat loss'))) {
    quests.push({
      id: `sys-quest-body-recomp-${Date.now()}`,
      type: 'daily',
      name: 'Metabolic Recomposition Surge',
      description: `Targeting estimated ${bodyFat}% Body Fat. Execute 15 minutes of high-intensity calisthenic intervals (Jumping Jacks, Mountain Climbers, Air Squats) for accelerated fat oxidation.`,
      status: 'active',
      xpReward: 45,
      coinReward: 18,
      createdAt: now,
      expiresAt,
      category: 'endurance',
      requirement: '15m Calisthenic HIIT',
      isGenerated: true,
      isSystemQuest: true,
      canReduceXP: true,
      estimatedMinutes: 15,
    });
  }

  // Dopamine & Porn-Free Shield
  if (goals.some(g => g.toLowerCase().includes('porn') || g.toLowerCase().includes('dopamine'))) {
    quests.push({
      id: `sys-quest-porn-free-${Date.now()}`,
      type: 'daily',
      name: 'Dopamine Shield & Purity Protocol',
      description: 'Zero exposure to explicit content or pornographic triggers. Perform 60 seconds of cold water exposure to re-anchor dopamine receptors.',
      status: 'active',
      xpReward: 50,
      coinReward: 20,
      createdAt: now,
      expiresAt,
      category: 'discipline',
      requirement: 'Porn-Free & Cold Shower',
      isGenerated: true,
      isSystemQuest: true,
      canReduceXP: true,
      estimatedMinutes: 5,
    });
  }

  // Screen Time & Digital Detox Boundary
  if (goals.some(g => g.toLowerCase().includes('screen') || g.toLowerCase().includes('digital detox'))) {
    quests.push({
      id: `sys-quest-screen-detox-${Date.now()}`,
      type: 'daily',
      name: 'Digital Detox & Screen Boundary',
      description: 'Limit smartphone screen time under 2 hours total & strictly zero screen exposure 1 hour prior to sleep.',
      status: 'active',
      xpReward: 45,
      coinReward: 15,
      createdAt: now,
      expiresAt,
      category: 'focus',
      requirement: 'Sub-2h Screen Time',
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

  // Level-Based Progressive Overload Quest Scaling
  const userLevel = profile?.totalLevel || 1;
  if (userLevel >= 3) {
    const levelMultiplier = 1 + (userLevel - 1) * 0.05;
    quests.push({
      id: `sys-quest-progressive-overload-${Date.now()}`,
      type: 'daily',
      name: `Level ${userLevel} Progressive Overload Challenge`,
      description: `Targeting Level ${userLevel} physical threshold. Execute 4 sets pushing 1 rep past your previous personal record.`,
      status: 'active',
      xpReward: Math.round(55 * levelMultiplier),
      coinReward: Math.round(20 * levelMultiplier),
      createdAt: now,
      expiresAt,
      category: 'strength',
      requirement: `Level ${userLevel} PR Push`,
      isGenerated: true,
      isSystemQuest: true,
      canReduceXP: true,
      estimatedMinutes: Math.min(20, availableTime),
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
    { id: 'ach-streak-3', name: 'Initiate Streak', description: 'Maintain a 3-day streak of daily quests', tier: 'bronze', unlocked: false, hidden: false, progress: 0, maxProgress: 3, condition: 'streak_3' },
    { id: 'ach-streak-7', name: 'Streak Novice', description: 'Maintain a 7-day streak of daily quests', tier: 'bronze', unlocked: false, hidden: false, progress: 0, maxProgress: 7, condition: 'streak_7' },
    { id: 'ach-streak-14', name: 'Core Builder', description: 'Maintain a 14-day streak of daily quests', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 14, condition: 'streak_14' },
    { id: 'ach-streak-30', name: 'Iron Will', description: 'Maintain a 30-day streak of daily quests', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 30, condition: 'streak_30' },
    { id: 'ach-streak-45', name: 'Resolute Vanguard', description: 'Maintain a 45-day streak of daily quests', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 45, condition: 'streak_45' },
    { id: 'ach-streak-60', name: 'Discipline Master', description: 'Maintain a 60-day streak of daily quests', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 60, condition: 'streak_60' },
    { id: 'ach-streak-90', name: 'Monarch Discipline', description: 'Maintain a 90-day streak of daily quests', tier: 'platinum', unlocked: false, hidden: false, progress: 0, maxProgress: 90, condition: 'streak_90' },
    { id: 'ach-streak-120', name: 'Fortified Mind', description: 'Maintain a 120-day streak of daily quests', tier: 'platinum', unlocked: false, hidden: false, progress: 0, maxProgress: 120, condition: 'streak_120' },
    { id: 'ach-streak-180', name: 'Eternal Warrior', description: 'Maintain a 180-day streak of daily quests', tier: 'diamond', unlocked: false, hidden: false, progress: 0, maxProgress: 180, condition: 'streak_180' },
    { id: 'ach-streak-365', name: 'Apex Ascendant', description: 'Maintain a 365-day streak of daily quests', tier: 'mythic', unlocked: false, hidden: false, progress: 0, maxProgress: 365, condition: 'streak_365' },
    { id: 'ach-dungeon-1', name: 'Gate Opener', description: 'Clear your first Dungeon', tier: 'bronze', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'dungeons_1' },
    { id: 'ach-dungeons-5', name: 'Raid Recruit', description: 'Clear 5 Dungeons', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 5, condition: 'dungeons_5' },
    { id: 'ach-dungeons-10', name: 'Dungeon Master', description: 'Clear 10 Dungeons', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 10, condition: 'dungeons_10' },
    { id: 'ach-dungeons-25', name: 'Gate Conqueror', description: 'Clear 25 Dungeons', tier: 'platinum', unlocked: false, hidden: false, progress: 0, maxProgress: 25, condition: 'dungeons_25' },
    { id: 'ach-dungeons-50', name: 'Abyss Cleanser', description: 'Clear 50 Dungeons', tier: 'diamond', unlocked: false, hidden: false, progress: 0, maxProgress: 50, condition: 'dungeons_50' },
    { id: 'ach-dungeons-100', name: 'Sovereign Slayer', description: 'Clear 100 Dungeons', tier: 'legendary', unlocked: false, hidden: false, progress: 0, maxProgress: 100, condition: 'dungeons_100' },
    { id: 'ach-level-5', name: 'Operator Awakening', description: 'Reach Level 5', tier: 'bronze', unlocked: false, hidden: false, progress: 0, maxProgress: 5, condition: 'level_5' },
    { id: 'ach-level-10', name: 'Limit Breaker', description: 'Reach Level 10', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 10, condition: 'level_10' },
    { id: 'ach-level-15', name: 'Ascending Power', description: 'Reach Level 15', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 15, condition: 'level_15' },
    { id: 'ach-level-20', name: 'Core Resonance', description: 'Reach Level 20', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 20, condition: 'level_20' },
    { id: 'ach-level-30', name: 'Unstoppable Force', description: 'Reach Level 30', tier: 'platinum', unlocked: false, hidden: false, progress: 0, maxProgress: 30, condition: 'level_30' },
    { id: 'ach-level-50', name: 'Titan Class', description: 'Reach Level 50', tier: 'diamond', unlocked: false, hidden: false, progress: 0, maxProgress: 50, condition: 'level_50' },
    { id: 'ach-level-75', name: 'Immortal Vessel', description: 'Reach Level 75', tier: 'legendary', unlocked: false, hidden: false, progress: 0, maxProgress: 75, condition: 'level_75' },
    { id: 'ach-level-100', name: 'Apex Sovereign', description: 'Reach Level 100', tier: 'mythic', unlocked: false, hidden: false, progress: 0, maxProgress: 100, condition: 'level_100' },
    { id: 'ach-porn-free-3', name: 'Purified Vision', description: 'Maintain a 3-day porn-free streak', tier: 'bronze', unlocked: false, hidden: false, progress: 0, maxProgress: 3, condition: 'porn_free_3' },
    { id: 'ach-porn-free-7', name: 'Shadow Resister', description: 'Maintain a 7-day porn-free streak', tier: 'bronze', unlocked: false, hidden: false, progress: 0, maxProgress: 7, condition: 'porn_free_7' },
    { id: 'ach-porn-free-14', name: 'Fortress of Mind', description: 'Maintain a 14-day porn-free streak', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 14, condition: 'porn_free_14' },
    { id: 'ach-porn-free-30', name: 'Shadow Walker', description: 'Maintain a 30-day porn-free streak', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 30, condition: 'porn_free_30' },
    { id: 'ach-porn-free-60', name: 'Grave Conqueror', description: 'Maintain a 60-day porn-free streak', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 60, condition: 'porn_free_60' },
    { id: 'ach-porn-free-90', name: 'The Unbreakable', description: 'Maintain a 90-day porn-free streak', tier: 'platinum', unlocked: false, hidden: false, progress: 0, maxProgress: 90, condition: 'porn_free_90' },
    { id: 'ach-porn-free-180', name: 'Purity Incarnate', description: 'Maintain a 180-day porn-free streak', tier: 'diamond', unlocked: false, hidden: false, progress: 0, maxProgress: 180, condition: 'porn_free_180' },
    { id: 'ach-porn-free-365', name: 'Ascended Soul', description: 'Maintain a 365-day porn-free streak', tier: 'mythic', unlocked: false, hidden: false, progress: 0, maxProgress: 365, condition: 'porn_free_365' },
    { id: 'ach-rank-e', name: 'Lowest Class', description: 'Obtain E Rank status', tier: 'bronze', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'rank_e' },
    { id: 'ach-rank-d', name: 'Awakened Hunter', description: 'Reach D Rank', tier: 'bronze', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'rank_d' },
    { id: 'ach-rank-c', name: 'Rising Hunter', description: 'Reach C Rank', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'rank_c' },
    { id: 'ach-rank-b', name: 'Hunter Class', description: 'Reach B Rank', tier: 'platinum', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'rank_b' },
    { id: 'ach-rank-a', name: 'Vanguard Raider', description: 'Reach A Rank', tier: 'diamond', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'rank_a' },
    { id: 'ach-rank-s', name: 'S-Rank Elite', description: 'Reach S Rank', tier: 'legendary', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'rank_s' },
    { id: 'ach-rank-national', name: 'National Authority', description: 'Reach National Rank', tier: 'legendary', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'rank_national' },
    { id: 'ach-rank-monarch', name: 'Monarch Divine', description: 'Reach Monarch Level', tier: 'mythic', unlocked: false, hidden: true, progress: 0, maxProgress: 1, condition: 'rank_monarch' },
    { id: 'ach-rank-shadow-monarch', name: 'Shadow Sovereign', description: 'Reach the pinnacle — Shadow Monarch', tier: 'mythic', unlocked: false, hidden: true, progress: 0, maxProgress: 1, condition: 'rank_shadow_monarch' },
    { id: 'ach-coin-100', name: 'Treasure Seeker', description: 'Earn 100 total Coins', tier: 'bronze', unlocked: false, hidden: false, progress: 0, maxProgress: 100, condition: 'coins_100' },
    { id: 'ach-coin-500', name: 'Merchant Class', description: 'Earn 500 total Coins', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 500, condition: 'coins_500' },
    { id: 'ach-coin-1000', name: 'Vault Keeper', description: 'Earn 1,000 total Coins', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 1000, condition: 'coins_1000' },
    { id: 'ach-coin-5000', name: 'Golden Sovereign', description: 'Earn 5,000 total Coins', tier: 'platinum', unlocked: false, hidden: false, progress: 0, maxProgress: 5000, condition: 'coins_5000' },
    { id: 'ach-coin-10000', name: 'Monarchy Treasury', description: 'Earn 10,000 total Coins', tier: 'diamond', unlocked: false, hidden: false, progress: 0, maxProgress: 10000, condition: 'coins_10000' },
    { id: 'ach-upskill-1', name: 'Adaptability Unlocked', description: 'Acquire 1 Upskill Module', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'upskill_1' },
    { id: 'ach-upskill-3', name: 'Multi-threaded Operator', description: 'Acquire 3 Upskill Modules', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 3, condition: 'upskill_3' },
    { id: 'ach-upskill-5', name: 'Complete Synchronization', description: 'Acquire all 5 Upskill Modules', tier: 'platinum', unlocked: false, hidden: false, progress: 0, maxProgress: 5, condition: 'upskill_5' },
    { id: 'ach-fatigue-zero', name: 'Perfect Restoration', description: 'Clear player fatigue to 0% 5 times', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 5, condition: 'fatigue_zero_5' },
    { id: 'ach-evaluation-first', name: 'Proven Class', description: 'Pass your first Rank Evaluation trial', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'eval_pass_1' },
    { id: 'ach-quest-fifty', name: 'Iron Laborer', description: 'Complete 50 total side/daily quests', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 50, condition: 'quests_50' },
    { id: 'ach-monarch-will', name: 'Apex Sovereign Will', description: 'Complete 500 total side/daily quests', tier: 'mythic', unlocked: false, hidden: false, progress: 0, maxProgress: 500, condition: 'quests_500' },
  ];
}

export function createDefaultTitles(): Title[] {
  return [
    { id: 'title-beginner', name: 'The Beginner', description: 'Starting title given to all Players', equipped: true, unlocked: true, bonus: 'None', tier: 'bronze', condition: 'initial_scan' },
    { id: 'title-streak-3', name: 'Resolute Initiate', description: 'Completed a 3-day daily quest streak', equipped: false, unlocked: false, bonus: '+2% Discipline XP', tier: 'bronze', condition: 'streak_3' },
    { id: 'title-disciplined', name: 'Disciplined', description: 'Maintained a 7-day streak', equipped: false, unlocked: false, bonus: '+5% Discipline XP', tier: 'bronze', condition: 'streak_7' },
    { id: 'title-core-builder', name: 'Core Builder', description: 'Completed a 14-day daily quest streak', equipped: false, unlocked: false, bonus: '+6% Strength XP', tier: 'silver', condition: 'streak_14' },
    { id: 'title-iron-will', name: 'Iron Will', description: 'Maintained a 30-day streak', equipped: false, unlocked: false, bonus: '+8% Focus XP', tier: 'silver', condition: 'streak_30' },
    { id: 'title-vanguard-streak', name: 'Resolute Vanguard', description: 'Completed a 45-day daily quest streak', equipped: false, unlocked: false, bonus: '+10% Combat XP', tier: 'gold', condition: 'streak_45' },
    { id: 'title-disc-master', name: 'Discipline Master', description: 'Completed a 60-day daily quest streak', equipped: false, unlocked: false, bonus: '+12% Recovery XP', tier: 'gold', condition: 'streak_60' },
    { id: 'title-monarch-disc', name: 'Monarch Discipline', description: 'Maintained a 90-day streak', equipped: false, unlocked: false, bonus: '+15% All XP', tier: 'platinum', condition: 'streak_90' },
    { id: 'title-fortified-mind', name: 'Fortified Mind', description: 'Completed a 120-day daily quest streak', equipped: false, unlocked: false, bonus: '+15% Focus XP', tier: 'platinum', condition: 'streak_120' },
    { id: 'title-eternal-war', name: 'Eternal Warrior', description: 'Completed a 180-day daily quest streak', equipped: false, unlocked: false, bonus: '+18% Endurance XP', tier: 'diamond', condition: 'streak_180' },
    { id: 'title-apex-ascendant', name: 'Apex Ascendant', description: 'Completed a 365-day daily quest streak', equipped: false, unlocked: false, bonus: '+25% All XP', tier: 'mythic', condition: 'streak_365' },
    { id: 'title-gate-opener', name: 'Gate Opener', description: 'Cleared your first Dungeon challenge', equipped: false, unlocked: false, bonus: '+3% Dungeon Coins', tier: 'bronze', condition: 'dungeons_1' },
    { id: 'title-raid-recruit', name: 'Raid Recruit', description: 'Cleared 5 Dungeons', equipped: false, unlocked: false, bonus: '+5% Dungeon Coins', tier: 'silver', condition: 'dungeons_5' },
    { id: 'title-dungeon-conqueror', name: 'Dungeon Conqueror', description: 'Cleared 10 Dungeons', equipped: false, unlocked: false, bonus: '+10% Dungeon XP', tier: 'gold', condition: 'dungeons_10' },
    { id: 'title-gate-conqueror', name: 'Gate Conqueror', description: 'Cleared 25 Dungeons', equipped: false, unlocked: false, bonus: '+12% Dungeon XP & Coins', tier: 'platinum', condition: 'dungeons_25' },
    { id: 'title-abyss-cleanser', name: 'Abyss Cleanser', description: 'Cleared 50 Dungeons', equipped: false, unlocked: false, bonus: '+15% Dungeon XP', tier: 'diamond', condition: 'dungeons_50' },
    { id: 'title-sovereign-slayer', name: 'Sovereign Slayer', description: 'Cleared 100 Dungeons', equipped: false, unlocked: false, bonus: '+20% All Dungeon Rewards', tier: 'legendary', condition: 'dungeons_100' },
    { id: 'title-op-awakening', name: 'Operator Awakening', description: 'Reached Player level 5', equipped: false, unlocked: false, bonus: '+2% All XP', tier: 'bronze', condition: 'level_5' },
    { id: 'title-limit-breaker', name: 'Limit Breaker', description: 'Reached Player level 10', equipped: false, unlocked: false, bonus: '+5% All XP', tier: 'silver', condition: 'level_10' },
    { id: 'title-ascending-pow', name: 'Ascending Power', description: 'Reached Player level 15', equipped: false, unlocked: false, bonus: '+6% Strength XP', tier: 'silver', condition: 'level_15' },
    { id: 'title-core-resonance', name: 'Core Resonance', description: 'Reached Player level 20', equipped: false, unlocked: false, bonus: '+8% All XP', tier: 'gold', condition: 'level_20' },
    { id: 'title-unstoppable-force', name: 'Unstoppable Force', description: 'Reached Player level 30', equipped: false, unlocked: false, bonus: '+10% All XP', tier: 'platinum', condition: 'level_30' },
    { id: 'title-titan-class', name: 'Titan Class', description: 'Reached Player level 50', equipped: false, unlocked: false, bonus: '+12% All XP', tier: 'diamond', condition: 'level_50' },
    { id: 'title-immortal-vessel', name: 'Immortal Vessel', description: 'Reached Player level 75', equipped: false, unlocked: false, bonus: '+18% All XP', tier: 'legendary', condition: 'level_75' },
    { id: 'title-apex-sovereign', name: 'Apex Sovereign', description: 'Reached Player level 100', equipped: false, unlocked: false, bonus: '+25% All XP', tier: 'mythic', condition: 'level_100' },
    { id: 'title-purified-vision', name: 'Purified Vision', description: 'Porn-free streak of 3 days', equipped: false, unlocked: false, bonus: '+3% Discipline XP', tier: 'bronze', condition: 'porn_free_3' },
    { id: 'title-shadow-resister', name: 'Shadow Resister', description: 'Porn-free streak of 7 days', equipped: false, unlocked: false, bonus: '+5% Discipline XP', tier: 'bronze', condition: 'porn_free_7' },
    { id: 'title-fortress-mind', name: 'Fortress of Mind', description: 'Porn-free streak of 14 days', equipped: false, unlocked: false, bonus: '+6% Focus XP', tier: 'silver', condition: 'porn_free_14' },
    { id: 'title-shadow-walker', name: 'Shadow Walker', description: 'Porn-free streak of 30 days', equipped: false, unlocked: false, bonus: '+8% Focus XP', tier: 'gold', condition: 'porn_free_30' },
    { id: 'title-grave-conq', name: 'Grave Conqueror', description: 'Porn-free streak of 60 days', equipped: false, unlocked: false, bonus: '+10% Focus XP', tier: 'gold', condition: 'porn_free_60' },
    { id: 'title-the-unbreakable', name: 'The Unbreakable', description: 'Porn-free streak of 90 days', equipped: false, unlocked: false, bonus: '+12% All XP', tier: 'platinum', condition: 'porn_free_90' },
    { id: 'title-purity-inc', name: 'Purity Incarnate', description: 'Porn-free streak of 180 days', equipped: false, unlocked: false, bonus: '+15% All XP', tier: 'diamond', condition: 'porn_free_180' },
    { id: 'title-ascended-soul', name: 'Ascended Soul', description: 'Porn-free streak of 365 days', equipped: false, unlocked: false, bonus: '+25% All XP', tier: 'mythic', condition: 'porn_free_365' },
    { id: 'title-rank-e', name: 'E-Rank Scrap', description: 'Classified E-Rank Operator', equipped: false, unlocked: false, bonus: 'None', tier: 'bronze', condition: 'rank_e' },
    { id: 'title-rank-d', name: 'D-Rank Awakened', description: 'Reached D-Rank Operator', equipped: false, unlocked: false, bonus: '+2% All XP', tier: 'bronze', condition: 'rank_d' },
    { id: 'title-elite', name: 'Elite Athlete', description: 'Reached C Rank', equipped: false, unlocked: false, bonus: '+10% All XP', tier: 'gold', condition: 'rank_c' },
    { id: 'title-hunter', name: 'Hunter', description: 'Reached B Rank', equipped: false, unlocked: false, bonus: '+15% All XP', tier: 'platinum', condition: 'rank_b' },
    { id: 'title-vanguard-raider', name: 'Vanguard Raider', description: 'Reached A Rank', equipped: false, unlocked: false, bonus: '+18% All XP', tier: 'diamond', condition: 'rank_a' },
    { id: 'title-s-rank-elite', name: 'S-Rank Elite', description: 'Reached S Rank', equipped: false, unlocked: false, bonus: '+20% All XP', tier: 'legendary', condition: 'rank_s' },
    { id: 'title-national', name: 'National Authority', description: 'Reached National Rank', equipped: false, unlocked: false, bonus: '+22% All XP', tier: 'legendary', condition: 'rank_national' },
    { id: 'title-monarch', name: 'Monarch Sovereign', description: 'Reached Monarch Rank', equipped: false, unlocked: false, bonus: '+24% All XP', tier: 'mythic', condition: 'rank_monarch' },
    { id: 'title-shadow-monarch', name: 'Shadow Monarch', description: 'Reached the pinnacle', equipped: false, unlocked: false, bonus: '+25% All XP', tier: 'mythic', condition: 'rank_shadow_monarch' },
    { id: 'title-coin-100', name: 'Treasure Seeker', description: 'Earned 100 total Coins', equipped: false, unlocked: false, bonus: '+2% Shop Discount', tier: 'bronze', condition: 'coins_100' },
    { id: 'title-coin-500', name: 'Merchant Class', description: 'Earned 500 total Coins', equipped: false, unlocked: false, bonus: '+4% Shop Discount', tier: 'silver', condition: 'coins_500' },
    { id: 'title-coin-1000', name: 'Vault Keeper', description: 'Earned 1,000 total Coins', equipped: false, unlocked: false, bonus: '+6% Shop Discount', tier: 'gold', condition: 'coins_1000' },
    { id: 'title-coin-5000', name: 'Golden Sovereign', description: 'Earned 5,000 total Coins', equipped: false, unlocked: false, bonus: '+8% Shop Discount', tier: 'platinum', condition: 'coins_5000' },
    { id: 'title-coin-10000', name: 'Monarchy Treasury', description: 'Earned 10,000 total Coins', equipped: false, unlocked: false, bonus: '+10% Shop Discount', tier: 'diamond', condition: 'coins_10000' },
    { id: 'title-upskill-1', name: 'Adaptable Raider', description: 'Acquired 1 Upskill Module', equipped: false, unlocked: false, bonus: '+3% Stat XP gains', tier: 'silver', condition: 'upskill_1' },
    { id: 'title-upskill-3', name: 'System Adaptor', description: 'Acquired 3 Upskill Modules', equipped: false, unlocked: false, bonus: '+6% Stat XP gains', tier: 'gold', condition: 'upskill_3' },
    { id: 'title-upskill-5', name: 'Sovereign Adaptor', description: 'Acquired all 5 Upskill Modules', equipped: false, unlocked: false, bonus: '+10% Stat XP gains', tier: 'platinum', condition: 'upskill_5' },
    { id: 'title-perf-rest', name: 'Restoration Catalyst', description: 'Cleared fatigue to 0% 5 times', equipped: false, unlocked: false, bonus: '-5% Base Fatigue Accumulation', tier: 'silver', condition: 'fatigue_zero_5' },
    { id: 'title-proven', name: 'Proven Class', description: 'Passed first Rank Evaluation', equipped: false, unlocked: false, bonus: '+5% Evaluation Quest XP', tier: 'silver', condition: 'eval_pass_1' },
    { id: 'title-iron-lab', name: 'Iron Laborer', description: 'Completed 50 quests total', equipped: false, unlocked: false, bonus: '+5% Side Quest Coins', tier: 'gold', condition: 'quests_50' },
    { id: 'title-monarch-will', name: 'Apex Will', description: 'Completed 500 quests total', equipped: false, unlocked: false, bonus: '+15% All Coins & XP', tier: 'mythic', condition: 'quests_500' },
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
  if (condition === 'streak_3' && profile.streak >= 3) return true;
  if (condition === 'streak_7' && profile.streak >= 7) return true;
  if (condition === 'streak_14' && profile.streak >= 14) return true;
  if (condition === 'streak_30' && profile.streak >= 30) return true;
  if (condition === 'streak_45' && profile.streak >= 45) return true;
  if (condition === 'streak_60' && profile.streak >= 60) return true;
  if (condition === 'streak_90' && profile.streak >= 90) return true;
  if (condition === 'streak_120' && profile.streak >= 120) return true;
  if (condition === 'streak_180' && profile.streak >= 180) return true;
  if (condition === 'streak_365' && profile.streak >= 365) return true;
  if (condition === 'dungeons_1' && dungeons >= 1) return true;
  if (condition === 'dungeons_5' && dungeons >= 5) return true;
  if (condition === 'dungeons_10' && dungeons >= 10) return true;
  if (condition === 'dungeons_25' && dungeons >= 25) return true;
  if (condition === 'dungeons_50' && dungeons >= 50) return true;
  if (condition === 'dungeons_100' && dungeons >= 100) return true;
  if (condition === 'level_5' && profile.totalLevel >= 5) return true;
  if (condition === 'level_10' && profile.totalLevel >= 10) return true;
  if (condition === 'level_15' && profile.totalLevel >= 15) return true;
  if (condition === 'level_20' && profile.totalLevel >= 20) return true;
  if (condition === 'level_30' && profile.totalLevel >= 30) return true;
  if (condition === 'level_50' && profile.totalLevel >= 50) return true;
  if (condition === 'level_75' && profile.totalLevel >= 75) return true;
  if (condition === 'level_100' && profile.totalLevel >= 100) return true;
  if (condition === 'porn_free_3' && profile.pornFreeStreak >= 3) return true;
  if (condition === 'porn_free_7' && profile.pornFreeStreak >= 7) return true;
  if (condition === 'porn_free_14' && profile.pornFreeStreak >= 14) return true;
  if (condition === 'porn_free_30' && profile.pornFreeStreak >= 30) return true;
  if (condition === 'porn_free_60' && profile.pornFreeStreak >= 60) return true;
  if (condition === 'porn_free_90' && profile.pornFreeStreak >= 90) return true;
  if (condition === 'porn_free_180' && profile.pornFreeStreak >= 180) return true;
  if (condition === 'porn_free_365' && profile.pornFreeStreak >= 365) return true;
  if (condition === 'rank_e' && RANK_ORDER.indexOf(profile.currentRank) >= RANK_ORDER.indexOf('E Rank')) return true;
  if (condition === 'rank_d' && RANK_ORDER.indexOf(profile.currentRank) >= RANK_ORDER.indexOf('D Rank')) return true;
  if (condition === 'rank_c' && RANK_ORDER.indexOf(profile.currentRank) >= RANK_ORDER.indexOf('C Rank')) return true;
  if (condition === 'rank_b' && RANK_ORDER.indexOf(profile.currentRank) >= RANK_ORDER.indexOf('B Rank')) return true;
  if (condition === 'rank_a' && RANK_ORDER.indexOf(profile.currentRank) >= RANK_ORDER.indexOf('A Rank')) return true;
  if (condition === 'rank_s' && RANK_ORDER.indexOf(profile.currentRank) >= RANK_ORDER.indexOf('S Rank')) return true;
  if (condition === 'rank_national' && RANK_ORDER.indexOf(profile.currentRank) >= RANK_ORDER.indexOf('National Level')) return true;
  if (condition === 'rank_monarch' && profile.currentRank === 'Monarch Level') return true;
  if (condition === 'rank_shadow_monarch' && profile.currentRank === 'Shadow Monarch') return true;
  if (condition === 'coins_100' && profile.coins >= 100) return true;
  if (condition === 'coins_500' && profile.coins >= 500) return true;
  if (condition === 'coins_1000' && profile.coins >= 1000) return true;
  if (condition === 'coins_5000' && profile.coins >= 5000) return true;
  if (condition === 'coins_10000' && profile.coins >= 10000) return true;
  if (condition === 'upskill_1' && (profile.unlockedUpskills || []).length >= 1) return true;
  if (condition === 'upskill_3' && (profile.unlockedUpskills || []).length >= 3) return true;
  if (condition === 'upskill_5' && (profile.unlockedUpskills || []).length >= 5) return true;
  if (condition === 'quests_50' && (workouts + dungeons) >= 50) return true;
  if (condition === 'quests_500' && (workouts + dungeons) >= 500) return true;
  
  return false;
}

// ============================================================
// Dungeon Engine
// ============================================================

export function createDefaultDungeons(): Dungeon[] {
  return [
    {
      id: 'dungeon-beginner-1',
      name: 'Foundation Threshold',
      type: 'beginner',
      description: 'Foundational trial testing bodyweight movement control, core stability, and baseline stamina.',
      difficulty: 1,
      color: '#CBD5E1',
      estimatedMinutes: 15,
      xpReward: 150,
      coinReward: 30,
      status: 'available',
      exercises: ['10 Controlled Push-ups', '20 Bodyweight Squats', '30-second Plank', '10 Inverted Rows / Pulls', 'Mobility Flow'],
    },
    {
      id: 'dungeon-agility-1',
      name: 'Agility & Reflex Trial',
      type: 'agility',
      description: 'Intermediate challenge testing footwork speed, balance transitions, and reaction efficiency.',
      difficulty: 2,
      color: '#FBBF24',
      estimatedMinutes: 20,
      xpReward: 300,
      coinReward: 60,
      status: 'locked',
      requirements: 'Requires Lv. 5+ (D-Rank)',
      exercises: ['Reaction Drill x5', 'Footwork Patterns 3min', 'Single-leg Balance 30s each', 'Lateral Shuffles x20', 'Sprint Starts x5'],
    },
    {
      id: 'dungeon-endurance-1',
      name: 'High-Intensity Endurance Gate',
      type: 'endurance',
      description: 'Advanced cardiovascular stamina circuit pushing maximum muscle endurance.',
      difficulty: 3,
      color: '#EF4444',
      estimatedMinutes: 30,
      xpReward: 400,
      coinReward: 80,
      status: 'locked',
      requirements: 'Requires Lv. 10+ (C-Rank)',
      exercises: ['Burpees x15', 'Mountain Climbers x30', 'Jump Squats x20', 'High Knees 1min', 'Bodyweight Circuit x3 rounds'],
    },
    {
      id: 'dungeon-boss-1',
      name: 'Rank Promotion Boss Trial',
      type: 'boss',
      description: 'A rank-scaled boss trial unlocking during rank evaluation milestones.',
      difficulty: 1,
      color: '#EF4444',
      estimatedMinutes: 45,
      xpReward: 800,
      coinReward: 200,
      status: 'locked',
      exercises: ['Max Push-ups', 'Max Plank Hold', 'Max Squats in 2min', 'Reaction Test', 'Agility Circuit'],
      requirements: 'Unlocked during Rank Evaluation',
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
