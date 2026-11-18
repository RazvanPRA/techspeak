import { phonemeToSound } from '../services/phonemeToSound.service';
import { rankWeakSounds } from '../services/rankWeakSounds.service';

describe('phonemeToSound', () => {
  it('maps Azure IPA phonemes to the drilled sound contrasts', () => {
    expect(phonemeToSound('θ')).toBe('θ-s');
    expect(phonemeToSound('ð')).toBe('ð-d');
    expect(phonemeToSound('v')).toBe('w-v');
    expect(phonemeToSound('w')).toBe('w-v');
    expect(phonemeToSound('i')).toBe('ɪ-iː');
    expect(phonemeToSound('ɪ')).toBe('ɪ-iː');
    expect(phonemeToSound('u')).toBe('ʊ-uː');
    expect(phonemeToSound('ɛ')).toBe('æ-e');
  });

  it('returns null for sounds that are not drilled', () => {
    expect(phonemeToSound('k')).toBeNull();
    expect(phonemeToSound('')).toBeNull();
  });
});

describe('rankWeakSounds', () => {
  const pair = (sound: string, correct: boolean) => ({ sound, correct });

  it('ranks by error rate across pair drills and Azure phonemes', () => {
    const ranked = rankWeakSounds({
      pairs: [pair('w-v', false), pair('w-v', true), pair('θ-s', true), pair('θ-s', true)],
      phonemes: [
        { phoneme: 'θ', accuracy: 30 },
        { phoneme: 'v', accuracy: 40 },
        { phoneme: 'w', accuracy: 95 },
      ],
    });
    expect(ranked).toEqual([
      { sound: 'w-v', errorRate: 0.5, samples: 4 },
      { sound: 'θ-s', errorRate: 1 / 3, samples: 3 },
    ]);
  });

  it('leaves out sounds with too few samples or no errors', () => {
    const ranked = rankWeakSounds({
      pairs: [pair('ð-d', false), pair('æ-e', true), pair('æ-e', true), pair('æ-e', true)],
      phonemes: [{ phoneme: 'k', accuracy: 10 }],
    });
    expect(ranked).toEqual([]);
  });

  it('is empty without data', () => {
    expect(rankWeakSounds({ pairs: [], phonemes: [] })).toEqual([]);
  });
});
