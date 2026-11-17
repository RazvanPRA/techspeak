type WavOptions = {
  sampleRate?: number;
  channels?: number;
  bitsPerSample?: number;
  audioFormat?: number;
  /** Seconds of silence (default 0.1). */
  seconds?: number;
  extraChunkBeforeFmt?: boolean;
};

function chunk(id: string, body: Buffer): Buffer {
  const header = Buffer.alloc(8);
  header.write(id, 0, 'ascii');
  header.writeUInt32LE(body.length, 4);
  return Buffer.concat([header, body]);
}

/** Builds a small, valid WAV file of silence for tests. */
export function buildWav(options: WavOptions): Buffer {
  const {
    sampleRate = 16000,
    channels = 1,
    bitsPerSample = 16,
    audioFormat = 1,
  } = options;
  const blockAlign = (channels * bitsPerSample) / 8;
  const fmt = Buffer.alloc(16);
  fmt.writeUInt16LE(audioFormat, 0);
  fmt.writeUInt16LE(channels, 2);
  fmt.writeUInt32LE(sampleRate, 4);
  fmt.writeUInt32LE(sampleRate * blockAlign, 8);
  fmt.writeUInt16LE(blockAlign, 12);
  fmt.writeUInt16LE(bitsPerSample, 14);
  const samples = Math.round(sampleRate * (options.seconds ?? 0.1));
  const chunks = [
    ...(options.extraChunkBeforeFmt
      ? [chunk('LIST', Buffer.from('INFOtest'))]
      : []),
    chunk('fmt ', fmt),
    chunk('data', Buffer.alloc(samples * blockAlign)),
  ];
  const body = Buffer.concat([Buffer.from('WAVE', 'ascii'), ...chunks]);
  return chunk('RIFF', body);
}
