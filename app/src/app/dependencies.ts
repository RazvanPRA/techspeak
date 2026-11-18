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
import type { ProgressDependencies } from '@/features/progress';
import {
  type FeedbackRepository,
  RemoteFeedbackRepository,
  type ScenariosDependencies,
  SeedPromptRepository,
  SqliteScenarioAnswerRepository,
  SqliteTalkRepository,
  UnavailableFeedbackRepository,
} from '@/features/scenarios';
import type { SessionDependencies } from '@/features/session';
import {
  createSyncRunner,
  RemoteSyncRepository,
  SqliteLocalSyncStore,
  type SyncDependencies,
  SyncStatusStore,
  UnavailableSyncRepository,
} from '@/features/sync';
import {
  countMissedWords,
  SHADOWING_DECK_IDS,
  type ShadowingDependencies,
  SqliteAttemptRepository,
} from '@/features/shadowing';
import {
  SeedDeckRepository,
  SqliteVocabularyRepository,
  type VocabularyDependencies,
} from '@/features/vocabulary';
import { HttpClient } from '@/services/api';
import { createLazyExecutor, type SqlExecutor } from '@/services/db';
import { openDatabase } from '@/services/db/openDatabase';
import { NativeReminderRepository } from '@/services/reminders/NativeReminderRepository';
import { defaultAliases } from '@/services/scoring';
import { KeyValueSettingsRepository } from '@/services/settings';
import { MmkvKeyValueStore } from '@/services/settings/repository/MmkvKeyValueStore';
import {
  AzurePronunciationAssessor,
  FallbackAssessor,
  type PronunciationAssessor,
  RateScaledTtsRepository,
  type RecognizerRepository,
  SttDiffAssessor,
  VoicedTtsRepository,
} from '@/services/speech';
import { AudioApiPlayerRepository } from '@/services/speech/repository/AudioApiPlayerRepository';
import { AudioApiRecorderRepository } from '@/services/speech/repository/AudioApiRecorderRepository';
import { FsRecordingArchive } from '@/services/speech/repository/FsRecordingArchive';
import { NativeSpeechTtsRepository } from '@/services/speech/repository/NativeSpeechTtsRepository';
import { WhisperModelStore } from '@/services/speech/repository/WhisperModelStore';
import { WhisperRecognizerRepository } from '@/services/speech/repository/WhisperRecognizerRepository';
import { apiConfig } from './config/apiConfig';
import { createProgressSources, createSessionSources } from './crossFeatureSources';

/** How many recent shadowing attempts feed the vocabulary "weak words" deck. */
const SHADOWING_ATTEMPTS_FOR_WEAK_WORDS = 200;

export type AppDependencies = {
  shadowing: ShadowingDependencies;
  vocabulary: VocabularyDependencies;
  minimalPairs: MinimalPairsDependencies;
  scenarios: ScenariosDependencies;
  session: SessionDependencies;
  progress: ProgressDependencies;
  sync: SyncDependencies;
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

/** Backup to my own server when there is one; otherwise sync reports "unavailable". */
function createSync(db: SqlExecutor, http: HttpClient | null, clock: () => Date): SyncDependencies {
  const local = new SqliteLocalSyncStore(db);
  const remote = http ? new RemoteSyncRepository(http) : new UnavailableSyncRepository();
  const run = createSyncRunner({ local, remote, clock });
  return { status: new SyncStatusStore(run, () => local.readMeta()), clock };
}

// arch-exception: the composition root wires every feature; splitting it would hide the wiring.
export function createDependencies(): AppDependencies {
  // One database, one settings store, one speech stack: shared by every feature.
  const db = createLazyExecutor(() => openDatabase());
  const settings = new KeyValueSettingsRepository(new MmkvKeyValueStore());
  const recognizer = new WhisperRecognizerRepository(new WhisperModelStore());
  const rateScaledTts = new RateScaledTtsRepository(
    new NativeSpeechTtsRepository(),
    () => settings.get().speechRate,
  );
  const tts = new VoicedTtsRepository(rateScaledTts, () => settings.get().voiceId);
  const speech = { tts, recorder: new AudioApiRecorderRepository(), recognizer };
  const player = new AudioApiPlayerRepository();
  const http = apiConfig ? new HttpClient(apiConfig) : null;
  const { assessor, feedback } = createServerBacked(http, recognizer);
  const decks = new SeedDeckRepository(seedDecks);
  const attempts = new SqliteAttemptRepository(db);
  const pairAttempts = new SqlitePairAttemptRepository(db);
  const reviews = new SqliteVocabularyRepository(db);
  const answers = new SqliteScenarioAnswerRepository(db);
  const promptRepository = new SeedPromptRepository(prompts);
  const clock = () => new Date();
  const progress = createProgressSources({ attempts, pairAttempts, reviews, answers });

  return {
    shadowing: { ...speech, decks, attempts, player, assessor, clock },
    vocabulary: {
      ...speech,
      decks,
      reviews,
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
      attempts: pairAttempts,
      aliases: defaultAliases,
      clock,
      random: Math.random,
    },
    scenarios: {
      recorder: speech.recorder,
      recognizer,
      player,
      decks,
      prompts: promptRepository,
      feedback,
      answers,
      talks: new SqliteTalkRepository(db),
      archive: new FsRecordingArchive(),
      clock,
      random: Math.random,
    },
    session: {
      settings,
      reminders: new NativeReminderRepository(),
      tts: rateScaledTts, // the voice picker previews voices itself
      ...createSessionSources(progress, { decks, reviews }, clock),
      shadowingDeckIds: SHADOWING_DECK_IDS,
      promptIds: promptRepository.listGroups().flatMap(g => g.prompts.map(p => p.id)),
      clock,
      random: Math.random,
    },
    progress,
    sync: createSync(db, http, clock),
  };
}
