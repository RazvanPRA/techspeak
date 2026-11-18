import { normalizeTranscript } from '@/services/scoring';
import type { FluencySummary } from '../model/types';
import { countFillers } from './countFillers.service';
import { wordsPerMinute } from './wordsPerMinute.service';

/** Pace and filler words measured on the device (shown when the server cannot be reached). */
export function summarizeFluency(transcript: string, durationSeconds: number): FluencySummary {
  const wordCount = normalizeTranscript(transcript).length;
  const fillers = countFillers(transcript);
  return {
    wordCount,
    wordsPerMinute: wordsPerMinute(wordCount, durationSeconds),
    fillerCount: fillers.count,
    fillers: fillers.fillers,
  };
}
