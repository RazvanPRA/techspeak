// Native implementation: import only from src/app/dependencies.ts (rn-bare-native-deps §3).
import { copyFile, DocumentDirectoryPath, mkdir } from '@dr.pogodin/react-native-fs';
import type { RecordingArchive } from '../model/types';

/** Copies recordings out of the cache (which the OS may clear) into app documents. */
export class FsRecordingArchive implements RecordingArchive {
  constructor(private readonly dir: string = `${DocumentDirectoryPath}/talks`) {}

  async keep(path: string): Promise<string> {
    await mkdir(this.dir);
    const name = path.split('/').pop() ?? `talk-${Date.now()}.wav`;
    const target = `${this.dir}/${Date.now()}-${name}`;
    await copyFile(path.replace(/^file:\/\//, ''), target);
    return target;
  }
}
