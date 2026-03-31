// ─────────────────────────────────────────────────────────────
// HappySanta — Budget Progress Bar
// ─────────────────────────────────────────────────────────────
import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/utils/constants';
import { formatPrice, calcListProgress } from '@/utils/helpers';

interface BudgetProgressProps {
  budget: number;
  spent:  number;
}

export function BudgetProgress({ budget, spent }: BudgetProgressProps) {
  const progress    = calcListProgress(budget, spent);
  const remaining   = Math.max(0, budget - spent);
  const widthAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue:         progress,
      duration:        600,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const barColor = progress >= 1
    ? COLORS.error
    : progress >= 0.8
    ? COLORS.warning
    : COLORS.santaRed;

  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        <Text style={styles.label}>
          Spent: <Text style={{ color: barColor, fontFamily: FONTS.bodyBold }}>{formatPrice(spent)}</Text>
        </Text>
        <Text style={styles.label}>
          Remaining: <Text style={{ color: COLORS.forestGreen, fontFamily: FONTS.bodyBold }}>{formatPrice(remaining)}</Text>
        </Text>
      </View>

      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: widthAnim.interpolate({
                inputRange:  [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <Text style={styles.percentText}>
        {Math.round(progress * 100)}% of {formatPrice(budget)} budget used
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 8 },
  labels:    { flexDirection: 'row', justifyContent: 'space-between' },
  label:     { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 13 },
  track:     { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  fill:      { height: '100%', borderRadius: 4 },
  percentText: { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
});
