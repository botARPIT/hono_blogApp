
import { AppError, AuthError, BadRequestError, ErrorCode, ServiceName, SeverityLevel, ValidationError } from "../errors/app-error";
import { createUser, findUniqueUser } from "../repositories/auth.repository";
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

    async authUsingGoogle(idToken: string): Promise<Token> {
        // Decode ID token to extract user info (it's a JWT)
        // ID token structure: header.payload.signature (base64url encoded)
        const tokenParts = idToken.split('.')
        if (tokenParts.length !== 3) {
            throw new AuthError("Invalid ID token format", false, { message: "Authentication failed" })
        }

        // Decode the payload (second part of the JWT)
        const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')))

        // Extract user details from ID token claims
        const { sub: _sub, email, name } = payload as { sub: string; email: string; name: string }

        if (!email) {
            throw new AuthError("Email not found in ID token", false, { message: "Please ensure you've granted email permission" })
        }

        const existingUser = await findUniqueUser(email, this.env.DATABASE_URL)
        if (existingUser) {
            const { id, name: userName } = existingUser
            const token: Token = generateTokens({ id, name: userName }, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
            return token
        }

        // Use name from ID token, fallback to email prefix if not available
        const userName = name || email.split('@')[0]
        const user = await createUser(userName, email, null, this.env.DATABASE_URL, AuthProvider.GOOGLE)
        if (!user) throw new AppError("Unable to create user",
            500,
            ErrorCode.INTERNAL_ERROR,
            false,
            Date.now(),
            SeverityLevel.HIGH,
            { message: "Kindly retry signing up" },
            ServiceName.BUSINESS)
        const { id } = user
        const token: Token = generateTokens({ id, name: userName }, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
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