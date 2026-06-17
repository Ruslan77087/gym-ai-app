import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { colors, fonts } from '@/theme';

export interface ChartPoint {
  label: string;
  value: number;
}

/** Лёгкий линейный график на SVG: веса по тренировкам, калории по дням */
export function LineChart({
  points,
  width = 320,
  height = 160,
  color = colors.accent,
  unit = '',
}: {
  points: ChartPoint[];
  width?: number;
  height?: number;
  color?: string;
  unit?: string;
}) {
  if (points.length === 0) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text style={styles.emptyText}>Нет данных</Text>
      </View>
    );
  }

  const pad = { l: 36, r: 12, t: 16, b: 22 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const values = points.map((p) => p.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const x = (i: number) => pad.l + (points.length === 1 ? w / 2 : (i / (points.length - 1)) * w);
  const y = (v: number) => pad.t + h - ((v - min) / range) * h;

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(' ');

  const gridLines = [min, (min + max) / 2, max];

  return (
    <Svg width={width} height={height}>
      {gridLines.map((v, i) => (
        <React.Fragment key={i}>
          <Line
            x1={pad.l} x2={width - pad.r} y1={y(v)} y2={y(v)}
            stroke={colors.border} strokeWidth={1} strokeDasharray="3 5"
          />
          <SvgText
            x={pad.l - 6} y={y(v) + 4} fill={colors.textMuted}
            fontSize={10} textAnchor="end" fontFamily={fonts.medium}
          >
            {Math.round(v)}{unit}
          </SvgText>
        </React.Fragment>
      ))}
      <Path d={path} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
      {points.map((p, i) => (
        <Circle key={i} cx={x(i)} cy={y(p.value)} r={3.5} fill={color} />
      ))}
      {points.length <= 8 &&
        points.map((p, i) => (
          <SvgText
            key={`l${i}`} x={x(i)} y={height - 6} fill={colors.textMuted}
            fontSize={9} textAnchor="middle" fontFamily={fonts.medium}
          >
            {p.label}
          </SvgText>
        ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
});
