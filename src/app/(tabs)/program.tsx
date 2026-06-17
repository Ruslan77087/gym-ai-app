import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Body, Card, Chip, Muted, Subtitle, Title } from '@/components/ui';
import { EXERCISES_BY_ID } from '@/data/exercises';
import { PROGRAMS, PROGRAMS_BY_ID } from '@/data/programs';
import { useApp } from '@/store/AppContext';
import { colors, fonts, radius, spacing } from '@/theme';

export default function ProgramTab() {
  const { profile, updateProfile } = useApp();
  const program = PROGRAMS_BY_ID[profile.programId] ?? PROGRAMS[0];
  const [expandedDay, setExpandedDay] = useState(0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Title>Программа</Title>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {PROGRAMS.map((p) => (
            <Chip
              key={p.id}
              label={p.shortName}
              selected={p.id === program.id}
              onPress={() => updateProfile({ programId: p.id })}
            />
          ))}
        </ScrollView>

        <Card>
          <Subtitle>{program.name}</Subtitle>
          <Body style={styles.desc}>{program.description}</Body>
          <Muted style={{ marginTop: 6 }}>
            {program.daysPerWeek} дн/нед · Прогрессия: базовые +2.5 кг каждые 1–2 недели,
            изолирующие +1.25–2.5 кг каждые 2 недели. Вес растёт только при выполнении целевых
            повторений.
          </Muted>
        </Card>

        {program.days.map((day, i) => (
          <Pressable key={i} onPress={() => setExpandedDay(expandedDay === i ? -1 : i)}>
            <Card>
              <View style={styles.dayHeader}>
                <View style={styles.flex1}>
                  <Subtitle>{day.name}</Subtitle>
                  <Muted>{day.focus}</Muted>
                </View>
                <Text style={styles.chevron}>{expandedDay === i ? '▴' : '▾'}</Text>
              </View>
              {expandedDay === i && (
                <View style={styles.exerciseList}>
                  {day.exercises.map((e, j) => {
                    const ex = EXERCISES_BY_ID[e.exerciseId];
                    return (
                      <View key={j} style={styles.exerciseRow}>
                        <View style={styles.flex1}>
                          <Text style={styles.exerciseName}>{ex?.name ?? e.exerciseId}</Text>
                          <Muted style={{ fontSize: 11 }}>
                            отдых {formatRest(e.restSec)}
                            {e.rpe ? ` · ${e.rpe}` : ''}
                          </Muted>
                        </View>
                        <Text style={styles.setsReps}>
                          {e.sets}×{e.reps}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatRest(sec: number): string {
  if (sec < 60) return `${sec} сек`;
  const m = sec / 60;
  return Number.isInteger(m) ? `${m} мин` : `${m.toFixed(1)} мин`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.l, gap: spacing.l, paddingBottom: 40 },
  chips: { gap: spacing.s },
  desc: { color: colors.textSecondary, marginTop: 4 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
  flex1: { flex: 1 },
  chevron: { color: colors.accent, fontSize: 18, fontFamily: fonts.bold },
  exerciseList: { marginTop: spacing.m, gap: spacing.m },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.s,
    padding: spacing.m,
  },
  exerciseName: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  setsReps: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.accent },
});
