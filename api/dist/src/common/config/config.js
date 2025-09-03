"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
function readEnv(key, fallback) {
    const value = process.env[key] ?? fallback;
    if (value === undefined || value === '') {
        throw new Error(`Missing required env: ${key}`);
    }
    return value;
}
exports.appConfig = {
    jwtSecret: readEnv('JWT_SECRET'),
    jwtExpiresIn: readEnv('JWT_EXPIRES_IN', '7d'),
    cookieName: readEnv('COOKIE_NAME', 'auth'),
    cookieSecure: readEnv('NODE_ENV', 'development') === 'production',
    cookieSameSite: readEnv('COOKIE_SAMESITE', 'lax').toLowerCase(),
    bcryptRounds: Number(readEnv('BCRYPT_ROUNDS', '12')),
    webOrigin: process.env.WEB_ORIGIN,
    apiPort: Number(readEnv('PORT', '3000')),
};
//# sourceMappingURL=config.js.map