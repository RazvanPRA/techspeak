import type { ModelStatus } from '../../model/types';

export type ModelStatusBannerProps = {
  status: ModelStatus;
  /** 0–1 */
  progress: number;
  onRetry: () => void;
};
