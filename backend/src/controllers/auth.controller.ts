import { Context } from "hono";
import { createUserService } from "../services/user.service";
import { EnvironmentVariables } from "../types/env.types";
import { fetchTokenFromGoogle } from "../auth/auth";
import { GoogleAuthResponse } from "../types/auth.types";
import { Token } from "../types/jwt.types";
import { createAuthService } from "../services/auth.service";
import { setCookies } from "../utils/setCookies";

class AuthController{
    constructor(private authService : ReturnType<typeof createAuthService> ){}

    async getAuthResponse(c: Context){
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = c.env
    const code = c.req.query('code');
    if(!code) return c.json({message: "Missing code"}, 400)
    const response= await fetchTokenFromGoogle(code, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) as GoogleAuthResponse;
    const{access_token} = response
    // const accessToken = access_token
    // const refreshToken = refresh_token
    // const token : Token = {accessToken, refreshToken}
    const result = await this.authService.auth(access_token)
    setCookies(c, result)
    // const userId = await jwtVerify(id_token, GOOGLE_CLIENT_SECRET)
    // console.log(userId)
    }
}

export default function createAuthController(obj: ReturnType<typeof createAuthService>){
    return new AuthController(obj)
}
