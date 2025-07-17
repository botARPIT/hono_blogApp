
import { getPrismaClient } from "../lib/prisma";
import { Bindings } from "../types/binding.types";
import { AddBlogDTO, CreatedBlogDTO, DeletedBlogDTO, GetBlogDTO, UpdateBlogDTO } from "../types/blog.types";
import { PrismaError } from "../types/error";
import { Result } from "../types/result";


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

        const updateData = Object.fromEntries(Object.entries(dto).filter(([_, v]) => v !== undefined))
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

export async function getAllBlogs(page: number, dbUrl: Bindings["DATABASE_URL"]): Promise<GetBlogDTO[]> {
    try {
        const prisma = getPrismaClient(dbUrl)
        const allBlogs = await prisma.blog.findMany({
            orderBy: { updatedAt: 'desc' },
            skip: (page - 1) * 10,
            take: 10,
            select: {
                id: true,
                title: true,
                content: true,
                thumbnail: true,
                authorId: true,
                updatedAt: true,
                like: true
            }
        })
        return allBlogs
    } catch (error) {
        throw new Error(`Cannot get blogs: ${String(error)}`)
    }
}

export async function deleteBlog(id: string, authorId: string, dbUrl: Bindings["DATABASE_URL"]): Promise<Result<DeletedBlogDTO, PrismaError>> {
    try {
        const prisma = getPrismaClient(dbUrl)
        const result = await prisma.blog.delete({
            where: {
                authorId,
                id
            }
        })
        return { success: true, data: result }

    } catch (error: unknown) {
        return { success: false, error: { message: String(error) } }
    }
}

export async function getBlogById(id:string, dbUrl: Bindings["DATABASE_URL"]): Promise<Result<GetBlogDTO, PrismaError>> {
    try {
        const prisma = getPrismaClient(dbUrl)
        const blog = await prisma.blog.findUnique({
            where: {
                id
            }, 
             select: {
                id: true,
                title: true,
                content: true,
                thumbnail: true,
                authorId: true,
                updatedAt: true,
                like: true
            }
        })
        if(!blog) return {success: false, error: {code :"P2025", message: "Blog not found"}}
        return {success: true, data: blog}
    } catch (error: unknown) {
           return { success: false, error: { message: String(error) } }
    }
}