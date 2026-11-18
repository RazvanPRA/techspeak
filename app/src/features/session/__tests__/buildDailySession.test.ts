import { buildDailySession } from '../services/buildDailySession.service';

const config = {
  totalMinutes: 18,
  shadowingDeckIds: ['react-rn', 'sql', 'go'],
  promptIds: ['sql-1', 'go-1'],
  random: () => 0,
};

const minutes = (plan: ReturnType<typeof buildDailySession>) =>
  plan.blocks.map(b => [b.kind, b.minutes]);

describe('buildDailySession', () => {
  it('builds the default 18-minute plan in SPEC order', () => {
    const plan = buildDailySession(10, ['θ-s', 'w-v'], config);
    expect(minutes(plan)).toEqual([
      ['pairs', 3],
      ['shadowing', 7],
      ['vocabulary', 5],
      ['scenario', 3],
    ]);
    expect(plan.totalMinutes).toBe(18);
  });

  it('drills the weakest sound and picks a deck and a prompt with the rng', () => {
    const plan = buildDailySession(10, ['θ-s', 'w-v'], { ...config, random: () => 0.99 });
    expect(plan.blocks.map(b => b.focus)).toEqual(['θ-s', 'go', null, 'go-1']);
  });

  it('drills random pairs when there are no weak sounds yet', () => {
    const plan = buildDailySession(10, [], config);
    expect(plan.blocks[0]).toEqual({ kind: 'pairs', minutes: 3, focus: null });
  });

  it('gives the vocabulary time to shadowing when no cards are due', () => {
    const plan = buildDailySession(0, [], config);
    expect(minutes(plan)).toEqual([
      ['pairs', 3],
      ['shadowing', 12],
      ['scenario', 3],
    ]);
  });

  it('scales to a custom total and still adds up exactly', () => {
    for (const totalMinutes of [10, 25, 30]) {
      const plan = buildDailySession(4, [], { ...config, totalMinutes });
      const sum = plan.blocks.reduce((s, b) => s + b.minutes, 0);
      expect(sum).toBe(totalMinutes);
      expect(plan.blocks.every(b => b.minutes >= 1)).toBe(true);
    }
    expect(minutes(buildDailySession(4, [], { ...config, totalMinutes: 36 }))).toEqual([
      ['pairs', 6],
      ['shadowing', 14],
      ['vocabulary', 10],
      ['scenario', 6],
    ]);
  });

  it('leaves out the scenario when there are no prompts', () => {
    const plan = buildDailySession(3, [], { ...config, promptIds: [] });
    expect(plan.blocks.map(b => b.kind)).toEqual(['pairs', 'shadowing', 'vocabulary']);
    expect(plan.blocks[1]?.minutes).toBe(10);
  });

  it('is deterministic for the same rng', () => {
    const a = buildDailySession(3, ['θ-s'], { ...config, random: () => 0.5 });
    const b = buildDailySession(3, ['θ-s'], { ...config, random: () => 0.5 });
    expect(a).toEqual(b);
  });

  it('rejects a total below one minute per block', () => {
    expect(() => buildDailySession(3, [], { ...config, totalMinutes: 3 })).toThrow(/minutes/);
  });
});
