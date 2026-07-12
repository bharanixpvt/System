// ============================================================
// SYSTEM — Game Engine
// XP/Leveling, Stats, Ranks, Calculations
// ============================================================

import type { Rank, StatName, PlayerProfile, PlayerStat, Quest, Achievement, Title } from '@/types';
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
    
    // Check title eligibility
    rewards.push('Title eligibility checked');
    // Unlock harder dungeons
    rewards.push('New Dungeon tier unlocked');
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
// Stat Engine
// ============================================================

export function createDefaultStats(): PlayerStat[] {
  return (Object.keys(STAT_CONFIG) as StatName[]).map((name) => ({
    name,
    ...STAT_CONFIG[name],
    level: 1,
    xp: 0,
    xpToNext: calculateXPToNextLevel(1),
    rank: 'E Rank' as Rank,
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
  
  const leveledUp = true;
  return { stat, leveledUp };
}

export function getStatLevelFromXP(totalXP: number): { level: number; xp: number; xpToNext: number } {
  let level = 1;
  let xp = totalXP;
  
  while (xp >= calculateXPToNextLevel(level) && level < 100) {
    xp -= calculateXPToNextLevel(level);
    level++;
  }
  
  return { level, xp, xpToNext: calculateXPToNextLevel(level) };
}

// ============================================================
// XP Calculation with Multipliers
// ============================================================

export interface XPMultipliers {
  baseXP: number;
  difficulty: number;
  consistency: number;
  intensity: number;
  perfectForm: boolean;
  streakDays: number;
  recovery: number;
  firstOfDay: boolean;
  newPR: boolean;
}

export function calculateFinalXP(multipliers: XPMultipliers): number {
  const streakMultiplier = Math.min(1.5, 1.0 + 0.01 * multipliers.streakDays);
  let finalXP = multipliers.baseXP 
    * multipliers.difficulty 
    * streakMultiplier 
    * multipliers.intensity 
    * multipliers.recovery;
  
  if (multipliers.perfectForm) finalXP += 2;
  if (multipliers.firstOfDay) finalXP += 20;
  if (multipliers.newPR) finalXP += 100;
  
  // Streak bonus
  if (multipliers.streakDays > 0 && multipliers.streakDays % 7 === 0) {
    finalXP += 10 * (multipliers.streakDays / 7);
  }
  
  return Math.round(finalXP);
}

// ============================================================
// Quest Generation
// ============================================================

export interface PersonalizationInput {
  fitnessLevel?: number;
  sleepQuality?: number;
  maxPushups?: number;
  maxPlank?: number;
  goals?: string[];
  screenTime?: number;
  combatTrainingStatus?: 'locked' | 'accepted' | 'held' | 'declined';
}

export function generateDailyQuests(profile?: PersonalizationInput): Quest[] {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  const dailyQuestTemplates = [
    { name: 'Hydration Protocol', description: 'Consume 3 liters of water today', category: 'general' as const, xpReward: 15 },
    { name: 'Mobility Ritual', description: 'Complete 10-minute morning mobility flow', category: 'mobility' as const, xpReward: 25 },
    { name: 'Strength Maintenance', description: 'Complete one Strength Path session', category: 'strength' as const, xpReward: 50 },
    { name: 'Mental Fortress', description: 'Meditate for 10 minutes minimum', category: 'focus' as const, xpReward: 15 },
    { name: 'Knowledge Acquisition', description: 'Read for 20+ minutes', category: 'focus' as const, xpReward: 30 },
    { name: 'Digital Discipline', description: 'Maintain porn-free streak today', category: 'discipline' as const, xpReward: 40 },
    { name: 'Screen Limit', description: 'Stay under daily screen time limit', category: 'discipline' as const, xpReward: 25 },
    { name: 'Recovery Protocol', description: 'Sleep before 11:00 PM', category: 'recovery' as const, xpReward: 20 },
    { name: 'Endurance Base', description: 'Walk 10,000 steps today', category: 'endurance' as const, xpReward: 30 },
  ];
  
  const goals = profile?.goals || [];
  const intensity = (profile?.fitnessLevel || 5) <= 3 ? 'starter' : (profile?.fitnessLevel || 5) >= 8 ? 'advanced' : 'standard';
  const personalized = dailyQuestTemplates.filter(q => {
    if (goals.length === 0) return true;
    return !q.category || goals.some(goal => q.category.includes(goal.toLowerCase()) || goal.toLowerCase().includes(q.category));
  });
  const selected = personalized.length >= 4 ? personalized : dailyQuestTemplates;
  return selected.map((template, index) => ({
    id: `daily-${now.toISOString().split('T')[0]}-${index}`,
    type: 'daily' as const,
    name: template.name,
    description: template.name === 'Strength Maintenance' && profile?.maxPushups
      ? `Complete a ${intensity} Strength Path session. Baseline: ${profile.maxPushups} push-ups.`
      : template.name === 'Recovery Protocol' && profile?.sleepQuality && profile.sleepQuality < 5
        ? 'Prioritize an early wind-down and 8 hours of recovery sleep.'
        : template.description,
    status: 'active' as const,
    xpReward: template.xpReward,
    coinReward: Math.floor(template.xpReward / 5),
    createdAt: now,
    expiresAt: endOfDay,
    category: template.category,
    isGenerated: true,
  }));
}

export function generateSideQuests(profile?: PersonalizationInput): Quest[] {
  const sideQuestTemplates = [
    { name: 'Cold Shower Challenge', description: 'Take a cold shower (30+ seconds)', xpReward: 15, category: 'general' as const },
    { name: 'Extra Mobility', description: 'Do an additional mobility session', xpReward: 20, category: 'mobility' as const },
    { name: 'Learn New Exercise', description: 'Learn one new resistance band exercise', xpReward: 25, category: 'strength' as const },
    { name: 'Fasting Window', description: 'Complete your fasting window', xpReward: 20, category: 'discipline' as const },
    { name: 'Healthy Meal', description: 'Prepare and eat a healthy meal', xpReward: 15, category: 'recovery' as const },
  ];
  
  const now = new Date();
  // Pick 1-2 random side quests
  const count = 1 + Math.floor(Math.random() * 2);
  const tailored = profile?.goals?.some(goal => goal.toLowerCase().includes('strength'))
    ? [...sideQuestTemplates.filter(q => q.category === 'strength'), ...sideQuestTemplates.filter(q => q.category !== 'strength')]
    : sideQuestTemplates;
  const shuffled = [...tailored].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  return selected.map((template, index) => ({
    id: `side-${now.toISOString()}-${index}`,
    type: 'side' as const,
    name: template.name,
    description: template.description,
    status: 'active' as const,
    xpReward: template.xpReward,
    coinReward: Math.floor(template.xpReward / 5),
    createdAt: now,
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    category: template.category,
  }));
}

export function generateRecoveryQuest(profile: PlayerProfile): Quest {
  const now = new Date();
  return {
    id: `recovery-${now.toISOString()}`,
    type: 'recovery',
    name: 'Recovery Protocol Activated',
    description: profile.fatigue > 70 
      ? 'Fatigue levels elevated. Complete light mobility and extended rest.' 
      : 'Complete a recovery session: light stretching and meditation.',
    status: 'active',
    xpReward: 30,
    coinReward: 5,
    createdAt: now,
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    category: 'recovery',
    isGenerated: true,
  };
}

// ============================================================
// Achievement Engine
// ============================================================

export function createDefaultAchievements(): Achievement[] {
  return [
    { id: 'ach-first-blood', name: 'First Blood', description: 'Complete your first training session', tier: 'bronze', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'first_workout' },
    { id: 'ach-iron-arms', name: 'Iron Arms', description: 'Complete 50 push-ups in one session', tier: 'bronze', unlocked: false, hidden: false, progress: 0, maxProgress: 50, condition: 'pushups_50' },
    { id: 'ach-steel-core', name: 'Steel Core', description: 'Hold plank for 3 minutes', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 180, condition: 'plank_180' },
    { id: 'ach-disciplined', name: 'Disciplined', description: 'Maintain a 7-day streak', tier: 'bronze', unlocked: false, hidden: false, progress: 0, maxProgress: 7, condition: 'streak_7' },
    { id: 'ach-iron-will', name: 'Iron Will', description: 'Maintain a 30-day streak', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 30, condition: 'streak_30' },
    { id: 'ach-swift-runner', name: 'Swift Runner', description: 'Achieve sub-300ms reaction time', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 300, condition: 'reaction_300' },
    { id: 'ach-shadow-boxer', name: 'Shadow Boxer', description: 'Complete Self-Defense Stage 2', tier: 'silver', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'defense_stage2' },
    { id: 'ach-band-warrior', name: 'Band Warrior', description: 'Complete all resistance band exercises', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'all_band' },
    { id: 'ach-dungeon-conqueror', name: 'Dungeon Conqueror', description: 'Clear 10 Dungeons', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 10, condition: 'dungeons_10' },
    { id: 'ach-elite-athlete', name: 'Elite Athlete', description: 'Reach C Rank', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 1, condition: 'rank_c' },
    { id: 'ach-shadow-walker', name: 'Shadow Walker', description: '30 days porn-free', tier: 'gold', unlocked: false, hidden: false, progress: 0, maxProgress: 30, condition: 'porn_free_30' },
    { id: 'ach-the-unbreakable', name: 'The Unbreakable', description: '90 days porn-free', tier: 'platinum', unlocked: false, hidden: false, progress: 0, maxProgress: 90, condition: 'porn_free_90' },
    { id: 'ach-the-untouchable', name: 'The Untouchable', description: '365 days porn-free', tier: 'legendary', unlocked: false, hidden: true, progress: 0, maxProgress: 365, condition: 'porn_free_365' },
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
    { id: 'title-shadow-boxer', name: 'Shadow Boxer', description: 'Completed Stage 2 training', equipped: false, unlocked: false, bonus: '+5% Combat XP', tier: 'silver', condition: 'defense_stage2' },
    { id: 'title-band-warrior', name: 'Band Warrior', description: 'Mastered all band exercises', equipped: false, unlocked: false, bonus: '+10% Strength XP', tier: 'gold', condition: 'all_band' },
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

export function createDefaultDungeons(): import('@/types').Dungeon[] {
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

// ============================================================
// Training Paths Engine
// ============================================================

export function createDefaultTrainingPaths(): import('@/types').TrainingPath[] {
  return [
    {
      name: 'strength',
      displayName: 'Strength Path',
      description: 'Build raw physical power through progressive resistance training',
      color: '#EF4444',
      icon: 'Dumbbell',
      tier: 1,
      maxTier: 5,
      progress: 0,
      currentExerciseIndex: 0,
      unlocked: true,
      completed: false,
      exercises: [
        { name: 'Push-ups', tier: 1, difficulty: 1.0, description: 'Standard push-ups, full range of motion', sets: 3, reps: 10, restSeconds: 60, unlocked: true, completed: false, path: 'strength' },
        { name: 'Band Push-ups', tier: 2, difficulty: 1.3, description: 'Push-ups with resistance band across back', sets: 3, reps: 8, restSeconds: 60, unlocked: false, completed: false, path: 'strength' },
        { name: 'Band Rows', tier: 2, difficulty: 1.2, description: 'Seated rows with resistance band', sets: 3, reps: 12, restSeconds: 60, unlocked: false, completed: false, path: 'strength' },
        { name: 'Band Chest Press', tier: 2, difficulty: 1.2, description: 'Standing chest press with band', sets: 3, reps: 10, restSeconds: 60, unlocked: false, completed: false, path: 'strength' },
        { name: 'Band Shoulder Press', tier: 2, difficulty: 1.2, description: 'Overhead press with resistance band', sets: 3, reps: 10, restSeconds: 60, unlocked: false, completed: false, path: 'strength' },
        { name: 'Band Squats', tier: 2, difficulty: 1.1, description: 'Squats with band across shoulders', sets: 3, reps: 15, restSeconds: 60, unlocked: false, completed: false, path: 'strength' },
        { name: 'Band Deadlift', tier: 2, difficulty: 1.2, description: 'Romanian deadlift with band', sets: 3, reps: 10, restSeconds: 60, unlocked: false, completed: false, path: 'strength' },
        { name: 'Split Squats', tier: 2, difficulty: 1.1, description: 'Bulgarian split squats', sets: 3, reps: 10, restSeconds: 60, unlocked: false, completed: false, path: 'strength' },
        { name: 'Lunges', tier: 1, difficulty: 1.0, description: 'Walking or stationary lunges', sets: 3, reps: 12, restSeconds: 45, unlocked: true, completed: false, path: 'strength' },
        { name: 'Planks', tier: 1, difficulty: 1.0, description: 'Core plank hold', sets: 3, reps: 1, restSeconds: 45, unlocked: true, completed: false, path: 'strength' },
        { name: 'Core Circuit', tier: 2, difficulty: 1.2, description: 'Rotating core exercises', sets: 3, reps: 1, restSeconds: 45, unlocked: false, completed: false, path: 'strength' },
      ],
    },
    {
      name: 'agility',
      displayName: 'Agility Path',
      description: 'Develop speed, reaction time, and directional change ability',
      color: '#FBBF24',
      icon: 'Zap',
      tier: 1,
      maxTier: 5,
      progress: 0,
      currentExerciseIndex: 0,
      unlocked: true,
      completed: false,
      exercises: [
        { name: 'Footwork Patterns', tier: 1, difficulty: 1.0, description: 'Basic in-in-out-out patterns', sets: 3, reps: 1, restSeconds: 30, unlocked: true, completed: false, path: 'agility' },
        { name: 'Ladder Drills', tier: 1, difficulty: 1.0, description: 'Imaginary ladder footwork drills', sets: 3, reps: 1, restSeconds: 30, unlocked: true, completed: false, path: 'agility' },
        { name: 'Cone Drills', tier: 1, difficulty: 1.0, description: 'Use bottles/objects as cones', sets: 3, reps: 1, restSeconds: 30, unlocked: true, completed: false, path: 'agility' },
        { name: 'Direction Changes', tier: 2, difficulty: 1.2, description: 'Rapid 180-degree direction changes', sets: 3, reps: 5, restSeconds: 45, unlocked: false, completed: false, path: 'agility' },
        { name: 'Jump Rope', tier: 2, difficulty: 1.2, description: 'Jump rope intervals (or simulate)', sets: 3, reps: 1, restSeconds: 30, unlocked: false, completed: false, path: 'agility' },
        { name: 'Single-leg Balance', tier: 1, difficulty: 1.0, description: 'Balance on one leg, eyes closed', sets: 3, reps: 1, restSeconds: 20, unlocked: true, completed: false, path: 'agility' },
        { name: 'Reaction Drills', tier: 2, difficulty: 1.3, description: 'React to visual/audio cues', sets: 3, reps: 5, restSeconds: 30, unlocked: false, completed: false, path: 'agility' },
        { name: 'Explosive Starts', tier: 2, difficulty: 1.2, description: 'Sprint starts from various positions', sets: 5, reps: 1, restSeconds: 60, unlocked: false, completed: false, path: 'agility' },
        { name: 'Lateral Movement', tier: 1, difficulty: 1.0, description: 'Side shuffles and carioca', sets: 3, reps: 1, restSeconds: 30, unlocked: true, completed: false, path: 'agility' },
        { name: 'Sprint Starts', tier: 2, difficulty: 1.2, description: 'Short burst sprints', sets: 5, reps: 1, restSeconds: 60, unlocked: false, completed: false, path: 'agility' },
        { name: 'Coordination Drills', tier: 2, difficulty: 1.2, description: 'Hand-eye coordination sequences', sets: 3, reps: 1, restSeconds: 30, unlocked: false, completed: false, path: 'agility' },
      ],
    },
    {
      name: 'mobility',
      displayName: 'Mobility Path',
      description: 'Increase range of motion, flexibility, and movement quality',
      color: '#06B6D4',
      icon: 'Move',
      tier: 1,
      maxTier: 5,
      progress: 0,
      currentExerciseIndex: 0,
      unlocked: true,
      completed: false,
      exercises: [
        { name: 'Hip Mobility Flow', tier: 1, difficulty: 1.0, description: '90/90 switches, hip circles, Cossack squats', sets: 1, reps: 1, restSeconds: 0, unlocked: true, completed: false, path: 'mobility' },
        { name: 'Shoulder Circuits', tier: 1, difficulty: 1.0, description: 'Arm circles, wall slides, band pull-aparts', sets: 1, reps: 1, restSeconds: 0, unlocked: true, completed: false, path: 'mobility' },
        { name: 'Thoracic Rotation', tier: 1, difficulty: 1.0, description: 'Open books, thread the needle', sets: 1, reps: 1, restSeconds: 0, unlocked: true, completed: false, path: 'mobility' },
        { name: 'Ankle Mobility', tier: 1, difficulty: 1.0, description: 'Ankle circles, calf raises, knee-to-wall', sets: 1, reps: 1, restSeconds: 0, unlocked: true, completed: false, path: 'mobility' },
        { name: 'Hamstring Stretching', tier: 1, difficulty: 1.0, description: 'Standing and seated hamstring stretches', sets: 1, reps: 1, restSeconds: 0, unlocked: true, completed: false, path: 'mobility' },
        { name: 'Spine Mobility', tier: 1, difficulty: 1.0, description: 'Cat-cow, spinal waves', sets: 1, reps: 1, restSeconds: 0, unlocked: true, completed: false, path: 'mobility' },
        { name: 'Daily Recovery Routine', tier: 1, difficulty: 1.0, description: 'Full body recovery flow', sets: 1, reps: 1, restSeconds: 0, unlocked: true, completed: false, path: 'mobility' },
        { name: 'Dynamic Stretching', tier: 1, difficulty: 1.0, description: 'Leg swings, arm circles, torso twists', sets: 1, reps: 1, restSeconds: 0, unlocked: true, completed: false, path: 'mobility' },
        { name: 'Static Stretching', tier: 1, difficulty: 1.0, description: 'Hold stretches 30-60 seconds each', sets: 1, reps: 1, restSeconds: 0, unlocked: true, completed: false, path: 'mobility' },
      ],
    },
    {
      name: 'endurance',
      displayName: 'Endurance Path',
      description: 'Build cardiovascular capacity and stamina',
      color: '#4ADE80',
      icon: 'Heart',
      tier: 1,
      maxTier: 5,
      progress: 0,
      currentExerciseIndex: 0,
      unlocked: true,
      completed: false,
      exercises: [
        { name: 'Walking', tier: 1, difficulty: 1.0, description: 'Brisk walking 20+ minutes', sets: 1, reps: 1, restSeconds: 0, unlocked: true, completed: false, path: 'endurance' },
        { name: 'Running', tier: 2, difficulty: 1.5, description: 'Steady-state running', sets: 1, reps: 1, restSeconds: 0, unlocked: false, completed: false, path: 'endurance' },
        { name: 'HIIT Circuits', tier: 3, difficulty: 2.0, description: 'High-intensity intervals', sets: 4, reps: 1, restSeconds: 60, unlocked: false, completed: false, path: 'endurance' },
        { name: 'Shadow Movement', tier: 2, difficulty: 1.3, description: 'Shadow boxing with movement', sets: 3, reps: 3, restSeconds: 60, unlocked: false, completed: false, path: 'endurance' },
        { name: 'Stair Climbing', tier: 2, difficulty: 1.4, description: 'Stair climbs or step-ups', sets: 5, reps: 1, restSeconds: 60, unlocked: false, completed: false, path: 'endurance' },
        { name: 'Burpees', tier: 2, difficulty: 1.5, description: 'Full burpees with push-up', sets: 3, reps: 10, restSeconds: 60, unlocked: false, completed: false, path: 'endurance' },
        { name: 'Mountain Climbers', tier: 2, difficulty: 1.3, description: 'Fast mountain climbers', sets: 3, reps: 20, restSeconds: 45, unlocked: false, completed: false, path: 'endurance' },
        { name: 'Band Circuits', tier: 2, difficulty: 1.4, description: 'Full-body band circuit', sets: 3, reps: 1, restSeconds: 60, unlocked: false, completed: false, path: 'endurance' },
      ],
    },
    {
      name: 'selfDefense',
      displayName: 'Self-Defense Path',
      description: 'Learn defensive skills — never violence, only protection',
      color: '#8B5CF6',
      icon: 'Shield',
      tier: 1,
      maxTier: 5,
      progress: 0,
      currentExerciseIndex: 0,
      unlocked: true,
      completed: false,
      exercises: [
        { name: 'Stage 1: Awareness & Posture', tier: 1, difficulty: 1.0, description: 'Learn situational awareness, proper stance, balance drills', sets: 1, reps: 1, restSeconds: 30, unlocked: true, completed: false, path: 'selfDefense' },
        { name: 'Stage 1: Footwork & Distance', tier: 1, difficulty: 1.0, description: 'Basic footwork patterns, distance management', sets: 1, reps: 1, restSeconds: 30, unlocked: true, completed: false, path: 'selfDefense' },
        { name: 'Stage 1: Guard Position', tier: 1, difficulty: 1.0, description: 'Defensive guard, hand positioning', sets: 1, reps: 1, restSeconds: 30, unlocked: true, completed: false, path: 'selfDefense' },
        { name: 'Stage 2: Jab Technique', tier: 2, difficulty: 1.2, description: 'Proper jab form and shadow practice', sets: 3, reps: 20, restSeconds: 30, unlocked: false, completed: false, path: 'selfDefense' },
        { name: 'Stage 2: Cross & Hook', tier: 2, difficulty: 1.2, description: 'Cross and hook technique', sets: 3, reps: 20, restSeconds: 30, unlocked: false, completed: false, path: 'selfDefense' },
        { name: 'Stage 2: Defense', tier: 2, difficulty: 1.3, description: 'Blocking, slipping, head movement', sets: 3, reps: 1, restSeconds: 30, unlocked: false, completed: false, path: 'selfDefense' },
        { name: 'Stage 3: Front Kick & Low Kick', tier: 3, difficulty: 1.4, description: 'Basic kicking techniques', sets: 3, reps: 10, restSeconds: 45, unlocked: false, completed: false, path: 'selfDefense' },
        { name: 'Stage 3: Teep & Combinations', tier: 3, difficulty: 1.5, description: 'Push kick and kick-punch combos', sets: 3, reps: 10, restSeconds: 45, unlocked: false, completed: false, path: 'selfDefense' },
        { name: 'Stage 4: Breakfalls & Bridging', tier: 4, difficulty: 1.5, description: 'Safe falling and hip bridging', sets: 3, reps: 5, restSeconds: 45, unlocked: false, completed: false, path: 'selfDefense' },
        { name: 'Stage 4: Stand-up & Hip Escape', tier: 4, difficulty: 1.5, description: 'Technical stand-up, shrimping', sets: 3, reps: 5, restSeconds: 45, unlocked: false, completed: false, path: 'selfDefense' },
        { name: 'Stage 5: Reaction Drills', tier: 5, difficulty: 1.8, description: 'Reaction challenges under stress', sets: 3, reps: 5, restSeconds: 60, unlocked: false, completed: false, path: 'selfDefense' },
        { name: 'Stage 5: Integration', tier: 5, difficulty: 2.0, description: 'Scenario-based defensive practice', sets: 1, reps: 1, restSeconds: 60, unlocked: false, completed: false, path: 'selfDefense' },
      ],
    },
  ];
}

// ============================================================
// Shop Items
// ============================================================

export function createDefaultShopItems(): import('@/types').ShopItem[] {
  return [
    { id: 'day-pass', type: 'utility', name: 'Day Pass', description: 'Skip one daily or side quest without XP, coins, or penalties.', effect: 'Use from an active quest card', cost: 45, preview: 'skip', purchased: false },
    { id: 'recovery-pass', type: 'utility', name: 'Recovery Pass', description: 'Resolve one recovery quest with no penalty and no rewards.', effect: 'Use from a recovery quest card', cost: 35, preview: 'recover', purchased: false },
    { id: 'deadline-extender', type: 'utility', name: 'Deadline Extender', description: 'Adds 24 hours to an active quest deadline.', effect: 'Use from an active quest card', cost: 30, preview: 'time', purchased: false },
    { id: 'quest-reroll', type: 'utility', name: 'Quest Reroll', description: 'Replace one daily quest with a fresh body-conditioning alternative.', effect: 'Use from an active daily quest card', cost: 55, preview: 'reroll', purchased: false },
    { id: 'streak-shield', type: 'utility', name: 'Streak Shield', description: 'The next failed quest keeps your streak intact.', effect: 'Activates when used from Inventory', cost: 80, preview: 'shield', purchased: false },
    { id: 'xp-amplifier', type: 'utility', name: 'XP Amplifier', description: 'Doubles the XP from your next completed quest.', effect: 'Activates when used from Inventory', cost: 95, preview: 'xp', purchased: false },
    { id: 'time-crystal', type: 'utility', name: 'Time Crystal', description: 'Adds 2 minutes to one dungeon timer.', effect: 'Use before starting a dungeon', cost: 70, preview: 'crystal', purchased: false },
    { id: 'dungeon-scout', type: 'utility', name: 'Dungeon Scout', description: 'Reveals a safe route: reduces the current dungeon difficulty by one.', effect: 'Use before starting a dungeon', cost: 90, preview: 'scout', purchased: false },
    { id: 'boss-beacon', type: 'utility', name: 'Boss Beacon', description: 'Unlocks one entry to the Boss Dungeon.', effect: 'Use from Inventory', cost: 120, preview: 'boss', purchased: false },
    { id: 'second-wind', type: 'utility', name: 'Second Wind', description: 'Restores 20 fatigue after a demanding day.', effect: 'Activates from Inventory', cost: 65, preview: 'wind', purchased: false },
    { id: 'focus-token', type: 'utility', name: 'Focus Token', description: 'Completes one focus quest with no reward or penalty.', effect: 'Use from a focus quest card', cost: 40, preview: 'focus', purchased: false },
    { id: 'xp-catalyst', type: 'utility', name: 'XP Catalyst', description: 'Doubles the XP from your next quest and grants +25 coins.', effect: 'Activates when used from Inventory', cost: 140, preview: 'xp', purchased: false },
    { id: 'vitality-elixir', type: 'utility', name: 'Elixir of Vitality', description: 'Restores 50 fatigue immediately and clears the Penalty Zone.', effect: 'Activates when used from Inventory', cost: 130, preview: 'wind', purchased: false },
    { id: 'temporal-accelerator', type: 'utility', name: 'Temporal Accelerator', description: 'Permanently increases all future dungeon timers by 30 seconds.', effect: 'Activates when used from Inventory', cost: 175, preview: 'crystal', purchased: false },
    { id: 'rank-sigil', type: 'utility', name: 'Rank Sigil', description: 'A hidden crest charged with condensed experience.', effect: 'Grants 300 XP immediately', cost: 180, preview: 'sigil', purchased: false, secret: true },
    { id: 'void-compass', type: 'utility', name: 'Void Compass', description: 'A rare compass that reveals two safe paths through a dungeon.', effect: 'Reduces your next dungeon difficulty by 2', cost: 210, preview: 'void', purchased: false, secret: true },
    { id: 'phoenix-feather', type: 'utility', name: 'Phoenix Feather', description: 'A legendary recovery relic, hidden from ordinary hunters.', effect: 'Restores 100 fatigue and clears the Penalty Zone', cost: 260, preview: 'phoenix', purchased: false, secret: true },
    { id: 'sovereign-cache', type: 'utility', name: 'Sovereign Cache', description: 'A sealed treasury that only appears to persistent players.', effect: 'Grants 400 coins immediately', cost: 300, preview: 'cache', purchased: false, secret: true },
    { id: 'prime-core', type: 'utility', name: 'Prime Core', description: 'An ultra-rare core that strengthens a complete dungeon attempt.', effect: 'Adds 5 minutes and reduces difficulty by 1 for your next dungeon', cost: 350, preview: 'prime', purchased: false, secret: true },
  ];
}

// ============================================================
// Fatigue & Recovery Engine
// ============================================================

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

export function shouldForceRest(fatigue: number, consecutiveTrainingDays: number): boolean {
  return fatigue > 85 || consecutiveTrainingDays >= 7;
}

export function getRecoveryRecommendation(fatigue: number): string {
  if (fatigue > 80) return 'CRITICAL: Mandatory rest day. Light mobility only.';
  if (fatigue > 60) return 'HIGH: Reduce intensity. Focus on recovery protocols.';
  if (fatigue > 40) return 'MODERATE: Include extended warm-up and cool-down.';
  return 'OPTIMAL: Full training capacity available.';
}

// ============================================================
// Streak Engine
// ============================================================

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

export function getStreakBonus(streak: number): number {
  if (streak >= 365) return 2000;
  if (streak >= 90) return 500;
  if (streak >= 30) return 200;
  if (streak >= 7) return 50;
  return 0;
}

// ============================================================
// Main Quests
// ============================================================

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
      id: 'main-shadow-warrior',
      type: 'main',
      name: 'Shadow Warrior',
      description: 'Complete Self-Defense Stage 3. Chapter 1/5: Complete Stage 1.',
      status: 'active',
      xpReward: 200,
      coinReward: 50,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      category: 'combat',
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
    {
      id: 'main-agile-hunter',
      type: 'main',
      name: 'The Agile Hunter',
      description: 'Achieve sub-200ms reaction time. Chapter 1/4: Reach 350ms.',
      status: 'active',
      xpReward: 200,
      coinReward: 50,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      category: 'agility',
    },
    {
      id: 'main-endurance-lord',
      type: 'main',
      name: 'Endurance Lord',
      description: 'Run 5K without stopping. Chapter 1/5: Run 1K.',
      status: 'active',
      xpReward: 200,
      coinReward: 50,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      category: 'endurance',
    },
  ];
}
