import { Context } from "hono";
import { fetchTokenFromGoogle } from "../auth/auth";
import { GoogleAuthResponse } from "../types/auth.types";
import { createAuthService } from "../services/auth.service";
import { setCookies } from "../utils/setCookies";
import { getCookie } from "hono/cookie";
import { UserSignInDTO, UserSignUpDTO } from "../types/user.types";
import { userInputPolicy } from "../policies/user.policy";
import { ZodValidationError } from "../errors/app-error";
import { sanitizeText } from "../utils/sanitize";




class AuthController {
    constructor(private authService: ReturnType<typeof createAuthService>) { }
    async getAuthResponse(c: Context) {
        const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI } = c.env
        const { code, state } = c.req.query();
        if (!code) return c.json({ message: "Missing code" }, 400)
        const storedState = getCookie(c, "oauth_state")
        if (!storedState) return c.json({ message: "Missing state" }, 400)
        if (state !== storedState) return c.json({ message: "Invalid state" }, 400)
        const codeVerifier = getCookie(c, "code_verifier")
        if (!codeVerifier) return c.json({ message: "Missing code verifier" }, 400)
        const response = await fetchTokenFromGoogle(code, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, codeVerifier, REDIRECT_URI) as GoogleAuthResponse;
        const { id_token } = response
        if (!id_token) return c.json({ message: "Failed to get ID token from Google" }, 400)
        const result = await this.authService.authUsingGoogle(id_token)
        setCookies(c, result)
    }

    async generateRefreshToken(c: Context) {
        const refreshToken = getCookie(c, "refresh_token")
        if (!refreshToken) return c.json({ message: "Unauthorized" }, 401)
        return this.authService.getRefreshToken(c, refreshToken)
    }

    async signup(c: Context) {
        const body = await c.req.json<UserSignUpDTO>();
        const inputValidation = userInputPolicy.validateSignUp(body)
        if (!inputValidation.success) throw new ZodValidationError("Zod validation failed", { message: inputValidation.error })
        const result = await this.authService.signup(inputValidation.data)
        setCookies(c, result)
        return c.json(result)

    }

    async signin(c: Context) {
        const body = await c.req.json<UserSignInDTO>()
        const inputValidation = userInputPolicy.validateSignIn(body)
        if (!inputValidation.success) {
            throw new ZodValidationError("Validation error", { field: "Incorrect email/password", message: "Password should be of minimum 8 of characters" },)
        }
        const result = await this.authService.signin(inputValidation.data)
        setCookies(c, result)
        return c.json(result)
    }
}

export default function createAuthController(obj: ReturnType<typeof createAuthService>) {
    return new AuthController(obj)
}
