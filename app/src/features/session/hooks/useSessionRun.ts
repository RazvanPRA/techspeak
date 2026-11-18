import { useCallback, useRef, useState } from 'react';
import { toLocalDay } from '@/shared/utils';
import { useSessionDependencies } from '../dependencies/SessionDependencies';
import type { BlockKind, SessionPlan, SessionSummary } from '../model/types';
import { updateStreak } from '../services/updateStreak.service';
import { useElapsedSeconds } from './useElapsedSeconds';

/**
 * Runs the plan block by block. "Next" counts the block as done, "Skip" does not. After the last
 * block the streak is updated (only if at least one block was done) and `onFinished` is called.
 */
export function useSessionRun(plan: SessionPlan, onFinished: (summary: SessionSummary) => void) {
  const { settings, clock } = useSessionDependencies();
  const [index, setIndex] = useState(0);
  const done = useRef<{ completed: BlockKind[]; skipped: BlockKind[] }>({ completed: [], skipped: [] });
  const startedAt = useRef(clock().getTime());
  const blockElapsed = useElapsedSeconds(clock, index);
  const block = plan.blocks[index] ?? null;

  const finish = useCallback(() => {
    const { completed, skipped } = done.current;
    let streak = settings.get().streak;
    if (completed.length > 0) {
      streak = updateStreak(streak, toLocalDay(clock()));
      settings.update({ streak });
    }
    const elapsedSeconds = Math.round((clock().getTime() - startedAt.current) / 1000);
    onFinished({ completed, skipped, elapsedSeconds, streak: streak.count });
  }, [settings, clock, onFinished]);

  const advance = useCallback(
    (outcome: 'completed' | 'skipped') => {
      if (!block) return;
      done.current = { ...done.current, [outcome]: [...done.current[outcome], block.kind] };
      if (index + 1 >= plan.blocks.length) finish();
      else setIndex(index + 1);
    },
    [block, index, plan.blocks.length, finish],
  );

  const next = useCallback(() => advance('completed'), [advance]);
  const skip = useCallback(() => advance('skipped'), [advance]);
  const timeUp = block !== null && blockElapsed >= block.minutes * 60;
  return { index, block, total: plan.blocks.length, blockElapsed, timeUp, next, skip };
}
