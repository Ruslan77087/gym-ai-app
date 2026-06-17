import { EXERCISES_BY_ID } from '@/data/exercises';
import { getLastResult } from '@/db/database';

/** Шаг прогрессии: базовые +2.5 кг, изолирующие +1.25 кг */
export function incrementFor(exerciseId: string): number {
  const ex = EXERCISES_BY_ID[exerciseId];
  return ex?.isCompound ? 2.5 : 1.25;
}

export interface WeightSuggestion {
  weight: number;
  reason: 'first' | 'progress' | 'repeat';
}

/**
 * Предлагает вес для следующего подхода.
 * Если в прошлый раз выполнены все целевые повторения — вес растёт на шаг прогрессии.
 * Если нет — повторяем прошлый вес. Если истории нет — 0 (пользователь вводит сам).
 */
export async function suggestWeight(exerciseId: string): Promise<WeightSuggestion> {
  const last = await getLastResult(exerciseId);
  if (!last || last.weight <= 0) return { weight: last?.weight ?? 0, reason: 'first' };
  if (last.allTargetMet) {
    return { weight: roundToPlate(last.weight + incrementFor(exerciseId)), reason: 'progress' };
  }
  return { weight: last.weight, reason: 'repeat' };
}

/** Округление до 1.25 кг (минимальный блин 1.25) */
export function roundToPlate(w: number): number {
  return Math.round(w / 1.25) * 1.25;
}
