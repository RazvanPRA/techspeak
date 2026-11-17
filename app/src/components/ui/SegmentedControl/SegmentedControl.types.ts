export type Segment<K extends string> = { key: K; label: string };

export type SegmentedControlProps<K extends string> = {
  segments: ReadonlyArray<Segment<K>>;
  selected: K;
  onChange: (key: K) => void;
};
