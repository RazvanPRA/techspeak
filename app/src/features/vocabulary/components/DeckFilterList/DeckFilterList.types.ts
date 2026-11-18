import type { DeckId, DeckSummary } from '../../model/types';

export type DeckFilterListProps = {
  decks: readonly DeckSummary[];
  selectedIds: readonly DeckId[];
  weakSelected: boolean;
  onToggleDeck: (id: DeckId) => void;
  onToggleWeak: () => void;
};

export type DeckFilterItemProps = {
  deck: DeckSummary;
  selected: boolean;
  onToggle: (id: DeckId) => void;
};
