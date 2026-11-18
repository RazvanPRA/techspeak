import type { ModelStatus } from '@/services/speech';

export type ModelStatusBannerProps = {
  status: ModelStatus;
  /** 0–1 */
  progress: number;
  onRetry: () => void;
};
