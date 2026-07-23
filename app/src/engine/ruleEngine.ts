// ============================================================
// SYSTEM — Rule-Based AI Engine
// Processes game state and triggers responses
// ============================================================

import type { PlayerProfile, PlayerStat, Quest, GameState, Notification } from '@/types';
import { calculateFatigue } from './gameEngine';

function buildRecoveryQuest(profile: PlayerProfile): Quest {
  const now = new Date();
  return {
    id: `recovery-${Date.now()}`,
    type: 'recovery',
    name: 'SYSTEM Recovery Protocol',
    description: `Rest, hydrate, and perform 10 minutes of gentle mobility work. Fatigue: ${profile.fatigue ?? 0}%.`,
    status: 'active',
    xpReward: 30,
    coinReward: 10,
    createdAt: now,
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    category: 'recovery',
    isSystemQuest: true,
    canReduceXP: false,
    estimatedMinutes: 10,
  };
}

export interface RuleEngineInput {
  profile: PlayerProfile;
  stats: PlayerStat[];
  quests: Quest[];
  gameState: GameState;
  consecutiveTrainingDays: number;
  sleepQuality: number;
  restDays: number;
  pornRelapseToday: boolean;
  screenTimeOverLimitDays: number;
  newPRToday: boolean;
}

export interface RuleEngineOutput {
  notifications: Notification[];
  newQuests: Quest[];
  profileUpdates: Partial<PlayerProfile>;
  penaltyZone: boolean;
  systemMessage: string | null;
  forceRestDay: boolean;
  evalDueSoon: boolean;
}

