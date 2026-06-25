import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { EXERCISES } from '@/data/exercises';
import { buildFoodDatabase } from '@/data/foods';
import {
  FoodAnalysis,
  FoodItem,
  MealType,
  NutritionEntry,
  PersonalRecord,
  SetRow,
  WorkoutRow,
} from '@/lib/types';

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) db = SQLite.openDatabaseSync('gym.db');
  return db;
}

export async function initDatabase(): Promise<void> {
  const d = getDb();
  // WAL ускоряет запись на нативе. В вебе (OPFS-бэкенд wa-sqlite) WAL не поддерживается — пропускаем.
  if (Platform.OS !== 'web') {
    await d.execAsync('PRAGMA journal_mode = WAL;').catch(() => {});
  }
  await d.execAsync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      equipment TEXT NOT NULL,
      is_compound INTEGER NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      name TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'program',
      program_day INTEGER,
      started_at TEXT NOT NULL,
      finished_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      exercise_id TEXT NOT NULL,
      set_index INTEGER NOT NULL,
      weight REAL NOT NULL DEFAULT 0,
      reps INTEGER NOT NULL DEFAULT 0,
      target_reps TEXT,
      done INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_sets_workout ON sets(workout_id);
    CREATE INDEX IF NOT EXISTS idx_sets_exercise ON sets(exercise_id);

    CREATE TABLE IF NOT EXISTS user_progress (
      exercise_id TEXT PRIMARY KEY,
      best_weight REAL NOT NULL DEFAULT 0,
      best_reps INTEGER NOT NULL DEFAULT 0,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS nutrition_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      dish TEXT NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      fat REAL NOT NULL,
      carbs REAL NOT NULL,
      fiber REAL NOT NULL DEFAULT 0,
      portion_g REAL NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'manual',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_nutrition_date ON nutrition_log(date);

    CREATE TABLE IF NOT EXISTS food_database (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      fat REAL NOT NULL,
      carbs REAL NOT NULL,
      fiber REAL NOT NULL DEFAULT 0
    );
  `);

  // Сидируем упражнения (идемпотентно — заменяем по id)
  const exCount = await d.getFirstAsync<{ c: number }>('SELECT COUNT(*) c FROM exercises');
  if (!exCount || exCount.c < EXERCISES.length) {
    await d.withTransactionAsync(async () => {
      for (const e of EXERCISES) {
        await d.runAsync(
          'INSERT OR REPLACE INTO exercises (id, name, muscle_group, equipment, is_compound, description) VALUES (?,?,?,?,?,?)',
          e.id, e.name, e.muscleGroup, e.equipment, e.isCompound ? 1 : 0, e.description
        );
      }
    });
  }

  // Сидируем базу продуктов один раз
  const foodCount = await d.getFirstAsync<{ c: number }>('SELECT COUNT(*) c FROM food_database');
  if (!foodCount || foodCount.c === 0) {
    const foods = buildFoodDatabase();
    await d.withTransactionAsync(async () => {
      for (const f of foods) {
        await d.runAsync(
          'INSERT INTO food_database (name, category, calories, protein, fat, carbs, fiber) VALUES (?,?,?,?,?,?,?)',
          f.name, f.category, f.calories, f.protein, f.fat, f.carbs, f.fiber
        );
      }
    });
  }
}

// ===================== Тренировки =====================

export async function startWorkout(
  name: string,
  mode: 'program' | 'free',
  programDay: number | null
): Promise<number> {
  const d = getDb();
  const now = new Date();
  const res = await d.runAsync(
    'INSERT INTO workouts (date, name, mode, program_day, started_at) VALUES (?,?,?,?,?)',
    toDateStr(now), name, mode, programDay, now.toISOString()
  );
  return res.lastInsertRowId;
}

export async function finishWorkout(workoutId: number): Promise<void> {
  const d = getDb();
  await d.runAsync('UPDATE workouts SET finished_at = ? WHERE id = ?', new Date().toISOString(), workoutId);
  await d.runAsync('DELETE FROM sets WHERE workout_id = ? AND done = 0', workoutId);
  // Обновляем личные рекорды по выполненным подходам
  const sets = await d.getAllAsync<SetRow>('SELECT * FROM sets WHERE workout_id = ? AND done = 1', workoutId);
  for (const s of sets) {
    const pr = await d.getFirstAsync<{ best_weight: number }>(
      'SELECT best_weight FROM user_progress WHERE exercise_id = ?', s.exercise_id
    );
    if (!pr || s.weight > pr.best_weight) {
      await d.runAsync(
        'INSERT OR REPLACE INTO user_progress (exercise_id, best_weight, best_reps, date) VALUES (?,?,?,?)',
        s.exercise_id, s.weight, s.reps, toDateStr(new Date())
      );
    }
  }
}

export async function deleteWorkout(workoutId: number): Promise<void> {
  await getDb().runAsync('DELETE FROM workouts WHERE id = ?', workoutId);
}

export async function addSet(
  workoutId: number,
  exerciseId: string,
  setIndex: number,
  weight: number,
  reps: number,
  targetReps: string | null
): Promise<number> {
  const res = await getDb().runAsync(
    'INSERT INTO sets (workout_id, exercise_id, set_index, weight, reps, target_reps, done) VALUES (?,?,?,?,?,?,0)',
    workoutId, exerciseId, setIndex, weight, reps, targetReps
  );
  return res.lastInsertRowId;
}

export async function updateSet(setId: number, weight: number, reps: number, done: boolean): Promise<void> {
  await getDb().runAsync('UPDATE sets SET weight = ?, reps = ?, done = ? WHERE id = ?', weight, reps, done ? 1 : 0, setId);
}

export async function deleteSet(setId: number): Promise<void> {
  await getDb().runAsync('DELETE FROM sets WHERE id = ?', setId);
}

export async function getWorkouts(limit = 60): Promise<WorkoutRow[]> {
  return getDb().getAllAsync<WorkoutRow>(
    'SELECT * FROM workouts WHERE finished_at IS NOT NULL ORDER BY started_at DESC LIMIT ?', limit
  );
}

export async function getWorkoutSets(workoutId: number): Promise<SetRow[]> {
  return getDb().getAllAsync<SetRow>(
    'SELECT * FROM sets WHERE workout_id = ? ORDER BY exercise_id, set_index', workoutId
  );
}

export async function getLastWorkoutDate(): Promise<string | null> {
  const row = await getDb().getFirstAsync<{ date: string }>(
    'SELECT date FROM workouts WHERE finished_at IS NOT NULL ORDER BY date DESC LIMIT 1'
  );
  return row?.date ?? null;
}

export async function getWorkoutDates(sinceDays = 90): Promise<string[]> {
  const since = toDateStr(new Date(Date.now() - sinceDays * 86400_000));
  const rows = await getDb().getAllAsync<{ date: string }>(
    'SELECT DISTINCT date FROM workouts WHERE finished_at IS NOT NULL AND date >= ? ORDER BY date DESC', since
  );
  return rows.map((r) => r.date);
}

/** Количество завершённых тренировок программы — для определения следующего дня цикла */
export async function getProgramWorkoutCount(): Promise<number> {
  const row = await getDb().getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) c FROM workouts WHERE mode = 'program' AND finished_at IS NOT NULL"
  );
  return row?.c ?? 0;
}

/** Последний результат по упражнению: лучший рабочий вес последней тренировки */
export async function getLastResult(
  exerciseId: string
): Promise<{ weight: number; reps: number; date: string; allTargetMet: boolean } | null> {
  const d = getDb();
  const last = await d.getFirstAsync<{ workout_id: number; date: string }>(
    `SELECT s.workout_id, w.date FROM sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.exercise_id = ? AND s.done = 1 AND w.finished_at IS NOT NULL
     ORDER BY w.started_at DESC LIMIT 1`, exerciseId
  );
  if (!last) return null;
  const sets = await d.getAllAsync<SetRow>(
    'SELECT * FROM sets WHERE workout_id = ? AND exercise_id = ? AND done = 1', last.workout_id, exerciseId
  );
  if (sets.length === 0) return null;
  const top = sets.reduce((a, b) => (b.weight > a.weight ? b : a));
  const allTargetMet = sets.every((s) => {
    const target = parseTargetReps(s.target_reps);
    return target == null || s.reps >= target;
  });
  return { weight: top.weight, reps: top.reps, date: last.date, allTargetMet };
}

export function parseTargetReps(target: string | null): number | null {
  if (!target) return null;
  const m = target.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

export async function getExerciseHistory(
  exerciseId: string,
  limit = 30
): Promise<{ date: string; weight: number; reps: number }[]> {
  return getDb().getAllAsync(
    `SELECT w.date, MAX(s.weight) weight, MAX(s.reps) reps FROM sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.exercise_id = ? AND s.done = 1 AND w.finished_at IS NOT NULL
     GROUP BY w.id ORDER BY w.started_at ASC LIMIT ?`, exerciseId, limit
  );
}

export async function getPersonalRecords(): Promise<PersonalRecord[]> {
  return getDb().getAllAsync<PersonalRecord>(
    'SELECT exercise_id, best_weight weight, best_reps reps, date FROM user_progress ORDER BY best_weight DESC'
  );
}

// ===================== Питание =====================

export async function addNutritionEntry(
  date: string,
  mealType: MealType,
  food: FoodAnalysis,
  source: NutritionEntry['source']
): Promise<number> {
  const res = await getDb().runAsync(
    `INSERT INTO nutrition_log (date, meal_type, dish, calories, protein, fat, carbs, fiber, portion_g, source)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    date, mealType, food.dish, food.calories, food.protein, food.fat, food.carbs, food.fiber, food.portion_g, source
  );
  return res.lastInsertRowId;
}

