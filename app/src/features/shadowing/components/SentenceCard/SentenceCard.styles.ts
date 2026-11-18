import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme';
import type { TokenStatus } from '../../model/types';

const HIT_SLOP = theme.space.sm;

export const styles = {
  ...StyleSheet.create({
    card: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: theme.space.sm,
      rowGap: theme.space.md,
      padding: theme.space.lg,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.color.surface,
    },
    word: { fontSize: theme.font.lg, color: theme.color.text, lineHeight: theme.font.lg * 1.4 },
    target: {
      backgroundColor: theme.color.highlight,
      borderRadius: theme.radius.sm,
      fontWeight: '600',
    },
  }),
  hitSlop: { top: HIT_SLOP, bottom: HIT_SLOP, left: HIT_SLOP / 2, right: HIT_SLOP / 2 },
};

export const statusStyles: Record<TokenStatus, { color: string } | null> = {
  pending: null,
  ok: { color: theme.color.ok },
  wrong: { color: theme.color.wrong },
  missing: { color: theme.color.missing },
};
