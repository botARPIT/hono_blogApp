import { Context } from "hono";
import { AppError } from "./app-error";

export function handleError(c: Context, error: unknown){
    if(error instanceof AppError){
        return c.json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.details || null
            }
        }, error.statusCode)
    }

    return c.json({
        success: false,
        error: {
            code: "INTERNAL ERROR",
            message: "Something went wrong"
        }
    }, 500)
}