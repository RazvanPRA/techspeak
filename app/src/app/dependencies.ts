// The single place where concrete implementations are chosen (modular-architecture §4).
// Swap an implementation here, never in the callers.
import { seedDecks } from '@/content/decks';
import minimalPairs from '@/content/minimal-pairs.json';
import prompts from '@/content/prompts.json';
import {
  type MinimalPairsDependencies,
  SeedPairRepository,
  SqlitePairAttemptRepository,
} from '@/features/minimal-pairs';
import {
  type FeedbackRepository,
  RemoteFeedbackRepository,
  type ScenariosDependencies,
  SeedPromptRepository,
  UnavailableFeedbackRepository,
} from '@/features/scenarios';
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
import { HttpClient } from '@/services/api';
import { createLazyExecutor } from '@/services/db';
import { openDatabase } from '@/services/db/openDatabase';
import { defaultAliases } from '@/services/scoring';
import {
  AzurePronunciationAssessor,
  FallbackAssessor,
  type PronunciationAssessor,
  type RecognizerRepository,
  SttDiffAssessor,
} from '@/services/speech';
import { AudioApiPlayerRepository } from '@/services/speech/repository/AudioApiPlayerRepository';
import { AudioApiRecorderRepository } from '@/services/speech/repository/AudioApiRecorderRepository';
import { NativeSpeechTtsRepository } from '@/services/speech/repository/NativeSpeechTtsRepository';
import { WhisperModelStore } from '@/services/speech/repository/WhisperModelStore';
import { WhisperRecognizerRepository } from '@/services/speech/repository/WhisperRecognizerRepository';
import { apiConfig } from './config/apiConfig';

/** How many recent shadowing attempts feed the vocabulary "weak words" deck. */
const SHADOWING_ATTEMPTS_FOR_WEAK_WORDS = 200;

export type AppDependencies = {
  shadowing: ShadowingDependencies;
  vocabulary: VocabularyDependencies;
  minimalPairs: MinimalPairsDependencies;
  scenarios: ScenariosDependencies;
};

/** Azure (via the server) when there is one, always falling back to on-device scoring. */
function createServerBacked(http: HttpClient | null, recognizer: RecognizerRepository) {
  const onDevice = new SttDiffAssessor(recognizer, defaultAliases);
  const assessor: PronunciationAssessor = http
    ? new FallbackAssessor(new AzurePronunciationAssessor(http), onDevice)
    : onDevice;
  const feedback: FeedbackRepository = http
    ? new RemoteFeedbackRepository(http)
    : new UnavailableFeedbackRepository();
  return { assessor, feedback };
}

export function createDependencies(): AppDependencies {
  // One database, one speech stack: shared by every feature.
  const db = createLazyExecutor(() => openDatabase());
  const recognizer = new WhisperRecognizerRepository(new WhisperModelStore());
  const speech = {
    tts: new NativeSpeechTtsRepository(),
    recorder: new AudioApiRecorderRepository(),
    recognizer,
  };
  const http = apiConfig ? new HttpClient(apiConfig) : null;
  const { assessor, feedback } = createServerBacked(http, recognizer);
  const decks = new SeedDeckRepository(seedDecks);
  const attempts = new SqliteAttemptRepository(db);
  const clock = () => new Date();

  return {
    shadowing: {
      ...speech,
      decks,
      attempts,
      player: new AudioApiPlayerRepository(),
      assessor,
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
      assessor,
      pairs: new SeedPairRepository(minimalPairs),
      attempts: new SqlitePairAttemptRepository(db),
      aliases: defaultAliases,
      clock,
      random: Math.random,
    },
    scenarios: {
      recorder: speech.recorder,
      recognizer,
      decks,
      prompts: new SeedPromptRepository(prompts),
      feedback,
      clock,
    },
  };
}
