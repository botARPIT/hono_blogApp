import { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog } from "../repositories/blog.repository";
import { Bindings, EnvironmentVariables } from "../types/env.types";
import { AddBlogDTO, CreatedBlogDTO, DeletedBlogDTO, GetBlogDTO, UpdateBlogDTO } from "../types/blog.types";
import { NotFoundError } from "../errors/app-error";

class BlogService {
    constructor(private env : EnvironmentVariables) {}
    async addBlog(dto: AddBlogDTO, userId: string): Promise<CreatedBlogDTO>{
       return await createBlog(dto, userId, this.env.DATABASE_URL)

         
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

    async getBlog(id: string) : Promise<GetBlogDTO | null>{ 
       const response = await getBlogById(id, this.env.DATABASE_URL)
      if(response == null) throw new NotFoundError("Blog not found")
        else return response
    }
}

//factory function
export function createBlogService(env: Bindings){
    return new BlogService(env)
}