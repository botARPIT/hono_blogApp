
import { AppError, AuthError, BadRequestError, ErrorCode, NotFoundError, ServiceName, SeverityLevel, ValidationError } from "../errors/app-error";
import { createUser, findUniqueUser } from "../repositories/auth.repository";
import { GoogleUserDetails } from "../types/auth.types";
import { EnvironmentVariables } from "../types/env.types";
import { Token } from "../types/jwt.types";
import { CreatedUserDTO, UserSignInDTO, UserSignUpDTO } from "../types/user.types";
import { generateTokens, jwtVerify } from "../utils/jwt";
import { Context } from "hono";
import { setCookies } from "../utils/setCookies";
import { compareHash, hashPassword } from "../utils/hashUsingWebCrypto";
import { AuthProvider } from "@prisma/client/edge";
import { AppConfig } from "../config";


class AuthService {
    constructor(private env: AppConfig) { }

    async auth(accessToken: Token['accessToken']): Promise<Token> {
        const getUserInfoFromGoogle = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        if (!getUserInfoFromGoogle) throw new AuthError("Unable to get user info from Google", false, { message: "Check your internet connection and try again" })
        const details = await getUserInfoFromGoogle.json() as GoogleUserDetails
        if (!details) throw new NotFoundError("Unable to get user details", { message: "Try again with different email" })
        const existingUser = await findUniqueUser(details.email, this.env.DATABASE_URL)
        if (existingUser) {
            const { id, name } = existingUser
            const token: Token = generateTokens({ id, name }, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
            return token
        }
        const user = await createUser(details.name, details.email, null, this.env.DATABASE_URL, AuthProvider.GOOGLE)
        if (!user) throw new AppError("Unable to create user",
            500,
            ErrorCode.INTERNAL_ERROR,
            false,
            Date.now(),
            SeverityLevel.HIGH,
            { message: "Kindly retry signing up" },
            ServiceName.BUSINESS)
        const { id, name } = user
        const payload = { id, name }
        const token: Token = generateTokens(payload, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
        return token
    }

    async getRefreshToken(c: Context, refreshToken: string) {
        const payload = await jwtVerify(refreshToken, this.env.JWT_REFRESH_SECRET)
        if (!payload) throw new AuthError("Invalid/expired token", true, { message: "Try to signin" })
        if (payload) {
            const token = generateTokens(payload, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
            if (!token) throw new AuthError("Unable to generate token", false, { message: "Try to signin" })
            setCookies(c, token)
        }
        return
    }

    async signup(dto: UserSignUpDTO): Promise<Token> {
        const user = await findUniqueUser(dto.email, this.env.DATABASE_URL)
        if (user && user.password == null) throw new BadRequestError("User already exists", ServiceName.BUSINESS, { message: "Try to sign in with your google account" })
        else if (user && user.password != null) throw new BadRequestError("User already exists", ServiceName.BUSINESS, { message: "Try to sign in with your registered credentials" })
        let hashedPass;
        if (user === null && dto.password != null) { hashedPass = await hashPassword(dto.password) }
        if (!hashedPass) throw new AppError("Hashing service failed", 500, ErrorCode.INTERNAL_ERROR, false, Date.now(), SeverityLevel.CRITICAL, { message: "Enter the password again" }, ServiceName.BUSINESS)
        const userCreated: CreatedUserDTO | null = await createUser(dto.name, dto.email, hashedPass, this.env.DATABASE_URL, AuthProvider.LOCAL)
        if (!userCreated) throw new AppError("Unable to create user",
            500,
            ErrorCode.INTERNAL_ERROR,
            false,
            Date.now(),
            SeverityLevel.HIGH,
            { message: "Kindly retry signing up" },
            ServiceName.BUSINESS)
        const { id, name } = userCreated
        return generateTokens({ id, name }, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
    }

    async signin(dto: UserSignInDTO): Promise<Token> {
        let hasValidPass;
        const user = await findUniqueUser(dto.email, this.env.DATABASE_URL)
        if (!user) {
            throw new BadRequestError("User not found", ServiceName.BUSINESS, { message: "Kindly signup first" })
        }
        if (dto.password != null && user.password != null) { hasValidPass = await compareHash(dto.password, user.password) }
        if (!hasValidPass) {
            throw new ValidationError("Password does not match", ServiceName.BUSINESS, { message: "Enter correct password" })
        }
        const { id, name } = user
        const { accessToken, refreshToken } = generateTokens({ id, name }, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
        return { accessToken, refreshToken, name }
    }
}

export function createAuthService(env: AppConfig) {
    return new AuthService(env)
}