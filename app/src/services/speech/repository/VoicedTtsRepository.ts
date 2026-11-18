import { resolveVoiceId } from '../model/resolveVoiceId.service';
import type { SpeakOptions, TtsRepository, TtsVoice } from '../model/types';

/**
 * Applies the user's voice setting to every utterance. An explicit `voiceId` (the Settings
 * preview) wins. A voice that is no longer installed falls back to the system voice.
 */
export class VoicedTtsRepository implements TtsRepository {
  private installed: Promise<TtsVoice[]> | null = null;

  constructor(
    private readonly inner: TtsRepository,
    private readonly selectedVoice: () => string | null,
  ) {}

  async speak(text: string, options: SpeakOptions): Promise<void> {
    if (options.voiceId) return this.inner.speak(text, options);
    const voiceId = resolveVoiceId(this.selectedVoice(), await this.installedVoices());
    return this.inner.speak(text, { ...options, voiceId });
  }

  stop(): Promise<void> {
    return this.inner.stop();
  }

  listVoices(language?: string): Promise<TtsVoice[]> {
    return this.inner.listVoices(language);
  }

  /** Fetched once; a failure is not cached, so the next utterance tries again. */
  private async installedVoices(): Promise<TtsVoice[]> {
    if (this.selectedVoice() === null) return [];
    this.installed ??= this.inner.listVoices('en');
    try {
      return await this.installed;
    } catch {
      this.installed = null;
      return [];
    }
  }
}
