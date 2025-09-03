// no imports

export type AppConfig = {
  jwtSecret: string;
  jwtExpiresIn: string; // e.g., '7d'
  cookieName: string;
  cookieSecure: boolean;
  cookieSameSite: 'lax' | 'strict' | 'none';
  bcryptRounds: number;
  webOrigin?: string;
  apiPort: number;
  eventIpSalt: string;
};

function readEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
}

export const appConfig: AppConfig = {
  jwtSecret: readEnv('JWT_SECRET'),
  jwtExpiresIn: readEnv('JWT_EXPIRES_IN', '7d'),
  cookieName: readEnv('COOKIE_NAME', 'auth'),
  cookieSecure: readEnv('NODE_ENV', 'development') === 'production',
  cookieSameSite: readEnv('COOKIE_SAMESITE', 'lax').toLowerCase() as
    | 'lax'
    | 'strict'
    | 'none',
  bcryptRounds: Number(readEnv('BCRYPT_ROUNDS', '12')),
  webOrigin: process.env.WEB_ORIGIN,
  apiPort: Number(readEnv('PORT', '3000')),
  eventIpSalt: readEnv('SECRET_SALT'),
};
