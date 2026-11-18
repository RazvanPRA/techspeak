import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useProgressDependencies } from '../dependencies/ProgressDependencies';
import type { ProgressData } from '../model/types';
import { loadProgress } from '../services/loadProgress.service';

export type ProgressStatus = 'loading' | 'ready' | 'error';

/** Loads the progress data each time the tab gets focus (practice elsewhere changes it). */
export function useProgressData() {
  const sources = useProgressDependencies();
  const [data, setData] = useState<ProgressData | null>(null);
  const [status, setStatus] = useState<ProgressStatus>('loading');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadProgress(sources)
        .then(loaded => {
          if (!active) return;
          setData(loaded);
          setStatus('ready');
        })
        .catch(() => active && setStatus('error'));
      return () => {
        active = false;
      };
    }, [sources]),
  );

  return { data, status };
}
