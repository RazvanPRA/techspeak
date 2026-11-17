import {
  AudioManager,
  AudioRecorder,
  BitDepth,
  FileDirectory,
  FileFormat,
  FilePreset,
  type PermissionStatus,
} from 'react-native-audio-api';
import type { MicPermission, RecorderRepository } from '../model/types';

/** whisper.cpp only decodes WAV; 16 kHz mono 16-bit is its native input format. */
const WHISPER_PRESET = { ...FilePreset.Low, sampleRate: 16000, bitDepth: BitDepth.Bit16 };

const PERMISSION: Record<PermissionStatus, MicPermission> = {
  Granted: 'granted',
  Denied: 'denied',
  Undetermined: 'undetermined',
};

export class AudioApiRecorderRepository implements RecorderRepository {
  private readonly recorder = new AudioRecorder();

  constructor() {
    this.recorder.enableFileOutput({
      format: FileFormat.Wav,
      channelCount: 1,
      preset: WHISPER_PRESET,
      directory: FileDirectory.Cache,
      subDirectory: 'attempts',
    });
  }

  async requestPermission(): Promise<MicPermission> {
    return PERMISSION[await AudioManager.requestRecordingPermissions()];
  }

  async start(): Promise<void> {
    AudioManager.setSystemOptions({
      ios: { category: 'playAndRecord', mode: 'spokenAudio', options: ['defaultToSpeaker'] },
    });
    const result = await this.recorder.start();
    if (result.status === 'error') throw new Error(result.message);
  }

  async stop(): Promise<string> {
    const result = await this.recorder.stop();
    if (result.status === 'error') throw new Error(result.message);
    const path = result.paths[0];
    if (!path) throw new Error('Recorder returned no file');
    return path;
  }
}
