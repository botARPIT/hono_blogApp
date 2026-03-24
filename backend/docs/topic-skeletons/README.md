# Topic Selection Summary

## Best single topic to write first
`Layered Architecture for a Cloudflare Workers Backend`

Why this ranks first:
- It explains the whole backend to readers fastest.
- It gives recruiters the clearest signal that you can onboard into a real codebase and structure backend work well.
- It creates context that later articles can reference.

## Selected topics
1. Layered architecture for backend
2. Web Crypto API for hashing instead of `bcrypt.js`
3. Pagination for blogs and transactions for likes
4. Query optimization using `select` statements and indexes
5. Cookie-based JWT authentication instead of bearer tokens
6. Proper DTOs and type-driven contracts
7. Security features: CORS, CSRF, rate limiting, input validation
8. Service-level tests before merging to main
9. Custom error handling and Prisma error normalization for Cloudflare Workers

## Topics not selected for now
- SOLID principles
  The code has some interface-driven design, but the repo is stronger when framed through concrete architecture and validation boundaries.

- Env variable quirks in Cloudflare
  There is typed config handling, but not enough distinctive runtime-specific material for a strong standalone article yet.

- Connection pooling
  The repo uses Prisma Accelerate and a singleton Prisma client, but there is not enough direct observability or benchmark evidence here to make pooling the main story.

- Caching in connection pooling using Prisma Accelerate
  The code does use `withAccelerate()` and query `cacheStrategy`, but the better article is about query/caching strategy after you gather actual latency numbers.

- KV cache for caching
  KV is used here for rate limiting storage, not as a general application cache.

- Singleton Prisma object for repo operations
  Real and worth mentioning inside broader architecture or data-access articles, but too narrow for the first standalone piece.

- Advanced TypeScript concepts
  The repo has solid types and DTOs, but “advanced TypeScript” is too vague and weaker than a contracts-focused article.

## Secondary bundled topic
- Logging, secrets, and observability on Cloudflare Workers
  This qualifies as a bundled operations topic because the repo already has Hono request logging, typed env bindings, health checks, internal API key usage, and Wrangler observability enabled, but it still needs stronger structured logging and monitoring evidence to rank with the top topics.
