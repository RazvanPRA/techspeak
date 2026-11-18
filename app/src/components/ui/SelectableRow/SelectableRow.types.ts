export type SelectableRowProps = {
  label: string;
  caption?: string;
  selected: boolean;
  onPress: () => void;
  /** "checkbox" for multi-select lists (default), "radio" for a single choice. */
  role?: 'checkbox' | 'radio';
};
