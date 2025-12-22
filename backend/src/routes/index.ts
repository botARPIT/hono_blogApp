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
import { ACCEPTED_FRONTEND_ORIGIN } from '../config';
const mainRouter = new Hono<{ Bindings: Bindings }>();

mainRouter.use("*", secureHeaders())
mainRouter.use("*", csrf({ origin: ACCEPTED_FRONTEND_ORIGIN }))
mainRouter.use("*", bodyLimit({ maxSize: 1024 * 1024 }))
// mainRouter.use("/*", cors({
//     origin: [ACCEPTED_FRONTEND_ORIGIN,
//         "http://localhost:5173"],
// }))

//Rate limiting
mainRouter.use((c: Context, next: Next) =>
    rateLimiter<{ Bindings: Bindings }>({
        windowMs: 15 * 60 * 1000,
        limit: 500, // Increased limit for development
        standardHeaders: 'draft-6',
        keyGenerator: (c) => c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? "global",
        store: new WorkersKVStore({ namespace: c.env.RATE_LIMIT_KV })

    })(c, next)
)

mainRouter.use("/*", logger())
// mainRouter.use("/*", timeout(5000))
mainRouter.onError(handleErrorMiddleware)
// mainRouter.onError((err, c) => {
//     console.log("Dummy onError hit")
// return c.json({
//     message: "This is dummy error hit"
// }, 500)
// }
// )

// Adding a health check endpoint
mainRouter.get("/health", (c) => {
    return c.json({
        status: "ok",
        timestamp: new Date().toISOString()
    })
})

mainRouter.route("api/v1/user", userRouter)
mainRouter.route("api/v1/blog", blogRouter)
mainRouter.route("api/v1/auth", authRouter)

export default mainRouter