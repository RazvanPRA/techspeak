import { stripNonSpeech } from '../model/stripNonSpeech.service';

describe('stripNonSpeech', () => {
  it.each([
    ['[BLANK_AUDIO] you', 'you'],
    ['[BLANK_AUDIO]', ''],
    ['(silence) The event loop runs. [Music]', 'The event loop runs.'],
    ['*coughs* Hello  there', 'Hello there'],
    ['The array [0] is first', 'The array [0] is first'],
  ])('%j → %j', (input, expected) => {
    expect(stripNonSpeech(input)).toBe(expected);
  });
});
