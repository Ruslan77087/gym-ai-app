import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Body, Button, Card, Muted, Subtitle, Title } from '@/components/ui';
import { EXERCISES_BY_ID, MUSCLE_GROUPS, RECOMMENDED_BY_GROUP } from '@/data/exercises';
import { PROGRAMS_BY_ID } from '@/data/programs';
import { getProgramWorkoutCount } from '@/db/database';
import { useApp } from '@/store/AppContext';
import { useWorkout } from '@/store/WorkoutContext';
import { colors, fonts, radius, spacing } from '@/theme';

export default function WorkoutStart() {
  const { mode: initialMode } = useLocalSearchParams<{ mode?: string }>();
  const { profile } = useApp();
  const { active, start } = useWorkout();
  const [mode, setMode] = useState<'program' | 'free'>(initialMode === 'free' ? 'free' : 'program');
  const [dayIndex, setDayIndex] = useState(0);
  const [starting, setStarting] = useState(false);

  const program = PROGRAMS_BY_ID[profile.programId];

  useEffect(() => {
    getProgramWorkoutCount().then((c) => setDayIndex(program ? c % program.days.length : 0));
  }, [profile.programId]);

  useEffect(() => {
    if (active) router.replace('/workout/active');
  }, [active]);

  const startProgram = async (idx: number) => {
    if (!program || starting) return;
    setStarting(true);
    const day = program.days[idx];
    await start(day.name, 'program', idx, day.exercises);
    router.replace('/workout/active');
  };

  const startFree = async (groupKey: string, groupLabel: string) => {
    if (starting) return;
    setStarting(true);
    const recommended = RECOMMENDED_BY_GROUP[groupKey] ?? [];
    await start(
      `Свободная: ${groupLabel}`,
      'free',
      null,
      recommended.map((id) => ({
        exerciseId: id,
        sets: 3,
        reps: EXERCISES_BY_ID[id]?.isCompound ? '8' : '12',
        restSec: EXERCISES_BY_ID[id]?.isCompound ? 150 : 90,
      }))
    );
    router.replace('/workout/active');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Title>Начать тренировку</Title>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.modeSwitch}>
          <Pressable
            style={[styles.modeBtn, mode === 'program' && styles.modeBtnActive]}
            onPress={() => setMode('program')}
          >
            <Text style={[styles.modeText, mode === 'program' && styles.modeTextActive]}>
              По программе
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeBtn, mode === 'free' && styles.modeBtnActive]}
            onPress={() => setMode('free')}
          >
            <Text style={[styles.modeText, mode === 'free' && styles.modeTextActive]}>
              Свободная
            </Text>
          </Pressable>
        </View>

        {mode === 'program' && program && (
          <>
            <Muted>
              Программа «{program.shortName}». Свободная тренировка не ломает цикл — история и
              прогресс считаются в обоих режимах.
            </Muted>
            {program.days.map((day, i) => (
              <Card key={i} style={i === dayIndex ? styles.nextDayCard : undefined}>
                <View style={styles.dayRow}>
                  <View style={styles.flex1}>
                    <Subtitle>{day.name}</Subtitle>
                    <Muted>
                      {i === dayIndex ? 'Следующая по циклу · ' : ''}
                      {day.exercises.length} упражнений
                    </Muted>
                    <Body style={styles.dayPreview} numberOfLines={2}>
                      {day.exercises
                        .map((e) => EXERCISES_BY_ID[e.exerciseId]?.name ?? e.exerciseId)
                        .join(' · ')}
                    </Body>
                  </View>
                </View>
                <Button
                  title={i === dayIndex ? 'Начать' : 'Начать вне очереди'}
                  variant={i === dayIndex ? 'primary' : 'secondary'}
                  onPress={() => startProgram(i)}
                  loading={starting}
                  style={{ marginTop: spacing.m }}
                />
              </Card>
            ))}
          </>
        )}

        {mode === 'free' && (
          <>
            <Muted>
              Выбери группу мышц — соберём рекомендованные упражнения. Веса подтянутся из истории
              (последний результат + прогрессия). Добавить любое упражнение можно уже внутри
              тренировки.
            </Muted>
            <View style={styles.groupGrid}>
              {MUSCLE_GROUPS.map((g) => (
                <Pressable
                  key={g.key}
                  style={styles.groupCard}
                  onPress={() => startFree(g.key, g.label)}
                >
                  <Text style={styles.groupEmoji}>{g.emoji}</Text>
                  <Text style={styles.groupLabel}>{g.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.l, gap: spacing.l, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: { color: colors.textSecondary, fontSize: 24, padding: 4 },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.s, alignItems: 'center' },
  modeBtnActive: { backgroundColor: colors.accent },
  modeText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textSecondary },
  modeTextActive: { color: colors.onAccent, fontFamily: fonts.bold },
  nextDayCard: { borderColor: colors.accent },
  dayRow: { flexDirection: 'row', gap: spacing.m },
  flex1: { flex: 1 },
  dayPreview: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  groupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.m },
  groupCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.l,
    alignItems: 'center',
    gap: spacing.s,
  },
  groupEmoji: { fontSize: 32 },
  groupLabel: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
});
