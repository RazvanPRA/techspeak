import type { ChartPoint } from './charts.types';

export type ScaledPoint = { key: string; x: number; y: number };

/** Lays points out left to right in a width × height box (y grows downwards, 0 at the bottom). */
export function scalePoints(
  points: readonly ChartPoint[],
  box: { width: number; height: number; maxValue?: number },
): ScaledPoint[] {
  const max = box.maxValue ?? Math.max(1, ...points.map(p => p.value));
  const step = points.length > 1 ? box.width / (points.length - 1) : 0;
  return points.map((p, i) => ({
    key: `${p.label}-${i}`,
    x: points.length > 1 ? i * step : box.width / 2,
    y: box.height - Math.max(0, Math.min(1, p.value / max)) * box.height,
  }));
}
