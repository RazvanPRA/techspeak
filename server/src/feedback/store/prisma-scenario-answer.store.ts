import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  ScenarioAnswerStore,
  ScenarioAnswerToSave,
} from './scenario-answer-store.js';

@Injectable()
export class PrismaScenarioAnswerStore implements ScenarioAnswerStore {
  constructor(private readonly prisma: PrismaService) {}

  async save({
    provider,
    feedback,
    ...answer
  }: ScenarioAnswerToSave): Promise<void> {
    await this.prisma.scenarioAnswer.create({
      data: {
        ...answer,
        feedback: {
          create: {
            provider,
            overallScore: feedback.overallScore,
            body: feedback,
          },
        },
      },
    });
  }
}
