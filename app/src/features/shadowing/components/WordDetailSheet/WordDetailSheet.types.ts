import type { ScoredWord } from '@/services/speech';
import type { SentenceToken } from '../../model/types';

export type WordDetailSheetProps = {
  /** null hides the sheet. */
  token: SentenceToken | null;
  /** Azure's score for this word in the last attempt, if any. */
  score: ScoredWord | null;
  onClose: () => void;
  onListen: (text: string) => void;
};
