// ============================================================
// SYSTEM — IndexedDB Layer (Dexie.js)
// ============================================================

import Dexie, { type Table } from 'dexie';
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
} from '@/types';

export class SystemDatabase extends Dexie {
  profile!: Table<PlayerProfile>;
  stats!: Table<PlayerStat>;
  quests!: Table<Quest>;
  workouts!: Table<WorkoutLog>;
  achievements!: Table<Achievement>;
  titles!: Table<Title>;
  inventory!: Table<InventoryItem>;
  history!: Table<HistoryEntry>;
  settings!: Table<SystemSettings>;
  dungeons!: Table<Dungeon>;
  evaluations!: Table<EvaluationResult>;

  constructor() {
    super('SystemDB');
    this.version(1).stores({
      profile: 'id',
      stats: 'name',
      quests: 'id, type, status, category, createdAt',
      workouts: 'id, date, path',
      achievements: 'id, tier, unlocked',
      titles: 'id, equipped, unlocked',
      inventory: 'id, type, equipped',
      history: 'id, date, type',
      settings: '++id',
      dungeons: 'id, type, status, difficulty',
      evaluations: 'id, date, rank, passed',
    });
  }
}

export const db = new SystemDatabase();

// ============================================================
// Database Operations
// ============================================================

export async function getProfile(): Promise<PlayerProfile | undefined> {
  return await db.profile.get('player');
}

export async function saveProfile(profile: PlayerProfile): Promise<void> {
  await db.profile.put(profile);
}

export async function getStats(): Promise<PlayerStat[]> {
  return await db.stats.toArray();
}

export async function saveStat(stat: PlayerStat): Promise<void> {
  await db.stats.put(stat);
}

export async function saveStats(stats: PlayerStat[]): Promise<void> {
  await db.stats.bulkPut(stats);
}

export async function getQuests(type?: string): Promise<Quest[]> {
  if (type) {
    return await db.quests.where('type').equals(type).toArray();
  }
  return await db.quests.toArray();
}

export async function getActiveQuests(): Promise<Quest[]> {
  return await db.quests.where('status').equals('active').toArray();
}

export async function saveQuest(quest: Quest): Promise<void> {
  await db.quests.put(quest);
}

export async function saveQuests(quests: Quest[]): Promise<void> {
  await db.quests.bulkPut(quests);
}

export async function deleteQuest(id: string): Promise<void> {
  await db.quests.delete(id);
}

export async function getWorkouts(limit = 50): Promise<WorkoutLog[]> {
  return await db.workouts.orderBy('date').reverse().limit(limit).toArray();
}

export async function saveWorkout(workout: WorkoutLog): Promise<void> {
  await db.workouts.put(workout);
}

export async function getAchievements(): Promise<Achievement[]> {
  return await db.achievements.toArray();
}

export async function saveAchievement(achievement: Achievement): Promise<void> {
  await db.achievements.put(achievement);
}

export async function saveAchievements(achievements: Achievement[]): Promise<void> {
  await db.achievements.bulkPut(achievements);
}

export async function getTitles(): Promise<Title[]> {
  return await db.titles.toArray();
}

export async function saveTitle(title: Title): Promise<void> {
  await db.titles.put(title);
}

export async function saveTitles(titles: Title[]): Promise<void> {
  await db.titles.bulkPut(titles);
}

export async function getInventory(): Promise<InventoryItem[]> {
  return await db.inventory.toArray();
}

export async function saveInventoryItem(item: InventoryItem): Promise<void> {
  await db.inventory.put(item);
}

export async function getHistory(limit = 100): Promise<HistoryEntry[]> {
  return await db.history.orderBy('date').reverse().limit(limit).toArray();
}

export async function addHistoryEntry(entry: HistoryEntry): Promise<void> {
  await db.history.put(entry);
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  await db.history.delete(id);
}

export async function getSettings(): Promise<SystemSettings | undefined> {
  const all = await db.settings.toArray();
  return all[0];
}

export async function saveSettings(settings: SystemSettings): Promise<void> {
  const existing = await db.settings.toArray();
  if (existing.length > 0) {
    await db.settings.clear();
  }
  await db.settings.add(settings as any);
}

export async function getDungeons(): Promise<Dungeon[]> {
  return await db.dungeons.toArray();
}

export async function saveDungeon(dungeon: Dungeon): Promise<void> {
  await db.dungeons.put(dungeon);
}

export async function saveDungeons(dungeons: Dungeon[]): Promise<void> {
  await db.dungeons.bulkPut(dungeons);
}

export async function getEvaluations(): Promise<EvaluationResult[]> {
  return await db.evaluations.orderBy('date').reverse().toArray();
}

export async function saveEvaluation(evalResult: EvaluationResult): Promise<void> {
  await db.evaluations.put(evalResult);
}

// Bulk export all data
export async function exportAllData() {
  const [profile, stats, quests, workouts, achievements, titles, inventory, history, settings, dungeons, evaluations] =
    await Promise.all([
      db.profile.toArray(),
      db.stats.toArray(),
      db.quests.toArray(),
      db.workouts.toArray(),
      db.achievements.toArray(),
      db.titles.toArray(),
      db.inventory.toArray(),
      db.history.toArray(),
      db.settings.toArray(),
      db.dungeons.toArray(),
      db.evaluations.toArray(),
    ]);

  return {
    version: '3.0.0',
    exportedAt: new Date().toISOString(),
    profile: profile[0] || null,
    stats,
    quests,
    workouts,
    achievements,
    titles,
    inventory,
    history,
    settings: settings[0] || null,
    dungeons,
    evaluations,
  };
}

// Bulk import all data
export async function importAllData(data: Record<string, unknown>): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.profile,
      db.stats,
      db.quests,
      db.workouts,
      db.achievements,
      db.titles,
      db.inventory,
      db.history,
      db.settings,
      db.dungeons,
      db.evaluations,
    ],
    async () => {
      if (data.profile) await db.profile.put(data.profile as PlayerProfile);
      if (data.stats && Array.isArray(data.stats)) await db.stats.bulkPut(data.stats as PlayerStat[]);
      if (data.quests && Array.isArray(data.quests)) await db.quests.bulkPut(data.quests as Quest[]);
      if (data.workouts && Array.isArray(data.workouts)) await db.workouts.bulkPut(data.workouts as WorkoutLog[]);
      if (data.achievements && Array.isArray(data.achievements)) await db.achievements.bulkPut(data.achievements as Achievement[]);
      if (data.titles && Array.isArray(data.titles)) await db.titles.bulkPut(data.titles as Title[]);
      if (data.inventory && Array.isArray(data.inventory)) await db.inventory.bulkPut(data.inventory as InventoryItem[]);
      if (data.history && Array.isArray(data.history)) await db.history.bulkPut(data.history as HistoryEntry[]);
      if (data.settings) await db.settings.put(data.settings as SystemSettings);
      if (data.dungeons && Array.isArray(data.dungeons)) await db.dungeons.bulkPut(data.dungeons as Dungeon[]);
      if (data.evaluations && Array.isArray(data.evaluations)) await db.evaluations.bulkPut(data.evaluations as EvaluationResult[]);
    }
  );
}

// Reset all data
export async function resetAllData(): Promise<void> {
  await db.delete();
  window.location.reload();
}
