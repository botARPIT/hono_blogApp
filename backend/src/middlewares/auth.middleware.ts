
import { Bindings } from './../types/binding.types';
import { Context } from "hono";
import {createMiddleware} from 'hono/factory'

import type { JwtVariables } from 'hono/jwt';

import { jwtVerify } from '../utils/jwt';
import { BadRequestError, UnauthorizedError } from '../errors/app-error';
import { Token } from '../types/jwt.types';
import { getCookie } from 'hono/cookie';

enum AUTH_HEADER {Bearer = "Bearer", Basic = "Basic", Api_key ="Api_key"} 
type Variables = JwtVariables
// export const authMiddleware = createMiddleware<{Bindings: Bindings, Variables: Variables}>(async (c: Context, next: () => Promise<void>)=>{
//    try {
//     const authHeader = c.req.header("Authorization")
//     if(!authHeader) throw new BadRequestError("Missing authorization token")
//    //    const[header, token] = authHeader.split(' ')

//    //  if(header !== AUTH_HEADER.Bearer || !token){
//    //    throw new BadRequestError("Invalid Authorization format")
//    //  }
//     const header = authHeader.startsWith(AUTH_HEADER.Bearer)
//     if(!header) return c.json({message: "Missing / Invalid header"}, 400)
//     const token : Token["accessToken"] = authHeader.split(' ')[1]
//     if(!token) return c.json({message: "Missing token"}, 400)
//     const payload = jwtVerify(token , c.env.JWT_ACCESS_SECRET)
//     c.set("jwtPayload", payload)
//     await next()
//    } catch (error) {
//     throw new UnauthorizedError("Unauthorized access")
//    }
// })

export const authMiddleware = createMiddleware<{Bindings: Bindings, Variables: Variables}>(async (c: Context, next: () => Promise<void>)=>{
  
   //  const authHeader = c.req.header("Authorization")
   //  if(!authHeader) throw new BadRequestError("Missing authorization token")
   //    const[header, token] = authHeader.split(' ')

   //  if(header !== AUTH_HEADER.Bearer || !token){
   //    throw new BadRequestError("Invalid Authorization format")
   //  }
    const token = getCookie(c, "access_token")
    if(!token) return c.json({message: "Unauthorized"}, 401)
       try {
    const payload = jwtVerify(token , c.env.JWT_ACCESS_SECRET)
    c.set("jwtPayload", payload)
    await next()
   } catch (error) {
    throw new UnauthorizedError("Unauthorized access")
   }
})
