import { Hono } from 'hono'
import mainRouter from './routes/router'
import hashPassword from './utils/hashPassword'


const app = new Hono()

app.route("/", mainRouter)
export default app
