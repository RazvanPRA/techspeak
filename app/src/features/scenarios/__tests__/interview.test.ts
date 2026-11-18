import type { AnswerResult, ScenarioPrompt } from '../model/types';
import { pickInterviewPrompts } from '../services/pickInterviewPrompts.service';
import { summarizeInterview } from '../services/summarizeInterview.service';
import { sampleFeedback } from '../testing/fixtures';

const prompt = (deckId: string, n: number): ScenarioPrompt => ({
  id: `${deckId}-${n}`,
  deckId,
  topic: deckId,
  text: `Question ${n} about ${deckId}`,
});

const prompts = [
  ...[1, 2, 3, 4].map(n => prompt('sql', n)),
  ...[1, 2, 3].map(n => prompt('go', n)),
  prompt('react-rn', 1),
];

/** A deterministic rng that walks through a fixed list of values. */
const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
};

describe('pickInterviewPrompts', () => {
  it('picks 5 different prompts from the chosen decks only', () => {
    const picked = pickInterviewPrompts(
      prompts,
      ['sql', 'go'],
      sequence(0.3, 0.7, 0.1),
    );
    expect(picked).toHaveLength(5);
    expect(new Set(picked.map(p => p.id)).size).toBe(5);
    expect(picked.every(p => p.deckId === 'sql' || p.deckId === 'go')).toBe(
      true,
    );
  });

  it('tops up from other decks when the chosen ones have fewer than 5 prompts', () => {
    const picked = pickInterviewPrompts(prompts, ['go'], sequence(0.5));
    expect(picked).toHaveLength(5);
    expect(picked.slice(0, 3).every(p => p.deckId === 'go')).toBe(true);
  });

  it('uses every deck when none is chosen, and never more prompts than exist', () => {
    expect(pickInterviewPrompts(prompts, [], sequence(0.2))).toHaveLength(5);
    expect(
      pickInterviewPrompts(prompts.slice(0, 2), [], sequence(0.2)),
    ).toHaveLength(2);
  });

  it('is deterministic for the same rng', () => {
    const a = pickInterviewPrompts(prompts, ['sql', 'go'], sequence(0.9, 0.4));
    const b = pickInterviewPrompts(prompts, ['sql', 'go'], sequence(0.9, 0.4));
    expect(a).toEqual(b);
  });
});

const answer = (overrides: Partial<AnswerResult> = {}): AnswerResult => ({
  prompt: prompt('sql', 1),
  transcript: 'an answer',
  durationSeconds: 90,
  feedback: sampleFeedback,
  localFluency: {
    wordCount: 200,
    wordsPerMinute: 133,
    fillerCount: 0,
    fillers: [],
  },
  feedbackError: null,
  ...overrides,
});

const fluency = (
  wordsPerMinute: number,
  fillerCount: number,
  fillers: string[] = [],
) => ({
  ...sampleFeedback,
  fluency: { wordsPerMinute, fillerCount, fillers, tip: '' },
});

describe('summarizeInterview', () => {
  it('returns at most the 3 most important issues, most severe first', () => {
    const answers = [1, 2, 3, 4, 5].map(() =>
      answer({ durationSeconds: 40, feedback: fluency(80, 8, ['um', 'like']) }),
    );
    const issues = summarizeInterview(answers);
    expect(issues).toHaveLength(3);
    expect(issues.map(i => i.kind)).toEqual(['length', 'fillers', 'pace']);
  });

  it('reports a slow pace with the average words per minute', () => {
    const issues = summarizeInterview([answer({ feedback: fluency(100, 0) })]);
    expect(issues).toContainEqual(
      expect.objectContaining({
        kind: 'pace',
        wordsPerMinute: 100,
        tooFast: false,
      }),
    );
  });

  it('collects the words and missing terms that come back most often', () => {
    const issues = summarizeInterview([
      answer(),
      answer(),
      answer({ feedback: fluency(130, 0) }),
    ]);
    const pronunciation = issues.find(i => i.kind === 'pronunciation');
    const vocabulary = issues.find(i => i.kind === 'vocabulary');
    expect(pronunciation).toEqual(
      expect.objectContaining({ words: ['query'] }),
    );
    expect(vocabulary).toEqual(
      expect.objectContaining({ terms: ['transaction'] }),
    );
  });

  it('falls back to the on-device fluency when the server was unreachable', () => {
    const offline = answer({
      feedback: null,
      localFluency: {
        wordCount: 300,
        wordsPerMinute: 180,
        fillerCount: 0,
        fillers: [],
      },
    });
    expect(summarizeInterview([offline])).toEqual([
      expect.objectContaining({
        kind: 'pace',
        wordsPerMinute: 180,
        tooFast: true,
      }),
    ]);
  });

  it('returns no issues for a clean interview, and none for no answers', () => {
    const clean = {
      ...fluency(140, 0),
      pronunciation: [],
      vocabulary: { used: ['index'], missing: [] },
    };
    expect(summarizeInterview([answer({ feedback: clean })])).toEqual([]);
    expect(summarizeInterview([])).toEqual([]);
  });
});
