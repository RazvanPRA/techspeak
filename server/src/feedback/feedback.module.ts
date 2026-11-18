import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.schema.js';
import { FeedbackController } from './feedback.controller.js';
import { FeedbackService } from './feedback.service.js';
import { FetchOllamaClient } from './ollama/ollama-client.js';
import {
  FEEDBACK_PROVIDER,
  type FeedbackProvider,
} from './providers/feedback-provider.js';
import { OllamaFeedbackProvider } from './providers/ollama-feedback.provider.js';
import { RuleBasedFeedbackProvider } from './providers/rule-based-feedback.provider.js';
import { PrismaScenarioAnswerStore } from './store/prisma-scenario-answer.store.js';
import { SCENARIO_ANSWER_STORE } from './store/scenario-answer-store.js';

type Config = ConfigService<Env, true>;

/** Rules only, or rules + a local Ollama model when OLLAMA_URL is set. Callers never change. */
function createFeedbackProvider(
  config: Config,
  rules: RuleBasedFeedbackProvider,
): FeedbackProvider {
  const url = config.get('OLLAMA_URL', { infer: true });
  if (!url) return rules;
  return new OllamaFeedbackProvider(new FetchOllamaClient(url), rules, {
    model: config.get('OLLAMA_MODEL', { infer: true }),
    timeoutMs: config.get('OLLAMA_TIMEOUT_MS', { infer: true }),
  });
}

@Module({
  controllers: [FeedbackController],
  providers: [
    FeedbackService,
    RuleBasedFeedbackProvider,
    {
      provide: FEEDBACK_PROVIDER,
      inject: [ConfigService, RuleBasedFeedbackProvider],
      useFactory: createFeedbackProvider,
    },
    { provide: SCENARIO_ANSWER_STORE, useClass: PrismaScenarioAnswerStore },
  ],
})
export class FeedbackModule {}
