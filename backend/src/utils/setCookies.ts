import { Context } from 'hono';
import { setCookie } from "hono/cookie"
import { Token } from "../types/jwt.types"
import { Bindings } from "../types/env.types"

function setCookies(c: Context<{ Bindings: Bindings }>, token: Token) {
    const { accessToken, refreshToken } = token

    // Determine environment explicitly from typed bindings
    const isProduction = c.env.ENVIRONMENT === 'production';

    setCookie(c, "access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
        maxAge: 60 * 60
    })
    setCookie(c, "refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
        maxAge: 60 * 60 * 24 * 2
    })
}


export { setCookies }