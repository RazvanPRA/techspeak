import type { RecordPhase } from '@/services/speech';
import type { Round, SayResult } from '../../model/types';

export type SayItRecordControls = {
  phase: RecordPhase;
  start: () => void;
  stop: () => void;
};

export type SayItRoundProps = {
  round: Round;
  result: SayResult | null;
  record: SayItRecordControls;
  /** True until the speech model is ready. */
  recordDisabled: boolean;
  handlers: { onListen: () => void; onNext: () => void };
};
