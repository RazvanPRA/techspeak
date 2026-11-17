export type ButtonVariant = 'primary' | 'secondary';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  accessibilityHint?: string;
};
