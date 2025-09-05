
import {z} from "zod";
export type BlogDTO = {
    id: string,
    title: string,
    content: string,
    thumbnail: string,
    authorId: string,
    createdAt: Date,
    updatedAt: Date,
    like: number,
    published: boolean
}


export type AddBlogDTO = Pick<BlogDTO, 'title'  |'content'| 'thumbnail'>
export type CreatedBlogDTO = Omit<BlogDTO, 'updatedAt' | 'published' | 'like'>
export type UpdateBlogDTO = Partial<Pick<BlogDTO, 'title' | 'content' | 'thumbnail'>>
export type GetBlogDTO = Omit<BlogDTO, 'updatedAt' | 'published' | 'thumbnail' | 'authorId'>
export type DeletedBlogDTO = BlogDTO

export const blogSchema = z.object({
    id: z.string().trim().optional(),
    title: z.string().min(10, {message: "Title too short"}).max(100, {message: "Title cannot exceed 100 characters"}).trim(),
    content: z.string().min(150, {message: "Add more content"}).max(2000, {message: "Content cannot exceed 2000 characters"}).trim(),
    thumbnail: z.string().trim(),
    authorId: z.string().trim().optional()
})

export const updateBlogSchema = z.object({
    title: z.string().min(10, {message: "Title too short"}).max(100, {message: "Title cannot exceed 100 characters"}).trim().optional(),
    content: z.string().min(150, {message: "Add more content"}).max(2000, {message: "Content cannot exceed 2000 characters"}).trim().optional(),
    thumbnail: z.string().trim().optional(),
    authorId: z.string().trim().optional()
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
})