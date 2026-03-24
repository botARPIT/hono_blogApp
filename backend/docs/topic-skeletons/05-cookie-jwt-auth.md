# Why This Backend Uses JWTs in Cookies Instead of Bearer Tokens

## Why this topic
- Strong security and frontend/backend integration topic.
- Easy for readers to map to real authentication tradeoffs.

## Working title options
- Cookie-Based JWT Auth in a Hono Backend
- Why I Chose HTTP-Only Cookies Over Bearer Tokens for Auth
- Authentication Tradeoffs in a Cloudflare Workers Backend

## Core claim
This backend stores JWT access and refresh tokens in HTTP-only cookies to reduce token exposure in frontend code and support browser-friendly session flows.

## Repo evidence to reference
- `backend/src/utils/setCookies.ts`
- `backend/src/middlewares/auth.middleware.ts`
- `backend/src/controllers/auth.controller.ts`
- `backend/src/routes/auth.route.ts`
- `backend/src/utils/jwt.ts`

## Recommended narrative
1. Start with the common SPA default: bearer tokens in headers.
2. Explain why cookie-based auth was a better fit here.
3. Show the login, refresh, middleware verification, and logout flow.
4. Cover the security implications honestly.

## Suggested outline
## 1. The decision
- Why bearer tokens are popular.
- Why this project chose cookies instead.

## 2. How the flow works here
- Signin/signup issue access and refresh tokens.
- Tokens are set as HTTP-only cookies.
- Middleware reads `access_token` from cookies.
- Refresh endpoint rotates access using `refresh_token`.

## 3. Security implications
- Benefit: frontend JavaScript cannot read HTTP-only cookies.
- Cost: cross-site requests now matter more, so CSRF protection is required.
- Why CORS and CSRF must be discussed together.

## 4. Operational tradeoffs
- Easier browser session handling.
- Harder mobile/API-client ergonomics than pure bearer tokens.
- Cookie settings must match deployment environment.

## 5. Honest caveats
- The current cookie helper sets `secure: true` and `sameSite: 'None'`, so explain deployment expectations clearly.
- There is room to document cookie domain strategy and refresh rotation policy more deeply.

## Code references
- `backend/src/utils/setCookies.ts`
- `backend/src/middlewares/auth.middleware.ts`
- `backend/src/controllers/auth.controller.ts`
- `backend/src/routes/auth.route.ts`

## Recruiter signal
- Shows practical auth design decisions.
- Shows you understand browser security and session management.
