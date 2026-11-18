import React, { memo } from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { theme } from '@/shared/theme';
import { AppText } from '../../ui';
import { styles } from '../charts.styles';
import type { ChartPoint } from '../charts.types';

export type BarChartProps = {
  points: readonly ChartPoint[];
  accessibilityLabel: string;
  /** Full-width value; defaults to the largest value. */
  maxValue?: number;
};

const BAR_HEIGHT = 12;
const WIDTH = 100;

/** Horizontal bars, one row per point, each labelled with its value. */
function BarChartComponent({ points, accessibilityLabel, maxValue }: BarChartProps) {
  const max = maxValue ?? Math.max(1, ...points.map(p => p.value));
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={styles.bars}>
      {points.map(p => (
        <View key={p.label} style={styles.barRow}>
          <AppText variant="caption">{`${p.label}: ${p.value}`}</AppText>
          <Svg width="100%" height={BAR_HEIGHT} viewBox={`0 0 ${WIDTH} ${BAR_HEIGHT}`} preserveAspectRatio="none">
            <Rect x={0} y={0} width={WIDTH} height={BAR_HEIGHT} rx={2} fill={theme.color.surface} />
            <Rect
              x={0}
              y={0}
              width={Math.max(0, Math.min(1, p.value / max)) * WIDTH}
              height={BAR_HEIGHT}
              rx={2}
              fill={theme.color.primary}
            />
          </Svg>
        </View>
      ))}
    </View>
  );
}

export const BarChart = memo(BarChartComponent);
