import { Context, Next } from "hono";
import { AppError, NotFoundError } from "../errors/app-error";


export async function handleErrorMiddleware
( error: unknown, c: Context,){
// try {
//    await next();
// } catch (error) {
       if(error instanceof AppError){
        return c.json({
            error: {
                code: error.errorCode,
                message: error.message,
                meta: error.meta || null,
                timestamp: error.timestamp,
                isOperational: error.isOperational,
                severityLevel : error.severityLevel,
                serviceName : error.serviceName
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