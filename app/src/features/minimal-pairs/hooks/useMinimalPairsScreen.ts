import { useCallback, useMemo, useState } from 'react';
import { t } from '@/shared/i18n';
import type { PairMode } from '../model/types';
import { usePairResults } from './usePairResults';
import { usePairRound } from './usePairRound';

/** Mode switch, the current round and the session score. focusSound limits the pairs. */
export function useMinimalPairsScreen(focusSound?: string | null) {
  const [mode, setMode] = useState<PairMode>('listen');
  const { round, next } = usePairRound(focusSound);
  const { score, record, error } = usePairResults(mode);
  const segments = useMemo(
    () => [
      { key: 'listen' as const, label: t('pairs.modeListen') },
      { key: 'say' as const, label: t('pairs.modeSay') },
    ],
    [],
  );
  const onResult = useCallback((correct: boolean) => record(round, correct), [record, round]);
  // Switching modes keeps the current pair; each mode's panel starts the round fresh.
  return { mode, segments, changeMode: setMode, round, next, score, onResult, saveError: error };
}
