import { ZodError } from "zod"

export type ValidationError = {
    field?: string,
    error: ZodError
}

export type AuthError = {
    field?: string,
    message: string
}

export type PrismaError = {
    code?: string,
    message: string
}