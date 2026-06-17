// Клиент AI-сервера. API-ключ Anthropic хранится ТОЛЬКО на сервере (server/).
// Адрес сервера задаётся переменной EXPO_PUBLIC_API_URL (см. README).
import { ChatMessage, FoodAnalysis } from './types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface CoachContext {
  goal: string;
  level: string;
  programName: string;
  todayWorkout: string;
  recentPRs: string;
  nutritionToday: string;
  targets: string;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI-сервер недоступен (${res.status}). ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

/** Единый чат AI-тренера/нутрициолога с общим контекстом */
export async function chatWithCoach(
  messages: ChatMessage[],
  context: CoachContext
): Promise<string> {
  const data = await post<{ reply: string }>('/api/chat', { messages, context });
  return data.reply;
}

/** Распознавание еды по фото (base64 JPEG) через Claude Vision */
export async function analyzeFoodPhoto(imageBase64: string): Promise<FoodAnalysis> {
  return post<FoodAnalysis>('/api/food/photo', { image: imageBase64 });
}

/** Парсинг текстового/голосового описания приёма пищи в КБЖУ */
export async function parseFoodText(text: string): Promise<FoodAnalysis> {
  return post<FoodAnalysis>('/api/food/parse', { text });
}

/** Генерация рациона на день под норму КБЖУ */
export async function generateMealPlan(context: CoachContext): Promise<string> {
  const data = await post<{ plan: string }>('/api/meal-plan', { context });
  return data.plan;
}
