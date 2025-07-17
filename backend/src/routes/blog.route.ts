import { Hono } from 'hono';
import { Bindings } from '../types/binding.types';
import { createBlogService } from '../services/blog.service';
import { createBlogController } from '../controllers/blog.controller';
import { memo } from 'react';
 const blogRouter = new Hono<{Bindings: Bindings}>()


 blogRouter.get("/getBlogs/:page", async (c) => {
   try {
      if(!c.env.DATABASE_URL) return c.json({message: "Server configuration errro"}, 500)
         const service = createBlogService(c.env)
      const controller = createBlogController(service)
      return await controller.getBlogs(c)
   }
    catch (error) {
      throw new Error(`Cannot get blogs: ${String(error)}`)
   }
 })
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

blogRouter.patch('/updateBlog/:id', async (c) => {
   try {
      if(!c.env) return c.json({message: "Server configuration error"}, 500)
         const service = createBlogService(c.env)
      const controller = createBlogController(service)
      return await controller.updateBlog(c)
   } catch (error) {
      throw new Error(`Error updating the blog: ${error}`)
   }
})

blogRouter.delete('/delete/:id', async (c) => {
   try {
      if(!c.env) return c.json({message: "Server configuration eror"}, 500)
         const service = createBlogService(c.env)
      const controller = createBlogController(service)
      return await controller.deleteBlog(c)
   } catch (error) {
      throw new Error(`Error deleting the blog, ${String(error)}`)
   }
})

blogRouter.get("/getBlog/:id", async (c) => {
   try {
      if(!c.env) return c.json({message: "Server configuraton error"}, 500)
         const service = createBlogService(c.env)
      const controller = createBlogController(service)
      return await controller.getBlog(c)
   } catch (error) {
      throw new Error(`Blog not found, ${String(error)}`)
   }
})
export {blogRouter}