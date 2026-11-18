import { emptyBatch, type LocalVersions } from '../model/types';
import { mergeRemote } from '../services/mergeRemote.service';
import { pair, talk, vocab } from '../testing/fixtures';

const local = (patch: Partial<LocalVersions> = {}): LocalVersions => ({
  ids: {
    shadowingAttempts: new Set(),
    pairAttempts: new Set(),
    scenarioAnswers: new Set(),
    talks: new Set(),
  },
  vocabularyUpdatedAt: new Map(),
  ...patch,
});

describe('mergeRemote', () => {
  it('restores everything on a fresh install', () => {
    const changes = {
      ...emptyBatch(),
      pairAttempts: [pair('p1')],
      talks: [talk('t1')],
      vocabularyStates: [vocab('10:00')],
    };
    expect(mergeRemote(changes, local())).toEqual(changes);
  });

  it('skips rows the device already has', () => {
    const versions = local({
      ids: { ...local().ids, pairAttempts: new Set(['p1']) },
    });
    const merge = mergeRemote({ ...emptyBatch(), pairAttempts: [pair('p1'), pair('p2')] }, versions);
    expect(merge.pairAttempts.map(p => p.id)).toEqual(['p2']);
  });

  it('takes a remote vocabulary state only when it is newer (last write wins)', () => {
    const versions = local({
      vocabularyUpdatedAt: new Map([
        ['sql:older', '2026-11-18T12:00:00.000Z'],
        ['sql:newer', '2026-11-18T08:00:00.000Z'],
        ['sql:same', '2026-11-18T10:00:00.000Z'],
      ]),
    });
    const merge = mergeRemote(
      {
        ...emptyBatch(),
        vocabularyStates: [vocab('10:00', 'older'), vocab('10:00', 'newer'), vocab('10:00', 'same')],
      },
      versions,
    );
    expect(merge.vocabularyStates.map(v => v.term)).toEqual(['newer']);
  });
});
