import type { TtsVoice } from './types';

/** The chosen voice if it is still installed; otherwise undefined (= the system voice). */
export function resolveVoiceId(
  selected: string | null,
  installed: readonly TtsVoice[],
): string | undefined {
  if (selected === null) return undefined;
  return installed.some(v => v.id === selected) ? selected : undefined;
}
