
import { Bindings } from './../types/env.types';
import { Hono } from "hono";
import { fetchTokenFromGoogle } from '../auth/auth';
import { GoogleAuthResponse } from '../types/auth.types';
import { Token } from '../types/jwt.types';
import { setCookies } from '../utils/setCookies';
import { createAuthService } from '../services/auth.service';
import createAuthController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const authRouter = new Hono<{ Bindings: Bindings }>()
// authRouter.use('/*', authMiddleware)
authRouter.get('/callback/google', async (c) => {
    if (!c.env) { return c.json({ message: "Server configuration error" }, 500) }
    const authService = createAuthService(c.env)
    const authController = createAuthController(authService)
    await authController.getAuthResponse(c)
    return c.redirect(c.env.REDIRECT_URI)
   
})

// authRouter('/refresh', async (c) => {
//     const authService = createAuthService(c.env)
//     const authController = createAuthController(authService)
//    return await authController.getRefreshToken()
// })

export { authRouter }