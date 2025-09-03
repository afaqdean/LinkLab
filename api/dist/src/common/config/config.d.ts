export type AppConfig = {
    jwtSecret: string;
    jwtExpiresIn: string;
    cookieName: string;
    cookieSecure: boolean;
    cookieSameSite: 'lax' | 'strict' | 'none';
    bcryptRounds: number;
    webOrigin?: string;
    apiPort: number;
};
export declare const appConfig: AppConfig;
