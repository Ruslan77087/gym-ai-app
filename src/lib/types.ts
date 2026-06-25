export type Goal = 'mass' | 'cut' | 'strength' | 'fitness';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Sex = 'male' | 'female';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'fullbody';

export interface UserProfile {
  onboardingDone: boolean;
  goal: Goal;
  level: Level;
  /** Дни недели тренировок: 0 = Вс … 6 = Сб (как в JS Date.getDay) */
  trainingDays: number[];
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  programId: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
  isCompound: boolean;
  description: string;
}

export interface ProgramExercise {
  exerciseId: string;
  sets: number;
  /** Целевые повторения: '8', '8-10', '30-60 сек' */
  reps: string;
  rpe?: string;
  restSec: number;
}

export interface ProgramDay {
  name: string;
  focus: string;
  exercises: ProgramExercise[];
}

export interface Program {
  id: string;
  name: string;
  shortName: string;
  description: string;
  daysPerWeek: number;
  levels: Level[];
  goals: Goal[];
  days: ProgramDay[];
}

export interface WorkoutRow {
  id: number;
  date: string; // YYYY-MM-DD
  name: string;
  mode: 'program' | 'free';
  program_day: number | null;
  started_at: string;
  finished_at: string | null;
}

export interface SetRow {
  id: number;
  workout_id: number;
  exercise_id: string;
  set_index: number;
  weight: number;
  reps: number;
  target_reps: string | null;
  done: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionEntry {
  id: number;
  date: string;
  meal_type: MealType;
  dish: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  portion_g: number;
  source: 'photo' | 'voice' | 'text' | 'manual';
}

export interface FoodItem {
  id: number;
  name: string;
  category: string;
  /** на 100 г */
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

export interface FoodAnalysis {
  dish: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  portion_g: number;
}

export interface PersonalRecord {
  exercise_id: string;
  weight: number;
  reps: number;
  date: string;
}
