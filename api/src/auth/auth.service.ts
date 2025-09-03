import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { appConfig } from '../common/config/config';
import type { RequestUser } from '../common/types/request-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    plainPassword: string,
  ): Promise<RequestUser> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { id: user.id, email: user.email, role: user.role };
  }

  async signToken(user: RequestUser): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async hashPassword(plain: string): Promise<string> {
    const saltRounds = appConfig.bcryptRounds;
    return bcrypt.hash(plain, saltRounds);
  }

  getMaxAgeMs(expiresIn: string): number {
    // supports simple '7d', '24h', '3600s'
    const match = /^([0-9]+)([smhd])$/.exec(expiresIn);
    if (!match) {
      return 0;
    }
    const value = Number(match[1]);
    const unit = match[2];
    const unitMs =
      unit === 's'
        ? 1000
        : unit === 'm'
          ? 60_000
          : unit === 'h'
            ? 3_600_000
            : 86_400_000;
    return value * unitMs;
  }
}
