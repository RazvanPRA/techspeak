import { t } from '@/shared/i18n';
import type { Round, SayResult } from '../../model/types';

/** The feedback line for a say-it try. */
export function sayItFeedback(round: Round, result: SayResult): string {
  if (result.verdict === 'correct') return t('pairs.sayCorrect', { word: round.target.word });
  if (result.verdict === 'confused') return t('pairs.sayConfused', { other: round.other.word });
  return t('pairs.sayUnclear', { transcript: result.transcript.trim() || '…' });
}
