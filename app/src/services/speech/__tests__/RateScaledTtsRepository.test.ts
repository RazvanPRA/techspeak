import { RateScaledTtsRepository } from '../repository/RateScaledTtsRepository';
import { FakeTtsRepository } from '../testing/fakes';

describe('RateScaledTtsRepository', () => {
  it('scales each rate by the current setting, read at speak time', async () => {
    const inner = new FakeTtsRepository();
    let setting = 0.8;
    const tts = new RateScaledTtsRepository(inner, () => setting);
    await tts.speak('normal', { rate: 1 });
    setting = 0.5;
    await tts.speak('slow', { rate: 0.6, voiceId: 'v1' });
    expect(inner.spoken).toEqual([
      { text: 'normal', options: { rate: 0.8 } },
      { text: 'slow', options: { rate: 0.3, voiceId: 'v1' } },
    ]);
  });

  it('passes voices through', async () => {
    const tts = new RateScaledTtsRepository(new FakeTtsRepository(), () => 1);
    expect(await tts.listVoices()).toHaveLength(1);
  });
});
