
import { AppError, ErrorCode, NotFoundError } from "../errors/app-error";
import { getPrismaClient } from "../lib/prisma";
import { Bindings } from "../types/binding.types";
import { AddBlogDTO, CreatedBlogDTO, DeletedBlogDTO, GetBlogDTO, UpdateBlogDTO } from "../types/blog.types";



export async function createBlog(dto: AddBlogDTO, dbUrl: Bindings["DATABASE_URL"]): Promise<CreatedBlogDTO> {
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
        throw new AppError("Cannot create blog", 500, ErrorCode.PRISMA_ERROR, error)
    }
}

export async function updateBlog(dto: UpdateBlogDTO, blogId: string, authorId :string, dbUrl: Bindings["DATABASE_URL"]): Promise<UpdateBlogDTO> {
    try {
        const prisma = getPrismaClient(dbUrl)

        const updateData = Object.fromEntries(Object.entries(dto).filter(([_, v]) => v !== undefined))
        const updatedBlog = await prisma.blog.update({
            where: {
                id: blogId,
                authorId: authorId
            },
            data: updateData
        })
        return updatedBlog
    } catch (error) {
       throw new AppError("Cannot update blog", 500, ErrorCode.PRISMA_ERROR, error)
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
                createdAt: true,
                like: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        })

        return allBlogs
        
    } catch (error) {
        throw new AppError("Failed to get blogs", 500, ErrorCode.PRISMA_ERROR, error)
    }
}

export async function deleteBlog(id: string, authorId: string, dbUrl: Bindings["DATABASE_URL"]): Promise<DeletedBlogDTO> {
    try {
        const prisma = getPrismaClient(dbUrl)
        const deletedBlog = await prisma.blog.delete({
            where: {
                authorId,
                id
            }
        })
        return deletedBlog
    } catch (error: unknown) {
       throw new AppError("Failed to delete blog", 500, ErrorCode.PRISMA_ERROR, error)
    }
}

export async function getBlogById(id:string, dbUrl: Bindings["DATABASE_URL"]): Promise<GetBlogDTO> {
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
                createdAt: true,
                like: true,
                author :{
                    select: {
                        name: true
                    }
                }
            }
        })
        if(!blog) throw new NotFoundError("Blog not found")
        return blog
    } catch (error) {
          throw new AppError("Cannot find the blog", 500, ErrorCode.PRISMA_ERROR, error)
    }
}