import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalorieRing } from '@/components/CalorieRing';
import { MacroTile } from '@/components/MacroTile';
import { Button, Card, Muted, Subtitle, Title } from '@/components/ui';
import * as db from '@/db/database';
import { calcTargets } from '@/lib/tdee';
import { MealType, NutritionEntry } from '@/lib/types';
import { useApp } from '@/store/AppContext';
import { colors, fonts, radius, spacing } from '@/theme';

const MEALS: { key: MealType; label: string; emoji: string }[] = [
  { key: 'breakfast', label: 'Завтрак', emoji: '🍳' },
  { key: 'lunch', label: 'Обед', emoji: '🍲' },
  { key: 'dinner', label: 'Ужин', emoji: '🍗' },
  { key: 'snack', label: 'Перекус', emoji: '🥜' },
];

export default function Nutrition() {
  const { profile } = useApp();
  const [entries, setEntries] = useState<NutritionEntry[]>([]);

  const isTrainingDay = profile.trainingDays.includes(new Date().getDay());
  const targets = calcTargets(profile, isTrainingDay);

  const reload = useCallback(() => {
    db.getNutritionByDate(db.todayStr()).then(setEntries);
  }, []);

  useFocusEffect(reload);

  const totals = entries.reduce(
    (a, e) => ({
      calories: a.calories + e.calories,
      protein: a.protein + e.protein,
      fat: a.fat + e.fat,
      carbs: a.carbs + e.carbs,
      fiber: a.fiber + e.fiber,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
  );

  const removeEntry = (e: NutritionEntry) => {
    Alert.alert('Удалить запись?', e.dish, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await db.deleteNutritionEntry(e.id);
          reload();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Title>Питание</Title>
          <Pressable onPress={() => router.push('/reports')}>
            <Text style={styles.reportsLink}>Отчёты →</Text>
          </Pressable>
        </View>

        <Card style={styles.ringCard}>
          <CalorieRing consumed={totals.calories} target={targets.calories} size={150} />
          <Muted style={{ textAlign: 'center' }}>
            {isTrainingDay ? 'Тренировочный день · норма +125 ккал' : 'День отдыха'}
          </Muted>
        </Card>

        <View style={styles.tilesRow}>
          <MacroTile label="Белки" value={totals.protein} target={targets.protein} color={colors.protein} />
          <MacroTile label="Жиры" value={totals.fat} target={targets.fat} color={colors.fat} />
        </View>
        <View style={styles.tilesRow}>
          <MacroTile label="Углеводы" value={totals.carbs} target={targets.carbs} color={colors.carbs} />
          <MacroTile label="Клетчатка" value={totals.fiber} target={targets.fiber} color={colors.fiber} />
        </View>

        <View style={styles.actionsRow}>
          <Button
            title="📷 Сфотографировать"
            onPress={() => router.push('/food/photo')}
            style={styles.flex1}
          />
          <Button
            title="+ Добавить"
            variant="secondary"
            onPress={() => router.push('/food/add')}
            style={styles.flex1}
          />
        </View>

        <Pressable onPress={() => router.push('/(tabs)/coach')}>
          <Card style={styles.aiCard}>
            <Text style={styles.aiEmoji}>✨</Text>
            <View style={styles.flex1}>
              <Subtitle style={{ fontSize: 15 }}>AI-нутрициолог</Subtitle>
              <Muted style={{ fontSize: 12 }}>
                Спроси, что съесть перед тренировкой, или попроси рацион на день
              </Muted>
            </View>
            <Text style={styles.aiArrow}>→</Text>
          </Card>
        </Pressable>

        {MEALS.map((meal) => {
          const mealEntries = entries.filter((e) => e.meal_type === meal.key);
          const kcal = mealEntries.reduce((a, e) => a + e.calories, 0);
          return (
            <Card key={meal.key}>
              <View style={styles.mealHeader}>
                <Subtitle style={{ fontSize: 15 }}>
                  {meal.emoji} {meal.label}
                </Subtitle>
                <Text style={styles.mealKcal}>{Math.round(kcal)} ккал</Text>
              </View>
              {mealEntries.length === 0 ? (
                <Muted style={{ fontSize: 12 }}>—</Muted>
              ) : (
                mealEntries.map((e) => (
                  <Pressable key={e.id} onLongPress={() => removeEntry(e)} style={styles.entryRow}>
                    <View style={styles.flex1}>
                      <Text style={styles.entryName}>{e.dish}</Text>
                      <Muted style={{ fontSize: 11 }}>
                        {Math.round(e.portion_g)} г · Б {Math.round(e.protein)} · Ж {Math.round(e.fat)} · У{' '}
                        {Math.round(e.carbs)}
                        {e.source === 'photo' ? ' · 📷' : e.source === 'voice' ? ' · 🎙' : ''}
                      </Muted>
                    </View>
                    <Text style={styles.entryKcal}>{Math.round(e.calories)}</Text>
                  </Pressable>
                ))
              )}
            </Card>
          );
        })}
        <Muted style={{ textAlign: 'center', fontSize: 11 }}>
          Долгое нажатие на запись — удалить
        </Muted>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.l, gap: spacing.m, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportsLink: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.accent },
  ringCard: { alignItems: 'center', gap: spacing.s },
  tilesRow: { flexDirection: 'row', gap: spacing.m },
  actionsRow: { flexDirection: 'row', gap: spacing.m },
  flex1: { flex: 1 },
  aiCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.m, borderColor: colors.accent },
  aiEmoji: { fontSize: 24 },
  aiArrow: { fontFamily: fonts.bold, fontSize: 18, color: colors.accent },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  mealKcal: { fontFamily: fonts.bold, fontSize: 14, color: colors.textSecondary },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  entryName: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  entryKcal: { fontFamily: fonts.bold, fontSize: 15, color: colors.accent },
});
