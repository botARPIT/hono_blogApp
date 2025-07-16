import { getPrismaClient } from "../lib/prisma";
import { Bindings } from "../types/binding.types";
import { AddBlogDTO, CreatedBlogDTO, UpdateBlogDTO } from "../types/blog.types";

export async function createBlog(dto: AddBlogDTO, dbUrl: Bindings["DATABASE_URL"]) {
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

export async function updateBlog(dto: UpdateBlogDTO, blogId: string, dbUrl: Bindings["DATABASE_URL"]) {
    try {
        const prisma = getPrismaClient(dbUrl)

        const updateData = Object.fromEntries(Object.entries(dto).filter(([_,v] )=> v !== undefined))
        const updatedBlog = await prisma.blog.update({
            where: {
                id: blogId,
                authorId: dto.authorId
            },
            data: updateData
        })
        return updatedBlog
    } catch (error) {
        throw new Error(`Failed to update blog: ${error}`)
    }
}