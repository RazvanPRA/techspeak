import { useMemo } from 'react';
import type { AttemptSummary } from '../components/AttemptResultPanel';
import { extraWords, mapTokenStatuses } from '../services/mapTokenStatuses.service';
import { scoresByToken } from '../services/scoresByToken.service';
import { selectHasPassed, selectLastAttempt } from '../state/selectors';
import { useShadowingSelector } from '../state/hooks';

/** The last attempt shaped for display: per-token colours, Azure word scores and the summary. */
export function useAttemptView(tokenCount: number) {
  const lastAttempt = useShadowingSelector(selectLastAttempt);
  const passed = useShadowingSelector(selectHasPassed);

  const statuses = useMemo(
    () => mapTokenStatuses(tokenCount, lastAttempt?.words ?? null),
    [tokenCount, lastAttempt],
  );
  const wordScores = useMemo(
    () => scoresByToken(tokenCount, lastAttempt?.details ?? null),
    [tokenCount, lastAttempt],
  );
  const summary = useMemo<AttemptSummary | null>(
    () =>
      lastAttempt && {
        score: lastAttempt.score,
        passed,
        transcript: lastAttempt.transcript,
        extraWords: extraWords(lastAttempt.words),
        details: lastAttempt.details ?? null,
      },
    [lastAttempt, passed],
  );

  return { statuses, wordScores, summary, audioPath: lastAttempt?.audioPath ?? null };
}
