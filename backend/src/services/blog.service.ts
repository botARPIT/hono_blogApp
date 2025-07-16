import { createBlog, updateBlog } from "../repositories/blog.repository";
import { Bindings } from "../types/binding.types";
import { AddBlogDTO, CreatedBlogDTO, UpdateBlogDTO } from "../types/blog.types";
import { JwtPayload } from "../types/jwt.types";

class BlogService {
    constructor(private env : Bindings) {}
    async addBlog(dto: AddBlogDTO): Promise<CreatedBlogDTO>{
        const blog = await createBlog(dto, this.env.DATABASE_URL)
        return blog
    }

    async update(dto: UpdateBlogDTO, blogId: string) : Promise<UpdateBlogDTO>{
        const blog = await updateBlog(dto, blogId, this.env.DATABASE_URL)
        return blog
    }
}

//factory function
export function createBlogService(env: Bindings){
    return new BlogService(env)
}