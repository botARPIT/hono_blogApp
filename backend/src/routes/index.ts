
import { Context, Hono } from "hono";
import { userRouter } from "./user.route";
import { blogRouter } from "./blog.route";
import { cors } from "hono/cors"
import { handleErrorMiddleware } from "../middlewares/error.middleware";
import { authRouter } from './auth.route';
const mainRouter = new Hono();
mainRouter.use("/*", cors({
    origin: 'https://996a78c2.hono-blogapp.pages.dev',
    // origin: "http://localhost:5173",
    credentials: true
}), handleErrorMiddleware)
mainRouter.route("api/v1/user", userRouter)
mainRouter.route("api/v1/blog", blogRouter)
mainRouter.route("api/v1/auth", authRouter)

export default mainRouter