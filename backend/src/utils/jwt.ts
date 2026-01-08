import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/jwt.types";


export function generateAccessToken(payload: JwtPayload, ACCESS_KEY: string): string {
    return jwt.sign(payload, ACCESS_KEY, { expiresIn: "1h" })
}

export function generateTokens(payload: JwtPayload, ACCESS_KEY: string, REFRESH_KEY: string): { accessToken: string, refreshToken: string, name?: string } {
    const accessToken = jwt.sign(payload, ACCESS_KEY, { expiresIn: "1h" })
    const refreshToken = jwt.sign(payload, REFRESH_KEY, { expiresIn: "7d" })
    return { accessToken, refreshToken, name: payload.name }
}
export async function jwtVerify(token: string, KEY: string): Promise<JwtPayload> {
    return jwt.verify(token, KEY, { algorithms: ['HS256'] }) as JwtPayload
}