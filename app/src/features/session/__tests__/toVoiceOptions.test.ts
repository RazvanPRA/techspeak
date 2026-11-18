import { toVoiceOptions } from '../services/toVoiceOptions.service';

const v = (id: string, language: string, name = id) => ({ id, name, language });

describe('toVoiceOptions', () => {
  it('names Android voices by accent and number, offline first, and hides duplicates', () => {
    const options = toVoiceOptions([
      v('en-us-x-iob-network', 'en-US'),
      v('en-AU-language', 'en-AU'),
      v('en-au-x-aub-local', 'en-AU'),
      v('en-au-x-aua-network', 'en-AU'),
      v('en-au-x-aua-local', 'en-AU'),
      v('en-us-x-iob-local', 'en-US'),
      v('en-gb-x-gba-network', 'en-GB'),
    ]);
    expect(options).toEqual([
      { id: 'en-au-x-aua-local', label: 'Australian English · Voice 1', caption: 'en-AU · offline' },
      { id: 'en-au-x-aub-local', label: 'Australian English · Voice 2', caption: 'en-AU · offline' },
      {
        id: 'en-gb-x-gba-network',
        label: 'British English · Voice 1',
        caption: 'en-GB · needs internet',
      },
      { id: 'en-us-x-iob-local', label: 'American English · Voice 1', caption: 'en-US · offline' },
    ]);
  });

  it('keeps readable names (iOS) and unknown accents as they are', () => {
    expect(
      toVoiceOptions([
        v('com.apple.voice.Samantha', 'en-US', 'Samantha'),
        v('com.apple.voice.Daniel', 'en-GB', 'Daniel'),
        v('en-zz-x-zza-local', 'en-ZZ'),
        v('com.apple.voice.Daniel', 'en-GB', 'Daniel'),
      ]),
    ).toEqual([
      { id: 'com.apple.voice.Daniel', label: 'Daniel', caption: 'British English' },
      { id: 'com.apple.voice.Samantha', label: 'Samantha', caption: 'American English' },
      { id: 'en-zz-x-zza-local', label: 'en-ZZ · Voice 1', caption: 'en-ZZ · offline' },
    ]);
  });
});
