import { Hono } from 'hono'
import mainRouter from './routes/router'



const app = new Hono()

app.route("/", mainRouter)
export default app
