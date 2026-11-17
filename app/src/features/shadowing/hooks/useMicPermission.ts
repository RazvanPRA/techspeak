import { useCallback, useEffect, useState } from 'react';
import type { MicPermission } from '@/services/speech';
import { useShadowingDependencies } from '../dependencies/ShadowingDependencies';

/** Asks for the microphone when the screen opens, so the first hold-to-talk records right away. */
export function useMicPermission() {
  const { recorder } = useShadowingDependencies();
  const [permission, setPermission] = useState<MicPermission>('undetermined');

  const request = useCallback(async (): Promise<MicPermission> => {
    const status = await recorder.requestPermission();
    setPermission(status);
    return status;
  }, [recorder]);

  useEffect(() => {
    request().catch(() => setPermission('denied'));
  }, [request]);

  return { permission, request };
}
