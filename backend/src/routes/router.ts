import { Context, Hono } from "hono";
import { userRouter } from "./user.route";
import { blogRouter } from "./blog.route";
import { cors } from "hono/cors"
import { handleErrorMiddleware } from "../middlewares/error.middleware";
const mainRouter = new Hono();
mainRouter.use("/*", cors({
    origin: 'https://996a78c2.hono-blogapp.pages.dev',
    credentials: true
}), handleErrorMiddleware)
mainRouter.route("api/v1", userRouter)
mainRouter.route("api/v1", blogRouter)

export default mainRouter