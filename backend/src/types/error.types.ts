
export type ValidationError  ={
    field? : string,
    message: string
}

export type AuthError = {
    field?: string,
    message: string
}

export type PrismaError = {
    code?: string,
    message: string
}