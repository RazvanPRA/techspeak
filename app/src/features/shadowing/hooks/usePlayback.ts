import { useCallback, useState } from 'react';
import { errorMessage } from '@/shared/utils';
import { NORMAL_RATE } from '../model/constants';
import { useShadowingDependencies } from '../dependencies/ShadowingDependencies';

/** Model audio (TTS), single words, and "model → me" back-to-back playback. */
export function usePlayback() {
  const { tts, player } = useShadowingDependencies();
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (task: () => Promise<void>) => {
    setError(null);
    setIsPlaying(true);
    try {
      await task();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setIsPlaying(false);
    }
  }, []);

  const speak = useCallback(
    (text: string, rate: number) => run(() => tts.speak(text, { rate })),
    [run, tts],
  );

  const modelThenMe = useCallback(
    (text: string, audioPath: string) =>
      run(async () => {
        await tts.speak(text, { rate: NORMAL_RATE });
        await player.play(audioPath);
      }),
    [run, tts, player],
  );

  const stop = useCallback(async () => {
    await Promise.all([tts.stop(), player.stop()]);
  }, [tts, player]);

  return { isPlaying, error, speak, modelThenMe, stop };
}
