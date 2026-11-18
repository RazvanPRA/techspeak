import { useEffect, useState } from 'react';

const TICK_MS = 1000;

/** Whole seconds since the hook mounted or `resetKey` changed. */
export function useElapsedSeconds(clock: () => Date, resetKey: unknown) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const startedAt = clock().getTime();
    setElapsed(0);
    const timer = setInterval(
      () => setElapsed(Math.floor((clock().getTime() - startedAt) / 1000)),
      TICK_MS,
    );
    return () => clearInterval(timer);
  }, [clock, resetKey]);
  return elapsed;
}
