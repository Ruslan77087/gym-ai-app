import { Exercise } from '@/lib/types';

export const EXERCISES: Exercise[] = [
  // ===== Грудь =====
  { id: 'bench-press', name: 'Жим лёжа', muscleGroup: 'chest', equipment: 'Штанга', isCompound: true, description: 'Лопатки сведены, стопы в пол, гриф опускается к низу груди. Локти под углом ~45° к корпусу.' },
  { id: 'incline-press', name: 'Жим на наклонной скамье', muscleGroup: 'chest', equipment: 'Штанга', isCompound: true, description: 'Наклон 30–45°. Акцент на верх груди. Не отбивай гриф от груди.' },
  { id: 'incline-db-press', name: 'Жим гантелей на наклонной', muscleGroup: 'chest', equipment: 'Гантели', isCompound: true, description: 'Гантели опускаются глубже грифа — больше растяжение. Контролируй негативную фазу.' },
  { id: 'db-press', name: 'Жим гантелей лёжа', muscleGroup: 'chest', equipment: 'Гантели', isCompound: true, description: 'Свободная траектория, больше работы стабилизаторов. Не своди гантели до удара.' },
  { id: 'close-grip-bench', name: 'Жим лёжа узким хватом', muscleGroup: 'chest', equipment: 'Штанга', isCompound: true, description: 'Хват на ширине плеч, локти ближе к корпусу. Базовое движение на трицепс и внутреннюю часть груди.' },
  { id: 'dips', name: 'Отжимания на брусьях', muscleGroup: 'chest', equipment: 'Брусья', isCompound: true, description: 'Наклон корпуса вперёд — акцент на грудь, вертикально — на трицепс. Не опускайся ниже комфортной глубины плеча.' },
  { id: 'cable-fly', name: 'Сведение в кроссовере', muscleGroup: 'chest', equipment: 'Блок', isCompound: false, description: 'Лёгкий изгиб в локте сохраняется всю амплитуду. Своди руки дугой, пиковое сокращение в центре.' },
  { id: 'db-fly', name: 'Разводка гантелей лёжа', muscleGroup: 'chest', equipment: 'Гантели', isCompound: false, description: 'Растягивающее движение. Не гонись за весом — риск для плечевого сустава.' },
  { id: 'pec-deck', name: 'Бабочка (пек-дек)', muscleGroup: 'chest', equipment: 'Тренажёр', isCompound: false, description: 'Изоляция груди с постоянным натяжением. Пауза в точке сведения 1 сек.' },
  { id: 'pushups', name: 'Отжимания от пола', muscleGroup: 'chest', equipment: 'Своё тело', isCompound: true, description: 'Корпус — жёсткая планка. Усложняй паузами или возвышением для ног.' },

  // ===== Спина =====
  { id: 'deadlift', name: 'Становая тяга', muscleGroup: 'back', equipment: 'Штанга', isCompound: true, description: 'Спина нейтральная, гриф скользит вдоль ног. Движение начинается ногами, заканчивается разгибанием корпуса.' },
  { id: 'barbell-row', name: 'Тяга штанги в наклоне', muscleGroup: 'back', equipment: 'Штанга', isCompound: true, description: 'Корпус 30–45° к полу, тяни к низу живота. Без рывков корпусом.' },
  { id: 'pullups', name: 'Подтягивания', muscleGroup: 'back', equipment: 'Турник', isCompound: true, description: 'Полная амплитуда: от прямых рук до подбородка над перекладиной. Тяни локтями вниз.' },
  { id: 'lat-pulldown', name: 'Тяга верхнего блока', muscleGroup: 'back', equipment: 'Блок', isCompound: true, description: 'Грудь к рукоятке, тяни к верху груди. Не отклоняйся сильно назад.' },
  { id: 'one-arm-db-row', name: 'Тяга гантели одной рукой', muscleGroup: 'back', equipment: 'Гантели', isCompound: true, description: 'Опора на скамью, спина параллельна полу. Тяни локоть к бедру, без вращения корпуса.' },
  { id: 'seated-cable-row', name: 'Тяга горизонтального блока', muscleGroup: 'back', equipment: 'Блок', isCompound: true, description: 'Спина прямая, тяни к животу, своди лопатки. Корпус почти неподвижен.' },
  { id: 't-bar-row', name: 'Т-образная тяга', muscleGroup: 'back', equipment: 'Штанга', isCompound: true, description: 'Толщина спины. Узкий хват, тяни к груди, фиксируй поясницу.' },
  { id: 'rack-pull', name: 'Тяга с плинтов', muscleGroup: 'back', equipment: 'Штанга', isCompound: true, description: 'Частичная становая с уровня колен. Позволяет работать с большим весом на верх спины и трапеции.' },
  { id: 'straight-arm-pulldown', name: 'Пуловер на блоке', muscleGroup: 'back', equipment: 'Блок', isCompound: false, description: 'Прямые руки, движение дугой к бёдрам. Изоляция широчайших.' },
  { id: 'hyperextension', name: 'Гиперэкстензия', muscleGroup: 'back', equipment: 'Тренажёр', isCompound: false, description: 'Разгибатели спины и ягодицы. Без переразгибания в верхней точке.' },
  { id: 'shrugs', name: 'Шраги с гантелями', muscleGroup: 'back', equipment: 'Гантели', isCompound: false, description: 'Только подъём плеч вверх, без вращения. Пауза в верхней точке.' },

  // ===== Ноги =====
  { id: 'squat', name: 'Присед со штангой', muscleGroup: 'legs', equipment: 'Штанга', isCompound: true, description: 'Гриф на трапециях, колени по направлению носков, глубина до параллели или ниже. Взгляд вперёд.' },
  { id: 'front-squat', name: 'Фронтальный присед', muscleGroup: 'legs', equipment: 'Штанга', isCompound: true, description: 'Гриф на передних дельтах, локти высоко. Корпус вертикальнее — акцент на квадрицепс.' },
  { id: 'romanian-deadlift', name: 'Румынская тяга', muscleGroup: 'legs', equipment: 'Штанга', isCompound: true, description: 'Колени чуть согнуты, таз назад, растяжение хамстрингов. Гриф вдоль ног.' },
  { id: 'leg-press', name: 'Жим ногами', muscleGroup: 'legs', equipment: 'Тренажёр', isCompound: true, description: 'Не отрывай таз от спинки в нижней точке. Колени не сводить внутрь.' },
  { id: 'lunges', name: 'Выпады с гантелями', muscleGroup: 'legs', equipment: 'Гантели', isCompound: true, description: 'Шаг вперёд, колено над стопой, корпус вертикален. Толчок пяткой передней ноги.' },
  { id: 'bulgarian-split-squat', name: 'Болгарский сплит-присед', muscleGroup: 'legs', equipment: 'Гантели', isCompound: true, description: 'Задняя нога на скамье. Тяжёлое унилатеральное движение на квадрицепс и ягодицы.' },
  { id: 'leg-extension', name: 'Разгибание ног', muscleGroup: 'legs', equipment: 'Тренажёр', isCompound: false, description: 'Изоляция квадрицепса. Пауза в верхней точке, медленный негатив.' },
  { id: 'leg-curl', name: 'Сгибание ног', muscleGroup: 'legs', equipment: 'Тренажёр', isCompound: false, description: 'Изоляция хамстрингов. Не отрывай таз, полная амплитуда.' },
  { id: 'hip-thrust', name: 'Ягодичный мост со штангой', muscleGroup: 'legs', equipment: 'Штанга', isCompound: true, description: 'Лопатки на скамье, в верхней точке корпус параллелен полу, пауза 1 сек.' },
  { id: 'calf-raise', name: 'Подъём на носки стоя', muscleGroup: 'legs', equipment: 'Тренажёр', isCompound: false, description: 'Полная амплитуда: растяжение внизу, пауза наверху. Без отбива.' },
  { id: 'seated-calf-raise', name: 'Подъём на носки сидя', muscleGroup: 'legs', equipment: 'Тренажёр', isCompound: false, description: 'Акцент на камбаловидную мышцу. Медленный темп.' },
  { id: 'goblet-squat', name: 'Гоблет-присед', muscleGroup: 'legs', equipment: 'Гантели', isCompound: true, description: 'Гантель у груди. Отличная техника-постановка для приседа, держи корпус вертикально.' },

  // ===== Плечи =====
  { id: 'overhead-press', name: 'Армейский жим', muscleGroup: 'shoulders', equipment: 'Штанга', isCompound: true, description: 'Стоя, ягодицы и пресс напряжены. Гриф над макушкой в верхней точке, без отклона поясницы.' },
  { id: 'db-shoulder-press', name: 'Жим гантелей стоя', muscleGroup: 'shoulders', equipment: 'Гантели', isCompound: true, description: 'Гантели по бокам головы, жми вверх дугой. Не превращай в жим лёжа стоя — корпус вертикален.' },
  { id: 'seated-db-press', name: 'Жим гантелей сидя', muscleGroup: 'shoulders', equipment: 'Гантели', isCompound: true, description: 'Спинка скамьи ~80°. Стабильнее, чем стоя — можно брать больший вес.' },
  { id: 'lateral-raise', name: 'Боковые подъёмы (махи)', muscleGroup: 'shoulders', equipment: 'Гантели', isCompound: false, description: 'Средняя дельта. Подъём до уровня плеч, мизинец чуть выше большого пальца, без читинга.' },
  { id: 'cable-lateral-raise', name: 'Махи в кроссовере', muscleGroup: 'shoulders', equipment: 'Блок', isCompound: false, description: 'Постоянное натяжение по всей амплитуде. Лучшая изоляция средней дельты.' },
  { id: 'rear-delt-fly', name: 'Разводка на заднюю дельту', muscleGroup: 'shoulders', equipment: 'Гантели', isCompound: false, description: 'В наклоне, локти чуть согнуты, веди локтями в стороны. Малые веса, чистая техника.' },
  { id: 'face-pull', name: 'Тяга к лицу (face pull)', muscleGroup: 'shoulders', equipment: 'Блок', isCompound: false, description: 'Канат к лицу, локти выше кисти, разворот плеча наружу. Здоровье плеч и задняя дельта.' },
  { id: 'upright-row', name: 'Тяга к подбородку', muscleGroup: 'shoulders', equipment: 'Штанга', isCompound: true, description: 'Широкий хват, локти не выше плеч — безопаснее для сустава.' },
  { id: 'front-raise', name: 'Подъёмы перед собой', muscleGroup: 'shoulders', equipment: 'Гантели', isCompound: false, description: 'Передняя дельта. Обычно достаточно жимов; добавляй при отставании.' },

  // ===== Руки =====
  { id: 'barbell-curl', name: 'Подъём штанги на бицепс', muscleGroup: 'arms', equipment: 'Штанга', isCompound: false, description: 'Локти у корпуса, без раскачки. Полное разгибание внизу.' },
  { id: 'db-curl', name: 'Подъём гантелей на бицепс', muscleGroup: 'arms', equipment: 'Гантели', isCompound: false, description: 'С супинацией: разворот кисти наружу по ходу подъёма.' },
  { id: 'hammer-curl', name: 'Молотковый подъём', muscleGroup: 'arms', equipment: 'Гантели', isCompound: false, description: 'Нейтральный хват. Брахиалис и предплечья — толщина руки.' },
  { id: 'incline-db-curl', name: 'Подъём на бицепс на наклонной', muscleGroup: 'arms', equipment: 'Гантели', isCompound: false, description: 'Растянутая позиция длинной головки бицепса. Локти назад, не выводи вперёд.' },
  { id: 'preacher-curl', name: 'Подъём на скамье Скотта', muscleGroup: 'arms', equipment: 'Штанга', isCompound: false, description: 'Исключает читинг. Не разгибай руку рывком в нижней точке.' },
  { id: 'cable-curl', name: 'Сгибание на блоке', muscleGroup: 'arms', equipment: 'Блок', isCompound: false, description: 'Постоянное натяжение. Хорош как завершающее упражнение.' },
  { id: 'triceps-pushdown', name: 'Трицепс на блоке (разгибание)', muscleGroup: 'arms', equipment: 'Блок', isCompound: false, description: 'Локти прижаты к корпусу, разгибай только предплечье. Пауза внизу.' },
  { id: 'overhead-triceps-ext', name: 'Французский жим с гантелью', muscleGroup: 'arms', equipment: 'Гантели', isCompound: false, description: 'Гантель за головой двумя руками. Растянутая позиция длинной головки трицепса.' },
  { id: 'skullcrusher', name: 'Французский жим лёжа', muscleGroup: 'arms', equipment: 'Штанга', isCompound: false, description: 'Опускай гриф ко лбу или за голову, локти неподвижны.' },
  { id: 'rope-pushdown', name: 'Разгибание с канатом', muscleGroup: 'arms', equipment: 'Блок', isCompound: false, description: 'В нижней точке разводи концы каната в стороны — пиковое сокращение.' },
  { id: 'wrist-curl', name: 'Сгибание запястий', muscleGroup: 'arms', equipment: 'Штанга', isCompound: false, description: 'Предплечья. Высокие повторения, медленный темп.' },

  // ===== Кор =====
  { id: 'plank', name: 'Планка', muscleGroup: 'core', equipment: 'Своё тело', isCompound: false, description: 'Тело — прямая линия, таз подкручен, пресс и ягодицы напряжены. Держи 30–60 сек.' },
  { id: 'hanging-leg-raise', name: 'Подъём ног в висе', muscleGroup: 'core', equipment: 'Турник', isCompound: false, description: 'Подъём за счёт пресса с подкручиванием таза, без раскачки.' },
  { id: 'cable-crunch', name: 'Скручивания на блоке', muscleGroup: 'core', equipment: 'Блок', isCompound: false, description: 'На коленях, скручивай грудную клетку к тазу. Нагрузка регулируется весом.' },
  { id: 'crunch', name: 'Скручивания', muscleGroup: 'core', equipment: 'Своё тело', isCompound: false, description: 'Поясница прижата к полу, поднимаются только лопатки. Медленный темп.' },
  { id: 'russian-twist', name: 'Русские скручивания', muscleGroup: 'core', equipment: 'Своё тело', isCompound: false, description: 'Косые мышцы. Вращай корпус, а не только руки.' },
  { id: 'ab-wheel', name: 'Ролик для пресса', muscleGroup: 'core', equipment: 'Ролик', isCompound: false, description: 'Таз подкручен, поясница не провисает. Амплитуда по силам.' },
  { id: 'side-plank', name: 'Боковая планка', muscleGroup: 'core', equipment: 'Своё тело', isCompound: false, description: 'Косые мышцы и стабилизация. Таз не провисает.' },
];

