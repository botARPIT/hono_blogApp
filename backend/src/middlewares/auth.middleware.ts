
import { Bindings } from '../types/env.types';
import { Context } from "hono";
import {createMiddleware} from 'hono/factory'

import type { JwtVariables } from 'hono/jwt';

import { jwtVerify } from '../utils/jwt';
import { BadRequestError, UnauthorizedError } from '../errors/app-error';
import { Token } from '../types/jwt.types';
import { getCookie } from 'hono/cookie';

enum AUTH_HEADER {Bearer = "Bearer", Basic = "Basic", Api_key ="Api_key"} 
type Variables = JwtVariables


export const authMiddleware = createMiddleware<{Bindings: Bindings, Variables: Variables}>(async (c: Context, next: () => Promise<void>)=>{
    const token = getCookie(c, "access_token")
    if(!token) return c.json({message: "Unauthorized"}, 401)
       try {
    const payload = await jwtVerify(token , c.env.JWT_ACCESS_SECRET)
    c.set("jwtPayload", payload)
    await next()
   } catch (error) {
    throw new UnauthorizedError("Unauthorized access")
   }
})
