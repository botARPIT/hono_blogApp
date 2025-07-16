import { JwtPayload } from './../types/jwt.types';
import { AddBlogDTO, UpdateBlogDTO } from './../types/blog.types';
import { Context } from "hono";
import { createBlogService } from "../services/blog.service";
import { blogPolicy } from "../policies/blog.policy";
import { jwtVerify } from '../utils/jwt';

class BlogController{
    constructor(private blogService : ReturnType<typeof createBlogService>){}

    async addBlog(c: Context){
        const body = await c.req.json<AddBlogDTO>()
        const inputValidation = blogPolicy.validateAddBlog(body)
        if(!inputValidation.success) return c.json({message: "Invalid data", error: inputValidation.error}, 400)
            const result = await this.blogService.addBlog(inputValidation.data)
        return c.json(result)
    }

    async updateBlog(c: Context){
        const blogId = c.req.param("id")
        const body = await c.req.json<UpdateBlogDTO>()
        const inputValidation = blogPolicy.validateUpdateBlog(body)
        if(!blogId) return c.json({message: "Blog id missing"}, 400)
        if(!inputValidation.success) return c.json({message: "Invalid data", error: inputValidation.error}, 400)
            const result = await this.blogService.update(inputValidation.data, blogId )
        return c.json(result)

    }
}

// factory function
export function createBlogController(obj : ReturnType<typeof createBlogService>){
    return new BlogController(obj)
}