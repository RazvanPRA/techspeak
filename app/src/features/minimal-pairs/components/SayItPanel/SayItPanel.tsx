import React, { useMemo } from 'react';
import { ModelStatusBanner } from '@/components/speech';
import { AppText } from '@/components/ui';
import { useSpeechModel } from '@/services/speech';
import { useMinimalPairsDependencies } from '../../dependencies/MinimalPairsDependencies';
import { usePairSayIt } from '../../hooks/usePairSayIt';
import type { Round } from '../../model/types';
import { SayItRound } from '../SayItRound';

export type SayItPanelProps = {
  round: Round;
  onResult: (correct: boolean) => Promise<void>;
  onNext: () => void;
};

/** Container: wires the speech model and say-it recording for one round. */
export function SayItPanel({ round, onResult, onNext }: SayItPanelProps) {
  const { recognizer } = useMinimalPairsDependencies();
  const model = useSpeechModel(recognizer);
  const { result, listen, record, error } = usePairSayIt(round, onResult);
  const handlers = useMemo(() => ({ onListen: listen, onNext }), [listen, onNext]);
  return (
    <>
      <ModelStatusBanner status={model.status} progress={model.progress} onRetry={model.retry} />
      <SayItRound
        round={round}
        result={result}
        record={record}
        recordDisabled={model.status !== 'ready'}
        handlers={handlers}
      />
      {error && <AppText variant="error">{error}</AppText>}
    </>
  );
}
