import { t } from '@/shared/i18n';
import type { InterviewIssue } from '../model/types';

export type IssueText = { title: string; detail: string };

/** The words shown for one interview issue. */
export function describeIssue(issue: InterviewIssue): IssueText {
  switch (issue.kind) {
    case 'length':
      return {
        title: t('interview.issueLength'),
        detail: t('interview.issueLengthDetail', { short: issue.shortAnswers, total: issue.total }),
      };
    case 'fillers':
      return {
        title: t('interview.issueFillers'),
        detail: t('interview.issueFillersDetail', {
          rate: issue.perMinute,
          fillers: issue.fillers.join(', '),
        }),
      };
    case 'pace':
      return {
        title: issue.tooFast ? t('interview.issueFast') : t('interview.issueSlow'),
        detail: t('interview.issuePaceDetail', { wpm: issue.wordsPerMinute }),
      };
    case 'pronunciation':
      return {
        title: t('interview.issuePronunciation'),
        detail: t('interview.issuePronunciationDetail', { words: issue.words.join(', ') }),
      };
    case 'vocabulary':
      return {
        title: t('interview.issueVocabulary'),
        detail: t('interview.issueVocabularyDetail', { terms: issue.terms.join(', ') }),
      };
  }
}
