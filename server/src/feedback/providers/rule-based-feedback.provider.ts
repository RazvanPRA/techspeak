import { Injectable } from '@nestjs/common';
import { normalizeText } from '../../content/text/index.js';
import {
  type ScenarioFeedback,
  ScenarioFeedbackSchema,
} from '../feedback.schema.js';
import type { AnswerMetrics } from '../rules/answer-metrics.js';
import { countFillers } from '../rules/count-fillers.js';
import { findLongSentences } from '../rules/find-long-sentences.js';
import { fluencyTip } from '../rules/fluency-tip.js';
import { matchDeckTerms } from '../rules/match-deck-terms.js';
import { pickPhrasesToReuse } from '../rules/pick-phrases-to-reuse.js';
import { pickStrength } from '../rules/pick-strength.js';
import {
  pronunciationTips,
  type ScoredWord,
} from '../rules/pronunciation-tips.js';
import { scoreAnswer } from '../rules/score-answer.js';
import { wordsPerMinute } from '../rules/words-per-minute.js';
import type {
  FeedbackInput,
  FeedbackProvider,
  FeedbackReview,
} from './feedback-provider.js';

const average = (scores: readonly ScoredWord[] | undefined): number | null =>
  scores && scores.length > 0
    ? scores.reduce((sum, s) => sum + s.accuracy, 0) / scores.length
    : null;

function measure(input: FeedbackInput, termsUsed: string[]): AnswerMetrics {
  const wordCount = normalizeText(input.transcript).length;
  const fillers = countFillers(input.transcript);
  return {
    wordCount,
    durationSeconds: input.durationSeconds,
    wordsPerMinute: wordsPerMinute(wordCount, input.durationSeconds),
    fillerCount: fillers.count,
    fillers: fillers.fillers,
    longSentenceCount: findLongSentences(input.transcript).length,
    termsUsed,
    pronunciationAverage: average(input.pronunciation),
  };
}

/** Free, deterministic feedback. Fields that need a language model stay empty. */
@Injectable()
export class RuleBasedFeedbackProvider implements FeedbackProvider {
  readonly name = 'rules';

  async review(input: FeedbackInput): Promise<FeedbackReview> {
    return { feedback: this.build(input), provider: this.name };
  }

  private build(input: FeedbackInput): ScenarioFeedback {
    const { deck, prompt, transcript, pronunciation } = input;
    const vocabulary = matchDeckTerms(deck, transcript, prompt);
    const m = measure(input, vocabulary.used);
    return ScenarioFeedbackSchema.parse({
      overallScore: scoreAnswer(m),
      strength: pickStrength(m, deck.title),
      corrections: [], // needs an LLM (deferred)
      pronunciation: pronunciationTips({
        deck,
        usedTerms: vocabulary.used,
        scores: pronunciation,
      }),
      fluency: {
        wordsPerMinute: m.wordsPerMinute,
        fillerCount: m.fillerCount,
        fillers: m.fillers,
        tip: fluencyTip(m),
      },
      improvedAnswer: '', // needs an LLM (deferred)
      phrasesToReuse: pickPhrasesToReuse(deck, prompt, vocabulary.missing),
      vocabulary,
    });
  }
}
