import { getCookie } from "hono/cookie";
import { AppError, BadRequestError, ErrorCode, ServiceName, SeverityLevel, ValidationError } from "../errors/app-error";
import { createUser, findUniqueUser } from "../repositories/auth.repository";
import { GoogleUserDetails } from "../types/auth.types";
import { EnvironmentVariables } from "../types/env.types";
import { Token } from "../types/jwt.types";
import { AuthProvider, CreatedUser, UserSignInDTO, UserSignUpDTO } from "../types/user.types";
import { generateAccessToken, generateTokens, jwtVerify } from "../utils/jwt";
import { Context } from "hono";
import { setCookies } from "../utils/setCookies";
import { compareHash, hashPassword } from "../utils/hashUsingWebCrypto";

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

    async signup(dto: UserSignUpDTO): Promise<Token> {
    console.log("Signup service hit!")
    const user = await findUniqueUser(dto.email, this.env.DATABASE_URL)
    console.log("User found from user service")
    if (user && user.password == null) throw new BadRequestError("User already exists", ServiceName.BUSINESS, { message: "Try to sign in with your google account" })
    else if (user && user.password != null) throw new BadRequestError("User already exists", ServiceName.BUSINESS, { message: "Try to sign in with your registered credentials" })
    let hashedPass;
    if (dto.password != null) { hashedPass = await hashPassword(dto.password) }
    if (!hashedPass) throw new AppError("Hashing service failed", 500, ErrorCode.INTERNAL_ERROR, false, Date.now(), SeverityLevel.CRITICAL, { message: "Enter the password again" }, ServiceName.BUSINESS)
    console.log("This is hashed passwrod", hashedPass)
    const userCreated = await createUser(dto.name, dto.email, hashedPass, this.env.DATABASE_URL, AuthProvider.LOCAL)
    const { id, name } = userCreated
    console.log("User created", userCreated)
    const payload = { id, name }
    const token: Token = generateTokens(payload, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
    return token

  }

  async signin(dto: UserSignInDTO): Promise<Token> {
    let hasValidPass;
    const user = await findUniqueUser(dto.email, this.env.DATABASE_URL)
    if (!user) {
      throw new BadRequestError("User not found", ServiceName.BUSINESS, { message: "Kindly signup first" })
    }
    console.log(user)
    if (dto.password != null && user.password != null) { hasValidPass = await compareHash(dto.password, user.password) }
    console.log()
    if (!hasValidPass) {
      throw new ValidationError("Password does not match", ServiceName.BUSINESS, { message: "Enter correct password" })
    }
    const { id, name } = user
    const payload = { id, name }
    const { accessToken, refreshToken } = generateTokens(payload, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
    return { accessToken: accessToken, refreshToken: refreshToken }
  }
}
    
export function createAuthService(env: EnvironmentVariables) {
    return new AuthService(env)
}