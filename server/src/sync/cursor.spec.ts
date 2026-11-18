import { EMPTY_CURSOR, formatCursor, parseCursor } from './cursor.js';

describe('sync cursor', () => {
  it('round-trips through its text form', () => {
    const cursor = {
      shadowingAttempts: 12,
      pairAttempts: 3,
      vocabularyStates: 40,
      scenarioAnswers: 5,
      talks: 0,
    };
    expect(formatCursor(cursor)).toBe('s12.p3.v40.a5.t0');
    expect(parseCursor('s12.p3.v40.a5.t0')).toEqual(cursor);
  });

  it('treats a missing or empty cursor as "everything"', () => {
    expect(parseCursor(undefined)).toEqual(EMPTY_CURSOR);
    expect(parseCursor('')).toEqual(EMPTY_CURSOR);
  });

  it('accepts the parts in any order and missing parts as 0', () => {
    expect(parseCursor('v7.s2')).toEqual({
      ...EMPTY_CURSOR,
      vocabularyStates: 7,
      shadowingAttempts: 2,
    });
  });

  it.each(['x1', 's-1', 's1.5', 's', 'abc', 's1..p2', 's1.s2'])(
    'returns null for an invalid cursor "%s"',
    (text) => {
      expect(parseCursor(text)).toBeNull();
    },
  );
});
