
import { Hono } from "hono";
import { createUserService } from "../services/user.service";
import 'dotenv/config'
import { Bindings } from '../types/env.types';
import createController from "../controllers/user.controller";
import { handleError } from "../errors/handle-error";
import { authMiddleware } from "../middlewares/auth.middleware";




const userRouter = new Hono<{ Bindings: Bindings }>();

userRouter.use('/*', authMiddleware)
userRouter.get('/profile_info', async (c) => {
   try {
      // const dbUrl = c.env.DATABASE_URL;
      if (!c.env) return c.json({ message: "Server configuration error" }, 503)
         const service = createUserService(c.env)
         const controller = createController(service)
      return await controller.getProfileInfo(c)
   
   } catch (error) {
      console.log(error)
      return handleError(c, error)
   }
})


userRouter.get('/myBlogs', async (c) => {
//   try {
      if(!c.env) return c.json({message: "Error server configuration"})
         const service = createUserService(c.env)
      const controller = createController(service)
      return controller.getUserBlogs(c)
//   } catch (error) {
//   return handleError(c, error)
//   }
 })

 userRouter.post("/logout", async(c) => {
   try {
   
   } catch (error) {
      return handleError(c, error)
   }
 })
  

export { userRouter }  