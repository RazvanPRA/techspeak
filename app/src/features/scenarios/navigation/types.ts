import type { AnswerResult } from '../model/types';

export type ScenariosStackParamList = {
  ScenarioPrompts: undefined;
  ScenarioAnswer: { promptId: string };
  ScenarioFeedback: { result: AnswerResult };
};
