import React, { useMemo } from 'react';
import { AppText } from '@/components/ui';
import { useListenPick } from '../../hooks/useListenPick';
import type { Round } from '../../model/types';
import { ListenPickRound } from '../ListenPickRound';

export type ListenPickPanelProps = {
  round: Round;
  onResult: (correct: boolean) => void;
  onNext: () => void;
};

/** Container: wires listen-and-pick for one round. */
export function ListenPickPanel({ round, onResult, onNext }: ListenPickPanelProps) {
  const { picked, play, pick, isSpeaking, error } = useListenPick(round, onResult);
  const handlers = useMemo(() => ({ onPick: pick, onPlay: play, onNext }), [pick, play, onNext]);
  return (
    <>
      <ListenPickRound round={round} picked={picked} isSpeaking={isSpeaking} handlers={handlers} />
      {error && <AppText variant="error">{error}</AppText>}
    </>
  );
}
