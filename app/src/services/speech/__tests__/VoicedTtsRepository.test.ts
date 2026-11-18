import type { TtsVoice } from '../model/types';
import { VoicedTtsRepository } from '../repository/VoicedTtsRepository';
import { FakeTtsRepository } from '../testing/fakes';

const voices: TtsVoice[] = [
  { id: 'en-us-1', name: 'Samantha', language: 'en-US' },
  { id: 'en-gb-1', name: 'Daniel', language: 'en-GB' },
];

describe('VoicedTtsRepository', () => {
  it('speaks with the chosen voice, read at speak time', async () => {
    const inner = new FakeTtsRepository(voices);
    let selected: string | null = 'en-gb-1';
    const tts = new VoicedTtsRepository(inner, () => selected);
    await tts.speak('one', { rate: 1 });
    selected = null;
    await tts.speak('two', { rate: 0.6 });
    expect(inner.spoken).toEqual([
      { text: 'one', options: { rate: 1, voiceId: 'en-gb-1' } },
      { text: 'two', options: { rate: 0.6, voiceId: undefined } },
    ]);
  });

  it('falls back to the system voice when the chosen one is not installed', async () => {
    const inner = new FakeTtsRepository(voices);
    const tts = new VoicedTtsRepository(inner, () => 'removed');
    await tts.speak('hi', { rate: 1 });
    expect(inner.spoken[0]?.options.voiceId).toBeUndefined();
  });

  it('keeps an explicit voice (the Settings preview)', async () => {
    const inner = new FakeTtsRepository(voices);
    const tts = new VoicedTtsRepository(inner, () => 'en-gb-1');
    await tts.speak('preview', { rate: 1, voiceId: 'en-us-1' });
    expect(inner.spoken[0]?.options.voiceId).toBe('en-us-1');
  });

  it('asks for the installed voices only once', async () => {
    const inner = new FakeTtsRepository(voices);
    const list = jest.spyOn(inner, 'listVoices');
    const tts = new VoicedTtsRepository(inner, () => 'en-us-1');
    await tts.speak('a', { rate: 1 });
    await tts.speak('b', { rate: 1 });
    expect(list).toHaveBeenCalledTimes(1);
    expect(list).toHaveBeenCalledWith('en');
  });

  it('still speaks with the system voice when listing voices fails, and retries later', async () => {
    const inner = new FakeTtsRepository(voices);
    const list = jest
      .spyOn(inner, 'listVoices')
      .mockRejectedValueOnce(new Error('not ready'));
    const tts = new VoicedTtsRepository(inner, () => 'en-us-1');
    await tts.speak('a', { rate: 1 });
    await tts.speak('b', { rate: 1 });
    expect(inner.spoken.map(s => s.options.voiceId)).toEqual([undefined, 'en-us-1']);
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('passes stop and listVoices through', async () => {
    const inner = new FakeTtsRepository(voices);
    const tts = new VoicedTtsRepository(inner, () => null);
    expect(await tts.listVoices('en')).toEqual(voices);
    await expect(tts.stop()).resolves.toBeUndefined();
  });
});
