import { testDeck } from '../testing/deck-fixture.js';
import { pronunciationTips } from './pronunciation-tips.js';
import { SOUND_TIPS, soundKind } from './sound-tips.js';

describe('soundKind', () => {
  it('uses the worst phoneme when Azure gives phonemes', () => {
    expect(
      soundKind('three', [
        { phoneme: 'θ', accuracy: 10 },
        { phoneme: 'r', accuracy: 90 },
      ]),
    ).toBe('th');
    expect(
      soundKind('vest', [
        { phoneme: 'v', accuracy: 20 },
        { phoneme: 'e', accuracy: 80 },
      ]),
    ).toBe('wv');
    expect(soundKind('sheep', [{ phoneme: 'iː', accuracy: 30 }])).toBe('vowel');
  });

  it.each([
    ['column', 'silent'],
    ['Foreign', 'silent'],
    ['method', 'th'],
    ['deployed', 'ed'],
    ['webhook', 'wv'],
    ['seed', 'vowel'],
    ['architecture', 'stress'],
  ] as const)('falls back to the spelling: %s → %s', (word, kind) => {
    expect(soundKind(word)).toBe(kind);
  });

  it('falls back to the spelling when the worst phoneme has no specific tip', () => {
    expect(soundKind('method', [{ phoneme: 'm', accuracy: 10 }])).toBe('th');
  });
});

describe('pronunciationTips', () => {
  it('tips every word below 70, worst first, once per word, with deck IPA and hint', () => {
    const tips = pronunciationTips({
      deck: testDeck,
      usedTerms: [],
      scores: [
        { word: 'Query', accuracy: 55 },
        { word: 'fast', accuracy: 95 },
        {
          word: 'think',
          accuracy: 30,
          phonemes: [{ phoneme: 'θ', accuracy: 5 }],
        },
        { word: 'query', accuracy: 60 },
      ],
    });
    expect(tips).toEqual([
      { word: 'think', ipa: '', tip: SOUND_TIPS.th },
      { word: 'Query', ipa: '/ˈkwɪəri/', tip: '"KWEER-ee"' },
    ]);
  });

  it('prefers a phoneme-specific tip over the deck hint, and spelling for unknown words', () => {
    const tips = pronunciationTips({
      deck: testDeck,
      usedTerms: [],
      scores: [
        {
          word: 'query',
          accuracy: 40,
          phonemes: [{ phoneme: 'w', accuracy: 10 }],
        },
        { word: 'deployed', accuracy: 50 },
      ],
    });
    expect(tips.map((t) => t.tip)).toEqual([SOUND_TIPS.wv, SOUND_TIPS.ed]);
  });

  it('returns no tips when every scored word is clear', () => {
    const scores = [{ word: 'index', accuracy: 90 }];
    expect(
      pronunciationTips({ deck: testDeck, usedTerms: ['index'], scores }),
    ).toEqual([]);
  });

  it('without scores, reminds the trap of each used deck term (max 3)', () => {
    const tips = pronunciationTips({
      deck: testDeck,
      usedTerms: ['query', 'index', 'isolation level', 'transaction', 'ACID'],
    });
    expect(tips).toEqual([
      { word: 'query', ipa: '/ˈkwɪəri/', tip: '"KWEER-ee"' },
      { word: 'index', ipa: '/ˈɪndɛks/', tip: 'Say it /ˈɪndɛks/.' },
      { word: 'transaction', ipa: '/trænˈzækʃən/', tip: 'stress on "-ZAK-"' },
    ]);
  });
});
