import type { SentenceToken, TokenStatus } from '../../model/types';

export type SentenceCardProps = {
  tokens: readonly SentenceToken[];
  statuses: readonly TokenStatus[];
  onWordPress: (index: number) => void;
};

export type WordTokenProps = {
  token: SentenceToken;
  status: TokenStatus;
  index: number;
  onPress: (index: number) => void;
};
