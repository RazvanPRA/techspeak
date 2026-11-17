import { useCallback, useEffect, useRef, useState } from 'react';
import { useHoldToRecord, useMicPermission } from '@/services/speech';
import { RECOGNISED_FIRST_GRADE, RECOGNISED_RETRY_GRADE } from '../model/constants';
import type { SayItOutcome } from '../model/types';
import { useVocabularyDependencies } from '../dependencies/VocabularyDependencies';
import { isTermRecognised } from '../services/isTermRecognised.service';

type Options = {
  term: string | null;
  /** Changes for every new card; resets the outcome and the try count. */
  cardKey: string | null;
  beforeRecord: () => Promise<void>;
};

/** Records the user saying `term` and checks whether the speech recogniser heard it. */
export function useSayItCheck({ term, cardKey, beforeRecord }: Options) {
  const { recorder, recognizer, aliases } = useVocabularyDependencies();
  const { isPermitted } = useMicPermission(recorder);
  const [outcome, setOutcome] = useState<SayItOutcome>({ kind: 'idle' });
  const tries = useRef(0);

  useEffect(() => {
    setOutcome({ kind: 'idle' });
    tries.current = 0;
  }, [cardKey]);

  const onRecorded = useCallback(
    async (audioPath: string) => {
      if (!term) return;
      const transcript = await recognizer.transcribe(audioPath, [term]);
      tries.current += 1;
      if (!isTermRecognised(term, transcript, aliases)) {
        setOutcome({ kind: 'missed', transcript });
        return;
      }
      const grade = tries.current === 1 ? RECOGNISED_FIRST_GRADE : RECOGNISED_RETRY_GRADE;
      setOutcome({ kind: 'recognised', transcript, grade });
    },
    [term, recognizer, aliases],
  );

  const record = useHoldToRecord({ recorder, isPermitted, onRecorded, beforeRecord });
  return { ...record, outcome };
}
