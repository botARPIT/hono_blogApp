
import { Hono } from 'hono';
import { Bindings } from '../types/binding.types';
import { createBlogService } from '../services/blog.service';
import { createBlogController } from '../controllers/blog.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { handleError } from '../errors/handle-error';
import { getStorageInfo, uploadFile } from '../repositories/blog.thumbnail.repository';

const blogRouter = new Hono<{ Bindings: Bindings,}>()

// blogRouter.use('/*', authMiddleware)




blogRouter.get("/blogs/:page", async (c) => {
   try {
      if (!c.env) return c.json({ message: "Server configuration error" }, 500)
      const service = createBlogService(c.env)
      const controller = createBlogController(service)
      return await controller.getBlogs(c)
   }
   catch (error) {
      return handleError(c, error)
   }
})

blogRouter.post('/addBlog', async (c) => {
   try {
      if (!c.env) return c.json({ message: "Server configuration error" }, 500)
      const service = createBlogService(c.env)
      const controller = createBlogController(service)
      return await controller.addBlog(c)
   } catch (error) {
      return handleError(c, error)
   }
})

blogRouter.patch('/updateBlog/:id', async (c) => {
   try {
      if (!c.env) return c.json({ message: "Server configuration error" }, 500)
      const service = createBlogService(c.env)
      const controller = createBlogController(service)
      return await controller.updateBlog(c)
   } catch (error) {
      return handleError(c, error)
   }
})

blogRouter.delete('/delete/:id', async (c) => {
   try {
      if (!c.env) return c.json({ message: "Server configuration error" }, 500)
      const service = createBlogService(c.env)
      const controller = createBlogController(service)
      return await controller.deleteBlog(c)
   } catch (error) {
      return handleError(c, error)
   }
})

blogRouter.get("/blog/:id", async (c) => {
   try {
      if (!c.env) return c.json({ message: "Server configuration error" }, 500)
      const service = createBlogService(c.env)
      const controller = createBlogController(service)
      return await controller.getBlog(c)
   } catch (error) {
      return handleError(c, error)
   }
})

blogRouter.post("/uploadImage", async (c) => {
   const data = await c.req.formData()
   const file = data.get('file') as File
   const userId = "123"
  await  getStorageInfo()
   const result = await uploadFile(file, userId)
   console.log(result)

})

export { blogRouter }