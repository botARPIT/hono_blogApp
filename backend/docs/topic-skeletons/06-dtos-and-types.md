# DTOs, Zod Schemas, and Type-Driven Backend Contracts

## Why this topic
- Good onboarding topic.
- Shows disciplined TypeScript usage without drifting into vague “advanced TypeScript” claims.

## Working title options
- DTOs and Validation Contracts in a TypeScript Backend
- Keeping Backend Boundaries Honest with DTOs and Zod
- Type-Driven API Design in a Hono + Prisma Project

## Core claim
This backend uses DTOs, Zod schemas, and typed repository/service boundaries to make request validation and data contracts explicit across layers.

## Repo evidence to reference
- `backend/src/types/blog.types.ts`
- `backend/src/types/user.types.ts`
- `backend/src/types/ai.types.ts`
- `backend/src/policies/blog.policy.ts`
- `backend/src/policies/user.policy.ts`
- `backend/src/interfaces/*.ts`

## Recommended narrative
1. Start with the problem: “TypeScript alone does not validate runtime input.”
2. Show how DTOs model internal contracts.
3. Show how Zod enforces runtime input validity.
4. Show why policies keep validation out of controllers and services.

## Suggested outline
## 1. Why DTOs matter
- Separate transport payloads from raw database models.
- Keep each layer honest about what it expects and returns.

## 2. How this repo uses them
- `AddBlogDTO`, `UpdateBlogDTO`, `CreatedUserDTO`, `ExistingUserDTO`.
- Zod schemas next to DTO definitions.
- Policy classes wrap validation and return typed results.

## 3. Benefits
- Better autocomplete and safer refactors.
- Clearer contracts for service tests.
- Less accidental field leakage.

## 4. Tradeoffs
- More types to maintain.
- DTO drift can happen if repository output and schema expectations are not kept aligned.

## 5. What not to overclaim
- Do not frame this as “advanced TypeScript” for its own sake.
- Frame it as maintainable contract design that pays off in collaborative development.

## Code references
- `backend/src/types/blog.types.ts`
- `backend/src/types/user.types.ts`
- `backend/src/policies/blog.policy.ts`
- `backend/src/policies/user.policy.ts`
- `backend/src/interfaces/blog.interface.ts`
- `backend/src/interfaces/user.interface.ts`

## Recruiter signal
- Shows type discipline tied to real API boundaries.
- Shows awareness of runtime validation, not just compile-time types.
