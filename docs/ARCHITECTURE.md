# Blogify - Backend Architecture Documentation

> A comprehensive technical deep-dive into the architecture, design decisions, and trade-offs of the Blogify backend built on Cloudflare Workers.

---

## Table of Contents

1. [Why Cloudflare Workers?](#a-why-cloudflare-workers)
2. [Architecture Overview](#b-architecture)
3. [Data Model](#c-data-model)
4. [Authentication](#d-authentication)
5. [Performance](#e-performance)
6. [Security](#f-security)
7. [Deployment & Developer Experience](#g-deployment--dx)
8. [Trade-offs](#h-trade-offs)

---

## A. Why Cloudflare Workers?

### The Decision Context

When selecting the infrastructure for Blogify, several factors influenced the choice of Cloudflare Workers over traditional server architectures:

#### Constraints That Forced This Choice

| Factor | Traditional Server (AWS Lambda/EC2) | Cloudflare Workers |
|--------|-------------------------------------|-------------------|
| **Cold Starts** | 500ms–2000ms (Lambda) | ~0ms (always warm) |
| **Global Latency** | Single region deployment | 300+ edge locations worldwide |
| **Cost at Low Scale** | $5–20/month minimum | Free tier: 100k requests/day |
| **Infrastructure Management** | VPS, containers, auto-scaling | Zero operational overhead |
| **Deployment Speed** | Minutes | Seconds (~5s globally) |

#### Why Edge Computing Makes Sense for Blogs

A blogging platform has specific characteristics that align well with edge computing:

1. **Read-Heavy Workload**: Most operations are reading blog posts, not writing them
2. **Global Audience**: Readers can be anywhere in the world
3. **Unpredictable Traffic**: A viral post can spike traffic 100x overnight
4. **SEO Requirements**: Fast Time-to-First-Byte (TTFB) directly impacts search rankings

### Execution Limits and Constraints

Cloudflare Workers operate within strict limits that shape application design:

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKERS LIMITS                           │
├─────────────────────────────────────────────────────────────┤
│ CPU Time:        10ms (free tier) / 50ms (paid)            │
│ Memory:          128MB per isolate                          │
│ Script Size:     <1MB after bundling                        │
│ Subrequests:     50 fetch() calls per request              │
│ Request Size:    100MB max                                  │
│ Response Size:   No hard limit (streaming supported)        │
└─────────────────────────────────────────────────────────────┘
```

#### What These Limits Mean for Blogify

| Constraint | Impact | Solution |
|------------|--------|----------|
| 50ms CPU time | No heavy computation | Use async operations, offload to external services |
| 128MB memory | No large file processing in-memory | Stream uploads directly to storage |
| No native modules | Can't use `bcrypt` | Implemented password hashing with Web Crypto API |
| Stateless execution | No persistent connections | Use connection poolers (Prisma Accelerate) |

---

## B. Architecture

### High-Level System Design

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              BLOGIFY ARCHITECTURE                            │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────────────┐
│   Browser   │────▶│   Vercel    │────▶│        React SPA (Frontend)         │
│   (User)    │     │    CDN      │     │   - React Router                    │
└─────────────┘     └─────────────┘     │   - TanStack Query                  │
                                        │   - Axios with credentials          │
                                        └─────────────────────────────────────┘
                                                        │
                                                        │ HTTPS (Cross-Origin)
                                                        │ Cookies: SameSite=None
                                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE EDGE NETWORK                             │
│                        (300+ Global Locations)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     CLOUDFLARE WORKER                                │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐  │   │
│  │  │    Hono     │───▶│ Middleware  │───▶│      Controllers        │  │   │
│  │  │   Router    │    │  - CORS     │    │  - AuthController       │  │   │
│  │  │             │    │  - Auth     │    │  - BlogController       │  │   │
│  │  │             │    │  - RateLimit│    │  - UserController       │  │   │
│  │  └─────────────┘    │  - Error    │    └─────────────────────────┘  │   │
│  │                     └─────────────┘              │                   │   │
│  │                                                  │                   │   │
│  │  ┌───────────────────────────────────────────────┴────────────────┐  │   │
│  │  │                        Services                                │  │   │
│  │  │  - AuthService (JWT, OAuth, Password Hashing)                 │  │   │
│  │  │  - BlogService (CRUD, Pagination, Likes)                      │  │   │
│  │  │  - UserService (Profile Management)                           │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                  │                                   │   │
│  │  ┌───────────────────────────────┴────────────────────────────────┐  │   │
│  │  │                      Repositories                              │  │   │
│  │  │  - Prisma Client with Accelerate Extension                    │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
          ┌─────────────────────────────┼─────────────────────────────┐
          │                             │                             │
          ▼                             ▼                             ▼
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│ Prisma Accelerate│          │  Cloudflare KV  │          │    Supabase     │
│  (HTTP Proxy)   │          │  (Rate Limiting)│          │   (Storage)     │
│                 │          │                 │          │                 │
│ Connection Pool │          │ Key-Value Store │          │ Blog Thumbnails │
│ Query Caching   │          │ Edge-Distributed│          │ User Avatars    │
└────────┬────────┘          └─────────────────┘          └─────────────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Supabase)    │
│                 │
│  Primary DB     │
│  Managed        │
└─────────────────┘
```

### Request Lifecycle at Edge

Every incoming request follows this lifecycle:

```
1. DNS Resolution
   └─▶ Cloudflare's Anycast routes to nearest edge location

2. TLS Termination (Automatic)
   └─▶ SSL certificate managed by Cloudflare

3. Worker Invocation (0ms cold start)
   └─▶ V8 isolate already warm and ready

4. Hono Router Matching
   └─▶ Routes matched in order of specificity
   └─▶ Example: POST /api/v1/auth/signin

5. Middleware Chain Execution
   ├─▶ CORS validation (origin check)
   ├─▶ Rate limiting (KV lookup)
   ├─▶ Auth middleware (JWT verification)
   └─▶ Error boundary (catches all exceptions)

6. Controller Execution
   ├─▶ Request body parsing
   ├─▶ Input validation (Zod schemas)
   ├─▶ Service method invocation
   └─▶ Response serialization

7. Database Access (via Prisma Accelerate)
   ├─▶ HTTP-based query to Prisma proxy
   ├─▶ Connection pooling handled externally
   ├─▶ Optional: Edge caching with TTL
   └─▶ Response returned to Worker

8. Response Sent to Client
   └─▶ Headers (including Set-Cookie)
   └─▶ JSON body or redirect
```

### Authentication Flow at Edge

#### Local Authentication (Email/Password)

```
┌───────────────────────────────────────────────────────────────────────────┐
│                     LOCAL AUTHENTICATION FLOW                             │
└───────────────────────────────────────────────────────────────────────────┘

  Browser                          Worker                           Database
     │                               │                                  │
     │  POST /api/v1/auth/signin     │                                  │
     │  { email, password }          │                                  │
     │──────────────────────────────▶│                                  │
     │                               │                                  │
     │                               │  findUnique({ email })           │
     │                               │─────────────────────────────────▶│
     │                               │                                  │
     │                               │  { id, name, password_hash }     │
     │                               │◀─────────────────────────────────│
     │                               │                                  │
     │                               │  ┌─────────────────────────┐     │
     │                               │  │ Web Crypto API          │     │
     │                               │  │ PBKDF2 hash comparison  │     │
     │                               │  └─────────────────────────┘     │
     │                               │                                  │
     │                               │  ┌─────────────────────────┐     │
     │                               │  │ Generate JWTs           │     │
     │                               │  │ - Access (1hr)          │     │
     │                               │  │ - Refresh (2 days)      │     │
     │                               │  └─────────────────────────┘     │
     │                               │                                  │
     │  302 Redirect + Set-Cookie    │                                  │
     │  (access_token, refresh_token)│                                  │
     │◀──────────────────────────────│                                  │
     │                               │                                  │
```

#### Google OAuth Flow (PKCE)

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        GOOGLE OAUTH FLOW (PKCE)                           │
└───────────────────────────────────────────────────────────────────────────┘

  Browser         Worker (Edge)         Google OAuth         Database
     │                 │                     │                   │
     │ GET /auth/google│                     │                   │
     │────────────────▶│                     │                   │
     │                 │                     │                   │
     │                 │ Generate PKCE:      │                   │
     │                 │ - code_verifier     │                   │
     │                 │ - code_challenge    │                   │
     │                 │ - state             │                   │
     │                 │                     │                   │
     │ Set-Cookie:     │                     │                   │
     │ code_verifier   │                     │                   │
     │ oauth_state     │                     │                   │
     │ 302 → Google    │                     │                   │
     │◀────────────────│                     │                   │
     │                 │                     │                   │
     │ User logs in at Google...             │                   │
     │─────────────────────────────────────▶│                   │
     │                 │                     │                   │
     │ Redirect with code + state            │                   │
     │◀─────────────────────────────────────│                   │
     │                 │                     │                   │
     │ GET /auth/google/callback             │                   │
     │ ?code=xxx&state=yyy                   │                   │
     │────────────────▶│                     │                   │
     │                 │                     │                   │
     │                 │ Verify state ✓      │                   │
     │                 │ Get code_verifier   │                   │
     │                 │                     │                   │
     │                 │ Exchange code       │                   │
     │                 │────────────────────▶│                   │
     │                 │                     │                   │
     │                 │ id_token (JWT)      │                   │
     │                 │◀────────────────────│                   │
     │                 │                     │                   │
     │                 │ Decode JWT:         │                   │
     │                 │ { email, name, sub }│                   │
     │                 │                     │                   │
     │                 │ Upsert user         │                   │
     │                 │────────────────────────────────────────▶│
     │                 │                     │                   │
     │                 │ Generate JWTs       │                   │
     │                 │                     │                   │
     │ 302 + Set-Cookie│                     │                   │
     │ → Frontend      │                     │                   │
     │◀────────────────│                     │                   │
```

### Database Connection Strategy

#### The Challenge: Edge + PostgreSQL

Cloudflare Workers cannot maintain persistent TCP connections. PostgreSQL requires TCP. This creates a fundamental incompatibility.

#### The Solution: Prisma Accelerate

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export function getPrismaClient(datasourceUrl: string) {
    return new PrismaClient({
        datasourceUrl,
    }).$extends(withAccelerate());
}
```

**How Prisma Accelerate Works:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PRISMA ACCELERATE ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────────┘

  Worker          Prisma Accelerate          Connection Pool       PostgreSQL
    │                    │                        │                     │
    │  HTTP Query        │                        │                     │
    │  (prisma://...)    │                        │                     │
    │───────────────────▶│                        │                     │
    │                    │                        │                     │
    │                    │  ┌──────────────────┐  │                     │
    │                    │  │ Query Analysis   │  │                     │
    │                    │  │ - Parse          │  │                     │
    │                    │  │ - Cache check    │  │                     │
    │                    │  └──────────────────┘  │                     │
    │                    │                        │                     │
    │                    │  [Cache HIT]           │                     │
    │  Cached Response   │◀────────────────────  │                     │
    │◀───────────────────│                        │                     │
    │                    │                        │                     │
    │                    │  [Cache MISS]          │                     │
    │                    │                        │                     │
    │                    │  TCP Connection        │                     │
    │                    │───────────────────────▶│                     │
    │                    │                        │  SQL Query          │
    │                    │                        │────────────────────▶│
    │                    │                        │                     │
    │                    │                        │  Result Set         │
    │                    │                        │◀────────────────────│
    │                    │  Query Result          │                     │
    │                    │◀───────────────────────│                     │
    │                    │                        │                     │
    │                    │  Cache + Return        │                     │
    │  Response          │                        │                     │
    │◀───────────────────│                        │                     │
```

**Cache Strategy Implementation:**

```typescript
// blogs with edge caching
const allBlogs = await prisma.blog.findMany({
    where: { published: true },
    orderBy: { updatedAt: 'desc' },
    skip: (page - 1) * 10,
    take: 10,
    cacheStrategy: {
        ttl: 300,  // 5 minutes
        tags: [`blogs_page_${page}`, 'all_blogs']
    }
});
```

---

## C. Data Model

### Core Entities

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum AuthProvider {
  LOCAL
  GOOGLE
}

enum BlogTag {
  SOCIAL
  TECH
  ENTERTAINMENT
  INFOTAINMENT
  SPORTS
  MOVIES
  GAMING
  PHILOSOPHY
  SCIENCE
  ART
  NATURE
  WILDLIFE
  GENERAL
}

model User {
  id           String       @id @default(cuid())
  name         String
  email        String       @unique
  password     String?      // Nullable for OAuth users
  authProvider AuthProvider @default(LOCAL)
  isAdmin      Boolean      @default(false)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  
  blogs        Blog[]       // One-to-many
  likes        BlogLike[]   // Many-to-many through join table
}

model Blog {
  id        String    @id @default(cuid())
  title     String
  content   String    @db.Text
  thumbnail String
  tag       BlogTag   @default(GENERAL)
  published Boolean   @default(false)
  like      Int       @default(0)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  authorId  String
  author    User      @relation(fields: [authorId], references: [id])
  likes     BlogLike[]
  
  @@index([authorId])
  @@index([published, updatedAt])
}

model BlogLike {
  blogId    String
  userId    String
  createdAt DateTime @default(now())
  
  blog      Blog     @relation(fields: [blogId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@id([blogId, userId])  // Composite primary key prevents double-likes
}
```

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ENTITY RELATIONSHIPS                              │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐                      ┌──────────────────┐
  │       User       │                      │       Blog       │
  ├──────────────────┤                      ├──────────────────┤
  │ id (PK)          │─────────────────────┐│ id (PK)          │
  │ name             │                     ││ title            │
  │ email (UNIQUE)   │                     ││ content          │
  │ password?        │                     ││ thumbnail        │
  │ authProvider     │                     ││ tag              │
  │ isAdmin          │                     ││ published        │
  │ createdAt        │                     ││ like (count)     │
  │ updatedAt        │                     ││ createdAt        │
  └──────────────────┘                     ││ updatedAt        │
         │ │                               ││ authorId (FK)────┘
         │ │                               │└──────────────────┘
         │ │                               │        │
         │ │       ┌───────────────────────┘        │
         │ │       │                                │
         │ └───────┼────────────────────────────────┘
         │         │
         │         ▼
         │  ┌──────────────────┐
         │  │     BlogLike     │
         │  ├──────────────────┤
         └─▶│ blogId (PK, FK)  │◀─────────────────────────────────────────────┐
            │ userId (PK, FK)  │                                               │
            │ createdAt        │                                               │
            └──────────────────┘                                               │
                                                                               │
  Relationships:                                                               │
  ─────────────                                                               │
  User 1:N Blog     (One user can write many blogs)                           │
  User N:M Blog     (Many users can like many blogs, via BlogLike)────────────┘
```

### Migration Strategy

#### Local Development

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name "add_blog_likes_table"

# This will:
# 1. Generate SQL migration file
# 2. Apply to local database
# 3. Regenerate Prisma Client
```

#### Production Deployment

```yaml
# .github/workflows/cd-backend-prod.yaml

jobs:
  deploy:
    steps:
      - name: Install dependencies
        run: npm ci
        
      - name: Generate Prisma Client
        run: npx prisma generate
        
      - name: Deploy migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          
      - name: Deploy Worker
        uses: cloudflare/wrangler-action@v3
```

### Handling Consistency at Edge

#### The Read-After-Write Problem

```
Time    Action                          Cache State
────    ──────                          ───────────
T+0     User creates new blog           Cache: [old blogs]
T+1     Redirect to /my-blogs           Cache HIT: Old data returned
T+2     User doesn't see their blog     ❌ Inconsistent
```

#### Solutions Implemented

1. **Cache Tags for Invalidation:**
   ```typescript
   // On read
   cacheStrategy: {
       ttl: 300,
       tags: ['user_blogs_' + userId]
   }
   
   // On write (not fully implemented yet)
   // Would need Prisma Accelerate API to invalidate tags
   ```

2. **Short TTLs for User-Specific Data:**
   ```typescript
   // Public blogs: 5 minute cache
   // User blogs: No cache (always fresh)
   ```

3. **Optimistic UI Updates:**
   ```typescript
   // Frontend: TanStack Query mutation
   onMutate: async (newBlog) => {
       await queryClient.cancelQueries({ queryKey: ['userBlogs'] })
       const previous = queryClient.getQueryData(['userBlogs'])
       queryClient.setQueryData(['userBlogs'], old => [...old, newBlog])
       return { previous }
   }
   ```

---

## D. Authentication

### Session vs Token Comparison

| Aspect | Server Sessions | JWTs (Blogify's Choice) |
|--------|-----------------|-------------------------|
| **Storage** | Server-side (Redis/DB) | Client-side (cookies) |
| **Stateless** | ❌ Requires shared state | ✅ Fully stateless |
| **Edge Compatible** | ❌ Needs external store | ✅ Verify anywhere |
| **Revocation** | ✅ Delete session | ⚠️ Needs blocklist or short expiry |
| **Scalability** | ⚠️ Session store bottleneck | ✅ No shared state |
| **Payload Size** | Small (session ID) | Larger (claims embedded) |

**Why JWT for Workers:**
Workers are stateless by design. There's no persistent storage between requests. JWTs allow authentication verification at the edge without external calls.

### JWT Implementation

```typescript
// auth/auth.ts

export function generateTokens(
    payload: { id: string; name: string },
    accessSecret: string,
    refreshSecret: string
) {
    const accessToken = sign(
        { ...payload, exp: Math.floor(Date.now() / 1000) + 3600 },  // 1 hour
        accessSecret
    );
    
    const refreshToken = sign(
        { ...payload, exp: Math.floor(Date.now() / 1000) + 172800 },  // 2 days
        refreshSecret
    );
    
    return { accessToken, refreshToken };
}
```

### Cookie Configuration

```typescript
// utils/setCookies.ts

export function setCookies(
    c: HonoContext,
    result: { accessToken: string; refreshToken: string }
) {
    const { accessToken, refreshToken } = result;
    
    setCookie(c, "access_token", accessToken, {
        httpOnly: true,      // JavaScript cannot access
        secure: true,        // HTTPS only
        sameSite: 'None',    // Required for cross-origin
        path: '/',           // Available on all routes
        maxAge: 60 * 60      // 1 hour
    });
    
    setCookie(c, "refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
        maxAge: 60 * 60 * 24 * 2  // 2 days
    });
}
```

### Cookie Security Flags Explained

| Flag | Value | Purpose |
|------|-------|---------|
| `httpOnly` | `true` | Prevents XSS attacks from stealing tokens via `document.cookie` |
| `secure` | `true` | Only sent over HTTPS connections |
| `sameSite` | `'None'` | Allows cross-origin requests (Vercel → Workers) |
| `path` | `'/'` | Cookie sent for all routes |
| `maxAge` | varies | Expiration time in seconds |

### Why SameSite=None?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CROSS-ORIGIN COOKIE FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

Frontend: https://blogify.arpitdev.site (Vercel)
Backend:  https://blogify-backend.*.workers.dev (Cloudflare)

These are DIFFERENT ORIGINS (different domains).

With SameSite=Lax (default):
┌─────────────────┐                    ┌─────────────────┐
│    Frontend     │  fetch() call     │    Backend      │
│    (Vercel)     │───────────────────▶│    (Workers)    │
│                 │  Cookie: ❌ BLOCKED│                 │
└─────────────────┘                    └─────────────────┘

With SameSite=None + Secure:
┌─────────────────┐                    ┌─────────────────┐
│    Frontend     │  fetch() call     │    Backend      │
│    (Vercel)     │───────────────────▶│    (Workers)    │
│                 │  Cookie: ✅ SENT   │                 │
└─────────────────┘                    └─────────────────┘
```

### Password Hashing at Edge

Traditional `bcrypt` uses native bindings — incompatible with Workers. Solution: Web Crypto API with PBKDF2.

```typescript
// utils/hashUsingWebCrypto.ts

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const encoder = new TextEncoder();
    
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    
    const hash = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    );
    
    // Combine salt + hash for storage
    const combined = new Uint8Array(salt.length + hash.byteLength);
    combined.set(salt, 0);
    combined.set(new Uint8Array(hash), salt.length);
    
    return btoa(String.fromCharCode(...combined));
}

export async function comparePassword(
    password: string,
    storedHash: string
): Promise<boolean> {
    // Extract salt from stored hash
    const combined = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const originalHash = combined.slice(16);
    
    // Hash the input password with same salt
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    
    const newHash = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    );
    
    // Constant-time comparison
    return timingSafeEqual(originalHash, new Uint8Array(newHash));
}
```

---

## E. Performance

### Latency Measurements

| Operation | Traditional (Lambda) | Cloudflare Workers | Improvement |
|-----------|---------------------|-------------------|-------------|
| Cold Start | 500–2000ms | ~0ms | ∞ |
| Auth Verification | 50–100ms | 5–10ms | 5-10x |
| Get Blogs (cached) | 100–200ms | 15–30ms | 5-7x |
| Get Blogs (uncached) | 150–300ms | 50–80ms | 2-3x |
| Create Blog | 100–150ms | 80–120ms | ~1.2x |

### What Actually Made It Fast

1. **Zero Cold Starts:**
   ```
   Lambda: Request → Container Spin-up → Execute → Response
                        ↑
                      500-2000ms
   
   Workers: Request → Already Running → Response
                            ↑
                          ~0ms
   ```

2. **Edge Execution:**
   ```
   User in Mumbai → CDN Edge in Mumbai → Response
   vs
   User in Mumbai → Server in us-east-1 → Response (200ms+ RTT)
   ```

3. **Prisma Accelerate Caching:**
   ```typescript
   // First request: DB hit (~50ms)
   // Subsequent requests (within TTL): Cache hit (~5ms)
   cacheStrategy: { ttl: 300 }
   ```

4. **Efficient JWT Verification:**
   ```typescript
   // Web Crypto is native to V8 isolates
   // No external calls needed for auth
   const payload = verify(token, secret);
   ```

### What Does NOT Scale Well

| Problem | Reason | Impact |
|---------|--------|--------|
| **Image Processing** | CPU limit (50ms) | Can't resize/compress on-the-fly |
| **Large File Uploads** | Memory limit (128MB) | Must stream directly to storage |
| **Real-time Features** | Stateless execution | No WebSockets without Durable Objects |
| **Heavy Aggregations** | DB query time | Complex queries may timeout |
| **ML Inference** | CPU limit | No on-device model execution |

---

## F. Security

### Content Security Policy

For SSR implementations (not applicable to current SPA):

```typescript
// Recommended CSP headers
app.use('*', async (c, next) => {
    await next();
    c.header('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",  // Required for hydration
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://blogify-backend.*.workers.dev"
    ].join('; '));
});
```

### OAuth Implementation Pitfalls

#### Problem 1: State Mismatch

```
Cause:   Cookie not surviving the Google redirect
Symptom: "Invalid state" error after Google login
Fix:     Ensure SameSite=None + Secure=true for oauth_state cookie
```

#### Problem 2: PKCE Code Verifier Lost

```
Cause:   code_verifier cookie with SameSite=Lax
Symptom: "Missing code verifier" error
Fix:     Match all OAuth cookies to same SameSite policy
```

#### Problem 3: Form Submission vs JSON

```
Cause:   Frontend sending form-data, backend expecting JSON
Symptom: Empty request body
Fix:     Handle both content types:

async parseBody<T>(c: Context): Promise<T> {
    const contentType = c.req.header('Content-Type');
    if (contentType?.includes('application/json')) {
        return c.req.json<T>();
    }
    return c.req.parseBody() as T;
}
```

### Input Validation

All user input is validated with Zod schemas:

```typescript
// types/blog.types.ts

export const blogSchema = z.object({
    title: z.string()
        .min(10, "Title too short")
        .max(100, "Title too long")
        .trim(),
    content: z.string()
        .max(5000, "Content too long")
        .trim(),
    tag: z.nativeEnum(BlogTag),
    published: z.boolean().optional().default(false)
}).superRefine((data, ctx) => {
    // Conditional validation: content length only matters when publishing
    if (data.published && data.content.length < 150) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Content must be at least 150 characters to publish",
            path: ["content"]
        });
    }
});
```

### Rate Limiting

```typescript
// routes/index.ts

import { rateLimiter } from 'hono-rate-limiter';

app.use(rateLimiter({
    windowMs: 60 * 1000,        // 1 minute
    limit: 100,                  // 100 requests per window
    standardHeaders: 'draft-6',
    keyGenerator: (c) => c.req.header('cf-connecting-ip') || 'unknown',
    store: new CloudflareKVStore(c.env.RATE_LIMIT_KV)
}));
```

---

## G. Deployment & DX

### Environment Variables Management

#### Non-Sensitive Configuration (wrangler.jsonc)

```jsonc
{
    "name": "blogify-backend",
    "main": "src/index.ts",
    "compatibility_date": "2025-07-07",
    "compatibility_flags": ["nodejs_compat"],
    
    "vars": {
        "ENVIRONMENT": "production",
        "GOOGLE_CLIENT_ID": "416523459097-xxx.apps.googleusercontent.com",
        "REDIRECT_URI": "https://blogify-backend.xxx.workers.dev/api/v1/auth/google/callback",
        "FRONTEND_REDIRECT_URL": "https://blogify.arpitdev.site",
        "FRONTEND_ORIGIN": "https://blogify.arpitdev.site"
    },
    
    "kv_namespaces": [
        {
            "binding": "RATE_LIMIT_KV",
            "id": "a117436b6cca4cd68894431e8f140c8c"
        }
    ]
}
```

#### Sensitive Secrets (CLI)

```bash
# Set secrets via Wrangler CLI
wrangler secret put DATABASE_URL
wrangler secret put JWT_ACCESS_SECRET
wrangler secret put JWT_REFRESH_SECRET
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

### Preview vs Production

| Aspect | Preview Deployments | Production |
|--------|--------------------|-----------| 
| URL | `*.workers.dev/preview-abc123` | `blogify-backend.*.workers.dev` |
| Secrets | Same (unless scoped) | Same |
| KV Bindings | Same namespace | Same namespace |
| Deployment Time | ~5 seconds | ~5 seconds |
| Auto Deploy | On every push | On `main` branch |

### What Cloudflare Gives "For Free"

#### ✅ Included at No Cost:

| Feature | Description |
|---------|-------------|
| **DDoS Protection** | Automatic L3/L4/L7 mitigation |
| **TLS/SSL** | Automatic certificate provisioning |
| **Global CDN** | 300+ edge locations |
| **100k Requests/Day** | Free tier limit |
| **Basic Logging** | Tail logs via `wrangler tail` |
| **CI/CD Integration** | GitHub Actions support |

#### ❌ Additional Cost Required:

| Feature | Cost Model |
|---------|------------|
| **KV Storage** | $0.50/million reads, $5/GB stored |
| **Durable Objects** | $0.15/million requests |
| **Prisma Accelerate** | Pay per query (external service) |
| **Custom Domains** | Requires zone on Cloudflare |
| **Logpush** | Enterprise only |

### GitHub Actions CI/CD

```yaml
# .github/workflows/cd-backend-prod.yaml

name: Deploy Backend to Production

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
        
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
          
      - run: npm ci
      
      - run: npm run lint
      
      - run: npm run test
      
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: backend
```

---

## H. Trade-offs

### One Reason NOT to Build on Workers

**Real-time Collaboration Features**

If Blogify needed Google Docs-style real-time collaboration:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WHY WORKERS FAIL FOR REAL-TIME                           │
└─────────────────────────────────────────────────────────────────────────────┘

Traditional Server:
┌──────────────┐                    ┌──────────────────────┐
│   Client A   │◀──────────────────▶│                      │
│              │     WebSocket      │    Node.js Server    │
│              │                    │    - Persistent      │
│   Client B   │◀──────────────────▶│    - Stateful        │
│              │     WebSocket      │    - In-memory sync  │
└──────────────┘                    └──────────────────────┘

Cloudflare Workers:
┌──────────────┐                    ┌──────────────────────┐
│   Client A   │─────Request───────▶│   Worker Instance 1  │─────Dies
│              │◀────Response───────│   (Stateless)        │
│              │                    └──────────────────────┘
│   Client B   │─────Request───────▶┌──────────────────────┐
│              │◀────Response───────│   Worker Instance 2  │─────Dies
└──────────────┘                    │   (Different!)       │
                                    └──────────────────────┘

Workers cannot maintain state between requests.
WebSockets require persistent connections.
Each request may hit a different isolate.
```

#### Alternatives for Real-time on Cloudflare:

1. **Durable Objects:** Stateful actors that maintain state
   - Complex to implement
   - Expensive at scale ($0.15/million requests)
   - Single point for coordination

2. **Hybrid Architecture:**
   ```
   Workers (API) + External WebSocket Service (e.g., Pusher, Ably)
   ```

3. **Different Platform Entirely:**
   - Fly.io (global VMs)
   - Railway (containers)
   - Traditional VPS with Socket.io

### Summary of Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| **Edge Execution** | Low latency globally | Limited CPU time |
| **Stateless Workers** | Infinite scale | No persistent connections |
| **Prisma Accelerate** | DB at edge | Per-query pricing |
| **JWT Auth** | Stateless verification | Complex revocation |
| **SameSite=None Cookies** | Cross-origin works | Weaker CSRF protection |

---

## Conclusion

Cloudflare Workers is an excellent choice for Blogify's use case:
- ✅ Read-heavy blog content with global audience
- ✅ Unpredictable traffic patterns
- ✅ SEO-critical latency requirements
- ✅ Simple operational model

It would be a poor choice if we needed:
- ❌ Real-time collaboration
- ❌ Long-running computations
- ❌ Large file processing
- ❌ Persistent WebSocket connections

The architecture maximizes the strengths of edge computing while working within its constraints through careful design decisions around authentication, database access, and caching strategies.

---

*Last updated: January 9, 2026*
