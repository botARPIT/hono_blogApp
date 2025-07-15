import jwt from "jsonwebtoken";


export function generateAccessToken(payload: string, ACCESS_KEY: string) {
    return jwt.sign( payload , ACCESS_KEY, { expiresIn: "1h" })
}

export function generateTokens(payload: string, ACCESS_KEY : string, REFRESH_KEY: string){
    const accessToken = jwt.sign(payload, ACCESS_KEY, {expiresIn: "1h"})
    const refreshToken = jwt.sign(payload, REFRESH_KEY, {expiresIn: "7d"})
    return {accessToken, refreshToken}
}
export function jwtVerify(token: string, KEY: string) {
    return jwt.verify(token, KEY)
}