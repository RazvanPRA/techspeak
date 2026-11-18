import { useCallback, useMemo, useState } from 'react';
import { useMinimalPairsDependencies } from '../dependencies/MinimalPairsDependencies';
import type { Round } from '../model/types';
import { pairsForSound } from '../services/pairsForSound.service';
import { pickRound } from '../services/pickRound.service';

/** The current round and "next pair" (never the same pair twice in a row), optionally one sound. */
export function usePairRound(focusSound?: string | null) {
  const { pairs, random } = useMinimalPairsDependencies();
  const pool = useMemo(() => pairsForSound(pairs.list(), focusSound), [pairs, focusSound]);
  const [round, setRound] = useState<Round>(() => pickRound(pool, random));
  const next = useCallback(
    () => setRound(previous => pickRound(pool, random, previous.pair.id)),
    [pool, random],
  );
  return { round, next };
}
