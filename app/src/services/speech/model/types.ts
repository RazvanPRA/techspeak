import type { WordResult } from '@/services/scoring';

export type TtsVoice = { id: string; name: string; language: string };
export type SpeakOptions = { rate: number; voiceId?: string; language?: string };
export type MicPermission = 'granted' | 'denied' | 'undetermined';
export type ProgressCallback = (fraction: number) => void;

export interface TtsRepository {
  /** Resolves when the utterance has finished (or was stopped). */
  speak(text: string, options: SpeakOptions): Promise<void>;
  stop(): Promise<void>;
  listVoices(language?: string): Promise<TtsVoice[]>;
}

export interface RecorderRepository {
  requestPermission(): Promise<MicPermission>;
  start(): Promise<void>;
  /** Stops and returns the path of a 16 kHz mono 16-bit WAV file. */
  stop(): Promise<string>;
}

export interface PlayerRepository {
  /** Resolves when playback has ended (or was stopped). */
  play(path: string): Promise<void>;
  stop(): Promise<void>;
}

export interface RecognizerRepository {
  /** Downloads / loads the model if needed. Safe to call many times. */
  prepare(onProgress?: ProgressCallback): Promise<void>;
  /** `hints` are vocabulary words that bias recognition (never the full sentence). */
  transcribe(path: string, hints?: readonly string[]): Promise<string>;
}

export type PhonemeScore = { phoneme: string; accuracy: number };

/** One word as a phoneme-level assessor scored it. `targetIndex` is null for inserted words. */
export type ScoredWord = {
  targetIndex: number | null;
  word: string;
  accuracy: number;
  phonemes: PhonemeScore[];
};

/** Extra detail from a phoneme-level assessor (Azure). Absent for the speech-to-text assessor. */
export type AssessmentDetails = {
  accuracy: number;
  fluency: number;
  completeness: number;
  prosody: number | null;
  words: ScoredWord[];
};

export type Assessment = {
  transcript: string;
  words: WordResult[];
  score: number;
  details?: AssessmentDetails;
};

export type AssessInput = {
  targetWords: readonly string[];
  audioPath: string;
  hints?: readonly string[];
  /** The sentence as written; phoneme-level assessors score against it. */
  referenceText?: string;
};

export interface PronunciationAssessor {
  assess(input: AssessInput): Promise<Assessment>;
}

export type RecordPhase = 'idle' | 'recording' | 'assessing';
export type ModelStatus = 'loading' | 'ready' | 'error';

/** Keeps a recording that must outlive the cache (e.g. the day-28 talk). */
export interface RecordingArchive {
  /** Copies the file to permanent app storage and returns its new path. */
  keep(path: string): Promise<string>;
}
