import { useCallback, useState } from 'react';
import { errorMessage } from '@/shared/utils';
import type { TtsRepository } from '../model/types';

/** Speaks text with TTS and tracks whether it is speaking. Errors are caught, never thrown. */
export function useSpeak(tts: TtsRepository) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speak = useCallback(
    async (text: string, rate: number) => {
      setError(null);
      setIsSpeaking(true);
      try {
        await tts.speak(text, { rate });
      } catch (e) {
        setError(errorMessage(e));
      } finally {
        setIsSpeaking(false);
      }
    },
    [tts],
  );

  const stop = useCallback(() => tts.stop(), [tts]);

  return { isSpeaking, error, speak, stop };
}
