import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Chip, Muted, Title } from '@/components/ui';
import { pickProgram } from '@/data/programs';
import { calcTargets } from '@/lib/tdee';
import { Goal, Level, Sex } from '@/lib/types';
import { useApp } from '@/store/AppContext';
import { colors, fonts, radius, spacing } from '@/theme';

const GOALS: { key: Goal; label: string; hint: string }[] = [
  { key: 'mass', label: 'Масса', hint: 'Набор мышечной массы' },
  { key: 'cut', label: 'Рельеф', hint: 'Снижение жира, сохранение мышц' },
  { key: 'strength', label: 'Сила', hint: 'Рост силовых показателей' },
  { key: 'fitness', label: 'Общая форма', hint: 'Здоровье и тонус' },
];

const LEVELS: { key: Level; label: string; hint: string }[] = [
  { key: 'beginner', label: 'Новичок', hint: 'Меньше года в зале' },
  { key: 'intermediate', label: 'Средний', hint: '1–3 года регулярных тренировок' },
  { key: 'advanced', label: 'Продвинутый', hint: '3+ года, знаю свою технику' },
];

const WEEK = [
  { day: 1, label: 'Пн' },
  { day: 2, label: 'Вт' },
  { day: 3, label: 'Ср' },
  { day: 4, label: 'Чт' },
  { day: 5, label: 'Пт' },
  { day: 6, label: 'Сб' },
  { day: 0, label: 'Вс' },
];

export default function Onboarding() {
  const { profile, updateProfile } = useApp();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal>('mass');
  const [level, setLevel] = useState<Level>('intermediate');
  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState('30');
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('180');

  const toggleDay = (d: number) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const finish = async () => {
    const program = pickProgram(goal, level, days.length);
    await updateProfile({
      onboardingDone: true,
      goal,
      level,
      trainingDays: days,
      sex,
      age: parseInt(age, 10) || 30,
      weightKg: parseFloat(weight.replace(',', '.')) || 80,
      heightCm: parseInt(height, 10) || 180,
      programId: program.id,
    });
    router.replace('/(tabs)');
  };

  const preview = calcTargets(
    {
      ...profile,
      goal,
      sex,
      age: parseInt(age, 10) || 30,
      weightKg: parseFloat(weight.replace(',', '.')) || 80,
      heightCm: parseInt(height, 10) || 180,
      trainingDays: days,
    },
    false
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.progress}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
          ))}
        </View>

        {step === 0 && (
          <>
            <Title>Какая у тебя цель?</Title>
            <Muted style={styles.lead}>От цели зависят программа и норма калорий.</Muted>
            {GOALS.map((g) => (
              <OptionCard
                key={g.key}
                label={g.label}
                hint={g.hint}
                selected={goal === g.key}
                onPress={() => setGoal(g.key)}
              />
            ))}
            <Button title="Дальше" onPress={() => setStep(1)} style={styles.next} />
          </>
        )}

        {step === 1 && (
          <>
            <Title>Твой уровень?</Title>
            <Muted style={styles.lead}>Подберём объём и сложность программы.</Muted>
            {LEVELS.map((l) => (
              <OptionCard
                key={l.key}
                label={l.label}
                hint={l.hint}
                selected={level === l.key}
                onPress={() => setLevel(l.key)}
              />
            ))}
            <Button title="Дальше" onPress={() => setStep(2)} style={styles.next} />
          </>
        )}

        {step === 2 && (
          <>
            <Title>Дни тренировок</Title>
            <Muted style={styles.lead}>Выбери дни недели, когда ходишь в зал.</Muted>
            <View style={styles.weekRow}>
              {WEEK.map((w) => (
                <Chip
                  key={w.day}
                  label={w.label}
                  selected={days.includes(w.day)}
                  onPress={() => toggleDay(w.day)}
                />
              ))}
            </View>

            <Title style={styles.sectionTitle}>Данные для питания</Title>
            <Muted style={styles.lead}>Нужны для расчёта нормы КБЖУ.</Muted>
            <View style={styles.weekRow}>
              <Chip label="Мужчина" selected={sex === 'male'} onPress={() => setSex('male')} />
              <Chip label="Женщина" selected={sex === 'female'} onPress={() => setSex('female')} />
            </View>
            <View style={styles.inputsRow}>
              <Field label="Возраст" value={age} onChange={setAge} suffix="лет" />
              <Field label="Вес" value={weight} onChange={setWeight} suffix="кг" />
              <Field label="Рост" value={height} onChange={setHeight} suffix="см" />
            </View>

            <View style={styles.previewCard}>
              <Muted>Твоя норма (день отдыха)</Muted>
              <Text style={styles.previewKcal}>{preview.calories} ккал</Text>
              <Muted>
                Б {preview.protein} г · Ж {preview.fat} г · У {preview.carbs} г
              </Muted>
              <Muted style={{ marginTop: 6 }}>
                Программа: {pickProgram(goal, level, days.length).name}
              </Muted>
            </View>

            <Button
              title="Начать тренироваться"
              onPress={finish}
              disabled={days.length === 0}
              style={styles.next}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function OptionCard({
  label,
  hint,
  selected,
  onPress,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Text onPress={onPress} style={[styles.option, selected && styles.optionSelected]}>
      <Text style={[styles.optionLabel, selected && { color: colors.onAccent }]}>{label}</Text>
      {'\n'}
      <Text style={[styles.optionHint, selected && { color: 'rgba(14,14,17,0.7)' }]}>{hint}</Text>
    </Text>
  );
}

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix: string;
}) {
  return (
    <View style={styles.field}>
      <Muted>{label}</Muted>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          maxLength={5}
        />
        <Text style={styles.fieldSuffix}>{suffix}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xl, gap: spacing.m, paddingBottom: 60 },
  progress: { flexDirection: 'row', gap: 8, marginBottom: spacing.l },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.surfaceHigh },
  dotActive: { backgroundColor: colors.accent },
  lead: { marginBottom: spacing.s },
  option: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.l,
    overflow: 'hidden',
  },
  optionSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  optionLabel: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, lineHeight: 28 },
  optionHint: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  next: { marginTop: spacing.l },
  weekRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s },
  sectionTitle: { fontSize: 20, marginTop: spacing.xl },
  inputsRow: { flexDirection: 'row', gap: spacing.m },
  field: { flex: 1, gap: 6 },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  fieldInput: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
    paddingVertical: 12,
  },
  fieldSuffix: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  previewCard: {
    backgroundColor: colors.accentDim,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: spacing.l,
    marginTop: spacing.m,
    gap: 2,
  },
  previewKcal: { fontFamily: fonts.extraBold, fontSize: 28, color: colors.accent },
});
