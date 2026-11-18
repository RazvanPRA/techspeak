import { validateEnv } from './env.schema.js';

const valid = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  API_KEY: 'a-long-enough-dev-key',
  AZURE_SPEECH_KEY: 'azure-key',
  AZURE_SPEECH_REGION: 'westeurope',
};

describe('validateEnv', () => {
  it('accepts a complete env and applies defaults', () => {
    const env = validateEnv(valid);
    expect(env.PORT).toBe(3000);
    expect(env.FFMPEG_PATH).toBeUndefined();
  });

  it('coerces PORT and treats an empty FFMPEG_PATH as unset', () => {
    const env = validateEnv({ ...valid, PORT: '4000', FFMPEG_PATH: '' });
    expect(env.PORT).toBe(4000);
    expect(env.FFMPEG_PATH).toBeUndefined();
  });

  it('fails fast, naming every missing key', () => {
    expect(() => validateEnv({ PORT: 'x' })).toThrow(
      /PORT[\s\S]*DATABASE_URL[\s\S]*API_KEY/,
    );
  });

  it('allows running without Azure (both keys empty)', () => {
    const env = validateEnv({
      ...valid,
      AZURE_SPEECH_KEY: '',
      AZURE_SPEECH_REGION: '',
    });
    expect(env.AZURE_SPEECH_KEY).toBeUndefined();
    expect(env.AZURE_SPEECH_REGION).toBeUndefined();
  });

  it('rejects half an Azure configuration', () => {
    expect(() => validateEnv({ ...valid, AZURE_SPEECH_REGION: '' })).toThrow(
      /or neither/,
    );
  });

  it('runs without Ollama by default, with the default model and timeout', () => {
    const env = validateEnv({ ...valid, OLLAMA_URL: '', OLLAMA_MODEL: '' });
    expect(env.OLLAMA_URL).toBeUndefined();
    expect(env.OLLAMA_MODEL).toBe('qwen3.5:2b');
    expect(env.OLLAMA_TIMEOUT_MS).toBe(12_000);
  });

  it('reads the Ollama settings and keeps the timeout under the app timeout', () => {
    const env = validateEnv({
      ...valid,
      OLLAMA_URL: 'http://localhost:11434',
      OLLAMA_MODEL: 'qwen3.5:0.8b',
      OLLAMA_TIMEOUT_MS: '8000',
    });
    expect(env).toMatchObject({
      OLLAMA_URL: 'http://localhost:11434',
      OLLAMA_MODEL: 'qwen3.5:0.8b',
      OLLAMA_TIMEOUT_MS: 8000,
    });
    expect(() => validateEnv({ ...valid, OLLAMA_TIMEOUT_MS: '20000' })).toThrow(
      /OLLAMA_TIMEOUT_MS/,
    );
    expect(() => validateEnv({ ...valid, OLLAMA_URL: 'not a url' })).toThrow(
      /OLLAMA_URL/,
    );
  });

  it('rejects an API key that is too short to be safe', () => {
    expect(() => validateEnv({ ...valid, API_KEY: 'short' })).toThrow(
      /API_KEY/,
    );
  });
});
