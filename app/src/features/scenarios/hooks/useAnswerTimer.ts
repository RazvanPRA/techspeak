import { useCallback, useEffect, useRef, useState } from 'react';

const TICK_MS = 250;

type Options = { clock: () => Date; maxSeconds: number; onLimit: () => void };

/** Elapsed seconds of the answer; calls `onLimit` once when `maxSeconds` is reached. */
export function useAnswerTimer({ clock, maxSeconds, onLimit }: Options) {
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const limitRef = useRef(onLimit);
  limitRef.current = onLimit;

  const clear = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const secondsSinceStart = useCallback(
    () => (startedAt.current === null ? 0 : (clock().getTime() - startedAt.current) / 1000),
    [clock],
  );

  const start = useCallback(() => {
    clear();
    startedAt.current = clock().getTime();
    setElapsed(0);
    timer.current = setInterval(() => {
      const seconds = Math.min(secondsSinceStart(), maxSeconds);
      setElapsed(seconds);
      if (seconds >= maxSeconds) {
        clear();
        limitRef.current();
      }
    }, TICK_MS);
  }, [clear, clock, maxSeconds, secondsSinceStart]);

  /** Stops the timer and returns the answer length in seconds. */
  const stop = useCallback((): number => {
    clear();
    const seconds = Math.min(secondsSinceStart(), maxSeconds);
    startedAt.current = null;
    setElapsed(seconds);
    return seconds;
  }, [clear, maxSeconds, secondsSinceStart]);

  useEffect(() => clear, [clear]);

  return { elapsed, start, stop };
}
