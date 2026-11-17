import type { SentenceToken } from '../../model/types';

export type WordDetailSheetProps = {
  /** null hides the sheet. */
  token: SentenceToken | null;
  onClose: () => void;
  onListen: (text: string) => void;
};
