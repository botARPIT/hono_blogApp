import { AddBlogDTO } from './../types/blog.types';
import { Context } from "hono";
import { createBlogService } from "../services/blog.service";
import { blogPolicy } from "../policies/blog.policy";

class BlogController{
    constructor(private blogService : ReturnType<typeof createBlogService>){}

    async addBlog(c: Context){
        const body = await c.req.json<AddBlogDTO>()
        const inputValidation = blogPolicy.validate(body)
        if(!inputValidation.success) return c.json({message: "Invalid data", error: inputValidation.error}, 400)
            const result = await this.blogService.addBlog(inputValidation.data)
        return c.json(result)
    }
}

// factory function
export function createBlogController(obj : ReturnType<typeof createBlogService>){
    return new BlogController(obj)
}