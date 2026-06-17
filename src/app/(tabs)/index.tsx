import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalorieRing } from '@/components/CalorieRing';
import { Body, Button, Card, Muted, Subtitle, Title } from '@/components/ui';
import { EXERCISES_BY_ID } from '@/data/exercises';
import { PROGRAMS_BY_ID } from '@/data/programs';
import * as db from '@/db/database';
import { calcTargets } from '@/lib/tdee';
import { useApp } from '@/store/AppContext';
import { useWorkout } from '@/store/WorkoutContext';
import { colors, fonts, radius, spacing } from '@/theme';

const DAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export default function Dashboard() {
  const { profile } = useApp();
  const { active } = useWorkout();
  const [streak, setStreak] = useState(0);
  const [kcalToday, setKcalToday] = useState(0);
  const [doneToday, setDoneToday] = useState(false);
  const [programDayIndex, setProgramDayIndex] = useState(0);

  const program = PROGRAMS_BY_ID[profile.programId];
  const todayDow = new Date().getDay();
  const isTrainingDay = profile.trainingDays.includes(todayDow);
  const targets = calcTargets(profile, isTrainingDay);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setStreak(await db.getStreakWeeks());
        const entries = await db.getNutritionByDate(db.todayStr());
        setKcalToday(entries.reduce((a, e) => a + e.calories, 0));
        const dates = await db.getWorkoutDates(1);
        setDoneToday(dates.includes(db.todayStr()));
        const count = await db.getProgramWorkoutCount();
        setProgramDayIndex(program ? count % program.days.length : 0);
      })();
    }, [profile.programId])
  );

  const nextDay = program?.days[programDayIndex];
  const nextTrainingDow = findNextTrainingDay(profile.trainingDays, todayDow, doneToday);

  const startProgramWorkout = () => router.push('/workout/start?mode=program');
  const startFreeWorkout = () => router.push('/workout/start?mode=free');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Muted>{formatToday()}</Muted>
            <Title>Главная</Title>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakNum}>{streak}</Text>
            <Muted style={{ fontSize: 10 }}>нед.</Muted>
          </View>
        </View>

        {active && (
          <Pressable onPress={() => router.push('/workout/active')}>
            <Card style={styles.activeCard}>
              <Subtitle style={{ color: colors.onAccent }}>Тренировка идёт</Subtitle>
              <Text style={styles.activeCardText}>{active.name} — вернуться →</Text>
            </Card>
          </Pressable>
        )}

        {/* Следующая тренировка */}
        <Card>
          <Muted>Следующая тренировка</Muted>
          {doneToday && !active ? (
            <>
              <Subtitle style={styles.cardTitle}>Сегодня уже отработано 💪</Subtitle>
              <Body style={{ color: colors.textSecondary }}>
                Следующая — {nextTrainingDow != null ? DAY_LABELS[nextTrainingDow] : 'по расписанию'}
                {nextDay ? `: ${nextDay.name}` : ''}
              </Body>
            </>
          ) : (
            <>
              <Subtitle style={styles.cardTitle}>
                {isTrainingDay ? 'Сегодня' : nextTrainingDow != null ? DAY_LABELS[nextTrainingDow] : '—'}
                {nextDay ? ` · ${nextDay.name}` : ''}
              </Subtitle>
              {nextDay && (
                <Body style={{ color: colors.textSecondary }} numberOfLines={2}>
                  {nextDay.exercises
                    .map((e) => EXERCISES_BY_ID[e.exerciseId]?.name ?? e.exerciseId)
                    .join(' · ')}
                </Body>
              )}
            </>
          )}
          <View style={styles.quickRow}>
            <Button title="Быстрый старт" onPress={startProgramWorkout} style={styles.flex1} />
            <Button
              title="Сегодня тренирую сам"
              variant="ghost"
              onPress={startFreeWorkout}
              style={styles.flex1}
            />
          </View>
        </Card>

        {/* Кольцо калорий */}
        <Card style={styles.calorieCard}>
          <View style={styles.flex1}>
            <Muted>Калории за день</Muted>
            <Subtitle style={styles.cardTitle}>
              {Math.max(0, Math.round(targets.calories - kcalToday))} ккал осталось
            </Subtitle>
            <Body style={{ color: colors.textSecondary, fontSize: 13 }}>
              {isTrainingDay ? 'Тренировочный день: норма повышена' : 'День отдыха'}
            </Body>
            <Button
              title="+ Приём пищи"
              variant="secondary"
              onPress={() => router.push('/food/add')}
              style={{ marginTop: spacing.m, alignSelf: 'flex-start' }}
            />
          </View>
          <CalorieRing consumed={kcalToday} target={targets.calories} size={132} />
        </Card>

        {/* Неделя */}
        <Card>
          <Muted style={{ marginBottom: spacing.m }}>Моя неделя</Muted>
          <View style={styles.weekRow}>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const training = profile.trainingDays.includes(d);
              const isToday = d === todayDow;
              return (
                <View
                  key={d}
                  style={[
                    styles.dayCell,
                    training && styles.dayCellTraining,
                    isToday && styles.dayCellToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayCellText,
                      training && { color: colors.accent },
                      isToday && { color: colors.onAccent },
                    ]}
                  >
                    {DAY_LABELS[d]}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function findNextTrainingDay(days: number[], today: number, doneToday: boolean): number | null {
  if (days.length === 0) return null;
  for (let i = doneToday ? 1 : 0; i <= 7; i++) {
    const d = (today + i) % 7;
    if (days.includes(d)) return d;
  }
  return null;
}

function formatToday(): string {
  const d = new Date();
  return d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.l, gap: spacing.l, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  streakFire: { fontSize: 16 },
  streakNum: { fontFamily: fonts.extraBold, fontSize: 18, color: colors.accent },
  activeCard: { backgroundColor: colors.accent, borderColor: colors.accent },
  activeCardText: { fontFamily: fonts.semiBold, color: colors.onAccent, marginTop: 4 },
  cardTitle: { marginTop: 4, marginBottom: 4 },
  quickRow: { flexDirection: 'row', gap: spacing.m, marginTop: spacing.l },
  flex1: { flex: 1 },
  calorieCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
  weekRow: { flexDirection: 'row', gap: spacing.s },
  dayCell: {
    flex: 1,
    aspectRatio: 0.9,
    borderRadius: radius.s,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellTraining: { borderWidth: 1, borderColor: colors.accent, backgroundColor: colors.accentDim },
  dayCellToday: { backgroundColor: colors.accent },
  dayCellText: { fontFamily: fonts.bold, fontSize: 12, color: colors.textSecondary },
});
