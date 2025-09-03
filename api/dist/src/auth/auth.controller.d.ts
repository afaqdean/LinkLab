import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { RequestUser } from '../common/types/request-user';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, res: Response): Promise<void>;
    me(user: RequestUser): RequestUser;
    logout(res: Response): void;
}