export const EXERCISES_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e])
);

export const MUSCLE_GROUPS: { key: string; label: string; emoji: string }[] = [
  { key: 'chest', label: 'Грудь', emoji: '🫁' },
  { key: 'back', label: 'Спина', emoji: '🔙' },
  { key: 'legs', label: 'Ноги', emoji: '🦵' },
  { key: 'shoulders', label: 'Плечи', emoji: '💪' },
  { key: 'arms', label: 'Руки', emoji: '✊' },
  { key: 'core', label: 'Кор', emoji: '🧱' },
  { key: 'fullbody', label: 'Full Body', emoji: '🏋️' },
];

/** Рекомендованные упражнения для свободной тренировки по группе мышц */
export const RECOMMENDED_BY_GROUP: Record<string, string[]> = {
  chest: ['bench-press', 'incline-db-press', 'dips', 'cable-fly'],
  back: ['deadlift', 'pullups', 'barbell-row', 'seated-cable-row'],
  legs: ['squat', 'romanian-deadlift', 'leg-press', 'leg-curl', 'calf-raise'],
  shoulders: ['overhead-press', 'lateral-raise', 'rear-delt-fly', 'face-pull'],
  arms: ['close-grip-bench', 'barbell-curl', 'triceps-pushdown', 'hammer-curl'],
  core: ['plank', 'hanging-leg-raise', 'cable-crunch'],
  fullbody: ['squat', 'bench-press', 'barbell-row', 'overhead-press', 'romanian-deadlift'],
};
