import { Goal, MacroTargets, UserProfile } from './types';

/** BMR по Миффлину–Сан Жеору */
export function calcBMR(p: Pick<UserProfile, 'sex' | 'age' | 'weightKg' | 'heightCm'>): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return p.sex === 'male' ? base + 5 : base - 161;
}

function activityFactor(trainingDaysPerWeek: number): number {
  if (trainingDaysPerWeek >= 6) return 1.65;
  if (trainingDaysPerWeek >= 4) return 1.55;
  if (trainingDaysPerWeek >= 3) return 1.45;
  if (trainingDaysPerWeek >= 1) return 1.375;
  return 1.2;
}

function goalAdjustment(goal: Goal): number {
  switch (goal) {
    case 'mass': return 400;      // +300–500 к TDEE
    case 'cut': return -400;      // −300–500
    case 'strength': return 250;  // +200–300
    default: return 0;
  }
}

/**
 * Норма КБЖУ. В тренировочный день +125 ккал (углеводами).
 * Белок: масса 2 г/кг, рельеф 2.2 г/кг, иначе 1.8 г/кг.
 * Жиры: рельеф 20% калорий, иначе 25%. Остаток — углеводы.
 */
export function calcTargets(profile: UserProfile, isTrainingDay: boolean): MacroTargets {
  const tdee = calcBMR(profile) * activityFactor(profile.trainingDays.length);
  let calories = tdee + goalAdjustment(profile.goal);
  let trainingBonus = 0;
  if (isTrainingDay) {
    trainingBonus = 125;
    calories += trainingBonus;
  }

  const proteinPerKg = profile.goal === 'cut' ? 2.2 : profile.goal === 'mass' ? 2 : 1.8;
  const protein = profile.weightKg * proteinPerKg;
  const fatShare = profile.goal === 'cut' ? 0.2 : 0.25;
  const fat = (calories * fatShare) / 9;
  const carbs = Math.max(0, (calories - protein * 4 - fat * 9) / 4);
  const fiber = Math.round((calories / 1000) * 14); // ~14 г на 1000 ккал

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
    fiber,
  };
}
