import Speech, { type EventProps } from '@mhpdev/react-native-speech';
import { Platform } from 'react-native';
import type { SpeakOptions, TtsRepository, TtsVoice } from '../model/types';

/** iOS AVSpeech "normal" rate is 0.5; Android's is 1.0. Our API uses 1.0 = normal. */
const IOS_NORMAL_RATE = 0.5;
const toPlatformRate = (rate: number): number =>
  Platform.OS === 'ios' ? rate * IOS_NORMAL_RATE : rate;

/** speak() resolves when the utterance is queued, so wait for its end event by id. */
function waitForUtterance(start: () => Promise<string>): Promise<void> {
  return new Promise((resolve, reject) => {
    let ownId: string | null = null;
    const endedEarly = new Map<string, Error | null>();
    const subs = [
      Speech.onFinish(({ id }: EventProps) => settle(id, null)),
      Speech.onStopped(({ id }: EventProps) => settle(id, null)),
      Speech.onError(({ id }: EventProps) => settle(id, new Error('Speech synthesis failed'))),
    ];
    const cleanup = (): void => subs.forEach(s => s.remove());
    function settle(id: string, error: Error | null): void {
      if (ownId === null) {
        endedEarly.set(id, error);
        return;
      }
      if (id !== ownId) return;
      cleanup();
      if (error) reject(error);
      else resolve();
    }
    start()
      .then(id => {
        ownId = id;
        if (endedEarly.has(id)) settle(id, endedEarly.get(id) ?? null);
      })
      .catch((error: unknown) => {
        cleanup();
        reject(error);
      });
  });
}

export class NativeSpeechTtsRepository implements TtsRepository {
  async speak(text: string, options: SpeakOptions): Promise<void> {
    const { rate, voiceId, language = 'en-US' } = options;
    await Speech.stop();
    await waitForUtterance(() =>
      Speech.speak(text, { rate: toPlatformRate(rate), voice: voiceId, language }),
    );
  }

  async stop(): Promise<void> {
    await Speech.stop();
  }

  async listVoices(language = 'en'): Promise<TtsVoice[]> {
    const voices = await Speech.getAvailableVoices(language);
    return voices.map(v => ({ id: v.identifier, name: v.name, language: v.language }));
  }
}
