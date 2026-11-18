import { z } from 'zod';

/** TTS rate range offered in Settings (SPEC §2). */
export const MIN_SPEECH_RATE = 0.5;
export const MAX_SPEECH_RATE = 1;
/** Daily session length range in minutes. */
export const DAILY_GOAL_RANGE = { min: 5, max: 60 } as const;

export const StreakSchema = z.object({
  /** Local calendar day "YYYY-MM-DD" of the last finished session, or null. */
  lastDay: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  count: z.number().int().min(0),
});

export const ReminderSchema = z.object({
  enabled: z.boolean(),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
});

export const SettingsSchema = z.object({
  speechRate: z.number().min(MIN_SPEECH_RATE).max(MAX_SPEECH_RATE),
  dailyGoalMinutes: z.number().int().min(DAILY_GOAL_RANGE.min).max(DAILY_GOAL_RANGE.max),
  reminder: ReminderSchema,
  streak: StreakSchema,
  /** Chosen TTS voice id; null = the system voice. */
  voiceId: z.string().min(1).nullable(),
});

export const DEFAULT_SETTINGS: z.infer<typeof SettingsSchema> = {
  speechRate: 1,
  voiceId: null,
  dailyGoalMinutes: 18,
  reminder: { enabled: false, hour: 19, minute: 0 },
  streak: { lastDay: null, count: 0 },
};
