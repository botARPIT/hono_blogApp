import { getCookie } from "hono/cookie";
import { AppError, BadRequestError, ErrorCode, ServiceName, SeverityLevel } from "../errors/app-error";
import { createUser, findUniqueUser } from "../repositories/user.repository";
import { GoogleUserDetails } from "../types/auth.types";
import { EnvironmentVariables } from "../types/env.types";
import { Token } from "../types/jwt.types";
import { AuthProvider, CreatedUser } from "../types/user.types";
import { generateAccessToken, generateTokens, jwtVerify } from "../utils/jwt";
import { Context } from "hono";
import { setCookies } from "../utils/setCookies";

class AuthService {
    constructor(private env: EnvironmentVariables) { }

    async auth(accessToken: Token['accessToken']): Promise<Token> {
        const getUserInfoFromGoogle = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        const details = await getUserInfoFromGoogle.json() as GoogleUserDetails
        if (!details) throw new AppError("Unable to get user details", 500, ErrorCode.INTERNAL_ERROR, false, Date.now(), SeverityLevel.CRITICAL, { message: "Try with different email" }, ServiceName.BUSINESS)
        const existingUser = await findUniqueUser(details.email, this.env.DATABASE_URL)
            console.log(existingUser)
        if (existingUser) {
            const { id, name } = existingUser
            const token: Token = generateTokens({ id, name }, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
            console.log(token)
            return token
        }
        const user = await createUser(details.name, details.email, null, this.env.DATABASE_URL, AuthProvider.GOOGLE)
        const { id, name } = user
        const payload = { id, name }
        const token: Token = generateTokens(payload, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
        return token
    }

    async getRefreshToken(c: Context, refreshToken: string){
        try {
        const payload = await jwtVerify(refreshToken, this.env.JWT_REFRESH_SECRET)
        if(!payload) return c.json({message: "Invalid token"}, 401)

        if(payload) 
        {
            const token = generateTokens(payload, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
            setCookies(c, token)
        }
        return
        } catch (error) {
            throw new Error("Invalid jwt")
        }
    }
}
    
export function createAuthService(env: EnvironmentVariables) {
    return new AuthService(env)
}