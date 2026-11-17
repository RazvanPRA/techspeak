export type AttemptSummary = {
  score: number;
  passed: boolean;
  transcript: string;
  extraWords: readonly string[];
};

export type AttemptResultPanelProps = {
  result: AttemptSummary;
  onNext: () => void;
};
