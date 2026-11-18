import { useCallback, useMemo, useState } from 'react';
import { useScenariosDependencies } from '../dependencies/ScenariosDependencies';
import { pickInterviewPrompts } from '../services/pickInterviewPrompts.service';

/** The decks to draw interview questions from, and the 5 questions once started. */
export function useInterviewSetup() {
  const { prompts, random } = useScenariosDependencies();
  const groups = prompts.listGroups();
  const [selected, setSelected] = useState<readonly string[]>([]);
  const decks = useMemo(
    () => [...new Map(groups.map(g => [g.deckId, g.topic])).entries()],
    [groups],
  );
  const toggle = useCallback(
    (deckId: string) =>
      setSelected(s => (s.includes(deckId) ? s.filter(d => d !== deckId) : [...s, deckId])),
    [],
  );
  const pickQuestions = useCallback(() => {
    const all = groups.flatMap(g => g.prompts);
    return pickInterviewPrompts(all, selected, random).map(p => p.id);
  }, [groups, selected, random]);
  return { decks, selected, toggle, pickQuestions };
}
