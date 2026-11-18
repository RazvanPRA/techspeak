import type { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard.js';

function contextWith(
  headers: Record<string, string | string[] | undefined>,
): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
  } as unknown as ExecutionContext;
}

describe('ApiKeyGuard', () => {
  const guard = new ApiKeyGuard('the-right-key-123');

  it('lets a request with the right key through', () => {
    expect(
      guard.canActivate(contextWith({ 'x-api-key': 'the-right-key-123' })),
    ).toBe(true);
  });

  it.each([
    ['no header', undefined],
    ['a wrong key', 'the-wrong-key-123'],
    ['a key with a different length', 'x'],
    ['a repeated header', ['the-right-key-123', 'the-right-key-123']],
  ])('rejects %s', (_label, value) => {
    expect(() =>
      guard.canActivate(contextWith({ 'x-api-key': value })),
    ).toThrow(UnauthorizedException);
  });
});
