import { Context } from 'hono';
import { setCookie } from "hono/cookie"
import { Token } from "../types/jwt.types"

function setCookies(c:Context, token: Token){
    const {accessToken, refreshToken} = token
    setCookie(c, "access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        path: '/',
        maxAge: 60 * 60 
    })
    setCookie(c, "refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 2
    })
}

export {setCookies}