// The single place where concrete implementations are chosen (modular-architecture §4).
// Swap an implementation here, never in the callers.
import { seedDecks } from '@/content/decks';
import { InMemoryAttemptRepository, type ShadowingDependencies } from '@/features/shadowing';
import { SeedDeckRepository } from '@/features/vocabulary';
import { defaultAliases } from '@/services/scoring';
import { SttDiffAssessor } from '@/services/speech';
import { AudioApiPlayerRepository } from '@/services/speech/repository/AudioApiPlayerRepository';
import { AudioApiRecorderRepository } from '@/services/speech/repository/AudioApiRecorderRepository';
import { NativeSpeechTtsRepository } from '@/services/speech/repository/NativeSpeechTtsRepository';
import { WhisperModelStore } from '@/services/speech/repository/WhisperModelStore';
import { WhisperRecognizerRepository } from '@/services/speech/repository/WhisperRecognizerRepository';

export type AppDependencies = { shadowing: ShadowingDependencies };

export function createDependencies(): AppDependencies {
  const recognizer = new WhisperRecognizerRepository(new WhisperModelStore());
  return {
    shadowing: {
      decks: new SeedDeckRepository(seedDecks),
      attempts: new InMemoryAttemptRepository(),
      tts: new NativeSpeechTtsRepository(),
      recorder: new AudioApiRecorderRepository(),
      player: new AudioApiPlayerRepository(),
      recognizer,
      assessor: new SttDiffAssessor(recognizer, defaultAliases),
      clock: () => new Date(),
    },
  };
}
