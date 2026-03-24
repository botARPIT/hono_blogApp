# Optimizing Queries with `select` Statements and Database Indexes

## Why this topic
- Very strong backend signal.
- Recruiters and senior engineers usually trust concrete query discipline more than abstract claims about performance.

## Working title options
- How I Reduced Query Overfetching with Prisma `select` and Schema Indexes
- Small Query Choices That Improve Backend Performance
- Practical Database Optimization in a Prisma + PostgreSQL Backend

## Core claim
This backend avoids unnecessary data loading with explicit Prisma `select` usage and supports common access paths with indexes defined in the Prisma schema.

## Repo evidence to reference
- `backend/src/repositories/auth.repository.ts`
- `backend/src/repositories/user.repository.ts`
- `backend/src/repositories/blog.repository.ts`
- `backend/prisma/schema.prisma`

## Recommended narrative
1. Start with the anti-pattern: fetching full rows everywhere.
2. Show how repository methods explicitly project only the fields the caller needs.
3. Pair that with the indexes declared in schema for common lookups.
4. Explain the effect on payload size, memory, and query planning.

## Suggested outline
## 1. Why overfetching is a backend smell
- Bigger payloads than needed.
- Higher serialization cost.
- Leaking fields across layers.

## 2. `select` usage in this repo
- Auth queries return only fields needed for signin/signup logic.
- User profile queries return profile-safe fields.
- Blog queries shape nested author data explicitly.

## 3. Indexes in the schema
- `User.email`
- `BlogLike.blogId`
- `BlogLike.userId`
- AI-related indexes for status and ownership lookups

## 4. Why this matters
- Faster common reads.
- Clearer repository contracts.
- Better protection against accidental exposure of sensitive columns.

## 5. Limitations and next steps
- Not every useful access pattern is indexed yet.
- Add query logging or database metrics if you want stronger before/after evidence.
- Explain that indexing has write and storage costs.

## Code references
- `backend/src/repositories/blog.repository.ts`
- `backend/src/repositories/auth.repository.ts`
- `backend/src/repositories/user.repository.ts`
- `backend/prisma/schema.prisma`

## Recruiter signal
- Shows performance thinking grounded in code.
- Shows that your data-access layer is deliberate, not accidental.
