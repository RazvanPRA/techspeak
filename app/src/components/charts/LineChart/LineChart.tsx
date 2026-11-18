import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { theme } from '@/shared/theme';
import { AppText } from '../../ui';
import { styles } from '../charts.styles';
import type { ChartPoint } from '../charts.types';
import { scalePoints } from '../scalePoints';

export type LineChartProps = {
  points: readonly ChartPoint[];
  /** Read out instead of the drawing (already translated). */
  accessibilityLabel: string;
  /** Top of the y axis; defaults to the largest value. */
  maxValue?: number;
};

const WIDTH = 300;
const HEIGHT = 120;

/** A trend line over time, with the first and last labels underneath. */
function LineChartComponent({ points, accessibilityLabel, maxValue }: LineChartProps) {
  const scaled = useMemo(
    () => scalePoints(points, { width: WIDTH, height: HEIGHT, maxValue }),
    [points, maxValue],
  );
  const first = points[0];
  const last = points[points.length - 1];
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
        <Line x1={0} y1={HEIGHT} x2={WIDTH} y2={HEIGHT} stroke={theme.color.extra} strokeWidth={1} />
        <Polyline
          points={scaled.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={theme.color.primary}
          strokeWidth={2}
        />
        {scaled.map(p => (
          <Circle key={p.key} cx={p.x} cy={p.y} r={3} fill={theme.color.primary} />
        ))}
      </Svg>
      <View style={styles.axis}>
        <AppText variant="caption">{first ? `${first.label}: ${first.value}` : ''}</AppText>
        <AppText variant="caption">{last && last !== first ? `${last.label}: ${last.value}` : ''}</AppText>
      </View>
    </View>
  );
}

export const LineChart = memo(LineChartComponent);
