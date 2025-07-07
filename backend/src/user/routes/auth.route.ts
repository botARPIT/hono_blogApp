import { Hono } from "hono";
import { register } from "../services/auth.service";

const userRouter = new Hono<{Bindings: {DATABASE_URL: string}}>();

userRouter.post('/signup', async(c) => {
   const dbUrl = c.env.DATABASE_URL;
   const {name, email, password} = await c.req.json();
   const created = await register(dbUrl, {name, email, password})
   if(created) return c.text("User created")
      else return c.text("Cannot create user")
})

export {userRouter}  