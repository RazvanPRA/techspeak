import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AttemptStore, AttemptToSave } from './attempt-store.js';

@Injectable()
export class PrismaAttemptStore implements AttemptStore {
  constructor(private readonly prisma: PrismaService) {}

  async save({
    referenceText,
    transcript,
    scores,
    words,
  }: AttemptToSave): Promise<void> {
    await this.prisma.attempt.create({
      data: {
        referenceText,
        transcript,
        pronunciationScore: scores.pronunciation,
        accuracyScore: scores.accuracy,
        fluencyScore: scores.fluency,
        completenessScore: scores.completeness,
        prosodyScore: scores.prosody,
        words,
      },
    });
  }
}
