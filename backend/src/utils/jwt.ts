import jwt from "jsonwebtoken";
type JwtPayload = {
    id? : string,
    email: string,
    role? : string
}

export function generateAccessToken(payload: JwtPayload, ACCESS_KEY: string) : string {
    return jwt.sign( payload , ACCESS_KEY, { expiresIn: "1h" })
}

export  function generateTokens(payload: JwtPayload, ACCESS_KEY : string, REFRESH_KEY: string) : {accessToken: string, refreshToken: string}{
    const accessToken =  jwt.sign(payload, ACCESS_KEY, {expiresIn: "1h"})
    const refreshToken = jwt.sign(payload, REFRESH_KEY, {expiresIn: "7d"})
    return {accessToken, refreshToken}
}
export function jwtVerify(token: string, KEY: string): JwtPayload {
    return jwt.verify(token, KEY) as JwtPayload
}