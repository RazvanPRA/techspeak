import type { TtsVoice } from '@/services/speech';
import { t } from '@/shared/i18n';

export type VoiceOption = { id: string; label: string; caption: string };

const ACCENTS: Record<string, string> = {
  'en-AU': 'Australian English',
  'en-GB': 'British English',
  'en-IE': 'Irish English',
  'en-IN': 'Indian English',
  'en-NG': 'Nigerian English',
  'en-NZ': 'New Zealand English',
  'en-US': 'American English',
  'en-ZA': 'South African English',
};
/** Google TTS ids: "en-au-x-aua-local" / "...-network"; "en-AU-language" is the locale default. */
const ANDROID_VOICE = /^[a-z]{2}-[a-z]{2}-x-[a-z]+-(local|network)$/;
const ANDROID_LOCALE_DEFAULT = /-language$/;

const accent = (language: string) => ACCENTS[language] ?? language;
const baseId = (id: string) => id.replace(/-(local|network)$/, '');
const byLanguageThenName = (a: TtsVoice, b: TtsVoice) =>
  a.language.localeCompare(b.language) || a.name.localeCompare(b.name);

/** Android: one entry per voice (offline copy preferred). The locale default = "System voice". */
function dedupeAndroid(voices: readonly TtsVoice[]): TtsVoice[] {
  const kept = new Map<string, TtsVoice>();
  for (const voice of voices) {
    if (ANDROID_LOCALE_DEFAULT.test(voice.id)) continue;
    const key = ANDROID_VOICE.test(voice.id) ? baseId(voice.id) : voice.id;
    const existing = kept.get(key);
    if (!existing || voice.id.endsWith('-local')) kept.set(key, voice);
  }
  return [...kept.values()];
}

/** Picker rows: readable names, ordered by accent then name, numbered per accent on Android. */
export function toVoiceOptions(voices: readonly TtsVoice[]): VoiceOption[] {
  const counters = new Map<string, number>();
  return dedupeAndroid(voices)
    .sort(byLanguageThenName)
    .map(voice => {
      if (!ANDROID_VOICE.test(voice.id)) {
        return { id: voice.id, label: voice.name, caption: accent(voice.language) };
      }
      const n = (counters.get(voice.language) ?? 0) + 1;
      counters.set(voice.language, n);
      const { language } = voice;
      const offline = voice.id.endsWith('-local');
      return {
        id: voice.id,
        label: t('settings.voiceLabel', { accent: accent(language), number: n }),
        caption: t(offline ? 'settings.voiceOffline' : 'settings.voiceOnline', { language }),
      };
    });
}
