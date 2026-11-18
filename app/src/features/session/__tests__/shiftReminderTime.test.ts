import { formatTimeOfDay, shiftReminderTime } from '../services/shiftReminderTime.service';
import { blockCaption, blockTitle, streakText } from '../services/describeBlock.service';

describe('shiftReminderTime', () => {
  it('moves forward and back within the day', () => {
    expect(shiftReminderTime({ hour: 19, minute: 0 }, 5)).toEqual({ hour: 19, minute: 5 });
    expect(shiftReminderTime({ hour: 19, minute: 0 }, -60)).toEqual({ hour: 18, minute: 0 });
  });

  it('wraps around midnight in both directions', () => {
    expect(shiftReminderTime({ hour: 23, minute: 55 }, 10)).toEqual({ hour: 0, minute: 5 });
    expect(shiftReminderTime({ hour: 0, minute: 0 }, -5)).toEqual({ hour: 23, minute: 55 });
  });
});

describe('formatTimeOfDay', () => {
  it('pads hours and minutes', () => {
    expect(formatTimeOfDay({ hour: 7, minute: 5 })).toBe('07:05');
  });
});

describe('describeBlock', () => {
  it('names the block and shows its minutes and focus', () => {
    expect(blockTitle('pairs')).toBe('Minimal pairs');
    expect(blockCaption({ kind: 'pairs', minutes: 3, focus: 'θ-s' })).toBe('3 min · θ-s');
    expect(blockCaption({ kind: 'vocabulary', minutes: 5, focus: null })).toBe('5 min');
    expect(blockCaption({ kind: 'scenario', minutes: 3, focus: 'sql-1' })).toBe('3 min');
  });
});

describe('streakText', () => {
  it('uses singular and plural forms', () => {
    expect(streakText(0)).toBe('Start a streak today');
    expect(streakText(1)).toBe('Streak: 1 day');
    expect(streakText(5)).toBe('Streak: 5 days');
  });
});
