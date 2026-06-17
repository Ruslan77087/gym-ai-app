import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '@/theme';

export function CalorieRing({
  consumed,
  target,
  size = 160,
}: {
  consumed: number;
  target: number;
  size?: number;
}) {
  const stroke = size / 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = target > 0 ? Math.min(consumed / target, 1) : 0;
  const over = target > 0 && consumed > target;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={colors.surfaceHigh} strokeWidth={stroke} fill="none"
        />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={over ? colors.danger : colors.accent}
          strokeWidth={stroke} fill="none"
          strokeDasharray={`${c}`}
          strokeDashoffset={c * (1 - ratio)}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.value}>{Math.round(consumed)}</Text>
        <Text style={styles.label}>из {Math.round(target)} ккал</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', alignItems: 'center' },
  value: { fontFamily: fonts.extraBold, fontSize: 30, color: colors.text },
  label: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
