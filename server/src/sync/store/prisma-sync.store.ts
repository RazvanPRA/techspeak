import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  StoredChanges,
  SyncBatch,
  SyncCursor,
  VocabularyStateRecord,
} from '../sync.types.js';
import type { SyncStore } from './sync-store.js';

type Tx = Prisma.TransactionClient;

const date = (iso: string) => new Date(iso);
const iso = (d: Date) => d.toISOString();
const json = (value: unknown) => value as Prisma.InputJsonValue;

/** Insert, or replace when newer (last write wins); a replaced row gets a new seq. */
function upsertVocabulary(tx: Tx, v: VocabularyStateRecord) {
  return tx.$executeRaw`
    INSERT INTO "SyncedVocabularyState"
      (id, "deckId", term, ease, interval, repetitions, "dueAt", lapses, "updatedAt")
    VALUES (${v.id}, ${v.deckId}, ${v.term}, ${v.ease}, ${v.interval}, ${v.repetitions},
            ${date(v.dueAt)}, ${v.lapses}, ${date(v.updatedAt)})
    ON CONFLICT (id) DO UPDATE SET
      ease = EXCLUDED.ease, interval = EXCLUDED.interval,
      repetitions = EXCLUDED.repetitions, "dueAt" = EXCLUDED."dueAt",
      lapses = EXCLUDED.lapses, "updatedAt" = EXCLUDED."updatedAt",
      "receivedAt" = now(),
      seq = nextval(pg_get_serial_sequence('"SyncedVocabularyState"', 'seq'))
    WHERE EXCLUDED."updatedAt" > "SyncedVocabularyState"."updatedAt"`;
}

@Injectable()
export class PrismaSyncStore implements SyncStore {
  constructor(private readonly prisma: PrismaService) {}

  async save(batch: SyncBatch): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.syncedShadowingAttempt.createMany({
        data: batch.shadowingAttempts.map((a) => ({
          ...a,
          words: json(a.words),
          details: a.details === null ? undefined : json(a.details),
          createdAt: date(a.createdAt),
        })),
        skipDuplicates: true,
      });
      await tx.syncedPairAttempt.createMany({
        data: batch.pairAttempts.map((a) => ({
          ...a,
          createdAt: date(a.createdAt),
        })),
        skipDuplicates: true,
      });
      await tx.syncedScenarioAnswer.createMany({
        data: batch.scenarioAnswers.map((a) => ({
          ...a,
          createdAt: date(a.createdAt),
        })),
        skipDuplicates: true,
      });
      await tx.syncedTalk.createMany({
        data: batch.talks.map((t) => ({ ...t, createdAt: date(t.createdAt) })),
        skipDuplicates: true,
      });
      for (const state of batch.vocabularyStates)
        await upsertVocabulary(tx, state);
    });
  }

  async changesSince(
    cursor: SyncCursor,
    limit: number,
  ): Promise<StoredChanges> {
    const page = (seq: number) => ({
      where: { seq: { gt: seq } },
      orderBy: { seq: 'asc' as const },
      take: limit,
      omit: { receivedAt: true },
    });
    const [shadowing, pairs, vocabulary, answers, talks] = await Promise.all([
      this.prisma.syncedShadowingAttempt.findMany(
        page(cursor.shadowingAttempts),
      ),
      this.prisma.syncedPairAttempt.findMany(page(cursor.pairAttempts)),
      this.prisma.syncedVocabularyState.findMany(page(cursor.vocabularyStates)),
      this.prisma.syncedScenarioAnswer.findMany(page(cursor.scenarioAnswers)),
      this.prisma.syncedTalk.findMany(page(cursor.talks)),
    ]);
    return {
      shadowingAttempts: shadowing.map((a) => ({
        ...a,
        words: a.words as unknown[],
        details: (a.details ?? null) as Record<string, unknown> | null,
        createdAt: iso(a.createdAt),
      })),
      pairAttempts: pairs.map((a) => ({
        ...a,
        mode: a.mode as 'listen' | 'say',
        createdAt: iso(a.createdAt),
      })),
      vocabularyStates: vocabulary.map((v) => ({
        ...v,
        dueAt: iso(v.dueAt),
        updatedAt: iso(v.updatedAt),
      })),
      scenarioAnswers: answers.map((a) => ({
        ...a,
        createdAt: iso(a.createdAt),
      })),
      talks: talks.map((t) => ({ ...t, createdAt: iso(t.createdAt) })),
    };
  }
}
