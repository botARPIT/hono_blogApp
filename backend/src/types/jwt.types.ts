export type JwtPayload = {
    id: string,
    name?: string,
    role?: string
}
export type Token = { accessToken: string, refreshToken: string, name?: string }