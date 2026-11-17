import { useCallback, useEffect, useState } from 'react';
import type { MicPermission, RecorderRepository } from '../model/types';

/** Asks for the microphone when the screen opens, so the first hold-to-talk records right away. */
export function useMicPermission(recorder: RecorderRepository) {
  const [permission, setPermission] = useState<MicPermission>('undetermined');

  const request = useCallback(async (): Promise<MicPermission> => {
    const status = await recorder.requestPermission();
    setPermission(status);
    return status;
  }, [recorder]);

  useEffect(() => {
    request().catch(() => setPermission('denied'));
  }, [request]);

  const isPermitted = useCallback(async () => (await request()) === 'granted', [request]);

  return { permission, request, isPermitted };
}
