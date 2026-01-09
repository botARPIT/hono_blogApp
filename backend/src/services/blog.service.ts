import { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog, getUserBlogs, likeBlog, hasUserLikedBlog } from "../repositories/blog.repository";
import { AddBlogDTO, CreatedBlogDTO, DeletedBlogDTO, GetBlogDTO, UpdateBlogDTO } from "../types/blog.types";
import { NotFoundError } from "../errors/app-error";
import { AppConfig } from "../config";

class BlogService {
    constructor(private env: AppConfig) { }
    async addBlog(dto: AddBlogDTO, userId: string): Promise<CreatedBlogDTO> {
        return await createBlog(dto, userId, this.env.DATABASE_URL)


    }

    async update(dto: UpdateBlogDTO, blogId: string, authorId: string): Promise<UpdateBlogDTO> {
        return await updateBlog(dto, blogId, authorId, this.env.DATABASE_URL)

    }

    async getBlogs(page: number): Promise<GetBlogDTO[]> {
        const result = await getAllBlogs(page, this.env.DATABASE_URL)
        if (!result.length) throw new NotFoundError("Cannot find blogs")
        else return result

    }

    async delete(id: string, authorId: string): Promise<DeletedBlogDTO> {
        return await deleteBlog(id, authorId, this.env.DATABASE_URL)

    }

    async getUserBlogs(userId: string): Promise<GetBlogDTO[]> {
        const blogs = await getUserBlogs(userId, this.env.DATABASE_URL)
        return blogs || []
    }


    async getBlog(id: string): Promise<GetBlogDTO> {
        const result = await getBlogById(id, this.env.DATABASE_URL)
        if (result == null) throw new NotFoundError("Blog not found")
        else return result
    }

    async like(blogId: string, userId: string): Promise<{ like: number; hasLiked: boolean }> {
        return await likeBlog(blogId, userId, this.env.DATABASE_URL)
    }

    async hasUserLikedBlog(blogId: string, userId: string): Promise<boolean> {
        return await hasUserLikedBlog(blogId, userId, this.env.DATABASE_URL)
    }
}

//factory function
export function createBlogService(env: AppConfig) {
    return new BlogService(env)
}