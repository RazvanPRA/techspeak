import {
  APPEND_ONLY_KINDS,
  type LocalVersions,
  type RemoteMerge,
  type SyncBatch,
} from '../model/types';

/**
 * Which downloaded rows to write on this device: append-only rows it does not have yet, and
 * vocabulary states newer than the local ones (last write wins by updatedAt).
 */
export function mergeRemote(changes: SyncBatch, local: LocalVersions): RemoteMerge {
  const merge = { ...changes } as Record<keyof SyncBatch, unknown[]>;
  for (const kind of APPEND_ONLY_KINDS) {
    const known = local.ids[kind];
    merge[kind] = changes[kind].filter(r => !known.has(r.id));
  }
  merge.vocabularyStates = changes.vocabularyStates.filter(v => {
    const mine = local.vocabularyUpdatedAt.get(v.id);
    return mine === undefined || v.updatedAt > mine;
  });
  return merge as RemoteMerge;
}
