import { Hono } from 'hono';
import { Bindings } from '../types/binding.types';
import { createBlogService } from '../services/blog.service';
import { createBlogController } from '../controllers/blog.controller';
 const blogRouter = new Hono<{Bindings: Bindings}>()

blogRouter.post('/addBlog', async (c) => {
   try {
     if(!c.env.DATABASE_URL) return c.json({messsage: "Server configuration error"}, 500)
    const service = createBlogService(c.env)
    const controller = createBlogController(service)
    return await controller.addBlog(c)   
   } catch (error) {
    throw new Error(`Error adding the blog: ${error}`)
   }
})

export {blogRouter}