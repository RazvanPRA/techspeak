import type {
  AssessInput,
  Assessment,
  MicPermission,
  PronunciationAssessor,
  PlayerRepository,
  RecognizerRepository,
  RecorderRepository,
  SpeakOptions,
  TtsRepository,
  TtsVoice,
} from '../model/types';

/** In-memory test doubles for the speech contracts. They record calls and never touch native code. */
export class FakeTtsRepository implements TtsRepository {
  readonly spoken: Array<{ text: string; options: SpeakOptions }> = [];
  async speak(text: string, options: SpeakOptions): Promise<void> {
    this.spoken.push({ text, options });
  }
  async stop(): Promise<void> {}
  async listVoices(): Promise<TtsVoice[]> {
    return [{ id: 'en-us-1', name: 'Test voice', language: 'en-US' }];
  }
}

export class FakeRecorderRepository implements RecorderRepository {
  permission: MicPermission = 'granted';
  isRecording = false;
  constructor(private readonly path = '/tmp/attempt.wav') {}
  async requestPermission(): Promise<MicPermission> {
    return this.permission;
  }
  async start(): Promise<void> {
    this.isRecording = true;
  }
  async stop(): Promise<string> {
    this.isRecording = false;
    return this.path;
  }
}

export class FakePlayerRepository implements PlayerRepository {
  readonly played: string[] = [];
  async play(path: string): Promise<void> {
    this.played.push(path);
  }
  async stop(): Promise<void> {}
}

/** Returns a fixed assessment (e.g. one with Azure details) and records every input. */
export class FakeAssessor implements PronunciationAssessor {
  readonly inputs: AssessInput[] = [];
  constructor(public result: Assessment) {}
  async assess(input: AssessInput): Promise<Assessment> {
    this.inputs.push(input);
    return this.result;
  }
}

export class FakeRecognizerRepository implements RecognizerRepository {
  readonly calls: Array<{ path: string; hints: readonly string[] }> = [];
  constructor(public transcript = '') {}
  async prepare(): Promise<void> {}
  async transcribe(path: string, hints: readonly string[] = []): Promise<string> {
    this.calls.push({ path, hints });
    return this.transcript;
  }
}
