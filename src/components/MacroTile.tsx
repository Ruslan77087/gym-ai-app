import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/theme';

export function MacroTile({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  const ratio = target > 0 ? Math.min(value / target, 1) : 0;
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {Math.round(value)}
        <Text style={styles.target}> / {Math.round(target)} г</Text>
      </Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    gap: 6,
  },
  label: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary },
  value: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  target: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  barBg: { height: 5, borderRadius: 3, backgroundColor: colors.surfaceHigh, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3 },
});
