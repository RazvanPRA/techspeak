import type { FeedbackInput } from '../providers/feedback-provider.js';
import { SCENARIO_FEEDBACK_PROMPT } from '../prompts/scenario-feedback.prompt.js';

export type ChatMessage = { role: 'system' | 'user'; content: string };

/**
 * Scores, fluency and pronunciation stay rule-based, so the model is asked for less output
 * (faster on a CPU) and cannot change them.
 */
const ONLY_LLM_FIELDS = `

For this request, return only "corrections" and "improvedAnswer" as a JSON object.
The other fields are computed elsewhere. If there is nothing to correct, return an empty
"corrections" array.`;

function formatScores(input: FeedbackInput): string {
  const scores = input.pronunciation ?? [];
  if (scores.length === 0) return 'none';
  return scores.map((s) => `${s.word} ${Math.round(s.accuracy)}`).join(', ');
}

/** The Part B system prompt with its {{variables}} filled in, plus the transcript as the user turn. */
export function buildFeedbackMessages(input: FeedbackInput): ChatMessage[] {
  const values: Record<string, string> = {
    prompt: input.prompt,
    deck: input.deck.title,
    transcript: input.transcript,
    durationSeconds: String(input.durationSeconds),
    pronunciationScores: formatScores(input),
  };
  // A replacer function, so "$&" etc. in the transcript are kept literally.
  const system = SCENARIO_FEEDBACK_PROMPT.replace(
    /\{\{(\w+)\}\}/g,
    (match, name: string) => values[name] ?? match,
  );
  return [
    { role: 'system', content: system + ONLY_LLM_FIELDS },
    { role: 'user', content: input.transcript },
  ];
}
