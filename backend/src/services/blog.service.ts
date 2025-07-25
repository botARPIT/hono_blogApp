import { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog } from "../repositories/blog.repository";
import { Bindings } from "../types/binding.types";
import { AddBlogDTO, CreatedBlogDTO, DeletedBlogDTO, GetBlogDTO, UpdateBlogDTO } from "../types/blog.types";

class BlogService {
    constructor(private env : Bindings) {}
    async addBlog(dto: AddBlogDTO): Promise<CreatedBlogDTO>{
       return await createBlog(dto, this.env.DATABASE_URL)
         
    }

    async update(dto: UpdateBlogDTO, blogId: string, authorId: string) : Promise<UpdateBlogDTO>{
        return await updateBlog(dto, blogId, authorId, this.env.DATABASE_URL)

    }

    async getBlogs(page: number) : Promise<GetBlogDTO[]> {
        return await getAllBlogs(page, this.env.DATABASE_URL)
    }

    async delete(id: string, authorId: string): Promise<DeletedBlogDTO>{
        return await deleteBlog(id, authorId, this.env.DATABASE_URL)
      
    }

    async getBlog(id: string) : Promise<GetBlogDTO>{
       return await getBlogById(id, this.env.DATABASE_URL)
      
    }
}

//factory function
export function createBlogService(env: Bindings){
    return new BlogService(env)
}