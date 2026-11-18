// Contracts and React hooks only. Native implementations are imported in src/app/dependencies.ts,
// so features (and their tests) never load native modules.
export type {
  Assessment,
  AssessmentDetails,
  AssessInput,
  MicPermission,
  ModelStatus,
  PhonemeScore,
  PlayerRepository,
  ProgressCallback,
  PronunciationAssessor,
  RecognizerRepository,
  RecorderRepository,
  RecordingArchive,
  RecordPhase,
  ScoredWord,
  SpeakOptions,
  TtsRepository,
  TtsVoice,
} from './model/types';
export { SttDiffAssessor } from './assessor/SttDiffAssessor';
export { AzurePronunciationAssessor } from './assessor/AzurePronunciationAssessor';
export { FallbackAssessor } from './assessor/FallbackAssessor';
export { RateScaledTtsRepository } from './repository/RateScaledTtsRepository';
export { useHoldToRecord } from './hooks/useHoldToRecord';
export { useMicPermission } from './hooks/useMicPermission';
export { useSpeak } from './hooks/useSpeak';
export { useSpeechModel } from './hooks/useSpeechModel';
