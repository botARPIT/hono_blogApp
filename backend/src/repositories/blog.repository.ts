import {  ServiceName } from './../errors/app-error';

import { NotFoundError, ValidationError } from "../errors/app-error";
import { getPrismaClient } from "../lib/prisma";
import { Bindings } from "../types/env.types";
import { AddBlogDTO, CreatedBlogDTO, DeletedBlogDTO, GetBlogDTO, UpdateBlogDTO } from "../types/blog.types";
import { prismaErrorObject, prismaErrorWrapper } from '../errors/prismaErrorWrapper';




export async function createBlog(dto: AddBlogDTO, userId: string, dbUrl: Bindings["DATABASE_URL"]): Promise<CreatedBlogDTO> {

    try {
        const prisma = getPrismaClient(dbUrl)
        const blog = await prisma.blog.create({
            data: {
                title: dto.title,
                content: dto.content,
                thumbnail: dto.thumbnail,
                authorId: userId,
                tag: dto.tag
            },
            select: {
                id: true,
                title: true,
                content: true,
                tag: true,
                thumbnail: true,
                authorId: true,
                createdAt: true,
                published: true,

            }
        })
        return blog
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}

export async function updateBlog(dto: UpdateBlogDTO, blogId: string, authorId: string, dbUrl: Bindings["DATABASE_URL"]): Promise<UpdateBlogDTO> {
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
                // thumbnail: true,
                // authorId: true,
                tag: true,
                createdAt: true,
                like: true,
                author: {
                    select: {
                        name: true
                    }
                }
            },
            cacheStrategy: {
                ttl: 300,
                tags: [`blogs_page_${page}`, 'all_blogs']
            }
        })
        return allBlogs

    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject)
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
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}

export async function getBlogById(id: string, dbUrl: Bindings["DATABASE_URL"]): Promise<GetBlogDTO | null> {
    try {
        const start = performance.now()
        const prisma = getPrismaClient(dbUrl)
        const blog = await prisma.blog.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                title: true,
                content: true,
                tag: true,
                thumbnail: true,
                authorId: true,
                createdAt: true,
                like: true,
                author: {
                    select: {
                        name: true
                    }
                }
            },
    
            cacheStrategy: {
                ttl: 600, 
                tags: [`single_blog`]
            }
        })
        return blog
    } catch (error) {
          console.log(error)
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}