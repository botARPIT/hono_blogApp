# Security Hardening in a Cloudflare Workers Backend

## Why this topic
- One of the strongest recruiter-facing topics after architecture.
- It shows maturity because it connects multiple protective layers instead of treating security as a checkbox.

## Working title options
- Security Layers in My Hono Backend: CORS, CSRF, Rate Limiting, and Validation
- Backend Security Beyond Login: Practical Hardening in a Cloudflare Workers API
- Building a Safer API on Cloudflare Workers

## Core claim
This backend applies multiple security controls at the framework edge, including secure headers, CORS, CSRF protection, body limits, rate limiting with Cloudflare KV, cookie-based auth, and Zod input validation.

## Repo evidence to reference
- `backend/src/routes/index.ts`
- `backend/src/index.ts`
- `backend/src/config.ts`
- `backend/src/middlewares/auth.middleware.ts`
- `backend/src/policies/*.ts`
- `backend/src/utils/setCookies.ts`

## Recommended narrative
1. Start with the principle: no single middleware “makes an API secure.”
2. Show the request pipeline in `routes/index.ts`.
3. Explain what each security layer blocks.
4. Discuss how cookie auth changes the threat model.
5. End with gaps and next improvements to keep the article credible.

## Suggested outline
## 1. Security layers in this backend
- Secure headers.
- Origin-based CORS.
- CSRF protection.
- Request body size limit.
- Rate limiting backed by Workers KV.
- Input validation using Zod-backed policies.

## 2. Why these layers work together
- CORS is not auth.
- CSRF matters because auth uses cookies.
- Rate limits protect auth and API routes from abuse.
- Validation reduces malformed input reaching business logic.

## 3. Cloudflare-specific details
- KV-backed rate limiting fits an edge deployment model.
- Allowed origins are derived from typed environment config.

## 4. Honest limitations
- Auth-route-specific limiter is present but commented out.
- Cookie settings should be reviewed across local and production environments.
- Sanitization coverage can be discussed if used only in specific paths.

## 5. What this says about engineering style
- Security is handled as a system, not a single library choice.

## Code references
- `backend/src/routes/index.ts`
- `backend/src/config.ts`
- `backend/src/utils/setCookies.ts`
- `backend/src/middlewares/auth.middleware.ts`
- `backend/src/policies/user.policy.ts`
- `backend/src/policies/blog.policy.ts`

## Recruiter signal
- Shows secure-by-default thinking.
- Shows you understand browser security, abuse prevention, and runtime validation.
