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
    if (!env.RATE_LIMIT_KV) throw new ConfigError("Rate Limit KV is missing")

    return {
        DATABASE_URL: env.DATABASE_URL,
        JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
        JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
        GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
        REDIRECT_URI: env.REDIRECT_URI,
        FRONTEND_REDIRECT_URL: env.FRONTEND_REDIRECT_URL,
        RATE_LIMIT_KV: env.RATE_LIMIT_KV,
    }
}

export const ACCEPTED_FRONTEND_ORIGIN = "http://localhost:5173"