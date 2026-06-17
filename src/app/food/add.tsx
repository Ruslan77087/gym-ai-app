import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Chip, Muted, Subtitle, Title } from '@/components/ui';
import { parseFoodText } from '@/lib/ai';
import * as db from '@/db/database';
import { FoodAnalysis, FoodItem, MealType } from '@/lib/types';
import { colors, fonts, radius, spacing } from '@/theme';

const MEALS: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Завтрак' },
  { key: 'lunch', label: 'Обед' },
  { key: 'dinner', label: 'Ужин' },
  { key: 'snack', label: 'Перекус' },
];

function guessMeal(): MealType {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

export default function FoodAdd() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState('150');
  const [meal, setMeal] = useState<MealType>(guessMeal());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<FoodAnalysis | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      db.searchFood(query || 'а').then(setResults);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const saveFromBase = async () => {
    if (!selected) return;
    const g = parseFloat(grams.replace(',', '.')) || 100;
    const k = g / 100;
    await db.addNutritionEntry(
      db.todayStr(),
      meal,
      {
        dish: selected.name,
        calories: selected.calories * k,
        protein: selected.protein * k,
        fat: selected.fat * k,
        carbs: selected.carbs * k,
        fiber: selected.fiber * k,
        portion_g: g,
      },
      'text'
    );
    router.back();
  };

  // Голос/текст: системная диктовка клавиатуры превращает речь в текст,
  // Claude разбирает описание («съел тарелку гречки с курицей 200г») в КБЖУ
  const askAi = async () => {
    if (!query.trim() || aiLoading) return;
    setAiError(null);
    setAiLoading(true);
    setSelected(null);
    try {
      setAiResult(await parseFoodText(query.trim()));
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'AI недоступен');
    } finally {
      setAiLoading(false);
    }
  };

  const saveAiResult = async () => {
    if (!aiResult) return;
    await db.addNutritionEntry(db.todayStr(), meal, aiResult, 'voice');
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Title style={{ fontSize: 22 }}>Добавить приём</Title>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setAiResult(null);
          }}
          placeholder="Поиск или опиши голосом: «тарелка гречки с курицей 200 г»"
          placeholderTextColor={colors.textMuted}
          multiline
        />
        <Muted style={{ fontSize: 11, marginTop: 6 }}>
          🎙 Для голосового ввода нажми микрофон на клавиатуре и продиктуй — затем «Спросить AI».
        </Muted>
      </View>

      <View style={styles.mealRow}>
        {MEALS.map((m) => (
          <Chip key={m.key} label={m.label} selected={meal === m.key} onPress={() => setMeal(m.key)} />
        ))}
      </View>

      {query.trim().length > 2 && !aiResult && (
        <View style={styles.aiAskWrap}>
          <Button
            title={aiLoading ? 'Анализирую…' : '✨ Спросить AI (свободное описание)'}
            variant="secondary"
            onPress={askAi}
            loading={aiLoading}
          />
          {aiError && <Muted style={{ color: colors.danger }}>{aiError}</Muted>}
        </View>
      )}

      {aiResult && (
        <Card style={styles.aiResultCard}>
          <Subtitle style={{ fontSize: 15 }}>{aiResult.dish}</Subtitle>
          <Text style={styles.aiKcal}>{Math.round(aiResult.calories)} ккал</Text>
          <Muted>
            {Math.round(aiResult.portion_g)} г · Б {Math.round(aiResult.protein)} · Ж{' '}
            {Math.round(aiResult.fat)} · У {Math.round(aiResult.carbs)}
          </Muted>
          <Button title="Записать в дневник" onPress={saveAiResult} style={{ marginTop: spacing.m }} />
        </Card>
      )}

      <FlatList
        data={results}
        keyExtractor={(f) => String(f.id)}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setSelected(item);
              setAiResult(null);
            }}
            style={[styles.row, selected?.id === item.id && styles.rowSelected]}
          >
            <View style={styles.flex1}>
              <Text style={styles.rowName}>{item.name}</Text>
              <Muted style={{ fontSize: 11 }}>
                {item.category} · Б {item.protein} · Ж {item.fat} · У {item.carbs} (на 100 г)
              </Muted>
            </View>
            <Text style={styles.rowKcal}>{Math.round(item.calories)}</Text>
          </Pressable>
        )}
      />

      {selected && (
        <View style={styles.bottomBar}>
          <View style={styles.flex1}>
            <Muted style={{ fontSize: 11 }}>{selected.name}</Muted>
            <View style={styles.gramsRow}>
              <TextInput
                style={styles.gramsInput}
                value={grams}
                onChangeText={setGrams}
                keyboardType="numeric"
                selectTextOnFocus
              />
              <Text style={styles.gramsSuffix}>г</Text>
              <Text style={styles.gramsKcal}>
                = {Math.round((selected.calories * (parseFloat(grams.replace(',', '.')) || 0)) / 100)} ккал
              </Text>
            </View>
          </View>
          <Button title="Записать" onPress={saveFromBase} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.l,
  },
  close: { color: colors.textSecondary, fontSize: 24, padding: 4 },
  searchWrap: { paddingHorizontal: spacing.l },
  search: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
  },
  mealRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  aiAskWrap: { paddingHorizontal: spacing.l, gap: spacing.s, marginBottom: spacing.s },
  aiResultCard: { marginHorizontal: spacing.l, borderColor: colors.accent, marginBottom: spacing.s },
  aiKcal: { fontFamily: fonts.extraBold, fontSize: 26, color: colors.accent, marginVertical: 2 },
  list: { padding: spacing.l, gap: spacing.s, paddingBottom: 120 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
  },
  rowSelected: { borderColor: colors.accent, backgroundColor: colors.accentDim },
  flex1: { flex: 1 },
  rowName: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  rowKcal: { fontFamily: fonts.bold, fontSize: 15, color: colors.accent },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    padding: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  gramsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  gramsInput: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 8,
    width: 70,
  },
  gramsSuffix: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  gramsKcal: { fontFamily: fonts.bold, fontSize: 14, color: colors.accent },
});
