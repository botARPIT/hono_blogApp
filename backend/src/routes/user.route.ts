
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie"
import { createUserService } from "../services/user.service";
import { generateAccessToken,  jwtVerify } from "../utils/jwt";

import 'dotenv/config'

import { Bindings } from '../types/env.types';
import createController from "../controllers/user.controller";
import { handleError } from "../errors/handle-error";
import { createHash } from "../utils/hash";
import {hashPassword} from "../utils/hashUsingWebCrypto";




const userRouter = new Hono<{ Bindings: Bindings }>();

userRouter.post('/signup', async (c) => {
   try {
      // const dbUrl = c.env.DATABASE_URL;
      if (!c.env) return c.json({ message: "Server configuration error" }, 503)

  
      const userService = createUserService(c.env)
      const controller = createController(userService)
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


userRouter.post('/signin', async (c) => {
  try {
    if (!c.env) return c.json({ message: "Server configuration error" }, 503)
      const userService = createUserService(c.env)
      const controller = createController(userService)
      return await controller.signin(c)
  } catch (error) {
  return handleError(c, error)
  }
 })

 userRouter.post("/logout", async(c) => {
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
   // const { email, password } = await c.req.json<UserSignInDTO>()

   // const registedUser = await signin(dbUrl, { email, password })

   // if (registedUser) {
   //    const { accessToken, refreshToken } = signInMiddleware(email, accessKey, refreshKey)
   //    console.log(accessToken, refreshToken)
   //    setCookie(c, "refreshToken", refreshToken, {
   //       httpOnly: true,
   //       secure: true,
   //       path: '/',
   //       sameSite: "Strict",
   //       maxAge: 60 * 60 * 24 * 7
   //    })
   //    return c.json({
   //       message: "Your token is generated",
   //       accessToken
   //    }, 200)
   // } else {
   //    console.log("User not found")
   // }



// userRouter.get("/getUser", async (c) => {
//    try {
//       const authHeader = c.req.header("Authorization");
//       if (!authHeader || !authHeader.startsWith("Bearer ")) return c.json({ message: "Invalid token"}, 404)

//       const token = authHeader.split(" ")[1];
//       if(!token) return c.json({message: "Cannot find token"}, 401)

//       const accessKey = c.env.JWT_ACCESS_SECRET;
//       if (!accessKey) {
//          console.log("JWT access key in missing in environment variables")
//          return c.json({message: "Serve configuration error"}, 500)
   

//       }
//       const verified = jwtVerify(token as string, accessKey)
//       if (!verified) return c.json({ message: "Invalid access" }, 400)
//       console.log( verified)
//       return c.json(verified)

//    } catch (error) {
//       throw new AppError("Internal server error")
//    }

// })

export { userRouter }  