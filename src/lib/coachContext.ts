import { EXERCISES_BY_ID } from '@/data/exercises';
import { PROGRAMS_BY_ID } from '@/data/programs';
import {
  getNutritionByDate,
  getPersonalRecords,
  getProgramWorkoutCount,
  getWorkoutDates,
  todayStr,
} from '@/db/database';
import { CoachContext } from './ai';
import { calcTargets } from './tdee';
import { UserProfile } from './types';

const GOAL_LABELS: Record<string, string> = {
  mass: 'набор мышечной массы',
  cut: 'рельеф (снижение жира)',
  strength: 'рост силы',
  fitness: 'общая форма',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'новичок',
  intermediate: 'средний',
  advanced: 'продвинутый',
};

/** Собирает живой контекст для AI-тренера: программа, тренировка, питание, рекорды */
export async function buildCoachContext(profile: UserProfile): Promise<CoachContext> {
  const program = PROGRAMS_BY_ID[profile.programId];
  const today = todayStr();
  const isTrainingDay = profile.trainingDays.includes(new Date().getDay());

  // Сегодняшняя тренировка: выполнена или предстоит
  const doneToday = (await getWorkoutDates(1)).includes(today);
  let todayWorkout: string;
  if (!isTrainingDay) {
    todayWorkout = 'Сегодня день отдыха по расписанию.';
  } else {
    const count = await getProgramWorkoutCount();
    const day = program?.days[count % (program?.days.length || 1)];
    const planned = day
      ? `${day.name}: ${day.exercises.map((e) => EXERCISES_BY_ID[e.exerciseId]?.name ?? e.exerciseId).join(', ')}`
      : 'свободная тренировка';
    todayWorkout = doneToday
      ? `Тренировка сегодня уже выполнена (${planned}).`
      : `Сегодня тренировочный день, предстоит: ${planned}.`;
  }

  // Питание за сегодня
  const entries = await getNutritionByDate(today);
  const sum = entries.reduce(
    (a, e) => ({
      calories: a.calories + e.calories,
      protein: a.protein + e.protein,
      fat: a.fat + e.fat,
      carbs: a.carbs + e.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
  const nutritionToday =
    entries.length === 0
      ? 'Сегодня приёмы пищи ещё не записаны.'
      : `Съедено: ${Math.round(sum.calories)} ккал (Б ${Math.round(sum.protein)} / Ж ${Math.round(sum.fat)} / У ${Math.round(sum.carbs)}). Приёмы: ${entries
          .map((e) => `${e.dish} (${Math.round(e.calories)} ккал)`)
          .join('; ')}.`;

  const t = calcTargets(profile, isTrainingDay);
  const targets = `Норма на сегодня: ${t.calories} ккал, белки ${t.protein} г, жиры ${t.fat} г, углеводы ${t.carbs} г, клетчатка ${t.fiber} г.`;

  // Последние личные рекорды
  const prs = (await getPersonalRecords()).slice(0, 8);
  const recentPRs =
    prs.length === 0
      ? 'Личных рекордов пока нет.'
      : prs
          .map((p) => `${EXERCISES_BY_ID[p.exercise_id]?.name ?? p.exercise_id}: ${p.weight} кг × ${p.reps}`)
          .join('; ');

  return {
    goal: GOAL_LABELS[profile.goal] ?? profile.goal,
    level: LEVEL_LABELS[profile.level] ?? profile.level,
    programName: program ? `${program.name} — ${program.description}` : 'без программы',
    todayWorkout,
    recentPRs,
    nutritionToday,
    targets,
  };
}
