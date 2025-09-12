export type Bindings = {
   DATABASE_URL: string,
   JWT_ACCESS_SECRET: string,
   JWT_REFRESH_SECRET: string,
   GOOGLE_CLIENT_ID: string,
   GOOGLE_CLIENT_SECRET: string,
   REDIRECT_URI: string,
   RATE_LIMIT_KV: string
   // SUPABASE_URL: string,
   // SUPABASE_SERVICE_ROLE_KEY: string
}

export interface EnvironmentVariables {
   DATABASE_URL: string,
   JWT_ACCESS_SECRET: string,
   JWT_REFRESH_SECRET: string,
   GOOGLE_CLIENT_ID: string,
   GOOGLE_CLIENT_SECRET: string,
    REDIRECT_URI: string,
   RATE_LIMIT_KV: string
}