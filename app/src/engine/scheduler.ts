export type ScheduleType = 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'challenge';

export interface ScheduleConfig {
  id: string;
  name: string;
  type: ScheduleType;
  intervalDays: number;
  activeDurationHours: number;
  penaltyEnabled: boolean;
  weekendOnly: boolean;
}

export const SCHEDULE_CONFIGS: Record<string, ScheduleConfig> = {
  'weekly-boss-dungeon': {
    id: 'weekly-boss-dungeon',
    name: 'Weekly Boss Dungeon',
    type: 'weekly',
    intervalDays: 7,
    activeDurationHours: 24,
    penaltyEnabled: true,
    weekendOnly: true,
  },
  // Future extensible schedules
  'daily-quests': {
    id: 'daily-quests',
    name: 'Daily Quests',
    type: 'daily',
    intervalDays: 1,
    activeDurationHours: 24,
    penaltyEnabled: false,
    weekendOnly: false,
  },
  'monthly-rank-evaluation': {
    id: 'monthly-rank-evaluation',
    name: 'Monthly Rank Evaluation',
    type: 'monthly',
    intervalDays: 30,
    activeDurationHours: 48,
    penaltyEnabled: true,
    weekendOnly: false,
  },
};

export interface ScheduleInput {
  lastOccurrence?: Date;
  nextOccurrence: Date;
  status: 'locked' | 'available' | 'completed' | 'expired';
}

export interface ScheduleResult {
  nextOccurrence: Date;
  lastOccurrence?: Date;
  status: 'locked' | 'available' | 'completed' | 'expired';
  didUnlock: boolean;
  didExpire: boolean;
  expiryDate?: Date;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

export function evaluateSchedule(
  config: ScheduleConfig,
  state: ScheduleInput,
  now: Date
): ScheduleResult {
  const result: ScheduleResult = {
    nextOccurrence: new Date(state.nextOccurrence),
    lastOccurrence: state.lastOccurrence ? new Date(state.lastOccurrence) : undefined,
    status: state.status,
    didUnlock: false,
    didExpire: false,
  };

  const isScheduled = now.getTime() >= result.nextOccurrence.getTime();
  const satisfiesWeekend = !config.weekendOnly || isWeekend(now);

  // 1. If currently locked (or completed/expired from last time), check if scheduled AND weekend condition is met
  if (result.status !== 'available') {
    if (isScheduled && satisfiesWeekend) {
      result.status = 'available';
      result.didUnlock = true;
    }
  }

  // 2. If available, check if the 24 hours window has elapsed since it was scheduled to start.
  if (result.status === 'available') {
    const expiryTime = new Date(result.nextOccurrence.getTime() + config.activeDurationHours * 60 * 60 * 1000);
    if (now.getTime() >= expiryTime.getTime()) {
      result.status = 'expired';
      result.didExpire = true;
      result.expiryDate = expiryTime;
      result.lastOccurrence = expiryTime;
      // Schedule the next occurrence exactly 7 days after the expiration date
      result.nextOccurrence = new Date(expiryTime.getTime() + config.intervalDays * 24 * 60 * 60 * 1000);
    }
  }

  return result;
}

export function getNextScheduleOnComplete(
  config: ScheduleConfig,
  now: Date
): {
  nextOccurrence: Date;
  lastOccurrence: Date;
  status: 'completed';
} {
  return {
    lastOccurrence: now,
    nextOccurrence: new Date(now.getTime() + config.intervalDays * 24 * 60 * 60 * 1000),
    status: 'completed',
  };
}
