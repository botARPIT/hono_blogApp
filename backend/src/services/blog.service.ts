import { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog } from "../repositories/blog.repository";
import { Bindings } from "../types/binding.types";
import { AddBlogDTO, CreatedBlogDTO, DeletedBlogDTO, GetBlogDTO, UpdateBlogDTO } from "../types/blog.types";
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

    async getBlogs(page: number) : Promise<GetBlogDTO[]> {
        return await getAllBlogs(page, this.env.DATABASE_URL)
    }

    async delete(id: string, authorId: string): Promise<DeletedBlogDTO>{
        const result =  await deleteBlog(id, authorId, this.env.DATABASE_URL)
        if(!result.success) throw new Error(`Delete failed: ${String(result.error)}`)
        return result.data
    }

    async getBlog(id: string) : Promise<GetBlogDTO>{
        const result = await getBlogById(id, this.env.DATABASE_URL)
        if(!result.success) throw new Error(`Blog not found: ${String(result.error)}`)
            return result.data
    }
}

//factory function
export function createBlogService(env: Bindings){
    return new BlogService(env)
}