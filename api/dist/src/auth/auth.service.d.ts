import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/types/request-user';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(email: string, plainPassword: string): Promise<RequestUser>;
    signToken(user: RequestUser): Promise<string>;
    hashPassword(plain: string): Promise<string>;
    getMaxAgeMs(expiresIn: string): number;
}
