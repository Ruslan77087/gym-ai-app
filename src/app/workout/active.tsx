import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RestTimer } from '@/components/RestTimer';
import { Button, Card, Muted, Subtitle } from '@/components/ui';
import { EXERCISES_BY_ID } from '@/data/exercises';
import { ActiveExercise, ActiveSet, useWorkout } from '@/store/WorkoutContext';
import { colors, fonts, radius, spacing } from '@/theme';

export default function ActiveWorkout() {
  const { active, saveSet, addSetTo, finish, cancel } = useWorkout();
  const [restFor, setRestFor] = useState<{ exerciseId: string; seconds: number } | null>(null);
  const [elapsed, setElapsed] = useState('0:00');

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      const s = Math.floor((Date.now() - active.startedAt) / 1000);
      setElapsed(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(t);
  }, [active?.startedAt]);

  if (!active) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyWrap}>
          <Muted>Нет активной тренировки</Muted>
          <Button title="Назад" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const totalSets = active.exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = active.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);

  // Главный сценарий: отметить подход → запустить таймер отдыха. 3–5 секунд на ввод.
  const completeSet = async (ex: ActiveExercise, set: ActiveSet, weight: number, reps: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    await saveSet(ex.exerciseId, set.id, weight, reps, true);
    const isLastSet = ex.sets.filter((s) => !s.done && s.id !== set.id).length === 0;
    if (!isLastSet) setRestFor({ exerciseId: ex.exerciseId, seconds: ex.restSec });
  };

  const onFinish = () => {
    if (doneSets === 0) {
      Alert.alert('Завершить?', 'Ни один подход не отмечен. Тренировка не сохранится.', [
        { text: 'Продолжить', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: async () => { await cancel(); router.back(); } },
      ]);
      return;
    }
    Alert.alert('Завершить тренировку?', `Выполнено ${doneSets} из ${totalSets} подходов.`, [
      { text: 'Ещё нет', style: 'cancel' },
      {
        text: 'Завершить',
        onPress: async () => {
          await finish();
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.flex1}>
          <Subtitle numberOfLines={1}>{active.name}</Subtitle>
          <Muted>
            {elapsed} · {doneSets}/{totalSets} подходов
          </Muted>
        </View>
        <Pressable onPress={onFinish} style={styles.finishBtn}>
          <Text style={styles.finishText}>Завершить</Text>
        </Pressable>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%` }]}
        />
      </View>

      {restFor && (
        <View style={styles.timerWrap}>
          <RestTimer
            seconds={restFor.seconds}
            onDone={() => setRestFor(null)}
            onSkip={() => setRestFor(null)}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.list}>
        {active.exercises.map((ex) => (
          <ExerciseBlock key={ex.exerciseId} ex={ex} onComplete={completeSet} onAddSet={addSetTo} />
        ))}
        <Button
          title="+ Добавить упражнение"
          variant="ghost"
          onPress={() => router.push('/exercises?picker=1')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ExerciseBlock({
  ex,
  onComplete,
  onAddSet,
}: {
  ex: ActiveExercise;
  onComplete: (ex: ActiveExercise, set: ActiveSet, weight: number, reps: number) => void;
  onAddSet: (exerciseId: string) => void;
}) {
  const info = EXERCISES_BY_ID[ex.exerciseId];
  return (
    <Card style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.flex1}>
          <Subtitle>{info?.name ?? ex.exerciseId}</Subtitle>
          <Muted>
            {ex.rpe ? `${ex.rpe} · ` : ''}отдых {Math.round(ex.restSec / 60 * 10) / 10} мин
            {ex.suggestionReason === 'progress' && ex.suggestedWeight > 0
              ? ` · прогрессия: ${ex.suggestedWeight} кг ↑`
              : ex.suggestionReason === 'repeat' && ex.suggestedWeight > 0
                ? ` · повтори ${ex.suggestedWeight} кг`
                : ''}
          </Muted>
        </View>
      </View>

      <View style={styles.setsHeader}>
        <Text style={[styles.setsHeaderText, styles.setCol]}>#</Text>
        <Text style={[styles.setsHeaderText, styles.inputCol]}>кг</Text>
        <Text style={[styles.setsHeaderText, styles.inputCol]}>повт.</Text>
        <Text style={[styles.setsHeaderText, styles.checkCol]}>цель {ex.sets[0]?.targetReps ?? ''}</Text>
      </View>

      {ex.sets.map((set, i) => (
        <SetRowView key={set.id} index={i} set={set} onComplete={(w, r) => onComplete(ex, set, w, r)} />
      ))}

      <Pressable onPress={() => onAddSet(ex.exerciseId)} style={styles.addSetBtn}>
        <Text style={styles.addSetText}>+ подход</Text>
      </Pressable>
    </Card>
  );
}

/** Строка подхода: ввод веса и повторений за 3–5 секунд, одна кнопка подтверждения */
function SetRowView({
  index,
  set,
  onComplete,
}: {
  index: number;
  set: ActiveSet;
  onComplete: (weight: number, reps: number) => void;
}) {
  const [weight, setWeight] = useState(set.weight > 0 ? String(set.weight) : '');
  const [reps, setReps] = useState(set.reps > 0 ? String(set.reps) : '');

  return (
    <View style={[styles.setRow, set.done && styles.setRowDone]}>
      <Text style={[styles.setNum, styles.setCol]}>{index + 1}</Text>
      <TextInput
        style={[styles.setInput, styles.inputCol]}
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        editable={!set.done}
        selectTextOnFocus
      />
      <TextInput
        style={[styles.setInput, styles.inputCol]}
        value={reps}
        onChangeText={setReps}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        editable={!set.done}
        selectTextOnFocus
      />
      <Pressable
        style={[styles.checkBtn, styles.checkCol, set.done && styles.checkBtnDone]}
        onPress={() => {
          if (set.done) return;
          onComplete(parseFloat(weight.replace(',', '.')) || 0, parseInt(reps, 10) || 0);
        }}
      >
        <Text style={[styles.checkText, set.done && { color: colors.onAccent }]}>
          {set.done ? '✓' : 'OK'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.l },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    gap: spacing.m,
  },
  flex1: { flex: 1 },
  finishBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.s,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  finishText: { fontFamily: fonts.bold, fontSize: 13, color: colors.onAccent },
  progressBar: { height: 3, backgroundColor: colors.surfaceHigh, marginHorizontal: spacing.l },
  progressFill: { height: 3, backgroundColor: colors.accent, borderRadius: 2 },
  timerWrap: { paddingHorizontal: spacing.l, paddingTop: spacing.m },
  list: { padding: spacing.l, gap: spacing.l, paddingBottom: 60 },
  exerciseCard: { gap: spacing.s },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center' },
  setsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.s, marginTop: spacing.s },
  setsHeaderText: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted },
  setCol: { width: 22, textAlign: 'center' },
  inputCol: { flex: 1, textAlign: 'center' },
  checkCol: { width: 74, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  setRowDone: { opacity: 0.55 },
  setNum: { fontFamily: fonts.bold, fontSize: 14, color: colors.textSecondary },
  setInput: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 17,
    textAlign: 'center',
    paddingVertical: 10,
  },
  checkBtn: {
    width: 74,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: 10,
    alignItems: 'center',
  },
  checkBtnDone: { backgroundColor: colors.accent },
  checkText: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.accent },
  addSetBtn: { paddingVertical: 8, alignItems: 'center' },
  addSetText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textSecondary },
});
