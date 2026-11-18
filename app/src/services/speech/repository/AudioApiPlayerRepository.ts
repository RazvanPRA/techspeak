import { AudioContext, type AudioBufferSourceNode } from 'react-native-audio-api';
import type { PlayerRepository } from '../model/types';

export class AudioApiPlayerRepository implements PlayerRepository {
  private context: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;

  async play(path: string): Promise<void> {
    await this.stop();
    this.context ??= new AudioContext();
    const context = this.context;
    await context.resume();
    const source = context.createBufferSource();
    source.buffer = await context.decodeAudioData(path);
    source.connect(context.destination);
    this.source = source;
    await new Promise<void>(resolve => {
      source.onended = () => {
        if (this.source === source) this.source = null;
        resolve();
      };
      source.start();
    });
  }

  async stop(): Promise<void> {
    const source = this.source;
    this.source = null;
    try {
      source?.stop();
    } catch {
      // Already ended: nothing to stop.
    }
  }
}
