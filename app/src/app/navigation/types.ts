import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ShadowingStackParamList } from '@/features/shadowing';

export type RootTabParamList = {
  ShadowingTab: NavigatorScreenParams<ShadowingStackParamList>;
};
