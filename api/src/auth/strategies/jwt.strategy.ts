import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { appConfig } from '../../common/config/config';
import type { Request } from 'express';
import type { RequestUser } from '../../common/types/request-user';

function cookieExtractor(req: Request): string | null {
  const cookies = req.cookies as Record<string, string> | undefined;
  const token = cookies?.[appConfig.cookieName];
  return token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: appConfig.jwtSecret,
      ignoreExpiration: false,
    });
  }

  validate(payload: { sub: string; email: string; role: string }): RequestUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role as RequestUser['role'],
    };
  }
}
