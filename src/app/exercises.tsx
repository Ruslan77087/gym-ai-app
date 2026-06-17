import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip, Muted, Subtitle, Title } from '@/components/ui';
import { EXERCISES, MUSCLE_GROUPS } from '@/data/exercises';
import { Exercise } from '@/lib/types';
import { useWorkout } from '@/store/WorkoutContext';
import { colors, fonts, radius, spacing } from '@/theme';

export default function ExerciseLibrary() {
  const { picker } = useLocalSearchParams<{ picker?: string }>();
  const isPicker = picker === '1';
  const { active, addExercise } = useWorkout();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter(
      (e) =>
        (!group || e.muscleGroup === group) &&
        (!q || e.name.toLowerCase().includes(q) || e.equipment.toLowerCase().includes(q))
    );
  }, [query, group]);

  const pick = async (e: Exercise) => {
    if (isPicker && active) {
      await addExercise(e.id, 3, e.isCompound ? '8' : '12', e.isCompound ? 150 : 90);
      router.back();
    } else {
      setExpanded(expanded === e.id ? null : e.id);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Title style={{ fontSize: 22 }}>{isPicker ? 'Добавить упражнение' : 'Упражнения'}</Title>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Поиск по названию или инвентарю…"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          <Chip label="Все" selected={group === null} onPress={() => setGroup(null)} />
          {MUSCLE_GROUPS.filter((g) => g.key !== 'fullbody').map((g) => (
            <Chip
              key={g.key}
              label={g.label}
              selected={group === g.key}
              onPress={() => setGroup(group === g.key ? null : g.key)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable onPress={() => pick(item)} style={styles.row}>
            <View style={styles.rowHeader}>
              <View style={styles.flex1}>
                <Subtitle style={{ fontSize: 15 }}>{item.name}</Subtitle>
                <Muted style={{ fontSize: 12 }}>
                  {MUSCLE_GROUPS.find((g) => g.key === item.muscleGroup)?.label} · {item.equipment}
                  {item.isCompound ? ' · базовое' : ''}
                </Muted>
              </View>
              <Text style={styles.action}>{isPicker ? '+' : expanded === item.id ? '▴' : '▾'}</Text>
            </View>
            {expanded === item.id && !isPicker && (
              <Text style={styles.description}>{item.description}</Text>
            )}
          </Pressable>
        )}
      />
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
  searchWrap: { paddingHorizontal: spacing.l, marginBottom: spacing.m },
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
  },
  chips: { gap: spacing.s, paddingHorizontal: spacing.l, paddingBottom: spacing.m },
  list: { padding: spacing.l, gap: spacing.s, paddingBottom: 40 },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
  },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
  flex1: { flex: 1 },
  action: { color: colors.accent, fontSize: 20, fontFamily: fonts.bold },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: spacing.s,
  },
});
