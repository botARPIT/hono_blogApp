

import { ContentfulStatusCode } from "hono/utils/http-status"

export enum ErrorCode {
    BAD_REQUEST = "BAD REQUEST",
    UNAUTHORIZED = "UNAUTHORIZED",
    NOT_FOUND = "NOT FOUND",
    VALIDATION_FAILED = "VALIDATION FAILED",
    INTERNAL_ERROR = "INTERNAL ERROR",
    ZOD_ERROR = "ZOD_ERROR",
    DB_ERROR = "DB_ERROR"
}

export enum SeverityLevel {
    CRITICAL = "CRITICAL",
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}

export enum ServiceName {
    BUSINESS = "BUSINESS",
    DB = "DB",
    CONTROLLER = "CONTROLLER",
    ROUTER = "ROUTER",
    MIDDLEWARE = "MIDDLEWARE"
}

export class AppError extends Error {
    public readonly statusCode: ContentfulStatusCode
    public readonly errorCode: ErrorCode
    public readonly meta?: Record<string, any>
    public readonly timestamp: number
    public readonly severityLevel?: SeverityLevel
    public readonly serviceName?: ServiceName
    public readonly isOperational: boolean
    constructor(message: string, statusCode = 500 as ContentfulStatusCode, errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR, isOperational: boolean, timestamp = Date.now(), severityLevel: SeverityLevel = SeverityLevel.LOW, meta?: Record<string, any> , serviceName?: ServiceName) {
        super(message)
        Error.captureStackTrace(this, this.constructor)
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.meta = meta;
        this.severityLevel = severityLevel;
        this.serviceName = serviceName;
        this.timestamp = timestamp;
        this.isOperational = isOperational
        
        Object.setPrototypeOf(this, AppError.prototype) //Ensures AppError instance of Error == true
    }
}

export class ValidationError extends AppError {
    constructor(message : string = "Validation Failed", serviceName: ServiceName, meta?: Record<string, any>, ) {
        super(message, 400, ErrorCode.VALIDATION_FAILED, true, Date.now(),  SeverityLevel.LOW, meta , serviceName )
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found", meta: Record<string, any> = {reason : "Resource does not exist"}) {
        super(message, 404, ErrorCode.NOT_FOUND, false, Date.now(), SeverityLevel.LOW, meta, ServiceName.DB)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized access to the resource", meta: Record<string, any> = {reason : "You don't have necessary permissions"} ) {
        super(message, 401, ErrorCode.UNAUTHORIZED, true, Date.now(), SeverityLevel.MEDIUM, meta, ServiceName.MIDDLEWARE)
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = "Bad Request", serviceName: ServiceName ,meta?: Record<string, any> ) {
        super(message, 400, ErrorCode.BAD_REQUEST, true, Date.now(), SeverityLevel.LOW, meta,  serviceName )
    }
}

export class ZodValidationError extends AppError {
    constructor(message: string = "Zod validation error", meta: Record<string, any>) {
        super(message, 400, ErrorCode.ZOD_ERROR, true, Date.now(), SeverityLevel.LOW, meta, ServiceName.CONTROLLER)
    }
}

export class DBError extends AppError {
    constructor(message: string , meta: Record<string, any>) {
        super(message, 400, ErrorCode.DB_ERROR, true, Date.now(), SeverityLevel.MEDIUM, meta, ServiceName.DB)
    }
}