import { useCallback } from 'react';
import {
  DAILY_GOAL_RANGE as GOAL_RANGE,
  MAX_SPEECH_RATE,
  MIN_SPEECH_RATE,
  useSettings,
} from '@/services/settings';
import { useSessionDependencies } from '../dependencies/SessionDependencies';
import { GOAL_STEP, RATE_STEP } from '../model/constants';

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Speech rate and daily goal, changed in fixed steps within their ranges. */
export function usePracticeSettings() {
  const { settings: repo } = useSessionDependencies();
  const { settings, update } = useSettings(repo);
  const { speechRate, dailyGoalMinutes } = settings;

  const changeRate = useCallback(
    (direction: 1 | -1) =>
      update({
        speechRate: clamp(round1(speechRate + direction * RATE_STEP), MIN_SPEECH_RATE, MAX_SPEECH_RATE),
      }),
    [update, speechRate],
  );
  const changeGoal = useCallback(
    (direction: 1 | -1) =>
      update({
        dailyGoalMinutes: clamp(dailyGoalMinutes + direction * GOAL_STEP, GOAL_RANGE.min, GOAL_RANGE.max),
      }),
    [update, dailyGoalMinutes],
  );

  return {
    speechRate,
    dailyGoalMinutes,
    rate: { canSlower: speechRate > MIN_SPEECH_RATE, canFaster: speechRate < MAX_SPEECH_RATE },
    goal: { canLess: dailyGoalMinutes > GOAL_RANGE.min, canMore: dailyGoalMinutes < GOAL_RANGE.max },
    changeRate,
    changeGoal,
  };
}
