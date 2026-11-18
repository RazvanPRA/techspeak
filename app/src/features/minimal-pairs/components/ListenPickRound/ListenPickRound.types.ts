import type { PairSide, Round } from '../../model/types';

export type ListenPickHandlers = {
  onPick: (side: PairSide) => void;
  onPlay: () => void;
  onNext: () => void;
};

export type ListenPickRoundProps = {
  round: Round;
  /** null until the user picks. */
  picked: PairSide | null;
  isSpeaking: boolean;
  handlers: ListenPickHandlers;
};
