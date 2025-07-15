import { createBlog } from "../repositories/blog.repository";
import { Bindings } from "../types/binding.types";
import { AddBlogDTO, CreatedBlogDTO } from "../types/blog.types";

class BlogService {
    constructor(private env : Bindings) {}
    async addBlog(dto: AddBlogDTO): Promise<CreatedBlogDTO>{
        const blog = await createBlog(dto, this.env.DATABASE_URL)
        return blog
    }
}

//factory function
export function createBlogService(env: Bindings){
    return new BlogService(env)
}