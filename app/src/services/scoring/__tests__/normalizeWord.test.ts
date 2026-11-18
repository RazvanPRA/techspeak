import { normalizeWord } from '../normalizeWord.service';

describe('normalizeWord', () => {
  it.each([
    ['Hello,', 'hello'],
    ['Node.js', 'nodejs'],
    ['re-renders', 'rerenders'],
    ["doesn't", "doesn't"],
    ['doesn’t', "doesn't"],
    ['"quoted"', 'quoted'],
    ['—', ''],
    ['', ''],
  ])('%s → %s', (input, expected) => {
    expect(normalizeWord(input)).toBe(expected);
  });
});
