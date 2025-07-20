import { Hono } from "hono";
import { userRouter } from "./user.route";
import { blogRouter } from "./blog.route";
import {cors} from "hono/cors"
const mainRouter = new Hono();
mainRouter.use("/*", cors())
mainRouter.route("api/v1", userRouter)
mainRouter.route("api/v1", blogRouter)

export default mainRouter