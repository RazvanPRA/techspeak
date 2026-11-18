import React from 'react';
import { BarChart, type ChartPoint, LineChart } from '@/components/charts';
import { AppText, TitledCard } from '@/components/ui';
import { chartLabel } from '../../services/toChartPoints.service';

export type ChartCardProps = {
  title: string;
  points: readonly ChartPoint[];
  kind: 'line' | 'bar';
  /** Shown instead of the chart when there are no points. */
  emptyMessage: string;
  maxValue?: number;
};

/** A titled card with a line or bar chart, or a hint when there is no data yet. */
export function ChartCard({ title, points, kind, emptyMessage, maxValue }: ChartCardProps) {
  const label = chartLabel(title, points);
  const Chart = kind === 'line' ? LineChart : BarChart;
  return (
    <TitledCard title={title}>
      {points.length === 0 ? (
        <AppText variant="muted">{emptyMessage}</AppText>
      ) : (
        <Chart points={points} accessibilityLabel={label} maxValue={maxValue} />
      )}
    </TitledCard>
  );
}
