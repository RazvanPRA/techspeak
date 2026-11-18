import { INTERVIEW_QUESTIONS } from '../model/constants';
import type { ScenarioPrompt } from '../model/types';

/** Fisher–Yates shuffle with an injected rng (returns [0, 1) like Math.random). */
function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.min(Math.floor(random() * (i + 1)), i);
    [result[i], result[j]] = [result[j] as T, result[i] as T];
  }
  return result;
}

/**
 * The questions of one mock interview: random prompts from the chosen decks (all decks when
 * none is chosen), topped up from the other decks when there are not enough. No repeats.
 */
export function pickInterviewPrompts(
  prompts: readonly ScenarioPrompt[],
  deckIds: readonly string[],
  random: () => number,
): ScenarioPrompt[] {
  const chosen = deckIds.length === 0 ? prompts : prompts.filter(p => deckIds.includes(p.deckId));
  const others = prompts.filter(p => !chosen.includes(p));
  return [...shuffle(chosen, random), ...shuffle(others, random)].slice(0, INTERVIEW_QUESTIONS);
}
