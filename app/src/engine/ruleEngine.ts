// ============================================================
// SYSTEM — Rule-Based AI Engine
// Processes game state and triggers responses
// ============================================================

import type { PlayerProfile, PlayerStat, Quest, GameState, Notification } from '@/types';
import { generateRecoveryQuest, calculateFatigue } from './gameEngine';

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

  // 1. Fatigue check
  const fatigue = calculateFatigue(consecutiveTrainingDays, sleepQuality, restDays, quests.filter(q => q.status === 'failed').length);
  profileUpdates.fatigue = fatigue;

  if (fatigue > 70) {
    notifications.push({
      id: `notif-fatigue-${Date.now()}`,
      type: 'warning',
      title: 'SYSTEM: Fatigue Detected',
      message: `Player fatigue at ${fatigue}%. Recovery Quest generated.`,
      timestamp: new Date(),
      read: false,
      autoDismiss: true,
    });
    newQuests.push(generateRecoveryQuest(profile));
    systemMessage = 'SYSTEM: Player fatigue detected. Recovery Quest generated.';
  }

  // 2. Overtraining check
  if (fatigue > 85 || consecutiveTrainingDays >= 7) {
    forceRestDay = true;
    notifications.push({
      id: `notif-rest-${Date.now()}`,
      type: 'danger',
      title: 'SYSTEM: Mandatory Rest Day',
      message: 'Overtraining detected. Rest is required for progression.',
      timestamp: new Date(),
      read: false,
      autoDismiss: false,
    });
    systemMessage = 'SYSTEM: Overtraining protocol activated. Mandatory rest day.';
  }

  // 3. Missed quests check
  const missedQuests = quests.filter(q => q.status === 'failed');
  if (missedQuests.length >= 3) {
    penaltyZone = true;
    const missedXP = missedQuests.reduce((sum, q) => sum + (q.penaltyXP || q.xpReward * 0.5), 0);
    profileUpdates.totalXP = Math.max(0, profile.totalXP - missedXP);
    notifications.push({
      id: `notif-penalty-${Date.now()}`,
      type: 'danger',
      title: 'SYSTEM: Penalty Zone Activated',
      message: `3 quests missed. -${missedXP} XP. Streak reset. Discipline penalty applied.`,
      timestamp: new Date(),
      read: false,
      autoDismiss: false,
    });
    systemMessage = 'SYSTEM: Penalty Zone activated. Complete Recovery Quest to exit.';
  }

  // 4. Porn relapse handling (compassionate)
  if (pornRelapseToday) {
    newQuests.push(generateRecoveryQuest(profile));
    notifications.push({
      id: `notif-relapse-${Date.now()}`,
      type: 'warning',
      title: 'SYSTEM: Recovery Protocol',
      message: 'Compassion Recovery Quest generated. Progress is not linear. Continue training.',
      timestamp: new Date(),
      read: false,
      autoDismiss: true,
    });
    systemMessage = 'SYSTEM: Compassion Recovery activated. Your progress is still valid.';
  }

  // 5. Screen time warnings
  if (screenTimeOverLimitDays >= 3) {
    notifications.push({
      id: `notif-screen-${Date.now()}`,
      type: 'warning',
      title: 'SYSTEM: Screen Time Alert',
      message: `Screen time limit exceeded ${screenTimeOverLimitDays} consecutive days. Discipline penalty applied.`,
      timestamp: new Date(),
      read: false,
      autoDismiss: true,
    });
    if (screenTimeOverLimitDays >= 5) {
      penaltyZone = true;
      systemMessage = 'SYSTEM: Escalating screen time warning. Penalty Zone activated.';
    }
  }

  // 6. New PR celebration
  if (newPRToday) {
    notifications.push({
      id: `notif-pr-${Date.now()}`,
      type: 'success',
      title: 'SYSTEM: Personal Record!',
      message: 'New PR achieved! +100 XP bonus awarded.',
      timestamp: new Date(),
      read: false,
      autoDismiss: true,
    });
    systemMessage = 'SYSTEM: Personal Record achieved. Player has become stronger.';
  }

  // 7. Streak milestone
  if (profile.streak > 0 && profile.streak % 7 === 0) {
    notifications.push({
      id: `notif-streak-${Date.now()}`,
      type: 'success',
      title: `SYSTEM: ${profile.streak}-Day Milestone`,
      message: `${profile.streak}-day streak maintained! Bonus XP awarded.`,
      timestamp: new Date(),
      read: false,
      autoDismiss: true,
    });
  }

  // 8. Evaluation reminder
  if (profile.nextEvaluationDate) {
    const evalDate = new Date(profile.nextEvaluationDate);
    const daysUntil = Math.ceil((evalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 3 && daysUntil > 0) {
      evalDueSoon = true;
      notifications.push({
        id: `notif-eval-${Date.now()}`,
        type: 'info',
        title: 'SYSTEM: Evaluation Approaching',
        message: `Rank Evaluation in ${daysUntil} days. Prepare accordingly.`,
        timestamp: new Date(),
        read: false,
        autoDismiss: true,
      });
    }
  }

  // 9. Idle reminder (3+ days)
  const lastLogin = profile.lastLoginDate;
  if (lastLogin) {
    const daysIdle = Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24));
    if (daysIdle >= 3) {
      notifications.push({
        id: `notif-idle-${Date.now()}`,
        type: 'info',
        title: 'SYSTEM: Return Detected',
        message: `Player has been absent ${daysIdle} days. Welcome back. Progress awaits.`,
        timestamp: new Date(),
        read: false,
        autoDismiss: true,
      });
      systemMessage = 'SYSTEM: Welcome back, Player. Your journey continues.';
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
