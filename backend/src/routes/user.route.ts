
import { Hono } from "hono";
import { createUserService } from "../services/user.service";
import { Bindings } from '../types/env.types';
import createController from "../controllers/user.controller";
import { handleError } from "../errors/handle-error";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getConfig } from "../config";




const userRouter = new Hono<{ Bindings: Bindings }>();

userRouter.use('/*', authMiddleware)

userRouter.get('/profile_info', async (c) => {
   try {
      const config = getConfig(c.env)
      if (!c.env) return c.json({ message: "Server configuration error" }, 503)
      const service = createUserService(config)
      const controller = createController(service)
      return await controller.getProfileInfo(c)
   } catch (error) {
      return handleError(c, error)
   }
})

userRouter.patch('/update_profile', async (c) => {
   try {
      const config = getConfig(c.env)
      if (!c.env) return c.json({ message: "Server configuration error" }, 503)
      const service = createUserService(config)
      const controller = createController(service)
      return await controller.updateProfile(c)
   } catch (error) {
      return handleError(c, error)
   }
})

userRouter.post("/logout", async (c) => {
   try {
      // Clear the auth token cookie
      c.header('Set-Cookie', 'token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0')
      return c.json({ message: "Logged out successfully" }, 200)
   } catch (error) {
      return handleError(c, error)
   }
})


export { userRouter }  