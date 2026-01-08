// Use environment variable with fallback for development
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8787"

// OAuth redirect URI (matches backend route)
export const GOOGLE_REDIRECT_URI = `${BACKEND_URL}/api/v1/auth/google/callback`