// Contracts only. Native implementations are imported in src/app/dependencies.ts,
// so features (and their tests) never load native modules.
export type {
  Assessment,
  AssessInput,
  MicPermission,
  PlayerRepository,
  ProgressCallback,
  PronunciationAssessor,
  RecognizerRepository,
  RecorderRepository,
  SpeakOptions,
  TtsRepository,
  TtsVoice,
} from './model/types';
export { SttDiffAssessor } from './assessor/SttDiffAssessor';
