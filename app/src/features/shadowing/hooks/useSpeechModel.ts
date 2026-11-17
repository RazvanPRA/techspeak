import { useCallback, useEffect, useState } from 'react';
import type { ModelStatus } from '../model/types';
import { useShadowingDependencies } from '../dependencies/ShadowingDependencies';

/** Downloads (first run only) and loads the on-device speech model, exposing progress. */
export function useSpeechModel() {
  const { recognizer } = useShadowingDependencies();
  const [status, setStatus] = useState<ModelStatus>('loading');
  const [progress, setProgress] = useState(0);

  const load = useCallback(() => {
    setStatus('loading');
    recognizer
      .prepare(setProgress)
      .then(() => setStatus('ready'))
      .catch(() => setStatus('error'));
  }, [recognizer]);

  useEffect(load, [load]);

  return { status, progress, retry: load };
}
