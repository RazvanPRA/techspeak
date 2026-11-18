const DAY_MINUTES = 24 * 60;

type Time = { hour: number; minute: number };

/** Moves a time of day by `minutes`, wrapping around midnight in both directions. */
export function shiftReminderTime(time: Time, minutes: number): Time {
  const total = (((time.hour * 60 + time.minute + minutes) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  return { hour: Math.floor(total / 60), minute: total % 60 };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "07:05" */
export function formatTimeOfDay(time: Time): string {
  return `${pad(time.hour)}:${pad(time.minute)}`;
}
