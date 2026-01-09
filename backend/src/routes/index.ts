import { Bindings } from './../types/env.types';


import { Context, Hono, Next } from "hono";
import { logger } from 'hono/logger'
import { timeout } from 'hono/timeout'
import { userRouter } from "./user.route";
import { blogRouter } from "./blog.route";
import { cors } from "hono/cors"
import { csrf } from "hono/csrf"
import { secureHeaders } from "hono/secure-headers"
import { handleErrorMiddleware } from "../middlewares/error.middleware";
import { authRouter } from './auth.route';
import { bodyLimit } from 'hono/body-limit'

import { rateLimiter } from 'hono-rate-limiter'
import { WorkersKVStore } from "@hono-rate-limiter/cloudflare"
import { getAllowedOrigins } from '../config';
const mainRouter = new Hono<{ Bindings: Bindings }>();

// Health check endpoint - BEFORE middleware so it works without env vars
// This is important for load balancer health checks and CI/CD pipelines
mainRouter.get("/health", (c) => {
    return c.json({
        status: "ok",
        timestamp: new Date().toISOString()
    })
})

mainRouter.use("*", secureHeaders())

// CSRF protection - dynamically configure origins based on environment
mainRouter.use("*", (c, next) => {
    const origins = getAllowedOrigins(c.env)
    return csrf({ origin: origins })(c, next)
})

mainRouter.use("*", bodyLimit({ maxSize: 1024 * 1024 }))

// CORS middleware - dynamically configure origins based on environment
mainRouter.use("/*", (c, next) => {
    const origins = getAllowedOrigins(c.env)
    return cors({
        origin: origins,
        credentials: true,
    })(c, next)
})

//Rate limiting
mainRouter.use((c: Context, next: Next) =>
    rateLimiter<{ Bindings: Bindings }>({
        windowMs: 15 * 60 * 1000,
        limit: 100,
        standardHeaders: 'draft-6',
        keyGenerator: (c) => c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? "global",
        store: new WorkersKVStore({ namespace: c.env.RATE_LIMIT_KV })

    })(c, next)
)

mainRouter.use("/*", logger())
mainRouter.use("/*", timeout(10000)) // 10 second timeout for requests
mainRouter.onError(handleErrorMiddleware)

mainRouter.route("api/v1/user", userRouter)
mainRouter.route("api/v1/blog", blogRouter)
mainRouter.route("api/v1/auth", authRouter)

export default mainRouter