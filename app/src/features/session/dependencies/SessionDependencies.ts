import type { ReminderRepository } from '@/services/reminders';
import type { SettingsRepository } from '@/services/settings';
import type { TtsRepository } from '@/services/speech';
import { createDependencyContext } from '@/shared/utils';

/** Everything the session feature needs, injected from src/app/dependencies.ts. */
export type SessionDependencies = {
  settings: SettingsRepository;
  reminders: ReminderRepository;
  /**
   * TTS *without* the saved-voice decorator, so the voice picker previews each voice
   * (including the system voice) exactly as it sounds.
   */
  tts: TtsRepository;
  /** Vocabulary cards a review of every deck would show today. */
  dueCount: () => Promise<number>;
  /** Sound contrasts I get wrong most often, weakest first. */
  weakSounds: () => Promise<string[]>;
  shadowingDeckIds: readonly string[];
  promptIds: readonly string[];
  clock: () => Date;
  random: () => number;
};

const context = createDependencyContext<SessionDependencies>('Session');

export const SessionDependenciesProvider = context.Provider;
export const useSessionDependencies = context.useDependencies;
