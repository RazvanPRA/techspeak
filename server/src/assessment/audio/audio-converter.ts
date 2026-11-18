/** Turns any uploaded audio into 16 kHz mono 16-bit PCM WAV. */
export interface AudioConverter {
  toPcm16kMonoWav(input: Buffer): Promise<Buffer>;
}

export const AUDIO_CONVERTER = Symbol('AudioConverter');
