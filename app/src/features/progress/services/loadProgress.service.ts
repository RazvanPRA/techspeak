import { RECENT_LIMIT, TREND_DAYS } from '../model/constants';
import type { ProgressSources } from '../model/sources';
import type { ProgressData, WeakSound } from '../model/types';
import { averageScoreByDay } from './averageScoreByDay.service';
import { averageScoreByDeck } from './averageScoreByDeck.service';
import { countMasteredWords } from './countMasteredWords.service';
import { fluencyTrend } from './fluencyTrend.service';
import { rankWeakSounds } from './rankWeakSounds.service';

type SoundSources = Pick<ProgressSources, 'shadowingAttempts' | 'pairResults'>;

/** Weakest sounds from recent pair drills and Azure-scored shadowing attempts. */
export async function loadWeakSounds(sources: SoundSources): Promise<WeakSound[]> {
  const [attempts, pairs] = await Promise.all([
    sources.shadowingAttempts(RECENT_LIMIT),
    sources.pairResults(RECENT_LIMIT),
  ]);
  return rankWeakSounds({ pairs, phonemes: attempts.flatMap(a => a.phonemes) });
}

/** Everything the Progress tab shows, from the most recent records. */
export async function loadProgress(sources: ProgressSources): Promise<ProgressData> {
  const [attempts, states, answers, weakSounds] = await Promise.all([
    sources.shadowingAttempts(RECENT_LIMIT),
    sources.reviewIntervals(),
    sources.scenarioAnswers(RECENT_LIMIT),
    loadWeakSounds(sources),
  ]);
  return {
    scoreByDay: averageScoreByDay(attempts).slice(-TREND_DAYS),
    scoreByDeck: averageScoreByDeck(attempts),
    masteredWords: countMasteredWords(states),
    weakSounds,
    fluency: fluencyTrend(answers).slice(-TREND_DAYS),
  };
}
