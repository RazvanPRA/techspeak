import type { RecordPhase } from '@/services/speech';

export type HoldToRecordButtonProps = {
  phase: RecordPhase;
  disabled: boolean;
  onStart: () => void;
  onStop: () => void;
};
