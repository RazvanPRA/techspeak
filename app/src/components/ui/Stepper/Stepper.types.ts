export type StepperProps = {
  /** What is being changed, e.g. "Speech rate". Also the accessibility label. */
  label: string;
  /** The current value, already formatted. */
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
  /** Accessibility labels of the two buttons (already translated). */
  decrementLabel: string;
  incrementLabel: string;
  canDecrement?: boolean;
  canIncrement?: boolean;
};
