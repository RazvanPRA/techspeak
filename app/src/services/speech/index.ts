// Contracts and React hooks only. Native implementations are imported in src/app/dependencies.ts,
// so features (and their tests) never load native modules.
export type {
  Assessment,
  AssessInput,
  MicPermission,
  ModelStatus,
  PlayerRepository,
  ProgressCallback,
  PronunciationAssessor,
  RecognizerRepository,
  RecorderRepository,
  RecordPhase,
  SpeakOptions,
  TtsRepository,
  TtsVoice,
} from './model/types';
export { SttDiffAssessor } from './assessor/SttDiffAssessor';
export { useHoldToRecord } from './hooks/useHoldToRecord';
export { useMicPermission } from './hooks/useMicPermission';
export { useSpeak } from './hooks/useSpeak';
export { useSpeechModel } from './hooks/useSpeechModel';
