// Whisper marks non-speech as [BLANK_AUDIO], [Music], (silence), *coughs*…: tags made of
// letters, spaces and underscores only, so code like "array[0]" is kept.
const NON_SPEECH = /\[[A-Za-z _]+\]|\([A-Za-z _]+\)|\*[A-Za-z _]+\*/g;

/** Removes Whisper's non-speech tags and tidies the spaces they leave behind. */
export function stripNonSpeech(transcript: string): string {
  return transcript.replace(NON_SPEECH, ' ').replace(/\s+/g, ' ').trim();
}
