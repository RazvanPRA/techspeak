import { useCallback, useRef, useState } from 'react';
import { useScenariosDependencies } from '../dependencies/ScenariosDependencies';
import type { AnswerResult, ScenarioPrompt } from '../model/types';

/** Steps through the interview questions; calls `onFinished` with every answer after the last. */
export function useInterview(
  promptIds: readonly string[],
  onFinished: (results: AnswerResult[]) => void,
) {
  const { prompts } = useScenariosDependencies();
  const questions = promptIds
    .map(id => prompts.getPrompt(id))
    .filter((p): p is ScenarioPrompt => p !== undefined);
  const [index, setIndex] = useState(0);
  const results = useRef<AnswerResult[]>([]);
  const total = questions.length;

  const onAnswered = useCallback(
    (result: AnswerResult) => {
      results.current = [...results.current, result];
      if (results.current.length >= total) onFinished(results.current);
      else setIndex(i => i + 1);
    },
    [total, onFinished],
  );

  return { index, total, prompt: questions[index] ?? null, onAnswered };
}
