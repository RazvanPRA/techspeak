import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@/shared/theme';
import { SessionBlockStep } from '../components/SessionBlockStep';
import { SessionRunHeader } from '../components/SessionRunHeader';
import { useSessionRun } from '../hooks/useSessionRun';
import type { SessionSummary } from '../model/types';
import type { SessionStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<SessionStackParamList, 'SessionRun'>;

/** One block at a time: its timer and controls on top, the feature's drill below. */
export function SessionRunScreen({ navigation, route }: Props) {
  const onFinished = useCallback(
    (summary: SessionSummary) => navigation.replace('SessionSummary', { summary }),
    [navigation],
  );
  const run = useSessionRun(route.params.plan, onFinished);
  if (!run.block) return null;
  return (
    <View style={styles.screen}>
      <SessionRunHeader
        block={run.block}
        position={{ index: run.index, total: run.total }}
        elapsed={run.blockElapsed}
        timeUp={run.timeUp}
        onNext={run.next}
        onSkip={run.skip}
      />
      <View style={styles.step}>
        <SessionBlockStep key={run.index} block={run.block} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.background },
  step: { flex: 1 },
});
