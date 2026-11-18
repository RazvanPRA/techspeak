// Data one feature reads from another, wired through public APIs only (modular-architecture §4).
import type { PairAttemptRepository } from '@/features/minimal-pairs';
import type { ProgressSources } from '@/features/progress';
import { loadWeakSounds } from '@/features/progress';
import type { ScenarioAnswerRepository } from '@/features/scenarios';
import type { AttemptRepository } from '@/features/shadowing';
import {
  countReviewCards,
  type DeckRepository,
  type VocabularyRepository,
} from '@/features/vocabulary';

type Stores = {
  attempts: AttemptRepository;
  pairAttempts: PairAttemptRepository;
  reviews: VocabularyRepository;
  answers: ScenarioAnswerRepository;
};

/** What the Progress tab reads, mapped to its plain input shapes. */
export function createProgressSources(stores: Stores): ProgressSources {
  return {
    shadowingAttempts: async limit =>
      (await stores.attempts.listRecent(limit)).map(a => ({
        createdAt: a.createdAt,
        deckId: a.deckId,
        score: a.score,
        phonemes: a.details?.words.flatMap(w => w.phonemes) ?? [],
      })),
    pairResults: async limit =>
      (await stores.pairAttempts.listRecent(limit)).map(a => ({ sound: a.sound, correct: a.correct })),
    reviewIntervals: async () => (await stores.reviews.listStates()).map(s => ({ interval: s.interval })),
    scenarioAnswers: async limit =>
      (await stores.answers.listRecent(limit)).map(a => ({
        createdAt: a.createdAt,
        wordsPerMinute: a.wordsPerMinute,
        fillers: a.fillers,
        durationSeconds: a.durationSeconds,
      })),
  };
}

/** What the daily session needs to size and focus its blocks. */
export function createSessionSources(
  progress: ProgressSources,
  vocabulary: { decks: DeckRepository; reviews: VocabularyRepository },
  clock: () => Date,
) {
  return {
    dueCount: () => countReviewCards(vocabulary, clock()),
    weakSounds: async () => (await loadWeakSounds(progress)).map(s => s.sound),
  };
}
