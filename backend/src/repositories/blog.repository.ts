import {  ServiceName } from './../errors/app-error';

import { NotFoundError, ValidationError } from "../errors/app-error";
import { getPrismaClient } from "../lib/prisma";
import { Bindings } from "../types/binding.types";
import { AddBlogDTO, CreatedBlogDTO, DeletedBlogDTO, GetBlogDTO, UpdateBlogDTO } from "../types/blog.types";
import { prismaErrorObject, prismaErrorWrapper } from '../utils/prismaErrorWrapper';




export async function createBlog(dto: AddBlogDTO, userId: string, dbUrl: Bindings["DATABASE_URL"]): Promise<CreatedBlogDTO> {

    try {
        if (!userId || !dto.content || !dto.thumbnail || !dto.title) throw new ValidationError("Missing input fields", ServiceName.DB, { message: "All required fields" })
        const prisma = getPrismaClient(dbUrl)
        const blog = await prisma.blog.create({
            data: {
                title: dto.title,
                content: dto.content,
                thumbnail: dto.thumbnail,
                authorId: userId
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
        console.log(error)
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}

export async function updateBlog(dto: UpdateBlogDTO, blogId: string, authorId: string, dbUrl: Bindings["DATABASE_URL"]): Promise<UpdateBlogDTO> {
    try {
        if (!dto.content && !dto.thumbnail && !dto.title) throw new ValidationError("Missing input fields", ServiceName.DB, { message: "At least one field is required" })
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
        console.log(error)
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}

export async function getAllBlogs(page: number, dbUrl: Bindings["DATABASE_URL"]): Promise<GetBlogDTO[]> {
    try {
        { !page ? page = 1 : page }
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
          console.log(error)
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}

export async function deleteBlog(id: string, authorId: string, dbUrl: Bindings["DATABASE_URL"]): Promise<DeletedBlogDTO> {
    try {
        if (!id || !authorId) throw new ValidationError("Missing input fields", ServiceName.DB, { message: "All required fields" })
        const prisma = getPrismaClient(dbUrl)
        const deletedBlog = await prisma.blog.delete({
            where: {
                authorId,
                id
            }
        })
        return deletedBlog
    } catch (error: unknown) {
          console.log(error)
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}

export async function getBlogById(id: string, dbUrl: Bindings["DATABASE_URL"]): Promise<GetBlogDTO> {
    try {
        if (!id) throw new ValidationError("Missing input fields", ServiceName.DB, { message: "Id is required" })
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
                author: {
                    select: {
                        name: true
                    }
                }
            }
        })
        if (!blog) throw new NotFoundError("Blog not found")
        return blog
    } catch (error) {
          console.log(error)
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}