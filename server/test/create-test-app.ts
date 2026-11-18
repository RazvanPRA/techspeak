import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { PRONUNCIATION_CLIENT } from '../src/assessment/azure/pronunciation-client.js';
import { ATTEMPT_STORE } from '../src/assessment/store/attempt-store.js';
import { InMemoryAttemptStore } from '../src/assessment/store/in-memory-attempt.store.js';
import { FakePronunciationClient } from '../src/assessment/testing/fake-pronunciation.client.js';
import { InMemoryScenarioAnswerStore } from '../src/feedback/store/in-memory-scenario-answer.store.js';
import { SCENARIO_ANSWER_STORE } from '../src/feedback/store/scenario-answer-store.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { InMemorySyncStore } from '../src/sync/store/in-memory-sync.store.js';
import { SYNC_STORE } from '../src/sync/store/sync-store.js';

export const API_KEY = 'e2e-test-api-key-123';

/** The real app (guards, pipes, Swagger) with Azure and PostgreSQL replaced by fakes. */
export async function createTestApp() {
  const client = new FakePronunciationClient(88);
  const attempts = new InMemoryAttemptStore();
  const answers = new InMemoryScenarioAnswerStore();
  const syncStore = new InMemorySyncStore();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PRONUNCIATION_CLIENT)
    .useValue(client)
    .overrideProvider(ATTEMPT_STORE)
    .useValue(attempts)
    .overrideProvider(SCENARIO_ANSWER_STORE)
    .useValue(answers)
    .overrideProvider(SYNC_STORE)
    .useValue(syncStore)
    .overrideProvider(PrismaService)
    .useValue({ $disconnect: async () => undefined })
    .compile();
  const app: INestApplication = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
  return { app, client, attempts, answers, syncStore };
}
