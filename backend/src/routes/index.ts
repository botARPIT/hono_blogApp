import { Bindings } from './../types/env.types';


import { Context, Hono, Next } from "hono";
import {logger} from 'hono/logger'
import {timeout} from 'hono/timeout'
import { userRouter } from "./user.route";
import { blogRouter } from "./blog.route";
import { cors } from "hono/cors"
import { handleErrorMiddleware } from "../middlewares/error.middleware";
import { authRouter } from './auth.route';

import {rateLimiter} from 'hono-rate-limiter'
import {WorkersKVStore} from "@hono-rate-limiter/cloudflare"
const mainRouter = new Hono<{Bindings: Bindings}>();
mainRouter.use("/*", cors({
    origin: ['https://bd2e6478.hono-blogapp.pages.dev',
        "https://267939c1.hono-blogapp.pages.dev",
     "http://localhost:5173"],
    credentials: true
}))

//Rate limiting
mainRouter.use((c: Context, next: Next) => 
    rateLimiter<{Bindings: Bindings}>({
        windowMs: 15 * 60 * 1000,
        limit: 100,
        standardHeaders: 'draft-6',
        keyGenerator : (c) => c.req.header('cf-connecting-ip') ?? "global",
        store: new WorkersKVStore({namespace: c.env.RATE_LIMIT_KV })
        
    })(c, next)
)

mainRouter.use("/*",logger())
// mainRouter.use("/*", timeout(5000))
mainRouter.onError(handleErrorMiddleware)
// mainRouter.onError((err, c) => {
//     console.log("Dummy onError hit")
// return c.json({
//     message: "This is dummy error hit"
// }, 500)
// }
// )
mainRouter.route("api/v1/user", userRouter)
mainRouter.route("api/v1/blog", blogRouter)
mainRouter.route("api/v1/auth", authRouter)

export default mainRouter