import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Chip, Muted, Title } from '@/components/ui';
import * as db from '@/db/database';
import { FoodItem, MealType } from '@/lib/types';
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
      'manual'
    );
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
          onChangeText={setQuery}
          placeholder="Поиск по базе продуктов: «гречка», «куриная грудка»…"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.mealRow}>
        {MEALS.map((m) => (
          <Chip key={m.key} label={m.label} selected={meal === m.key} onPress={() => setMeal(m.key)} />
        ))}
      </View>

      <FlatList
        data={results}
        keyExtractor={(f) => String(f.id)}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelected(item)}
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