export function processRules(input: RuleEngineInput): RuleEngineOutput {
  const notifications: Notification[] = [];
  const newQuests: Quest[] = [];
  const profileUpdates: Partial<PlayerProfile> = {};
  let penaltyZone = input.gameState.penaltyZone;
  let systemMessage: string | null = null;
  let forceRestDay = false;
  let evalDueSoon = false;

  const { profile, quests, consecutiveTrainingDays, sleepQuality, restDays, pornRelapseToday, screenTimeOverLimitDays, newPRToday } = input;

  // 1. Fatigue Analysis & Debuff System
  const fatigue = calculateFatigue(consecutiveTrainingDays, sleepQuality, restDays, quests.filter(q => q.status === 'failed').length);
  profileUpdates.fatigue = fatigue;

  if (fatigue > 80) {
    notifications.push({
      id: `notif-fatigue-${Date.now()}`,
      type: 'warning',
      title: 'SYSTEM: Heavy Fatigue Penalty',
      message: `Fatigue at ${fatigue}%. Active XP earnings reduced by 20%. Complete Recovery Protocol immediately.`,
      timestamp: new Date(),
      read: false,
      autoDismiss: false,
    });
    newQuests.push(buildRecoveryQuest(profile));
    systemMessage = 'SYSTEM: Heavy Fatigue detected. XP debuff active until Recovery Protocol is complete.';
  } else if (fatigue > 60) {
    notifications.push({
      id: `notif-fatigue-${Date.now()}`,
      type: 'warning',
      title: 'SYSTEM: Moderate Fatigue Detected',
      message: `Fatigue at ${fatigue}%. Recovery Quest generated.`,
      timestamp: new Date(),
      read: false,
      autoDismiss: true,
    });
    newQuests.push(buildRecoveryQuest(profile));
  }

  // 2. Overtraining & Mandatory Rest Protocol
  if (fatigue > 85 || consecutiveTrainingDays >= 7) {
    forceRestDay = true;
    notifications.push({
      id: `notif-rest-${Date.now()}`,
      type: 'danger',
      title: 'SYSTEM: Mandatory Rest Protocol',
      message: 'Overtraining threshhold exceeded. Rest is required to preserve muscle integrity.',
      timestamp: new Date(),
      read: false,
      autoDismiss: false,
    });
    systemMessage = 'SYSTEM: Overtraining protocol activated. Mandatory rest day engaged.';
  }

  // 3. Missed Quests & Penalty Zone Enforcement
  const missedQuests = quests.filter(q => q.status === 'failed');
  if (missedQuests.length >= 3) {
    penaltyZone = true;
    const missedXP = missedQuests.reduce((sum, q) => sum + (q.penaltyXP || Math.round(q.xpReward * 0.5)), 0);
    profileUpdates.totalXP = Math.max(0, profile.totalXP - missedXP);
    notifications.push({
      id: `notif-penalty-${Date.now()}`,
      type: 'danger',
      title: 'SYSTEM: Penalty Zone Activated',
      message: `3 quests missed. -${missedXP} XP. Streak reset. Penalty Zone activated.`,
      timestamp: new Date(),
      read: false,
      autoDismiss: false,
    });
    systemMessage = 'SYSTEM: Penalty Zone activated due to missed quests. Resolve immediately.';
  }

  // 4. Relapse Recovery & Mental Re-anchor
  if (pornRelapseToday) {
    newQuests.push(buildRecoveryQuest(profile));
    notifications.push({
      id: `notif-relapse-${Date.now()}`,
      type: 'warning',
      title: 'SYSTEM: Mental Recovery Protocol',
      message: 'Relapse registered. Compassion Protocol engaged. Re-anchor your focus and continue.',
      timestamp: new Date(),
      read: false,
      autoDismiss: true,
    });
    systemMessage = 'SYSTEM: Compassion Recovery active. Focus on today\'s training.';
  }

  // 5. Screen Time Limit Violations
  if (screenTimeOverLimitDays >= 3) {
    notifications.push({
      id: `notif-screen-${Date.now()}`,
      type: 'warning',
      title: 'SYSTEM: Digital Over-consumption',
      message: `Screen time exceeded limit ${screenTimeOverLimitDays} consecutive days. Focus debuff applied.`,
      timestamp: new Date(),
      read: false,
      autoDismiss: true,
    });
    if (screenTimeOverLimitDays >= 5) {
      penaltyZone = true;
      systemMessage = 'SYSTEM: Persistent screen time violation. Penalty Zone activated.';
    }
  }

  // 6. Personal Record Milestone Rewards
  if (newPRToday) {
    profileUpdates.totalXP = (profile.totalXP || 0) + 100;
    profileUpdates.coins = (profile.coins || 0) + 25;
    notifications.push({
      id: `notif-pr-${Date.now()}`,
      type: 'success',
      title: 'SYSTEM: Personal Record Achieved!',
      message: 'New PR registered! +100 XP and +25 Coins awarded.',
      timestamp: new Date(),
      read: false,
      autoDismiss: true,
    });
    systemMessage = 'SYSTEM: Personal Record confirmed. Player power ceiling increased.';
  }

  // 7. Streak Milestones & Adaptive Escalation
  if (profile.streak > 0 && profile.streak % 7 === 0) {
    const streakBonusXP = profile.streak * 10;
    profileUpdates.totalXP = (profileUpdates.totalXP ?? profile.totalXP) + streakBonusXP;
    notifications.push({
      id: `notif-streak-${Date.now()}`,
      type: 'success',
      title: `SYSTEM: ${profile.streak}-Day Streak Milestone`,
      message: `${profile.streak}-day streak maintained! +${streakBonusXP} Bonus XP awarded.`,
      timestamp: new Date(),
      read: false,
      autoDismiss: true,
    });
  }

  // 8. Evaluation Approaching Warning
  if (profile.nextEvaluationDate) {
    const evalDate = new Date(profile.nextEvaluationDate);
    const daysUntil = Math.ceil((evalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 3 && daysUntil > 0) {
      evalDueSoon = true;
      notifications.push({
        id: `notif-eval-${Date.now()}`,
        type: 'info',
        title: 'SYSTEM: Rank Evaluation Approaching',
        message: `Rank Promotion Trial scheduled in ${daysUntil} days. Prepare your training.`,
        timestamp: new Date(),
        read: false,
        autoDismiss: true,
      });
    }
  }

  // 9. Absence / Return Handling
  const lastLogin = profile.lastLoginDate;
  if (lastLogin) {
    const daysIdle = Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24));
    if (daysIdle >= 3) {
      notifications.push({
        id: `notif-idle-${Date.now()}`,
        type: 'info',
        title: 'SYSTEM: Operator Return Detected',
        message: `Player returned after ${daysIdle} days of absence. Welcome back. Re-engaging Operating Core.`,
        timestamp: new Date(),
        read: false,
        autoDismiss: true,
      });
      systemMessage = 'SYSTEM: Welcome back, Player. Operating Core re-synchronized.';
    }
  }

  return {
    notifications,
    newQuests,
    profileUpdates,
    penaltyZone,
    systemMessage,
    forceRestDay,
    evalDueSoon,
  };
}
