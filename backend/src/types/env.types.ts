export type Bindings = {
   DATABASE_URL: string,
   JWT_ACCESS_SECRET: string,
   JWT_REFRESH_SECRET: string,
   GOOGLE_CLIENT_ID: string,
   GOOGLE_CLIENT_SECRET: string,
   REDIRECT_URI: string,
   FRONTEND_REDIRECT_URL: string,
   FRONTEND_ORIGIN: string,
   ENVIRONMENT: 'development' | 'production',
   RATE_LIMIT_KV: KVNamespace<string>,

   // AI Integration (optional)
   BLOGIFY_AI_URL?: string,
   BLOGIFY_AI_API_KEY?: string,
   BACKEND_URL?: string,
   INTERNAL_API_KEY?: string,
}

export interface EnvironmentVariables {
   DATABASE_URL: string,
   JWT_ACCESS_SECRET: string,
   JWT_REFRESH_SECRET: string,
   GOOGLE_CLIENT_ID: string,
   GOOGLE_CLIENT_SECRET: string,
   REDIRECT_URI: string,
   FRONTEND_REDIRECT_URL: string,
   FRONTEND_ORIGIN: string,
   ENVIRONMENT: 'development' | 'production',
   RATE_LIMIT_KV: KVNamespace<string>,

   // AI Integration (optional)
   BLOGIFY_AI_URL?: string,
   BLOGIFY_AI_API_KEY?: string,
   BACKEND_URL?: string,
   INTERNAL_API_KEY?: string,
}