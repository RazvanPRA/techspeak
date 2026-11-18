import type { RecordPhase } from '@/services/speech';
import type { Grade, SayItOutcome } from '../../model/types';

export type ReviewRecordControls = {
  phase: RecordPhase;
  start: () => void;
  stop: () => void;
};

export type ReviewActionHandlers = {
  onReveal: () => void;
  onGrade: (grade: Grade) => void;
  onNext: () => void;
};

export type ReviewActionsProps = {
  outcome: SayItOutcome;
  revealed: boolean;
  /** True until the speech model is ready. */
  recordDisabled: boolean;
  record: ReviewRecordControls;
  actions: ReviewActionHandlers;
};
