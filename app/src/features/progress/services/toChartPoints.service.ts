import type { ChartPoint } from '@/components/charts';
import { t } from '@/shared/i18n';
import type { DayValue, DeckValue, FluencyPoint } from '../model/types';

/** "2026-11-18" → "11-18": short enough for an axis caption. */
const shortDay = (day: string) => day.slice(5);

export const dayPoints = (days: readonly DayValue[]): ChartPoint[] =>
  days.map(d => ({ label: shortDay(d.day), value: d.value }));

export const deckPoints = (decks: readonly DeckValue[]): ChartPoint[] =>
  decks.map(d => ({ label: d.deckId, value: d.value }));

export const wpmPoints = (points: readonly FluencyPoint[]): ChartPoint[] =>
  points.map(p => ({ label: shortDay(p.day), value: p.wordsPerMinute }));

export const fillerPoints = (points: readonly FluencyPoint[]): ChartPoint[] =>
  points.map(p => ({ label: shortDay(p.day), value: p.fillersPerMinute }));

/** What a screen reader says for a chart: its title and every point. */
export function chartLabel(title: string, points: readonly ChartPoint[]): string {
  return t('progress.chartLabel', {
    title,
    points: points.map(p => `${p.label} ${p.value}`).join(', '),
  });
}
