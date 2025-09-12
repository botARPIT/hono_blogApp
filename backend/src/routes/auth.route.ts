
import { Bindings } from './../types/env.types';
import { Hono } from "hono";
import { fetchTokenFromGoogle } from '../auth/auth';
import { GoogleAuthResponse } from '../types/auth.types';
import { Token } from '../types/jwt.types';
import { setCookies } from '../utils/setCookies';
import { createAuthService } from '../services/auth.service';
import createAuthController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { handleError } from '../errors/handle-error';
import { deleteCookie } from 'hono/cookie';

const authRouter = new Hono<{ Bindings: Bindings }>()
// authRouter.use('/*', authMiddleware)
authRouter.get('/callback/google', async (c) => {
    if (!c.env) { return c.json({ message: "Server configuration error" }, 500) }
    const authService = createAuthService(c.env)
    const authController = createAuthController(authService)
    await authController.getAuthResponse(c)
    return c.redirect(c.env.REDIRECT_URI)
   
})

authRouter.get('/refresh', async (c) => {
    if(!c.env) {return c.json({message: "Server configuration error"}, 500)}
    const authService = createAuthService(c.env)
    const authController = createAuthController(authService)
    const res = await authController.generateRefreshToken(c)
    return c.json({message: res})

})


authRouter.post('/signup', async (c) => {
   try {
      // const dbUrl = c.env.DATABASE_URL;
      if (!c.env) return c.json({ message: "Server configuration error" }, 503)

  
      const authService = createAuthService(c.env)
      const controller = createAuthController(authService)
      // await webCrypto()
      // await hashPassword("This is a test password")
      // const start = performance.now()
      // await createHash("This is a test")
      // console.log("Time required to create hash", performance.now() - start)
      return await controller.signup(c)
   
   } catch (error) {
      console.log(error)
      return handleError(c, error)
   }
})


authRouter.post('/signin', async (c) => {
  try {
    if (!c.env) return c.json({ message: "Server configuration error" }, 503)
      
      const authService = createAuthService(c.env)
      const controller = createAuthController(authService)
      return await controller.signin(c)
  } catch (error) {
  return handleError(c, error)
  }
 })

 authRouter.post("/logout", async(c) => {
   try {
     deleteCookie(c, 'access_token', {
      secure: true,
      sameSite: 'None',
      httpOnly: true
     })
     return c.json({message: "User logged out"})
   } catch (error) {
      return handleError(c, error)
   }
 })

export { authRouter }