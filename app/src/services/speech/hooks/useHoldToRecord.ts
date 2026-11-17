import { useCallback, useRef, useState } from 'react';
import { t } from '@/shared/i18n';
import { errorMessage } from '@/shared/utils';
import type { RecordPhase, RecorderRepository } from '../model/types';

type Options = {
  recorder: RecorderRepository;
  isPermitted: () => Promise<boolean>;
  onRecorded: (audioPath: string) => Promise<void>;
  beforeRecord?: () => Promise<void>;
};

/** Hold-to-talk: start on press-in, stop and hand the WAV path to `onRecorded` on press-out. */
export function useHoldToRecord({ recorder, isPermitted, onRecorded, beforeRecord }: Options) {
  const [phase, setPhase] = useState<RecordPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const starting = useRef<Promise<boolean> | null>(null);

  const begin = useCallback(async (): Promise<boolean> => {
    if (!(await isPermitted())) {
      setError(t('speech.micDenied'));
      return false;
    }
    await beforeRecord?.();
    await recorder.start();
    setPhase('recording');
    return true;
  }, [isPermitted, beforeRecord, recorder]);

  const start = useCallback(() => {
    if (starting.current) return;
    setError(null);
    starting.current = begin().catch(e => {
      setError(errorMessage(e));
      return false;
    });
  }, [begin]);

  const stop = useCallback(async () => {
    const started = await starting.current;
    starting.current = null;
    if (!started) return;
    setPhase('assessing');
    try {
      await onRecorded(await recorder.stop());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPhase('idle');
    }
  }, [onRecorded, recorder]);

  return { phase, error, start, stop };
}
