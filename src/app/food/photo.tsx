import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Body, Button, Card, Chip, Muted, Subtitle, Title } from '@/components/ui';
import { analyzeFoodPhoto } from '@/lib/ai';
import * as db from '@/db/database';
import { FoodAnalysis, MealType } from '@/lib/types';
import { colors, fonts, radius, spacing } from '@/theme';

const PORTIONS = [0.5, 1, 1.5, 2];
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

export default function FoodPhoto() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FoodAnalysis | null>(null);
  const [portion, setPortion] = useState(1);
  const [meal, setMeal] = useState<MealType>(guessMeal());

  const pickImage = async (fromCamera: boolean) => {
    setError(null);
    const opts: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      quality: 0.6,
      base64: true,
      allowsEditing: false,
    };
    const res = fromCamera
      ? await (async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) return null;
          return ImagePicker.launchCameraAsync(opts);
        })()
      : await ImagePicker.launchImageLibraryAsync(opts);

    if (!res || res.canceled || !res.assets[0]?.base64) return;
    setImageUri(res.assets[0].uri);
    setResult(null);
    setAnalyzing(true);
    try {
      const analysis = await analyzeFoodPhoto(res.assets[0].base64);
      setResult(analysis);
      setPortion(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось распознать фото');
    } finally {
      setAnalyzing(false);
    }
  };

  const save = async () => {
    if (!result) return;
    await db.addNutritionEntry(
      db.todayStr(),
      meal,
      {
        dish: result.dish,
        calories: result.calories * portion,
        protein: result.protein * portion,
        fat: result.fat * portion,
        carbs: result.carbs * portion,
        fiber: result.fiber * portion,
        portion_g: result.portion_g * portion,
      },
      'photo'
    );
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Title style={{ fontSize: 22 }}>Фото еды</Title>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        {!imageUri && (
          <>
            <Muted>
              Сфотографируй блюдо — Claude Vision определит состав и КБЖУ. Требуется интернет.
            </Muted>
            <Button title="📷 Камера" onPress={() => pickImage(true)} />
            <Button title="🖼 Из галереи" variant="secondary" onPress={() => pickImage(false)} />
          </>
        )}

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
        )}

        {analyzing && (
          <Card style={styles.center}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Body style={{ color: colors.textSecondary }}>Анализирую фото…</Body>
          </Card>
        )}

        {error && (
          <Card style={{ borderColor: colors.danger }}>
            <Body style={{ color: colors.danger }}>{error}</Body>
            <Button
              title="Попробовать ещё раз"
              variant="secondary"
              onPress={() => pickImage(false)}
              style={{ marginTop: spacing.m }}
            />
          </Card>
        )}

        {result && (
          <>
            <Card>
              <Subtitle>{result.dish}</Subtitle>
              <Text style={styles.kcalBig}>
                {Math.round(result.calories * portion)} <Text style={styles.kcalUnit}>ккал</Text>
              </Text>
              <Muted>
                Порция {Math.round(result.portion_g * portion)} г · Б{' '}
                {Math.round(result.protein * portion)} · Ж {Math.round(result.fat * portion)} · У{' '}
                {Math.round(result.carbs * portion)} · клетчатка{' '}
                {Math.round(result.fiber * portion)}
              </Muted>

              <Muted style={{ marginTop: spacing.l, marginBottom: spacing.s }}>Размер порции</Muted>
              <View style={styles.portionRow}>
                {PORTIONS.map((p) => (
                  <Pressable
                    key={p}
                    style={[styles.portionBtn, portion === p && styles.portionBtnActive]}
                    onPress={() => setPortion(p)}
                  >
                    <Text style={[styles.portionText, portion === p && styles.portionTextActive]}>
                      ×{p}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Muted style={{ marginTop: spacing.l, marginBottom: spacing.s }}>Приём пищи</Muted>
              <View style={styles.mealRow}>
                {MEALS.map((m) => (
                  <Chip
                    key={m.key}
                    label={m.label}
                    selected={meal === m.key}
                    onPress={() => setMeal(m.key)}
                  />
                ))}
              </View>
            </Card>
            <Button title="Записать в дневник" onPress={save} />
            <Button title="Переснять" variant="ghost" onPress={() => pickImage(true)} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.l, gap: spacing.m, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: { color: colors.textSecondary, fontSize: 24, padding: 4 },
  preview: { width: '100%', height: 220, borderRadius: radius.l, backgroundColor: colors.surface },
  center: { alignItems: 'center', gap: spacing.m },
  kcalBig: { fontFamily: fonts.extraBold, fontSize: 36, color: colors.accent, marginVertical: 4 },
  kcalUnit: { fontSize: 16, color: colors.textSecondary },
  portionRow: { flexDirection: 'row', gap: spacing.s },
  portionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
  },
  portionBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  portionText: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  portionTextActive: { color: colors.onAccent },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s },
});
