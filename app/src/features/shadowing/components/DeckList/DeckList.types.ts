import type { DeckSummary } from '@/features/vocabulary';

export type DeckListProps = {
  decks: readonly DeckSummary[];
  onSelect: (deckId: string) => void;
};

export type DeckListItemProps = {
  deck: DeckSummary;
  onSelect: (deckId: string) => void;
};
