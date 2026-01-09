import { Context } from "hono";
import { AppError } from "../errors/app-error";
import { sanitizeObject } from "../utils/sanitize";


export async function handleErrorMiddleware
    (error: unknown, c: Context,) {
    // try {
    //    await next();
    // } catch (error) {
    if (error instanceof AppError) {
        const safeMeta = error.meta ? sanitizeObject(error.meta) : null
        return c.json({
            error: {
                code: error.errorCode,
                message: error.message,
                meta: safeMeta || null,
                timestamp: error.timestamp,
                isOperational: error.isOperational,
                severityLevel: error.severityLevel,
                serviceName: error.serviceName
            }
        }, error.statusCode)
    }

    return c.json({
        error: {
            code: "INTERNAL ERROR",
            message: "Something went wrong"
        }
    }, 500)
}

// }