export type WavFormat = {
  audioFormat: number;
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
};

const PCM = 1;
const FMT_MIN_SIZE = 16;

/** Reads the `fmt ` chunk of a RIFF/WAVE buffer, or null if it is not a readable WAV. */
export function readWavFormat(buffer: Buffer): WavFormat | null {
  if (buffer.length < 12) return null;
  if (
    buffer.toString('ascii', 0, 4) !== 'RIFF' ||
    buffer.toString('ascii', 8, 12) !== 'WAVE'
  ) {
    return null;
  }
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const body = offset + 8;
    if (id === 'fmt ') {
      if (size < FMT_MIN_SIZE || body + FMT_MIN_SIZE > buffer.length)
        return null;
      return {
        audioFormat: buffer.readUInt16LE(body),
        channels: buffer.readUInt16LE(body + 2),
        sampleRate: buffer.readUInt32LE(body + 4),
        bitsPerSample: buffer.readUInt16LE(body + 14),
      };
    }
    offset = body + size + (size % 2); // chunks are word-aligned
  }
  return null;
}

/** True for 16 kHz, mono, 16-bit PCM WAV: what Azure expects and the app records. */
export function isPcm16kMonoWav(buffer: Buffer): boolean {
  const f = readWavFormat(buffer);
  return (
    f !== null &&
    f.audioFormat === PCM &&
    f.channels === 1 &&
    f.sampleRate === 16000 &&
    f.bitsPerSample === 16
  );
}
