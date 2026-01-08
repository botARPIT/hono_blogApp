import { Hono } from 'hono'
import mainRouter from './routes'
import { cors } from 'hono/cors'
import { getAllowedOrigins } from './config'
import docsApp from './openapi.routes'
import { Bindings } from './types/env.types'


const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware - origins determined by environment
app.use("/*", (c, next) => {
    const origins = getAllowedOrigins(c.env)
    return cors({
        origin: origins,
        credentials: true
    })(c, next)
})

app.route("/", mainRouter)
app.route("/docs", docsApp)
export default app
