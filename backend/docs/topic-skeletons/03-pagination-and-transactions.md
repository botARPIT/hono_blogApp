# Pagination for Blog Feeds and Transactions for Likes

## Why this topic
- Good practical backend topic.
- Lets you show both read-path scalability and write-path consistency in one article.

## Working title options
- Two Small Backend Decisions That Matter: Pagination and Transactions
- Designing Blog Feed Reads and Like Writes for Consistency
- Pagination and Atomic Like Toggling in a Prisma Backend

## Core claim
This backend uses pagination for blog listing and Prisma transactions for like toggling to keep read performance predictable and write operations consistent.

## Repo evidence to reference
- `backend/src/repositories/blog.repository.ts`
- `backend/src/controllers/blog.controller.ts`
- `backend/src/openapi.schemas.ts`

## Recommended narrative
1. Start with feed growth and why unbounded queries fail early.
2. Explain the pagination strategy in `getAllBlogs`.
3. Move to the like toggle flow and why two writes must succeed or fail together.
4. Discuss limitations honestly.

## Suggested outline
## 1. Why pagination exists even in small apps
- Prevent oversized payloads.
- Make latency and cost more predictable.
- Improve frontend rendering and perceived performance.

## 2. Implementation in this repo
- Page param validation in the controller.
- `skip` and `take` in the repository.
- Sorting by `updatedAt`.

## 3. Why likes use a transaction
- Like toggling touches `BlogLike` and `Blog.like`.
- Without a transaction, count drift becomes possible.
- Prisma `$transaction` keeps both writes together.

## 4. Advantages
- Predictable response size.
- Lower database and network overhead.
- Better data consistency on write operations.

## 5. Disadvantages and tradeoffs
- Offset pagination can degrade on very large datasets.
- The current like flow does a read before the transaction, so race conditions are reduced but not fully eliminated in every design.
- Counter denormalization adds maintenance complexity.

## 6. Future improvements
- Cursor pagination.
- Returning total count or next-page metadata.
- More explicit concurrency safeguards if write traffic grows.

## Code references
- `backend/src/controllers/blog.controller.ts`
- `backend/src/repositories/blog.repository.ts`

## Recruiter signal
- Shows you think about scale before it becomes a crisis.
- Shows awareness of consistency, not just feature completion.
