import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { DeckFilterList } from '../components/DeckFilterList';
import { useDeckFilter } from '../hooks/useDeckFilter';
import type { VocabularyStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<VocabularyStackParamList, 'DeckFilter'>;

export function DeckFilterScreen({ navigation }: Props) {
  const filter = useDeckFilter();
  const start = useCallback(() => navigation.navigate('Review'), [navigation]);
  return (
    <View style={styles.screen}>
      <DeckFilterList
        decks={filter.decks}
        selectedIds={filter.selectedIds}
        weakSelected={filter.weakSelected}
        onToggleDeck={filter.toggleDeck}
        onToggleWeak={filter.toggleWeak}
      />
      <View style={styles.footer}>
        <Button label={t('vocabulary.start')} onPress={start} disabled={!filter.canStart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.background },
  footer: { padding: theme.space.lg },
});
