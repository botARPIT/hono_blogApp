
import { Bindings } from './../types/binding.types';
import { Context } from "hono";
import {createMiddleware} from 'hono/factory'
import { jwt, } from 'hono/jwt';
import type { JwtVariables } from 'hono/jwt';
import { verify } from 'jsonwebtoken';
import { jwtVerify } from '../utils/jwt';


type Variables = JwtVariables
export const authMiddleware = createMiddleware<{Bindings: Bindings, Variables: Variables}>(async (c: Context, next: () => Promise<void>)=>{
   try {
     const authHeader = c.req.header("Authorization")
    const token = authHeader?.split(' ')[1]
    if(!token) return c.json({message: "Missing token"}, 400)
    const payload = jwtVerify(token, c.env.JWT_ACCESS_SECRET)
    c.set("jwtPayload", payload)
    await next()
   } catch (error) {
    throw new Error(`Unauthorized: Invalid or exprired token, ${String(error)}`)
   }
})
