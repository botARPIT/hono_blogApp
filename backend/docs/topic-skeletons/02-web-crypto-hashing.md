# Using the Web Crypto API for Password Hashing on Cloudflare Workers

## Why this topic
- Strong platform-specific story.
- Shows you adapted security implementation to the runtime instead of blindly using common Node packages.

## Working title options
- Why I Used Web Crypto Instead of bcrypt.js in a Cloudflare Workers Backend
- Password Hashing on the Edge with the Web Crypto API
- Runtime-Aware Security: Replacing bcrypt.js with Web Crypto

## Core claim
This backend hashes passwords with the Web Crypto API using PBKDF2 and constant-time comparison because that approach aligns better with the Cloudflare Workers runtime than a typical Node-first hashing setup.

## Repo evidence to reference
- `backend/src/utils/hashUsingWebCrypto.ts`
- `backend/src/services/auth.service.ts`
- `backend/src/__tests__/utils/hashUsingWebCrypto.test.ts`
- `backend/package.json`

## Recommended narrative
1. Start with the runtime constraint: Cloudflare Workers is not a normal Node server.
2. Explain why Web Crypto is a better fit here.
3. Walk through your hash format and verification flow.
4. Call out security details like salt, iterations, and constant-time comparison.
5. End with tradeoffs and where Argon2 or other options might fit later.

## Suggested outline
## 1. The runtime problem
- Why `bcrypt.js` is not the most compelling choice on Workers.
- Why using platform-native crypto reduces friction.

## 2. The implementation
- Import raw password bytes.
- Derive bits with PBKDF2 + SHA-256.
- Generate per-password salt.
- Store a self-describing hash string.

## 3. Verification flow
- Parse the stored format.
- Recompute with stored salt and iterations.
- Compare using constant-time logic.

## 4. Security notes
- Why salts matter.
- Why iteration count is tuned for the runtime.
- Why timing-safe comparison matters.

## 5. Tradeoffs
- PBKDF2 is pragmatic, but not necessarily the final best choice forever.
- Runtime constraints can shape security implementation details.

## Code references
- `backend/src/utils/hashUsingWebCrypto.ts`
- `backend/src/services/auth.service.ts`

## Recruiter signal
- Shows security awareness.
- Shows runtime-specific engineering judgment.
- Shows you can justify technical choices instead of following defaults.

## Caveat to address honestly
- The repo still lists `bcryptjs` as a dependency, so explain that the actual auth flow uses Web Crypto and note the leftover dependency if it is no longer needed.
