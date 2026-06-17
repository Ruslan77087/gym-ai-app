import { Program } from '@/lib/types';

export const PROGRAMS: Program[] = [
  {
    id: 'fullbody-3',
    name: 'Full Body 3×неделю (A/B/C)',
    shortName: 'Full Body 3×',
    description:
      'Всё тело трижды в неделю. Высокая частота на каждую группу — оптимально для набора массы на среднем уровне.',
    daysPerWeek: 3,
    levels: ['beginner', 'intermediate'],
    goals: ['mass', 'fitness'],
    days: [
      {
        name: 'Full Body A',
        focus: 'Присед + горизонтальные жимы и тяги',
        exercises: [
          { exerciseId: 'squat', sets: 4, reps: '6', rpe: 'RPE 7-8', restSec: 180 },
          { exerciseId: 'bench-press', sets: 4, reps: '8', rpe: 'RPE 7', restSec: 150 },
          { exerciseId: 'barbell-row', sets: 3, reps: '8', rpe: 'RPE 7', restSec: 150 },
          { exerciseId: 'db-shoulder-press', sets: 3, reps: '10', rpe: 'RPE 7', restSec: 120 },
          { exerciseId: 'barbell-curl', sets: 3, reps: '12', restSec: 90 },
          { exerciseId: 'triceps-pushdown', sets: 3, reps: '12', restSec: 90 },
        ],
      },
      {
        name: 'Full Body B',
        focus: 'Становая + вертикальные жимы и тяги',
        exercises: [
          { exerciseId: 'deadlift', sets: 4, reps: '5', rpe: 'RPE 8', restSec: 210 },
          { exerciseId: 'incline-press', sets: 4, reps: '10', rpe: 'RPE 7', restSec: 120 },
          { exerciseId: 'pullups', sets: 4, reps: '8', restSec: 150 },
          { exerciseId: 'overhead-press', sets: 3, reps: '8', rpe: 'RPE 7', restSec: 120 },
          { exerciseId: 'leg-extension', sets: 3, reps: '15', restSec: 90 },
          { exerciseId: 'leg-curl', sets: 3, reps: '15', restSec: 90 },
        ],
      },
      {
        name: 'Full Body C',
        focus: 'Фронтальный присед + руки и плечи',
        exercises: [
          { exerciseId: 'front-squat', sets: 4, reps: '6', rpe: 'RPE 7', restSec: 180 },
          { exerciseId: 'close-grip-bench', sets: 4, reps: '8', restSec: 150 },
          { exerciseId: 'one-arm-db-row', sets: 4, reps: '10', restSec: 120 },
          { exerciseId: 'lateral-raise', sets: 4, reps: '15', restSec: 90 },
          { exerciseId: 'hammer-curl', sets: 3, reps: '12', restSec: 90 },
          { exerciseId: 'plank', sets: 3, reps: '30-60 сек', restSec: 60 },
        ],
      },
    ],
  },
  {
    id: 'ppl-6',
    name: 'PPL сплит 6×неделю (Push/Pull/Legs)',
    shortName: 'PPL 6×',
    description:
      'Push/Pull/Legs дважды в неделю. Большой объём для продвинутых: набор массы и рельеф.',
    daysPerWeek: 6,
    levels: ['advanced'],
    goals: ['mass', 'cut'],
    days: [
      {
        name: 'Push 1',
        focus: 'Грудь + плечи + трицепс',
        exercises: [
          { exerciseId: 'bench-press', sets: 4, reps: '6-8', rpe: 'RPE 8', restSec: 180 },
          { exerciseId: 'incline-db-press', sets: 3, reps: '10', restSec: 120 },
          { exerciseId: 'overhead-press', sets: 3, reps: '8', restSec: 150 },
          { exerciseId: 'lateral-raise', sets: 4, reps: '15', restSec: 75 },
          { exerciseId: 'triceps-pushdown', sets: 3, reps: '12', restSec: 90 },
          { exerciseId: 'overhead-triceps-ext', sets: 3, reps: '12', restSec: 90 },
        ],
      },
      {
        name: 'Pull 1',
        focus: 'Спина + бицепс + задняя дельта',
        exercises: [
          { exerciseId: 'deadlift', sets: 3, reps: '5', rpe: 'RPE 8', restSec: 210 },
          { exerciseId: 'pullups', sets: 4, reps: '8', restSec: 150 },
          { exerciseId: 'seated-cable-row', sets: 3, reps: '10', restSec: 120 },
          { exerciseId: 'face-pull', sets: 3, reps: '15', restSec: 75 },
          { exerciseId: 'barbell-curl', sets: 3, reps: '10', restSec: 90 },
          { exerciseId: 'incline-db-curl', sets: 3, reps: '12', restSec: 90 },
        ],
      },
      {
        name: 'Legs 1',
        focus: 'Квадрицепс + хамстринг + икры',
        exercises: [
          { exerciseId: 'squat', sets: 4, reps: '6', rpe: 'RPE 8', restSec: 180 },
          { exerciseId: 'romanian-deadlift', sets: 3, reps: '10', restSec: 150 },
          { exerciseId: 'leg-press', sets: 3, reps: '12', restSec: 120 },
          { exerciseId: 'leg-curl', sets: 3, reps: '12', restSec: 90 },
          { exerciseId: 'calf-raise', sets: 4, reps: '15', restSec: 75 },
        ],
      },
      {
        name: 'Push 2',
        focus: 'Акцент на плечи',
        exercises: [
          { exerciseId: 'overhead-press', sets: 4, reps: '6', rpe: 'RPE 8', restSec: 180 },
          { exerciseId: 'incline-press', sets: 3, reps: '10', restSec: 120 },
          { exerciseId: 'seated-db-press', sets: 3, reps: '10', restSec: 120 },
          { exerciseId: 'cable-lateral-raise', sets: 4, reps: '15', restSec: 75 },
          { exerciseId: 'dips', sets: 3, reps: '10', restSec: 120 },
          { exerciseId: 'rope-pushdown', sets: 3, reps: '15', restSec: 75 },
        ],
      },
      {
        name: 'Pull 2',
        focus: 'Акцент на бицепс и толщину спины',
        exercises: [
          { exerciseId: 'barbell-row', sets: 4, reps: '8', rpe: 'RPE 8', restSec: 150 },
          { exerciseId: 't-bar-row', sets: 3, reps: '10', restSec: 120 },
          { exerciseId: 'lat-pulldown', sets: 3, reps: '12', restSec: 120 },
          { exerciseId: 'rear-delt-fly', sets: 3, reps: '15', restSec: 75 },
          { exerciseId: 'preacher-curl', sets: 3, reps: '10', restSec: 90 },
          { exerciseId: 'hammer-curl', sets: 3, reps: '12', restSec: 90 },
        ],
      },
      {
        name: 'Legs 2',
        focus: 'Акцент на хамстринг и ягодицы',
        exercises: [
          { exerciseId: 'romanian-deadlift', sets: 4, reps: '8', rpe: 'RPE 8', restSec: 180 },
          { exerciseId: 'hip-thrust', sets: 4, reps: '10', restSec: 150 },
          { exerciseId: 'bulgarian-split-squat', sets: 3, reps: '10', restSec: 120 },
          { exerciseId: 'leg-curl', sets: 3, reps: '15', restSec: 90 },
          { exerciseId: 'seated-calf-raise', sets: 4, reps: '15', restSec: 75 },
        ],
      },
    ],
  },
  {
    id: 'upper-lower-4',
    name: 'Upper/Lower 4×неделю',
    shortName: 'Upper/Lower 4×',
    description:
      'Верх/низ дважды в неделю. Баланс силы и массы для среднего уровня.',
    daysPerWeek: 4,
    levels: ['intermediate', 'advanced'],
    goals: ['strength', 'mass'],
    days: [
      {
        name: 'Upper A',
        focus: 'Горизонтальный жим + вертикальная тяга',
        exercises: [
          { exerciseId: 'bench-press', sets: 4, reps: '6', rpe: 'RPE 8', restSec: 180 },
          { exerciseId: 'pullups', sets: 4, reps: '8', restSec: 150 },
          { exerciseId: 'db-press', sets: 3, reps: '10', restSec: 120 },
          { exerciseId: 'seated-cable-row', sets: 3, reps: '10', restSec: 120 },
          { exerciseId: 'lateral-raise', sets: 3, reps: '15', restSec: 75 },
          { exerciseId: 'barbell-curl', sets: 3, reps: '10', restSec: 90 },
        ],
      },
      {
        name: 'Lower A',
        focus: 'Присед + хамстринг',
        exercises: [
          { exerciseId: 'squat', sets: 4, reps: '5', rpe: 'RPE 8', restSec: 210 },
          { exerciseId: 'romanian-deadlift', sets: 3, reps: '8', restSec: 150 },
          { exerciseId: 'leg-press', sets: 3, reps: '12', restSec: 120 },
          { exerciseId: 'leg-curl', sets: 3, reps: '12', restSec: 90 },
          { exerciseId: 'calf-raise', sets: 4, reps: '15', restSec: 75 },
          { exerciseId: 'plank', sets: 3, reps: '45 сек', restSec: 60 },
        ],
      },
      {
        name: 'Upper B',
        focus: 'Вертикальный жим + горизонтальная тяга',
        exercises: [
          { exerciseId: 'overhead-press', sets: 4, reps: '6', rpe: 'RPE 8', restSec: 180 },
          { exerciseId: 'barbell-row', sets: 4, reps: '8', restSec: 150 },
          { exerciseId: 'incline-db-press', sets: 3, reps: '10', restSec: 120 },
          { exerciseId: 'lat-pulldown', sets: 3, reps: '12', restSec: 120 },
          { exerciseId: 'face-pull', sets: 3, reps: '15', restSec: 75 },
          { exerciseId: 'skullcrusher', sets: 3, reps: '10', restSec: 90 },
        ],
      },
      {
        name: 'Lower B',
        focus: 'Становая + квадрицепс',
        exercises: [
          { exerciseId: 'deadlift', sets: 4, reps: '5', rpe: 'RPE 8', restSec: 210 },
          { exerciseId: 'front-squat', sets: 3, reps: '8', restSec: 180 },
          { exerciseId: 'lunges', sets: 3, reps: '10', restSec: 120 },
          { exerciseId: 'leg-extension', sets: 3, reps: '15', restSec: 90 },
          { exerciseId: 'hanging-leg-raise', sets: 3, reps: '12', restSec: 75 },
        ],
      },
    ],
  },
  {
    id: 'bro-split-5',
    name: 'Бро-сплит 5×неделю',
    shortName: 'Бро-сплит 5×',
    description:
      'Одна группа мышц в день, максимальный объём на группу. Гипертрофия для среднего и продвинутого уровня.',
    daysPerWeek: 5,
    levels: ['intermediate', 'advanced'],
    goals: ['mass'],
    days: [
      {
        name: 'Грудь',
        focus: 'Жимы под разными углами + изоляция',
        exercises: [
          { exerciseId: 'bench-press', sets: 4, reps: '6-8', rpe: 'RPE 8', restSec: 180 },
          { exerciseId: 'incline-db-press', sets: 4, reps: '10', restSec: 120 },
          { exerciseId: 'dips', sets: 3, reps: '10', restSec: 120 },
          { exerciseId: 'cable-fly', sets: 3, reps: '15', restSec: 75 },
          { exerciseId: 'pec-deck', sets: 3, reps: '15', restSec: 75 },
        ],
      },
      {
        name: 'Спина',
        focus: 'Толщина и ширина',
        exercises: [
          { exerciseId: 'deadlift', sets: 4, reps: '5', rpe: 'RPE 8', restSec: 210 },
          { exerciseId: 'pullups', sets: 4, reps: '8', restSec: 150 },
          { exerciseId: 'barbell-row', sets: 4, reps: '8', restSec: 150 },
          { exerciseId: 'seated-cable-row', sets: 3, reps: '12', restSec: 120 },
          { exerciseId: 'straight-arm-pulldown', sets: 3, reps: '15', restSec: 75 },
        ],
      },
      {
        name: 'Плечи',
        focus: 'Все три пучка дельт',
        exercises: [
          { exerciseId: 'overhead-press', sets: 4, reps: '6-8', rpe: 'RPE 8', restSec: 180 },
          { exerciseId: 'seated-db-press', sets: 3, reps: '10', restSec: 120 },
          { exerciseId: 'lateral-raise', sets: 4, reps: '15', restSec: 75 },
          { exerciseId: 'rear-delt-fly', sets: 4, reps: '15', restSec: 75 },
          { exerciseId: 'shrugs', sets: 3, reps: '12', restSec: 90 },
        ],
      },
      {
        name: 'Руки',
        focus: 'Бицепс + трицепс суперсетами',
        exercises: [
          { exerciseId: 'close-grip-bench', sets: 4, reps: '8', restSec: 150 },
          { exerciseId: 'barbell-curl', sets: 4, reps: '10', restSec: 90 },
          { exerciseId: 'skullcrusher', sets: 3, reps: '10', restSec: 90 },
          { exerciseId: 'incline-db-curl', sets: 3, reps: '12', restSec: 90 },
          { exerciseId: 'rope-pushdown', sets: 3, reps: '15', restSec: 75 },
          { exerciseId: 'hammer-curl', sets: 3, reps: '12', restSec: 75 },
        ],
      },
      {
        name: 'Ноги',
        focus: 'Квадрицепс + хамстринг + икры',
        exercises: [
          { exerciseId: 'squat', sets: 4, reps: '6', rpe: 'RPE 8', restSec: 210 },
          { exerciseId: 'romanian-deadlift', sets: 4, reps: '8', restSec: 150 },
          { exerciseId: 'leg-press', sets: 3, reps: '12', restSec: 120 },
          { exerciseId: 'leg-extension', sets: 3, reps: '15', restSec: 90 },
          { exerciseId: 'leg-curl', sets: 3, reps: '15', restSec: 90 },
          { exerciseId: 'calf-raise', sets: 4, reps: '15', restSec: 75 },
        ],
      },
    ],
  },
];

export const PROGRAMS_BY_ID: Record<string, Program> = Object.fromEntries(
  PROGRAMS.map((p) => [p.id, p])
);

/** Автоподбор программы по ответам онбординга */
export function pickProgram(goal: string, level: string, daysCount: number): Program {
  const scored = PROGRAMS.map((p) => {
    let score = 0;
    if (p.goals.includes(goal as never)) score += 2;
    if (p.levels.includes(level as never)) score += 2;
    score -= Math.abs(p.daysPerWeek - daysCount);
    return { p, score };
  }).sort((a, b) => b.score - a.score);
  return scored[0].p;
}
