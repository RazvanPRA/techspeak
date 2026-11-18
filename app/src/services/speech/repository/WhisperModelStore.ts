import {
  DocumentDirectoryPath,
  downloadFile,
  exists,
  mkdir,
  moveFile,
  stat,
  unlink,
} from '@dr.pogodin/react-native-fs';
import type { ProgressCallback } from '../model/types';

const MODEL_FILE = 'ggml-base.en.bin';
const MODEL_URL = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/${MODEL_FILE}`;
/** base.en is ~148 MB; anything far smaller is a broken download. */
const MIN_MODEL_BYTES = 100_000_000;

/** Downloads the Whisper model once into app storage (it is never bundled in the binary). */
export class WhisperModelStore {
  constructor(private readonly dir: string = `${DocumentDirectoryPath}/whisper`) {}

  get path(): string {
    return `${this.dir}/${MODEL_FILE}`;
  }

  async isReady(): Promise<boolean> {
    if (!(await exists(this.path))) return false;
    return Number((await stat(this.path)).size) >= MIN_MODEL_BYTES;
  }

  async ensure(onProgress?: ProgressCallback): Promise<string> {
    if (await this.isReady()) return this.path;
    await mkdir(this.dir);
    const partial = `${this.path}.part`;
    const { promise } = downloadFile({
      fromUrl: MODEL_URL,
      toFile: partial,
      progressInterval: 500,
      progress: p => onProgress?.(p.contentLength > 0 ? p.bytesWritten / p.contentLength : 0),
    });
    const result = await promise;
    if (result.statusCode !== 200 || result.bytesWritten < MIN_MODEL_BYTES) {
      await unlink(partial).catch(() => undefined);
      throw new Error(`Speech model download failed (HTTP ${result.statusCode})`);
    }
    if (await exists(this.path)) await unlink(this.path);
    await moveFile(partial, this.path);
    return this.path;
  }
}
