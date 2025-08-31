
import { Context, Hono } from "hono";
import {logger} from 'hono/logger'
import {timeout} from 'hono/timeout'
import { userRouter } from "./user.route";
import { blogRouter } from "./blog.route";
import { cors } from "hono/cors"
import { handleErrorMiddleware } from "../middlewares/error.middleware";
import { authRouter } from './auth.route';

const mainRouter = new Hono();
mainRouter.use("/*", cors({
    origin: ['https://69715f30.hono-blogapp.pages.dev',
        "https://ee4c94a3.hono-blogapp.pages.dev",
     "http://localhost:5173"],
    credentials: true
}))
mainRouter.use("/*",logger())
// mainRouter.use("/*", timeout(5000))
mainRouter.use("/*", handleErrorMiddleware)
mainRouter.route("api/v1/user", userRouter)
mainRouter.route("api/v1/blog", blogRouter)
mainRouter.route("api/v1/auth", authRouter)

export default mainRouter