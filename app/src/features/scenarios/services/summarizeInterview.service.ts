import { TOP_ISSUES } from '../model/constants';
import type { AnswerResult, InterviewIssue } from '../model/types';
import {
  fillerIssue,
  lengthIssue,
  paceIssue,
  pronunciationIssue,
  vocabularyIssue,
} from './interviewIssues.service';

/** Checked in this order; on equal severity the earlier one wins. */
const CHECKS = [lengthIssue, fillerIssue, paceIssue, pronunciationIssue, vocabularyIssue];

/**
 * The 3 most important things to improve across a mock interview ($0, no LLM): short answers,
 * filler words, pace outside 110–170 wpm, words mispronounced again and again, key terms missed.
 */
export function summarizeInterview(answers: readonly AnswerResult[]): InterviewIssue[] {
  if (answers.length === 0) return [];
  return CHECKS.map(check => check(answers))
    .filter((issue): issue is InterviewIssue => issue !== null)
    .map((issue, order) => ({ issue, order }))
    .sort((a, b) => b.issue.severity - a.issue.severity || a.order - b.order)
    .slice(0, TOP_ISSUES)
    .map(({ issue }) => issue);
}
