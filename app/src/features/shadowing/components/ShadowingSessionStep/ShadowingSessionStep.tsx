import React, { useEffect } from 'react';
import { ShadowingScreen } from '../../screens/ShadowingScreen';
import { selectDeckId } from '../../state/selectors';
import { deckSelected } from '../../state/slice';
import { useShadowingDispatch, useShadowingSelector } from '../../state/hooks';

export type ShadowingSessionStepProps = { deckId: string };

/** The daily session's shadowing block: selects the planned deck, then the usual drill. */
export function ShadowingSessionStep({ deckId }: ShadowingSessionStepProps) {
  const dispatch = useShadowingDispatch();
  const current = useShadowingSelector(selectDeckId);
  useEffect(() => {
    if (current !== deckId) dispatch(deckSelected(deckId));
  }, [current, deckId, dispatch]);
  return current === deckId ? <ShadowingScreen /> : null;
}
