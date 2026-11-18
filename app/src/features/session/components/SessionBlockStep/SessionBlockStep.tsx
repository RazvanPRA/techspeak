import React from 'react';
import { MinimalPairsSessionStep } from '@/features/minimal-pairs';
import { ScenarioSessionStep } from '@/features/scenarios';
import { ShadowingSessionStep } from '@/features/shadowing';
import { VocabularySessionStep } from '@/features/vocabulary';
import type { SessionBlock } from '../../model/types';

export type SessionBlockStepProps = { block: SessionBlock };

/** The drill of one block, taken from the owning feature's public API. */
export function SessionBlockStep({ block }: SessionBlockStepProps) {
  switch (block.kind) {
    case 'pairs':
      return <MinimalPairsSessionStep focusSound={block.focus} />;
    case 'shadowing':
      return block.focus ? <ShadowingSessionStep deckId={block.focus} /> : null;
    case 'vocabulary':
      return <VocabularySessionStep />;
    case 'scenario':
      return block.focus ? <ScenarioSessionStep promptId={block.focus} /> : null;
  }
}
