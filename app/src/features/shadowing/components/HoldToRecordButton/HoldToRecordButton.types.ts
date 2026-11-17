import type { RecordPhase } from '../../model/types';

export type HoldToRecordButtonProps = {
  phase: RecordPhase;
  disabled: boolean;
  onStart: () => void;
  onStop: () => void;
};
