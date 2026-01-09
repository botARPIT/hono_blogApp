
import { Bindings } from './../types/env.types';
import { Hono } from "hono";
import crypto from "crypto";
import { createAuthService } from '../services/auth.service';
import createAuthController from '../controllers/auth.controller';
import { handleError } from '../errors/handle-error';
import { deleteCookie } from 'hono/cookie';
import { getConfig } from '../config'
import { generateCodeChallenge, generateCodeVerifier, setPKCECookies } from '../utils/pkce';
const authRouter = new Hono<{ Bindings: Bindings }>()

// Rate limitter for auth routes
// authRouter.use('/*', (c, next) => {
//    const config = getConfig(c.env)
//    return rateLimiter<{Bindings: Bindings}>({
//       windowMs: 15 * 60 * 1000,
//       limit: 20,
//       standardHeaders: 'draft-6',
//       keyGenerator: (c) => c.req.header('cf-connecting-ip') ?? "global",
//       store: new WorkersKVStore({namespace: config.RATE_LIMIT_KV})
//    })(c, next)
// })

authRouter.get('/google/callback', async (c) => {
   try {
      const config = getConfig(c.env)
      if (!c.env) { return c.json({ message: "Server configuration error" }, 500) }
      const authService = createAuthService(config)
      const authController = createAuthController(authService)
      const result = await authController.getAuthResponse(c)
      // If controller returned a response (error), return it
      if (result) return result
      // Otherwise redirect to frontend
      return c.redirect(config.FRONTEND_REDIRECT_URL)
   } catch (error) {
      // eslint-disable-next-line no-console
      console.error("OAuth callback error:", error)
      return c.json({ message: "OAuth authentication failed", error: String(error) }, 500)
   }
})

authRouter.get('/google', async (c) => {
   // Generate PKCE code verifier and challenge
   const codeVerifier = generateCodeVerifier()
   const codeChallenge = await generateCodeChallenge(codeVerifier)
   const state = crypto.randomUUID()

   // Store code_verifier and state in cookies for callback verification
   setPKCECookies(c, codeVerifier, state)

   const params = new URLSearchParams({
      client_id: c.env.GOOGLE_CLIENT_ID,
      redirect_uri: c.env.REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      state
   })
   const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
   return c.redirect(url)
})

authRouter.get('/refresh', async (c) => {
   const config = getConfig(c.env)
   if (!c.env) { return c.json({ message: "Server configuration error" }, 500) }
   const authService = createAuthService(config)
   const authController = createAuthController(authService)
   const res = await authController.generateRefreshToken(c)
   return c.json({ message: res })

})


authRouter.post('/signup', async (c) => {
   try {
      const config = getConfig(c.env)
      if (!c.env) return c.json({ message: "Server configuration error" }, 503)


      const authService = createAuthService(config)
      const controller = createAuthController(authService)
      return await controller.signup(c)

   } catch (error) {
      return handleError(c, error)
   }
})


authRouter.post('/signin', async (c) => {
   try {
      const config = getConfig(c.env)
      if (!c.env) return c.json({ message: "Server configuration error" }, 503)

      const authService = createAuthService(config)
      const controller = createAuthController(authService)
      return await controller.signin(c)
   } catch (error) {
      return handleError(c, error)
   }
})

authRouter.post("/logout", async (c) => {
   try {
      const isProduction = c.env.ENVIRONMENT === 'production';
      const cookieOptions = {
         path: '/',
         httpOnly: true,
         secure: isProduction,
         sameSite: isProduction ? 'None' as const : 'Lax' as const,
      };

      deleteCookie(c, 'access_token', cookieOptions)
      deleteCookie(c, 'refresh_token', cookieOptions)

      return c.json({ message: "User logged out" })
   } catch (error) {
      return handleError(c, error)
   }
})

export { authRouter }