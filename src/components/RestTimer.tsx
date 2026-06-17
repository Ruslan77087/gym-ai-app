import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/theme';

/** Таймер отдыха между подходами. Появляется после отметки подхода. */
export function RestTimer({
  seconds,
  onDone,
  onSkip,
}: {
  seconds: number;
  onDone: () => void;
  onSkip: () => void;
}) {
  const [left, setLeft] = useState(seconds);
  const endRef = useRef(Date.now() + seconds * 1000);

  useEffect(() => {
    endRef.current = Date.now() + seconds * 1000;
    setLeft(seconds);
    const t = setInterval(() => {
      const remain = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setLeft(remain);
      if (remain <= 0) {
        clearInterval(t);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        onDone();
      }
    }, 250);
    return () => clearInterval(t);
  }, [seconds]);

  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');
  const ratio = seconds > 0 ? left / seconds : 0;

  const adjust = (delta: number) => {
    endRef.current += delta * 1000;
    setLeft(Math.max(0, Math.round((endRef.current - Date.now()) / 1000)));
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable onPress={() => adjust(-15)} style={styles.adjustBtn}>
          <Text style={styles.adjustText}>−15</Text>
        </Pressable>
        <View style={styles.timeBox}>
          <Text style={styles.time}>{mm}:{ss}</Text>
          <Text style={styles.caption}>отдых</Text>
        </View>
        <Pressable onPress={() => adjust(15)} style={styles.adjustBtn}>
          <Text style={styles.adjustText}>+15</Text>
        </Pressable>
        <Pressable onPress={onSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Пропустить</Text>
        </Pressable>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${ratio * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.m,
    padding: spacing.m,
    gap: spacing.m,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
  timeBox: { alignItems: 'center', flex: 1 },
  time: { fontFamily: fonts.extraBold, fontSize: 34, color: colors.accent, fontVariant: ['tabular-nums'] },
  caption: { fontFamily: fonts.medium, fontSize: 11, color: colors.textSecondary },
  adjustBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.s,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  adjustText: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  skipBtn: { paddingVertical: 10, paddingHorizontal: 8 },
  skipText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textSecondary },
  barBg: { height: 4, borderRadius: 2, backgroundColor: colors.surface, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2, backgroundColor: colors.accent },
});
