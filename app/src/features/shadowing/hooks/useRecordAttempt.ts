import { useCallback, useRef, useState } from 'react';
import { t } from '@/shared/i18n';
import type { RecordPhase } from '../model/types';
import { useShadowingDependencies } from '../dependencies/ShadowingDependencies';

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

type Options = {
  isPermitted: () => Promise<boolean>;
  onRecorded: (audioPath: string) => Promise<void>;
  beforeRecord?: () => Promise<void>;
};

/** Hold-to-talk: start on press-in, stop + assess on press-out. */
export function useRecordAttempt({ isPermitted, onRecorded, beforeRecord }: Options) {
  const { recorder } = useShadowingDependencies();
  const [phase, setPhase] = useState<RecordPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const starting = useRef<Promise<boolean> | null>(null);

  const begin = useCallback(async (): Promise<boolean> => {
    if (!(await isPermitted())) {
      setError(t('shadowing.micDenied'));
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
      setError(messageOf(e));
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
      setError(messageOf(e));
    } finally {
      setPhase('idle');
    }
  }, [onRecorded, recorder]);

  return { phase, error, start, stop };
}
