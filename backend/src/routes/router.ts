import { Hono } from "hono";
import { userRouter } from "./user.route";
import { blogRouter } from "./blog.route";

const mainRouter = new Hono();

mainRouter.route("api/v1", userRouter)
mainRouter.route("api/v1", blogRouter)

export default mainRouter