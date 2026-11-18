import type { AssessmentDetails } from '@/services/speech';

export type AttemptSummary = {
  score: number;
  passed: boolean;
  transcript: string;
  extraWords: readonly string[];
  /** Azure sub-scores; null when the attempt was scored on the device. */
  details: AssessmentDetails | null;
};

export type AttemptResultPanelProps = {
  result: AttemptSummary;
  onNext: () => void;
};
