import { useMemo } from 'react';
import type { AttemptSummary } from '../components/AttemptResultPanel';
import { extraWords, mapTokenStatuses } from '../services/mapTokenStatuses.service';
import { selectHasPassed, selectLastAttempt } from '../state/selectors';
import { useShadowingSelector } from '../state/hooks';

/** The last attempt shaped for display: per-token colours and the result summary. */
export function useAttemptView(tokenCount: number) {
  const lastAttempt = useShadowingSelector(selectLastAttempt);
  const passed = useShadowingSelector(selectHasPassed);

  const statuses = useMemo(
    () => mapTokenStatuses(tokenCount, lastAttempt?.words ?? null),
    [tokenCount, lastAttempt],
  );
  const summary = useMemo<AttemptSummary | null>(
    () =>
      lastAttempt && {
        score: lastAttempt.score,
        passed,
        transcript: lastAttempt.transcript,
        extraWords: extraWords(lastAttempt.words),
      },
    [lastAttempt, passed],
  );

  return { statuses, summary, audioPath: lastAttempt?.audioPath ?? null };
}
