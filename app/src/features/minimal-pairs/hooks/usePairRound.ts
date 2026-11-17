import { useCallback, useState } from 'react';
import { useMinimalPairsDependencies } from '../dependencies/MinimalPairsDependencies';
import type { Round } from '../model/types';
import { pickRound } from '../services/pickRound.service';

/** The current round and "next pair" (never the same pair twice in a row). */
export function usePairRound() {
  const { pairs, random } = useMinimalPairsDependencies();
  const [round, setRound] = useState<Round>(() => pickRound(pairs.list(), random));
  const next = useCallback(
    () => setRound(previous => pickRound(pairs.list(), random, previous.pair.id)),
    [pairs, random],
  );
  return { round, next };
}
