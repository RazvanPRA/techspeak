// The single place where concrete implementations are chosen (modular-architecture §4).
// Swap an implementation here, never in the callers.
import { seedDecks } from '@/content/decks';
import minimalPairs from '@/content/minimal-pairs.json';
import {
  type MinimalPairsDependencies,
  SeedPairRepository,
  SqlitePairAttemptRepository,
} from '@/features/minimal-pairs';
import {
  countMissedWords,
  type ShadowingDependencies,
  SqliteAttemptRepository,
} from '@/features/shadowing';
import {
  SeedDeckRepository,
  SqliteVocabularyRepository,
  type VocabularyDependencies,
} from '@/features/vocabulary';
import { createLazyExecutor } from '@/services/db';
import { openDatabase } from '@/services/db/openDatabase';
import { defaultAliases } from '@/services/scoring';
import { SttDiffAssessor } from '@/services/speech';
import { AudioApiPlayerRepository } from '@/services/speech/repository/AudioApiPlayerRepository';
import { AudioApiRecorderRepository } from '@/services/speech/repository/AudioApiRecorderRepository';
import { NativeSpeechTtsRepository } from '@/services/speech/repository/NativeSpeechTtsRepository';
import { WhisperModelStore } from '@/services/speech/repository/WhisperModelStore';
import { WhisperRecognizerRepository } from '@/services/speech/repository/WhisperRecognizerRepository';

/** How many recent shadowing attempts feed the vocabulary "weak words" deck. */
const SHADOWING_ATTEMPTS_FOR_WEAK_WORDS = 200;

export type AppDependencies = {
  shadowing: ShadowingDependencies;
  vocabulary: VocabularyDependencies;
  minimalPairs: MinimalPairsDependencies;
};

export function createDependencies(): AppDependencies {
  // One database, one speech stack: shared by every feature.
  const db = createLazyExecutor(() => openDatabase());
  const recognizer = new WhisperRecognizerRepository(new WhisperModelStore());
  const speech = {
    tts: new NativeSpeechTtsRepository(),
    recorder: new AudioApiRecorderRepository(),
    recognizer,
  };
  const decks = new SeedDeckRepository(seedDecks);
  const attempts = new SqliteAttemptRepository(db);
  const clock = () => new Date();

  return {
    shadowing: {
      ...speech,
      decks,
      attempts,
      player: new AudioApiPlayerRepository(),
      assessor: new SttDiffAssessor(recognizer, defaultAliases),
      clock,
    },
    vocabulary: {
      ...speech,
      decks,
      reviews: new SqliteVocabularyRepository(db),
      aliases: defaultAliases,
      // Cross-feature data goes through shadowing's public API only.
      missedWords: async () =>
        countMissedWords(await attempts.listRecent(SHADOWING_ATTEMPTS_FOR_WEAK_WORDS)),
      clock,
    },
    minimalPairs: {
      ...speech,
      pairs: new SeedPairRepository(minimalPairs),
      attempts: new SqlitePairAttemptRepository(db),
      aliases: defaultAliases,
      clock,
      random: Math.random,
    },
  };
}
