import React from 'react';
import type { AnswerResult } from '../../model/types';
import { BetterWayCard } from '../BetterWayCard';
import { FeedbackSummary } from '../FeedbackSummary';
import { FluencyCard } from '../FluencyCard';
import { PhrasesCard } from '../PhrasesCard';
import { PronunciationCard } from '../PronunciationCard';
import { TranscriptCard } from '../TranscriptCard';
import { VocabularyCard } from '../VocabularyCard';

export type FeedbackViewProps = { result: AnswerResult };

/** Server feedback on one answer, or the on-device fluency summary when it is missing. */
export function FeedbackView({ result }: FeedbackViewProps) {
  const { feedback, localFluency } = result;
  const fluency = feedback?.fluency ?? { ...localFluency, tip: null };
  return (
    <>
      <FeedbackSummary result={result} />
      <TranscriptCard transcript={result.transcript} />
      {feedback && (
        <BetterWayCard corrections={feedback.corrections} improvedAnswer={feedback.improvedAnswer} />
      )}
      {feedback && <PronunciationCard tips={feedback.pronunciation} />}
      <FluencyCard
        wordsPerMinute={fluency.wordsPerMinute}
        fillerCount={fluency.fillerCount}
        fillers={fluency.fillers}
        tip={fluency.tip}
      />
      {feedback && <VocabularyCard vocabulary={feedback.vocabulary} />}
      {feedback && <PhrasesCard phrases={feedback.phrasesToReuse} />}
    </>
  );
}
