import { UnprocessableEntityException } from '@nestjs/common';
import { bundledFfmpegPath as ffmpegPath } from './bundled-ffmpeg.js';
import { buildWav } from '../testing/build-wav.js';
import { FfmpegAudioConverter } from './ffmpeg-audio-converter.js';
import { isPcm16kMonoWav, readWavFormat } from './wav-format.js';

describe('FfmpegAudioConverter', () => {
  it('returns a 16 kHz mono WAV unchanged, without running ffmpeg', async () => {
    const converter = new FfmpegAudioConverter('/no/such/ffmpeg');
    const wav = buildWav({});
    await expect(converter.toPcm16kMonoWav(wav)).resolves.toBe(wav);
  });

  it('converts a 44.1 kHz stereo WAV with the bundled ffmpeg', async () => {
    if (!ffmpegPath)
      throw new Error('ffmpeg-static has no binary for this platform');
    const converter = new FfmpegAudioConverter(ffmpegPath);
    const output = await converter.toPcm16kMonoWav(
      buildWav({ sampleRate: 44100, channels: 2 }),
    );
    expect(isPcm16kMonoWav(output)).toBe(true);
    expect(readWavFormat(output)?.sampleRate).toBe(16000);
  }, 20_000);

  it('reports unreadable audio as 422', async () => {
    if (!ffmpegPath)
      throw new Error('ffmpeg-static has no binary for this platform');
    const converter = new FfmpegAudioConverter(ffmpegPath);
    await expect(
      converter.toPcm16kMonoWav(Buffer.from('not audio')),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  }, 20_000);
});
