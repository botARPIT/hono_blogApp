import { Hono } from 'hono'
import mainRouter from './routes/router'
import createHash from './utils/hash'


const app = new Hono()

app.route("/", mainRouter)
export default app
