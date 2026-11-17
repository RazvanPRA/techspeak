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

export type Assessment = { transcript: string; words: WordResult[]; score: number };
export type AssessInput = {
  targetWords: readonly string[];
  audioPath: string;
  hints?: readonly string[];
};

export interface PronunciationAssessor {
  assess(input: AssessInput): Promise<Assessment>;
}

export type RecordPhase = 'idle' | 'recording' | 'assessing';
export type ModelStatus = 'loading' | 'ready' | 'error';
