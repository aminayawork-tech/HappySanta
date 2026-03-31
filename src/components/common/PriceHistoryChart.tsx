// ─────────────────────────────────────────────────────────────
// HappySanta — Price History Chart
// Uses react-native-chart-kit for a clean line chart.
// Shows 90-day price history with all-time-low marker.
// ─────────────────────────────────────────────────────────────
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, FONTS } from '@/utils/constants';
import { formatPrice }   from '@/utils/helpers';
import type { PricePoint } from '@/types';

const CHART_WIDTH  = Dimensions.get('window').width - 32;
const CHART_HEIGHT = 160;

// Max data points to render (downsample if needed)
const MAX_POINTS = 30;

interface PriceHistoryChartProps {
  data:        PricePoint[];
  allTimeLow?: number;
}

export function PriceHistoryChart({ data, allTimeLow }: PriceHistoryChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    // Downsample to MAX_POINTS evenly spaced points
    let points = data;
    if (points.length > MAX_POINTS) {
      const step = Math.floor(points.length / MAX_POINTS);
      points = points.filter((_, i) => i % step === 0).slice(0, MAX_POINTS);
    }

    // Build labels (show month/day for first and last, empty for rest)
    const labels = points.map((p, i) => {
      if (i === 0 || i === points.length - 1) {
        const d = new Date(p.date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }
      return '';
    });

    const prices = points.map((p) => Math.round(p.price * 100) / 100);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return { labels, prices, minPrice, maxPrice };
  }, [data]);

  if (!chartData || chartData.prices.length < 2) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Not enough price history yet</Text>
      </View>
    );
  }

  const { labels, prices, minPrice, maxPrice } = chartData;

  return (
    <View style={styles.container}>
      {/* Min/Max indicators */}
      <View style={styles.priceRange}>
        <View style={styles.rangeItem}>
          <Text style={styles.rangeLabel}>30-day range</Text>
          <Text style={styles.rangeValues}>
            {formatPrice(minPrice)} – {formatPrice(maxPrice)}
          </Text>
        </View>
        {allTimeLow != null && (
          <View style={[styles.rangeItem, { alignItems: 'flex-end' }]}>
            <Text style={styles.rangeLabel}>All-Time Low</Text>
            <Text style={[styles.rangeValues, { color: COLORS.forestGreen }]}>
              {formatPrice(allTimeLow)}
            </Text>
          </View>
        )}
      </View>

      <LineChart
        data={{
          labels,
          datasets: [
            {
              data:        prices,
              color:       (opacity = 1) => `rgba(196, 30, 58, ${opacity})`,
              strokeWidth: 2,
            },
            // Dashed all-time-low line
            ...(allTimeLow != null
              ? [{
                  data:        prices.map(() => allTimeLow),
                  color:       (opacity = 1) => `rgba(22, 91, 51, ${opacity * 0.7})`,
                  strokeWidth: 1,
                  withDots:    false,
                }]
              : []),
          ],
          legend: allTimeLow != null ? ['Price', 'All-Time Low'] : ['Price'],
        }}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        chartConfig={{
          backgroundGradientFrom:        COLORS.bgCard,
          backgroundGradientTo:          COLORS.bgCard,
          backgroundGradientFromOpacity: 1,
          backgroundGradientToOpacity:   1,
          color:                         (opacity = 1) => `rgba(192, 192, 192, ${opacity})`,
          labelColor:                    (opacity = 1) => `rgba(192, 192, 192, ${opacity})`,
          strokeWidth:                   2,
          propsForDots: {
            r:           '3',
            strokeWidth: '1',
            stroke:      COLORS.santaRed,
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke:          'rgba(255,255,255,0.05)',
          },
          decimalPlaces: 0,
        }}
        bezier
        style={styles.chart}
        withVerticalLines={false}
        withHorizontalLines
        withDots={prices.length <= 15}
        formatYLabel={(val) => `$${val}`}
        yAxisLabel="$"
        yAxisSuffix=""
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius:    12,
    overflow:        'hidden',
    padding:         12,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.06)',
  },
  priceRange: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   10,
  },
  rangeItem:  { gap: 2 },
  rangeLabel: { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 11 },
  rangeValues:{ fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 13 },
  chart:      { borderRadius: 8, marginHorizontal: -6 },
  placeholder:{
    backgroundColor: COLORS.bgCard,
    borderRadius:    12,
    padding:         24,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.06)',
  },
  placeholderText: {
    fontFamily: FONTS.body,
    color:      COLORS.textMuted,
    fontSize:   13,
  },
});
