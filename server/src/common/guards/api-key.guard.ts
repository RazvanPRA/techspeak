import { timingSafeEqual } from 'node:crypto';
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

export const API_KEY_HEADER = 'x-api-key';

type RequestLike = { headers: Record<string, string | string[] | undefined> };

/** Simple shared-key auth between the app and this server (header `x-api-key`). */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly expected: Buffer;

  constructor(apiKey: string) {
    this.expected = Buffer.from(apiKey);
  }

  canActivate(context: ExecutionContext): boolean {
    const header = context.switchToHttp().getRequest<RequestLike>().headers[
      API_KEY_HEADER
    ];
    if (typeof header === 'string' && this.matches(header)) return true;
    throw new UnauthorizedException('Missing or invalid API key');
  }

  private matches(candidate: string): boolean {
    const given = Buffer.from(candidate);
    // timingSafeEqual needs equal lengths; the length check leaks nothing useful.
    return (
      given.length === this.expected.length &&
      timingSafeEqual(given, this.expected)
    );
  }
}
