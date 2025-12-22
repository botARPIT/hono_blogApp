import { Hono } from 'hono'
import mainRouter from './routes'
import { cors } from 'hono/cors'
import { ACCEPTED_FRONTEND_ORIGIN } from './config'
import docsApp from './openapi.routes'


const app = new Hono()

app.use("/*", cors({
    origin: [ACCEPTED_FRONTEND_ORIGIN,
        "http://localhost:5173"],
    credentials: true
}))

app.route("/", mainRouter)
app.route("/docs", docsApp)
export default app
