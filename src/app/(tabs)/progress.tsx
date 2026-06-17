import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChartPoint, LineChart } from '@/components/LineChart';
import { Card, Chip, Muted, Subtitle, Title } from '@/components/ui';
import { EXERCISES_BY_ID } from '@/data/exercises';
import * as db from '@/db/database';
import { PersonalRecord } from '@/lib/types';
import { colors, fonts, radius, spacing } from '@/theme';

const KEY_LIFTS = ['squat', 'bench-press', 'deadlift', 'overhead-press'];

export default function Progress() {
  const { width } = useWindowDimensions();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [selectedLift, setSelectedLift] = useState('bench-press');
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [trainedExercises, setTrainedExercises] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const prs = await db.getPersonalRecords();
        setRecords(prs);
        const trained = prs.map((p) => p.exercise_id);
        const lifts = [...KEY_LIFTS.filter((l) => trained.includes(l)),
                       ...trained.filter((t) => !KEY_LIFTS.includes(t))];
        setTrainedExercises(lifts.length ? lifts : KEY_LIFTS);
      })();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      db.getExerciseHistory(selectedLift, 20).then((rows) =>
        setChart(
          rows.map((r) => ({
            label: new Date(r.date + 'T12:00:00').toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'numeric',
            }),
            value: r.weight,
          }))
        )
      );
    }, [selectedLift])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Title>Прогресс</Title>

        <Card>
          <Subtitle style={{ marginBottom: spacing.m }}>График весов</Subtitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {trainedExercises.slice(0, 12).map((id) => (
              <Chip
                key={id}
                label={EXERCISES_BY_ID[id]?.name ?? id}
                selected={selectedLift === id}
                onPress={() => setSelectedLift(id)}
              />
            ))}
          </ScrollView>
          <View style={{ marginTop: spacing.m }}>
            <LineChart points={chart} width={width - spacing.l * 4} unit=" кг" />
          </View>
        </Card>

        <Card>
          <Subtitle style={{ marginBottom: spacing.m }}>Личные рекорды</Subtitle>
          {records.length === 0 && (
            <Muted>Рекорды появятся после первых завершённых тренировок.</Muted>
          )}
          {records.slice(0, 15).map((r) => (
            <View key={r.exercise_id} style={styles.prRow}>
              <View style={styles.flex1}>
                <Text style={styles.prName}>{EXERCISES_BY_ID[r.exercise_id]?.name ?? r.exercise_id}</Text>
                <Muted style={{ fontSize: 11 }}>{r.date}</Muted>
              </View>
              <Text style={styles.prValue}>
                {r.weight} кг × {r.reps}
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.l, gap: spacing.l, paddingBottom: 40 },
  chips: { gap: spacing.s },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.m,
  },
  flex1: { flex: 1 },
  prName: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  prValue: { fontFamily: fonts.extraBold, fontSize: 16, color: colors.accent },
});
