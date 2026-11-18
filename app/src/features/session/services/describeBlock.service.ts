import { t } from '@/shared/i18n';
import type { BlockKind, SessionBlock } from '../model/types';

const TITLE_KEYS = {
  pairs: 'session.blockPairs',
  shadowing: 'session.blockShadowing',
  vocabulary: 'session.blockVocabulary',
  scenario: 'session.blockScenario',
} as const satisfies Record<BlockKind, string>;

export function blockTitle(kind: BlockKind): string {
  return t(TITLE_KEYS[kind]);
}

/** "3 min · θ-s", "7 min · sql", "5 min". */
export function blockCaption(block: SessionBlock): string {
  const minutes = t('session.minutes', { minutes: block.minutes });
  if (block.kind === 'scenario' || !block.focus) return minutes;
  return `${minutes} · ${block.focus}`;
}

/** 'Streak: 1 day', 'Streak: 5 days'; 'Start a streak today' at 0. */
export function streakText(count: number): string {
  if (count <= 0) return t('session.noStreak');
  return count === 1 ? t('session.streakOne') : t('session.streak', { count });
}
