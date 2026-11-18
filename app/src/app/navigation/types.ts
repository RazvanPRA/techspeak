import type { NavigatorScreenParams } from '@react-navigation/native';
import type { MinimalPairsStackParamList } from '@/features/minimal-pairs';
import type { ProgressStackParamList } from '@/features/progress';
import type { ScenariosStackParamList } from '@/features/scenarios';
import type { SessionStackParamList } from '@/features/session';
import type { ShadowingStackParamList } from '@/features/shadowing';
import type { VocabularyStackParamList } from '@/features/vocabulary';

export type RootTabParamList = {
  TodayTab: NavigatorScreenParams<SessionStackParamList>;
  ShadowingTab: NavigatorScreenParams<ShadowingStackParamList>;
  VocabularyTab: NavigatorScreenParams<VocabularyStackParamList>;
  MinimalPairsTab: NavigatorScreenParams<MinimalPairsStackParamList>;
  ScenariosTab: NavigatorScreenParams<ScenariosStackParamList>;
  ProgressTab: NavigatorScreenParams<ProgressStackParamList>;
};
