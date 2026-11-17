import { initWhisper, type WhisperContext } from 'whisper.rn';
import type { ProgressCallback, RecognizerRepository } from '../model/types';

export interface ModelProvider {
  ensure(onProgress?: ProgressCallback): Promise<string>;
}

export class WhisperRecognizerRepository implements RecognizerRepository {
  private context: Promise<WhisperContext> | null = null;

  constructor(private readonly models: ModelProvider) {}

  async prepare(onProgress?: ProgressCallback): Promise<void> {
    await this.getContext(onProgress);
  }

  async transcribe(path: string, hints: readonly string[] = []): Promise<string> {
    const context = await this.getContext();
    const { promise } = context.transcribe(path, {
      language: 'en',
      prompt: hints.length > 0 ? hints.join(', ') : undefined,
    });
    const { result } = await promise;
    return result.trim();
  }

  private getContext(onProgress?: ProgressCallback): Promise<WhisperContext> {
    this.context ??= this.models
      .ensure(onProgress)
      .then(filePath => initWhisper({ filePath }))
      .catch((error: unknown) => {
        this.context = null;
        throw error;
      });
    return this.context;
  }
}