export async function deleteNutritionEntry(id: number): Promise<void> {
  await getDb().runAsync('DELETE FROM nutrition_log WHERE id = ?', id);
}

export async function getNutritionByDate(date: string): Promise<NutritionEntry[]> {
  return getDb().getAllAsync<NutritionEntry>(
    'SELECT * FROM nutrition_log WHERE date = ? ORDER BY created_at ASC', date
  );
}

export interface DayTotals {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

export async function getNutritionTotals(fromDate: string, toDate: string): Promise<DayTotals[]> {
  return getDb().getAllAsync<DayTotals>(
    `SELECT date, SUM(calories) calories, SUM(protein) protein, SUM(fat) fat, SUM(carbs) carbs, SUM(fiber) fiber
     FROM nutrition_log WHERE date >= ? AND date <= ? GROUP BY date ORDER BY date ASC`,
    fromDate, toDate
  );
}

export async function searchFood(query: string, limit = 40): Promise<FoodItem[]> {
  const q = `%${query.trim()}%`;
  return getDb().getAllAsync<FoodItem>(
    'SELECT * FROM food_database WHERE name LIKE ? COLLATE NOCASE ORDER BY LENGTH(name) ASC LIMIT ?', q, limit
  );
}

// ===================== Утилиты =====================

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

/** Streak: число подряд идущих недель (включая текущую), в которых была хотя бы одна тренировка */
export async function getStreakWeeks(): Promise<number> {
  const dates = await getWorkoutDates(365);
  if (dates.length === 0) return 0;
  const weekKey = (s: string) => {
    const d = new Date(s + 'T12:00:00');
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return toDateStr(monday);
  };
  const weeks = new Set(dates.map(weekKey));
  let streak = 0;
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));
  // текущая неделя может быть ещё без тренировки — не обнуляем streak из-за неё
  if (!weeks.has(toDateStr(cursor))) cursor.setDate(cursor.getDate() - 7);
  while (weeks.has(toDateStr(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}
