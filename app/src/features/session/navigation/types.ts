import type { SessionPlan, SessionSummary } from '../model/types';

export type SessionStackParamList = {
  Today: undefined;
  SessionRun: { plan: SessionPlan };
  SessionSummary: { summary: SessionSummary };
  Settings: undefined;
};
