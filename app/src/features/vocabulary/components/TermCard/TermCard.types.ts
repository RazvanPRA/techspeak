import type { Term } from '../../model/types';

export type TermCardProps = {
  term: Term;
  /** Pronunciation help (IPA, trap, listen) is shown after an attempt or "Show answer". */
  revealed: boolean;
  onListen: () => void;
};
