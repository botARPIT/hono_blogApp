# Service-Level Tests as a Safety Net for Backend Changes

## Why this topic
- Strong remote-team signal.
- It shows that you optimize for maintainability and confidence, not just feature delivery.

## Working title options
- Why I Wrote Service-Level Tests for This Backend
- Service Tests as a Merge Gate for Backend Code
- Testing Business Logic Without Overcoupling to HTTP or the Database

## Core claim
This backend uses service-level tests with mocked repositories and utilities to validate business behavior without making tests brittle or slow.

## Repo evidence to reference
- `backend/src/__tests__/services/auth.service.test.ts`
- `backend/src/__tests__/services/blog.service.test.ts`
- `backend/src/__tests__/services/user.service.test.ts`
- `backend/vitest.config.ts`

## Recommended narrative
1. Start with the testing pyramid tradeoff.
2. Explain why the service layer is the most useful unit here.
3. Show how repositories and helpers are mocked.
4. Explain what these tests catch and what they do not.

## Suggested outline
## 1. Why test the service layer
- Route tests can be noisy.
- Repository tests can be integration-heavy.
- Services hold business rules and decision points.

## 2. How the tests are structured
- Mock repositories.
- Mock crypto and JWT utilities where needed.
- Assert returned values and error behavior.

## 3. What is covered in this repo
- Signup and signin flows.
- Blog creation, update, delete, and fetch paths.
- User profile retrieval and update behavior.

## 4. Benefits
- Fast feedback for refactors.
- Safer merges.
- Easier onboarding because tests document behavior.

## 5. Limitations
- Current environment here could not execute Vitest because the local binary was unavailable.
- Service tests do not replace end-to-end auth and middleware coverage.
- Add CI execution details if you want this article to feel complete.

## Code references
- `backend/src/__tests__/services/auth.service.test.ts`
- `backend/src/__tests__/services/blog.service.test.ts`
- `backend/src/__tests__/services/user.service.test.ts`

## Recruiter signal
- Shows change safety mindset.
- Shows you know where to place tests for maximum value.
