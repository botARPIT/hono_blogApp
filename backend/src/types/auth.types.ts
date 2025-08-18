export type GoogleAuthResponse = {
    access_token: string,
    expires_in: number,
    refresh_token: string,
    scope: string,
    token_type: string | "Bearer",
    id_token: string,
    errro? :string |  {
        code?: number,
        message: string,
        status?: string
    },
    error_description?: string
}

export type GoogleUserDetails = {
    sub: string,
    name: string,
    first_name: string,
    last_name: string,
    profileImageUrl: string,
    email: string,
    isEmailVerified: boolean
}