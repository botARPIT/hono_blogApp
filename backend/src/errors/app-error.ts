
import { ContentfulStatusCode } from "hono/utils/http-status"

export enum ErrorCode {
    BAD_REQUEST = "BAD REQUEST",
    UNAUTHORIZED = "UNAUTHORIZED",
    NOT_FOUND = "NOT FOUND",
    VALIDATION_ERROR = "VALIDATION ERROR",
    INTERNAL_ERROR = "INTERNAL ERROR",
    ZOD_ERROR = "ZOD_ERROR",
    PRISMA_ERROR = "PRISMA_ERROR"
 }
export class AppError extends Error{
   public statusCode : ContentfulStatusCode
   public code : ErrorCode
   public details? : unknown
   constructor(message: string, statusCode = 500 as ContentfulStatusCode, code: ErrorCode = ErrorCode.INTERNAL_ERROR, details?: unknown){
    super(message)
    this.statusCode = statusCode,
    this.code = code 
    this.details = details
    Object.setPrototypeOf(this, AppError.prototype) //Ensures AppError instance of Error == true
   }
}

export class ValidationError extends AppError{
    constructor(message: string, details?: unknown){
        super(message, 400, ErrorCode.BAD_REQUEST, details)
    }
}

export class NotFoundError extends AppError{
    constructor(message: string){
        super(message, 404, ErrorCode.NOT_FOUND)
    }
}

export class UnauthorizedError extends AppError{
    constructor(message: string,){
        super(message, 401, ErrorCode.UNAUTHORIZED)
    }
}

export class BadRequestError extends AppError{
    constructor(message: string){
        super(message, 400, ErrorCode.BAD_REQUEST)
    }
}

export class ZodError extends AppError{
    constructor(message: string){
        super(message, 400, ErrorCode.ZOD_ERROR)
    }
}