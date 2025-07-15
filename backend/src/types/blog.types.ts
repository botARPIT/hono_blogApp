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


export type AddBlogDTO = Pick<BlogDTO, 'title'  |'content'| 'thumbnail' | 'authorId'>
export type CreatedBlogDTO = Omit<BlogDTO, 'updatedAt' | 'published' | 'like'>

export const blogSchema = z.object({
    id: z.string().trim().optional(),
    title: z.string().min(10, {message: "Title too short"}).max(100, {message: "Title cannot exceed 100 characters"}),
    content: z.string().min(150, {message: "Add more content"}).max(2000, {message: "Content cannot exceed 2000 characters"}),
    thumbnail: z.string(),
    authorId: z.string()
})
