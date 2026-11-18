import { useCallback, useEffect, useState } from 'react';
import type { ModelStatus, RecognizerRepository } from '../model/types';

/** Downloads (first run only) and loads the on-device speech model, exposing progress. */
export function useSpeechModel(recognizer: RecognizerRepository) {
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
