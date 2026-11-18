export type PlaybackActions = {
  onPlay: () => void;
  onPlaySlow: () => void;
  onModelThenMe: () => void;
};

export type PlaybackControlsProps = {
  actions: PlaybackActions;
  /** "Model → me" needs a recorded attempt. */
  canCompare: boolean;
  disabled: boolean;
};
