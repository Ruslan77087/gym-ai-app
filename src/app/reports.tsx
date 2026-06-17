import * as Print from 'expo-print';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChartPoint, LineChart } from '@/components/LineChart';
import { Button, Card, Chip, Muted, Subtitle, Title } from '@/components/ui';
import * as db from '@/db/database';
import { calcTargets } from '@/lib/tdee';
import { useApp } from '@/store/AppContext';
import { colors, fonts, spacing } from '@/theme';

type Period = 7 | 30;

export default function Reports() {
  const { profile } = useApp();
  const { width } = useWindowDimensions();
  const [period, setPeriod] = useState<Period>(7);
  const [days, setDays] = useState<db.DayTotals[]>([]);

  const targets = calcTargets(profile, false);

  useEffect(() => {
    const from = db.toDateStr(new Date(Date.now() - (period - 1) * 86400_000));
    db.getNutritionTotals(from, db.todayStr()).then(setDays);
  }, [period]);

  const avg = (key: keyof Omit<db.DayTotals, 'date'>) =>
    days.length ? Math.round(days.reduce((a, d) => a + Number(d[key]), 0) / days.length) : 0;

  const surplusDays = days.filter((d) => d.calories > targets.calories).length;
  const deficitDays = days.filter((d) => d.calories <= targets.calories).length;

  const chart: ChartPoint[] = days.map((d) => ({
    label: d.date.slice(8) + '.' + d.date.slice(5, 7),
    value: Math.round(d.calories),
  }));

  const exportPdf = async () => {
    const rows = days
      .map(
        (d) => `<tr>
          <td>${d.date}</td><td>${Math.round(d.calories)}</td>
          <td>${Math.round(d.protein)}</td><td>${Math.round(d.fat)}</td>
          <td>${Math.round(d.carbs)}</td><td>${Math.round(d.fiber)}</td>
          <td>${d.calories > targets.calories ? 'профицит' : 'дефицит'}</td>
        </tr>`
      )
      .join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        body { font-family: -apple-system, sans-serif; padding: 24px; color: #111; }
        h1 { font-size: 22px; } h2 { font-size: 15px; color: #555; font-weight: normal; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: center; }
        th { background: #f4f4f4; }
        .summary { margin-top: 12px; font-size: 13px; line-height: 1.7; }
      </style></head><body>
      <h1>Отчёт по питанию — ${period} дней</h1>
      <h2>Сформировано ${new Date().toLocaleDateString('ru-RU')} · Норма: ${targets.calories} ккал (Б ${targets.protein} / Ж ${targets.fat} / У ${targets.carbs})</h2>
      <div class="summary">
        Среднее за период: <b>${avg('calories')} ккал</b> · Б ${avg('protein')} г · Ж ${avg('fat')} г · У ${avg('carbs')} г · клетчатка ${avg('fiber')} г<br/>
        Дней с профицитом: <b>${surplusDays}</b> · с дефицитом: <b>${deficitDays}</b>
      </div>
      <table><tr><th>Дата</th><th>Ккал</th><th>Б</th><th>Ж</th><th>У</th><th>Клетч.</th><th>Баланс</th></tr>${rows}</table>
      </body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Title style={{ fontSize: 22 }}>Отчёты</Title>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.periodRow}>
          <Chip label="Неделя" selected={period === 7} onPress={() => setPeriod(7)} />
          <Chip label="Месяц" selected={period === 30} onPress={() => setPeriod(30)} />
        </View>

        <Card>
          <Subtitle style={{ marginBottom: spacing.m }}>Калории по дням</Subtitle>
          <LineChart points={chart} width={width - spacing.l * 4} />
          <Muted style={{ marginTop: spacing.s }}>Норма: {targets.calories} ккал/день</Muted>
        </Card>

        <Card>
          <Subtitle style={{ marginBottom: spacing.m }}>Среднее за период</Subtitle>
          <StatRow label="Калории" value={`${avg('calories')} ккал`} />
          <StatRow label="Белки" value={`${avg('protein')} г`} />
          <StatRow label="Жиры" value={`${avg('fat')} г`} />
          <StatRow label="Углеводы" value={`${avg('carbs')} г`} />
          <StatRow label="Клетчатка" value={`${avg('fiber')} г`} />
          <StatRow label="Дней с профицитом" value={String(surplusDays)} />
          <StatRow label="Дней с дефицитом" value={String(deficitDays)} />
        </Card>

        <Button title="📄 Экспорт PDF" onPress={exportPdf} disabled={days.length === 0} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Muted>{label}</Muted>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.l, gap: spacing.l, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: { color: colors.textSecondary, fontSize: 24, padding: 4 },
  periodRow: { flexDirection: 'row', gap: spacing.s },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statValue: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
});
