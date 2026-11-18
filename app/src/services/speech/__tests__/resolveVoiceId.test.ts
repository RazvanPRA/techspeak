import { resolveVoiceId } from '../model/resolveVoiceId.service';

const installed = [
  { id: 'en-us-1', name: 'Samantha', language: 'en-US' },
  { id: 'en-gb-1', name: 'Daniel', language: 'en-GB' },
];

describe('resolveVoiceId', () => {
  it('returns the chosen voice when it is installed', () => {
    expect(resolveVoiceId('en-gb-1', installed)).toBe('en-gb-1');
  });

  it('uses the system voice when nothing is chosen', () => {
    expect(resolveVoiceId(null, installed)).toBeUndefined();
  });

  it('uses the system voice when the chosen voice is no longer installed', () => {
    expect(resolveVoiceId('removed', installed)).toBeUndefined();
    expect(resolveVoiceId('en-us-1', [])).toBeUndefined();
  });
});
