import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Muted, Subtitle, Title } from '@/components/ui';
import { EXERCISES_BY_ID } from '@/data/exercises';
import * as db from '@/db/database';
import { SetRow, WorkoutRow } from '@/lib/types';
import { colors, fonts, radius, spacing } from '@/theme';

interface WorkoutWithSets extends WorkoutRow {
  sets: SetRow[];
}

export default function Diary() {
  const [workouts, setWorkouts] = useState<WorkoutWithSets[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const rows = await db.getWorkouts(60);
        const full: WorkoutWithSets[] = [];
        for (const w of rows) {
          full.push({ ...w, sets: await db.getWorkoutSets(w.id) });
        }
        setWorkouts(full);
      })();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Title>Дневник</Title>
        {workouts.length === 0 && (
          <Card>
            <Muted>Здесь появится история тренировок. Начни первую с главного экрана!</Muted>
          </Card>
        )}
        {workouts.map((w) => {
          const volume = w.sets.reduce((a, s) => a + s.weight * s.reps, 0);
          const duration = w.finished_at
            ? Math.round(
                (new Date(w.finished_at).getTime() - new Date(w.started_at).getTime()) / 60000
              )
            : 0;
          const byExercise = groupSets(w.sets);
          return (
            <Pressable key={w.id} onPress={() => setExpanded(expanded === w.id ? null : w.id)}>
              <Card>
                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Subtitle>{w.name}</Subtitle>
                    <Muted>
                      {formatDate(w.date)} · {w.mode === 'program' ? 'программа' : 'свободная'} ·{' '}
                      {duration} мин · {Math.round(volume / 1000 * 10) / 10} т
                    </Muted>
                  </View>
                  <Text style={styles.chevron}>{expanded === w.id ? '▴' : '▾'}</Text>
                </View>
                {expanded === w.id && (
                  <View style={styles.detail}>
                    {Object.entries(byExercise).map(([exId, sets]) => (
                      <View key={exId} style={styles.exerciseDetail}>
                        <Text style={styles.exerciseName}>
                          {EXERCISES_BY_ID[exId]?.name ?? exId}
                        </Text>
                        <Text style={styles.setsText}>
                          {sets.map((s) => `${s.weight}×${s.reps}`).join('  ')}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function groupSets(sets: SetRow[]): Record<string, SetRow[]> {
  const out: Record<string, SetRow[]> = {};
  for (const s of sets) {
    (out[s.exercise_id] ??= []).push(s);
  }
  return out;
}

function formatDate(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.l, gap: spacing.m, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
  flex1: { flex: 1 },
  chevron: { color: colors.accent, fontSize: 18, fontFamily: fonts.bold },
  detail: { marginTop: spacing.m, gap: spacing.s },
  exerciseDetail: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.s,
    padding: spacing.m,
    gap: 4,
  },
  exerciseName: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text },
  setsText: { fontFamily: fonts.medium, fontSize: 13, color: colors.accent },
});
