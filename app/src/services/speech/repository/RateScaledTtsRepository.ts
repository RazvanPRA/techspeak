import type { SpeakOptions, TtsRepository, TtsVoice } from '../model/types';

/**
 * Applies the user's speech-rate setting to every utterance: features keep asking for "normal"
 * (1.0) or "slow" (0.6) and get that scaled by the setting.
 */
export class RateScaledTtsRepository implements TtsRepository {
  constructor(
    private readonly inner: TtsRepository,
    private readonly scale: () => number,
  ) {}

  speak(text: string, options: SpeakOptions): Promise<void> {
    return this.inner.speak(text, { ...options, rate: options.rate * this.scale() });
  }

  stop(): Promise<void> {
    return this.inner.stop();
  }

  listVoices(language?: string): Promise<TtsVoice[]> {
    return this.inner.listVoices(language);
  }
}
