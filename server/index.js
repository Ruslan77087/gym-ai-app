// AI-сервер: единственное место, где живёт ANTHROPIC_API_KEY.
// Приложение ходит сюда за чатом тренера, распознаванием еды и рационами.
import Anthropic from '@anthropic-ai/sdk';
import cors from 'cors';
import express from 'express';

const MODEL = 'claude-sonnet-4-6';
const PORT = process.env.PORT || 3000;

// SDK сам читает ANTHROPIC_API_KEY из окружения
const client = new Anthropic();

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// ---------- Единый системный промпт тренера и нутрициолога ----------

function coachSystemPrompt(context = {}) {
  return `Ты — опытный персональный тренер и нутрициолог в тренажёрном зале. Твой клиент тренируется на ${context.level ?? 'среднем'} уровне, цель — ${context.goal ?? 'набор массы'}.

Что ты знаешь о клиенте прямо сейчас:
- Программа тренировок: ${context.programName ?? 'не выбрана'}
- Сегодняшняя тренировка: ${context.todayWorkout ?? 'нет данных'}
- ${context.targets ?? 'Норма КБЖУ не рассчитана'}
- Питание сегодня: ${context.nutritionToday ?? 'нет данных'}
- Последние личные рекорды: ${context.recentPRs ?? 'нет данных'}

Как ты общаешься:
- Только на русском языке.
- Как живой опытный тренер, а не энциклопедия: коротко, по делу, с конкретикой под этого клиента.
- Технику упражнения объясняешь в 2–4 предложениях простым языком, затем называешь 2–3 типичные ошибки и как их исправить.
- Отвечая про питание, опирайся на фактический рацион и норму клиента из контекста выше: если не добрал белка — скажи сколько и предложи конкретные продукты (например, 150 г творога).
- Корректируй советы по питанию под нагрузку: тренировочный день или отдых.
- Если просят рацион на день — составь завтрак/обед/ужин и 1–2 перекуса под норму калорий и БЖУ, из простых доступных продуктов, с граммовками и итоговой суммой КБЖУ.
- По вопросам здоровья и боли — рекомендуй врача, не ставь диагнозы.`;
}

// ---------- Чат AI-тренера (общий контекст: тренировки + питание) ----------

app.post('/api/chat', async (req, res) => {
  try {
    const { messages = [], context = {} } = req.body;
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: [
        {
          type: 'text',
          text: coachSystemPrompt(context),
        },
      ],
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const reply = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
    res.json({ reply });
  } catch (e) {
    handleError(res, e);
  }
});

// ---------- Распознавание еды по фото (Claude Vision + structured output) ----------

const FOOD_SCHEMA = {
  type: 'object',
  properties: {
    dish: { type: 'string', description: 'Название блюда по-русски' },
    calories: { type: 'number', description: 'Калории всей порции на фото' },
    protein: { type: 'number', description: 'Белки, г' },
    fat: { type: 'number', description: 'Жиры, г' },
    carbs: { type: 'number', description: 'Углеводы, г' },
    fiber: { type: 'number', description: 'Клетчатка, г' },
    portion_g: { type: 'number', description: 'Оценка веса порции, г' },
  },
  required: ['dish', 'calories', 'protein', 'fat', 'carbs', 'fiber', 'portion_g'],
  additionalProperties: false,
};

app.post('/api/food/photo', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Поле image (base64) обязательно' });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: { format: { type: 'json_schema', schema: FOOD_SCHEMA } },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: image },
            },
            {
              type: 'text',
              text: 'Определи блюдо на фото и оцени КБЖУ всей видимой порции. Название блюда — по-русски. Если на фото не еда, верни dish с пояснением и нули.',
            },
          ],
        },
      ],
    });
    res.json(extractJson(response));
  } catch (e) {
    handleError(res, e);
  }
});

// ---------- Парсинг текстового/голосового описания еды ----------

app.post('/api/food/parse', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Поле text обязательно' });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: { format: { type: 'json_schema', schema: FOOD_SCHEMA } },
      messages: [
        {
          role: 'user',
          content: `Пользователь описал приём пищи: «${text}». Оцени КБЖУ всего описанного. Если граммовка не указана — возьми типичную порцию. Название блюда — по-русски, кратко.`,
        },
      ],
    });
    res.json(extractJson(response));
  } catch (e) {
    handleError(res, e);
  }
});

// ---------- Рацион на день под норму КБЖУ ----------

app.post('/api/meal-plan', async (req, res) => {
  try {
    const { context = {} } = req.body;
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: coachSystemPrompt(context),
      messages: [
        {
          role: 'user',
          content:
            'Составь рацион на сегодня: завтрак, обед, ужин и 1–2 перекуса. Уложись в мою норму калорий и БЖУ с учётом типа дня (тренировка/отдых). Простые блюда, доступные продукты, граммовки и итоговая сумма КБЖУ.',
        },
      ],
    });
    const plan = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
    res.json({ plan });
  } catch (e) {
    handleError(res, e);
  }
});

app.get('/health', (_req, res) => res.json({ ok: true, model: MODEL }));

// ---------- Утилиты ----------

function extractJson(response) {
  // output_config.format гарантирует: первый text-блок — валидный JSON по схеме
  const text = response.content.find((b) => b.type === 'text')?.text ?? '{}';
  return JSON.parse(text);
}

function handleError(res, e) {
  console.error(e);
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'На сервере не задан ANTHROPIC_API_KEY' });
  }
  if (e instanceof Anthropic.AuthenticationError) {
    return res.status(500).json({ error: 'Неверный ANTHROPIC_API_KEY на сервере' });
  }
  if (e instanceof Anthropic.RateLimitError) {
    return res.status(429).json({ error: 'Лимит запросов к Claude, попробуй через минуту' });
  }
  if (e instanceof Anthropic.APIError) {
    return res.status(502).json({ error: `Ошибка Claude API: ${e.message}` });
  }
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
}

app.listen(PORT, () => {
  console.log(`AI-сервер запущен: http://localhost:${PORT} (модель ${MODEL})`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY не задан — запросы к Claude будут падать');
  }
});
