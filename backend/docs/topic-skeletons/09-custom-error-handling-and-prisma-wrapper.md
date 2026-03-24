# Custom Error Handling and a Prisma Error Wrapper for Cloudflare Workers

## Why this topic
- Strong backend maturity signal.
- It shows you thought about runtime constraints, operational errors, and consistent API responses instead of letting low-level exceptions leak to clients.

## Working title options
- Building a Custom Error System for a Prisma Backend on Cloudflare Workers
- How I Normalized Prisma Errors in a Serverless Runtime
- Error Handling Architecture in a Hono + Prisma Backend

## Core claim
This backend uses a custom `AppError` hierarchy plus a Prisma error wrapper to normalize database failures into predictable API errors, which is useful in a Cloudflare Workers environment where native Prisma error instance checks are not always ergonomic.

## Repo evidence to reference
- `backend/src/errors/app-error.ts`
- `backend/src/errors/prismaErrorWrapper.ts`
- `backend/src/errors/handle-error.ts`
- `backend/src/middlewares/error.middleware.ts`
- `backend/src/repositories/*.ts`

## Recommended narrative
1. Start with the problem: raw database and runtime errors are noisy, inconsistent, and risky to expose directly.
2. Explain the `AppError` base type and why it carries status, code, metadata, severity, service name, and operational flags.
3. Show how repositories translate Prisma failures into `DBError`.
4. Show how route helpers and Hono middleware return a consistent response envelope.
5. End with tradeoffs and what you would improve next.

## Suggested outline
## 1. Why backend error handling needs structure
- Transport, business, validation, auth, config, and database failures are different kinds of problems.
- Returning ad hoc `500` responses everywhere makes debugging and client behavior worse.

## 2. The custom error model in this repo
- `AppError` as the base class.
- Specialized errors: validation, auth, config, database, not found, unauthorized.
- Why metadata and severity are useful in a real service.

## 3. The Prisma wrapper problem
- In edge or serverless runtimes, native Prisma error handling can be less convenient than in a long-lived Node environment.
- This repo uses a duck-typed wrapper object instead of relying on direct Prisma error instances.
- Repository functions catch low-level errors and rethrow normalized `DBError`s.

## 4. Response shaping
- `handleError()` for route-level try/catch handlers.
- `handleErrorMiddleware()` for centralized Hono error responses.
- Sanitizing metadata before returning it.

## 5. Why this matters
- Clients get stable error shapes.
- Internal layers can throw semantic errors instead of transport-specific responses.
- The codebase is easier to debug and safer to extend.

## 6. Honest limitations
- There are two response paths right now: `handleError()` and `handleErrorMiddleware()`, which may be worth consolidating later.
- The Prisma wrapper currently handles `P2002` explicitly and falls back generically for other codes.
- Stronger observability would pair well with this design.

## Code references
- `backend/src/errors/app-error.ts`
- `backend/src/errors/prismaErrorWrapper.ts`
- `backend/src/errors/handle-error.ts`
- `backend/src/middlewares/error.middleware.ts`
- `backend/src/repositories/blog.repository.ts`
- `backend/src/repositories/auth.repository.ts`
- `backend/src/repositories/user.repository.ts`

## Recruiter signal
- Shows you understand error taxonomy, not just exceptions.
- Shows runtime-aware engineering judgment.
- Shows you care about stable API contracts and debuggability.

## Angle to emphasize
- Do not overclaim that serverless makes Prisma unusable.
- Frame it more accurately: in this runtime, a wrapper-based normalization approach gave you a cleaner and more reliable error boundary.
