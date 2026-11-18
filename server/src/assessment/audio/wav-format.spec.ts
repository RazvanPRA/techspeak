import { buildWav } from '../testing/build-wav.js';
import { isPcm16kMonoWav, readWavFormat } from './wav-format.js';

describe('readWavFormat', () => {
  it('reads the fmt chunk of a PCM WAV', () => {
    expect(readWavFormat(buildWav({ sampleRate: 44100, channels: 2 }))).toEqual(
      {
        audioFormat: 1,
        channels: 2,
        sampleRate: 44100,
        bitsPerSample: 16,
      },
    );
  });

  it('finds fmt after another chunk', () => {
    const wav = buildWav({ extraChunkBeforeFmt: true });
    expect(readWavFormat(wav)?.sampleRate).toBe(16000);
  });

  it.each([
    ['an empty buffer', Buffer.alloc(0)],
    [
      'a non-RIFF file',
      Buffer.from('ID3\u0004 not a wav file at all, just bytes'),
    ],
    ['a truncated header', buildWav({}).subarray(0, 20)],
  ])('returns null for %s', (_label, buffer) => {
    expect(readWavFormat(buffer)).toBeNull();
  });
});

describe('isPcm16kMonoWav', () => {
  it('accepts the format the app records', () => {
    expect(isPcm16kMonoWav(buildWav({}))).toBe(true);
  });

  it.each([
    ['stereo', { channels: 2 }],
    ['44.1 kHz', { sampleRate: 44100 }],
    ['8-bit', { bitsPerSample: 8 }],
    ['float', { audioFormat: 3 }],
  ])('rejects %s', (_label, options) => {
    expect(isPcm16kMonoWav(buildWav(options))).toBe(false);
  });
});
