import { getPrismaClient } from "../lib/prisma";
import { Bindings } from "../types/binding.types";
import { AddBlogDTO } from "../types/blog.types";

export async function createBlog(dto: AddBlogDTO, dbUrl : Bindings["DATABASE_URL"]) {
    const prisma = getPrismaClient(dbUrl)
    try {
        const blog = await prisma.blog.create({
            data: {
                title: dto.title,
                content: dto.content,
                thumbnail: dto.thumbnail,
                authorId: dto.authorId
            }, 
            select: {
                id: true,
                title: true,
                content: true,
                thumbnail: true,
                authorId: true,
                createdAt: true,
                published: true
            }
        })

        return blog
    } catch (error) {
        throw new Error(`Failed to create blog: ${error}`)
    }
}