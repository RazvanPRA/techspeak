import { useCallback, useEffect, useState } from 'react';
import { useSettings } from '@/services/settings';
import { t } from '@/shared/i18n';
import { useSessionDependencies } from '../dependencies/SessionDependencies';
import { toVoiceOptions, type VoiceOption } from '../services/toVoiceOptions.service';

export type VoiceListStatus = 'loading' | 'ready' | 'error';

/** Installed English voices, the chosen one (null = system voice), and a spoken preview. */
export function useVoiceSettings() {
  const { settings: repo, tts } = useSessionDependencies();
  const { settings, update } = useSettings(repo);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [status, setStatus] = useState<VoiceListStatus>('loading');

  useEffect(() => {
    let active = true;
    tts
      .listVoices('en')
      .then(list => {
        if (!active) return;
        setVoices(toVoiceOptions(list));
        setStatus('ready');
      })
      .catch(() => active && setStatus('error'));
    return () => {
      active = false;
    };
  }, [tts]);

  const select = useCallback((voiceId: string | null) => update({ voiceId }), [update]);

  const preview = useCallback(
    async (voiceId: string | null) => {
      try {
        await tts.stop();
        await tts.speak(t('settings.voicePreviewSentence'), {
          rate: 1,
          ...(voiceId ? { voiceId } : {}),
        });
      } catch {
        // A failed preview is harmless: the list stays usable.
      }
    },
    [tts],
  );

  return { status, voices, selectedId: settings.voiceId, select, preview };
}
