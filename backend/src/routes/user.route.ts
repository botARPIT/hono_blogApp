
import { Hono } from "hono";
import { createUserService } from "../services/user.service";
import { Bindings } from '../types/env.types';
import createController from "../controllers/user.controller";
import { handleError } from "../errors/handle-error";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getConfig } from "../config";
import { deleteCookie } from "hono/cookie";




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
      const isProduction = c.env.ENVIRONMENT === 'production';
      const cookieOptions = {
         path: '/',
         httpOnly: true,
         secure: isProduction,
         sameSite: isProduction ? 'None' as const : 'Lax' as const,
      };

      deleteCookie(c, "access_token", cookieOptions);
      deleteCookie(c, "refresh_token", cookieOptions);

      return c.json({ message: "Logged out successfully" }, 200)
   } catch (error) {
      return handleError(c, error)
   }
})


export { userRouter }  