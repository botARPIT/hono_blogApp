
import { AddBlogDTO, UpdateBlogDTO } from './../types/blog.types';
import { Context } from "hono";
import { createBlogService } from "../services/blog.service";
import { blogPolicy } from "../policies/blog.policy";
import { BadRequestError, ServiceName, ValidationError } from '../errors/app-error';


class BlogController {
    constructor(private blogService: ReturnType<typeof createBlogService>) {}

    async addBlog(c: Context) {
        const body = await c.req.json<AddBlogDTO>()
        console.log("blog body", body)
        const inputValidation = blogPolicy.validateAddBlog(body)
        console.log("validation", inputValidation)
        const {id: userId} = c.get("jwtPayload")
        if (!inputValidation.success) throw new ValidationError("Invalid input", ServiceName.CONTROLLER, {message: "Kindly provide input in all fields"})
        const result = await this.blogService.addBlog(inputValidation.data, userId)
        return c.json(result)
    }

    async updateBlog(c: Context) {
        const blogId = c.req.param('id')
        const body = await c.req.json<UpdateBlogDTO>()
        const inputValidation = blogPolicy.validateUpdateBlog(body)
        const { id: userId } = c.get('jwtPayload')
        if (!blogId || !userId) throw new BadRequestError("Blog or user id missing",ServiceName.CONTROLLER, {message: "Retry with correct user/blog id"})
        if (!inputValidation.success) throw new ValidationError("Invalid input", ServiceName.CONTROLLER)
        const result = await this.blogService.update(inputValidation.data, blogId, userId)
        return c.json(result)

    }

    async getBlogs(c: Context) {
        const page = parseInt(c.req.param('page'))
        if (Number.isNaN(page) || page <= 0) throw new BadRequestError("Missing / Invalid page number", ServiceName.CONTROLLER, {message: "Cannot find the requested page"})
        const result = await this.blogService.getBlogs(page)
        return c.json(result)
    }

    async deleteBlog(c: Context) {
        const blogId: string = c.req.param('id')
        const { id: userId } = c.get('jwtPayload')
        if (!blogId || !userId) throw new BadRequestError("Blog or user ID missing", ServiceName.CONTROLLER, {message: "Credentials required for deleting the blog"})
        const result = await this.blogService.delete(blogId, userId)
        return c.json(result)
    }

    async getBlog(c: Context) {
        const id = c.req.param('id')
        if (!id) throw new BadRequestError("Blog id missing", ServiceName.CONTROLLER, {message: "Kindly provide blog id"})
        const result = await this.blogService.getBlog(id)
        return c.json(result)
    }
}

// factory function
export function createBlogController(obj: ReturnType<typeof createBlogService>) {
    return new BlogController(obj)
}