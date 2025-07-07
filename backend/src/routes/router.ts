import { Hono } from "hono";
import { userRouter } from "../user/routes/auth.route";

const mainRouter = new Hono();

mainRouter.route("api/v1", userRouter)

export default mainRouter