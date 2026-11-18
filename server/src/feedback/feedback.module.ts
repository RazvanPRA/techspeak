import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller.js';
import { FeedbackService } from './feedback.service.js';
import { FEEDBACK_PROVIDER } from './providers/feedback-provider.js';
import { RuleBasedFeedbackProvider } from './providers/rule-based-feedback.provider.js';
import { PrismaScenarioAnswerStore } from './store/prisma-scenario-answer.store.js';
import { SCENARIO_ANSWER_STORE } from './store/scenario-answer-store.js';

@Module({
  controllers: [FeedbackController],
  providers: [
    FeedbackService,
    // Swap for a Claude / local-model provider here; callers never change.
    { provide: FEEDBACK_PROVIDER, useClass: RuleBasedFeedbackProvider },
    { provide: SCENARIO_ANSWER_STORE, useClass: PrismaScenarioAnswerStore },
  ],
})
export class FeedbackModule {}
