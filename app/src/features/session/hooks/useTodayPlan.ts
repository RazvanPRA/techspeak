import { useCallback, useEffect, useState } from 'react';
import { useSettings } from '@/services/settings';
import { toLocalDay } from '@/shared/utils';
import { useSessionDependencies } from '../dependencies/SessionDependencies';
import type { SessionPlan } from '../model/types';
import { buildDailySession } from '../services/buildDailySession.service';
import { currentStreak } from '../services/updateStreak.service';

export type PlanStatus = 'loading' | 'ready' | 'error';

/** Today's plan (rebuilt when the daily goal changes or on `refresh`) and the current streak. */
export function useTodayPlan() {
  const deps = useSessionDependencies();
  const { settings } = useSettings(deps.settings);
  const [plan, setPlan] = useState<SessionPlan | null>(null);
  const [status, setStatus] = useState<PlanStatus>('loading');
  const { dueCount, weakSounds, shadowingDeckIds, promptIds, random } = deps;
  const totalMinutes = settings.dailyGoalMinutes;

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      const [due, sounds] = await Promise.all([dueCount(), weakSounds()]);
      const config = { totalMinutes, shadowingDeckIds, promptIds, random };
      setPlan(buildDailySession(due, sounds, config));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [dueCount, weakSounds, shadowingDeckIds, promptIds, random, totalMinutes]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const streak = currentStreak(settings.streak, toLocalDay(deps.clock()));
  return { plan, status, streak, refresh };
}
