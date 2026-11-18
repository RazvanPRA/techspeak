import type { NavigatorScreenParams } from '@react-navigation/native';
import type { MinimalPairsStackParamList } from '@/features/minimal-pairs';
import type { ScenariosStackParamList } from '@/features/scenarios';
import type { ShadowingStackParamList } from '@/features/shadowing';
import type { VocabularyStackParamList } from '@/features/vocabulary';

export type RootTabParamList = {
  ShadowingTab: NavigatorScreenParams<ShadowingStackParamList>;
  VocabularyTab: NavigatorScreenParams<VocabularyStackParamList>;
  MinimalPairsTab: NavigatorScreenParams<MinimalPairsStackParamList>;
  ScenariosTab: NavigatorScreenParams<ScenariosStackParamList>;
};
