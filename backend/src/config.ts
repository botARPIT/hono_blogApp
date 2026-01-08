import { ConfigError } from "./errors/app-error";
import type { EnvironmentVariables } from "./types/env.types";

export type AppConfig = {
    DATABASE_URL: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    REDIRECT_URI: string;
    FRONTEND_REDIRECT_URL: string;
    FRONTEND_ORIGIN: string;
    ENVIRONMENT: 'development' | 'production';
    RATE_LIMIT_KV: KVNamespace<string>;
};

export function getConfig(env: EnvironmentVariables): AppConfig {
    if (!env.DATABASE_URL) throw new ConfigError("Database URL is missing")
    if (!env.JWT_ACCESS_SECRET) throw new ConfigError("JWT Access Secret is missing")
    if (!env.JWT_REFRESH_SECRET) throw new ConfigError("JWT Refresh Secret is missing")
    if (!env.GOOGLE_CLIENT_ID) throw new ConfigError("Google Client ID is missing")
    if (!env.GOOGLE_CLIENT_SECRET) throw new ConfigError("Google Client Secret is missing")
    if (!env.REDIRECT_URI) throw new ConfigError("Redirect URI is missing")
    if (!env.FRONTEND_REDIRECT_URL) throw new ConfigError("Frontend Redirect URL is missing")
    if (!env.FRONTEND_ORIGIN) throw new ConfigError("Frontend Origin is missing")
    if (!env.RATE_LIMIT_KV) throw new ConfigError("Rate Limit KV is missing")

    return {
        DATABASE_URL: env.DATABASE_URL,
        JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
        JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
        GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
        REDIRECT_URI: env.REDIRECT_URI,
        FRONTEND_REDIRECT_URL: env.FRONTEND_REDIRECT_URL,
        FRONTEND_ORIGIN: env.FRONTEND_ORIGIN,
        ENVIRONMENT: env.ENVIRONMENT || 'development',
        RATE_LIMIT_KV: env.RATE_LIMIT_KV,
    }
}

// Helper to check if running in production
export function isProduction(env: EnvironmentVariables): boolean {
    return env.ENVIRONMENT === 'production'
}

// Get allowed origins for CORS/CSRF from environment
export function getAllowedOrigins(env: EnvironmentVariables): string[] {
    // Always include the configured origin
    const origins = [env.FRONTEND_ORIGIN]

    // In development, also allow localhost
    if (!isProduction(env)) {
        origins.push("http://localhost:5173")
        origins.push("http://localhost:3000")
    }

    return origins
}