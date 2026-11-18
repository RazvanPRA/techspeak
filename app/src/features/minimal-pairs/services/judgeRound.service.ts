import {
  type AliasMap,
  containsPhrase,
  normalizeTranscript,
  normalizeWord,
} from '@/services/scoring';
import type { Assessment } from '@/services/speech';
import { PAIR_PASS_ACCURACY } from '../model/constants';
import type { PairSide, Round, SayResult, SayVerdict } from '../model/types';

/** Listen-and-pick: the user picked the side that was spoken. */
export function isCorrectPick(round: Round, picked: PairSide): boolean {
  return round.side === picked;
}

/** Say-it: the transcript must contain the target and not the word it is paired with. */
export function judgeSaid(round: Round, transcript: string, aliases: AliasMap): SayVerdict {
  const spoken = normalizeTranscript(transcript, aliases);
  const saidTarget = containsPhrase(spoken, [normalizeWord(round.target.word)]);
  const saidOther = containsPhrase(spoken, [normalizeWord(round.other.word)]);
  if (saidTarget && !saidOther) return 'correct';
  if (saidOther && !saidTarget) return 'confused';
  return 'unclear';
}

/**
 * Say-it with any assessor. With Azure word scores the target's accuracy decides (a
 * recognised but poorly pronounced word is "weak"); without them, the transcript does.
 */
export function judgeAssessment(round: Round, assessment: Assessment, aliases: AliasMap): SayResult {
  const { transcript } = assessment;
  const heard = judgeSaid(round, transcript, aliases);
  const scored = assessment.details?.words.find(w => w.targetIndex === 0);
  if (!scored) return { verdict: heard, transcript, accuracy: null };
  const accuracy = Math.round(scored.accuracy);
  if (accuracy >= PAIR_PASS_ACCURACY) return { verdict: 'correct', transcript, accuracy };
  return { verdict: heard === 'confused' ? 'confused' : 'weak', transcript, accuracy };
}
