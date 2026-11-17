import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { UnprocessableEntityException } from '@nestjs/common';
import type { AudioConverter } from './audio-converter.js';
import { isPcm16kMonoWav } from './wav-format.js';

const run = promisify(execFile);
const TIMEOUT_MS = 20_000;

/**
 * Converts with ffmpeg through temp files (a WAV written to a pipe has no valid length header).
 * Skips ffmpeg entirely when the input is already in the target format, which is the normal case:
 * the app records 16 kHz mono WAV.
 */
export class FfmpegAudioConverter implements AudioConverter {
  constructor(private readonly ffmpegPath: string) {}

  async toPcm16kMonoWav(input: Buffer): Promise<Buffer> {
    if (isPcm16kMonoWav(input)) return input;
    const dir = await mkdtemp(join(tmpdir(), 'techspeak-'));
    const source = join(dir, randomUUID());
    const target = join(dir, 'out.wav');
    try {
      await writeFile(source, input);
      const args = [
        '-y',
        '-i',
        source,
        '-ac',
        '1',
        '-ar',
        '16000',
        '-sample_fmt',
        's16',
        target,
      ];
      await run(this.ffmpegPath, args, { timeout: TIMEOUT_MS });
      return await readFile(target);
    } catch {
      throw new UnprocessableEntityException('Could not read the audio file');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }
}
