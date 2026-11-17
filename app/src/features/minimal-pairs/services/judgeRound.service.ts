import {
  type AliasMap,
  containsPhrase,
  normalizeTranscript,
  normalizeWord,
} from '@/services/scoring';
import type { PairSide, Round, SayVerdict } from '../model/types';

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
