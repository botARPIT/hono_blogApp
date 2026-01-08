import { ServiceName } from './../errors/app-error';

import { NotFoundError, ValidationError } from "../errors/app-error";
import { getPrismaClient } from "../lib/prisma";
import { Bindings } from "../types/env.types";
import { AddBlogDTO, BlogTag, CreatedBlogDTO, DeletedBlogDTO, GetBlogDTO, UpdateBlogDTO } from "../types/blog.types";
import { prismaErrorWrapper } from '../errors/prismaErrorWrapper';
import type { prismaErrorObject } from '../errors/prismaErrorWrapper';
import { AppConfig } from '../config';




export async function createBlog(dto: AddBlogDTO, userId: string, dbUrl: AppConfig['DATABASE_URL']): Promise<CreatedBlogDTO> {

    try {
        const prisma = getPrismaClient(dbUrl)
        const blog = await prisma.blog.create({
            data: {
                title: dto.title,
                content: dto.content,
                thumbnail: dto.thumbnail,
                authorId: userId,
                tag: dto.tag,
                published: dto.published || false
            },
            select: {
                id: true,
                title: true,
                content: true,
                tag: true,
                thumbnail: true,
                authorId: true,
                createdAt: true,
                updatedAt: true,
                like: true,
                published: true,

            }
        })
        return { ...blog, tag: blog.tag as BlogTag }
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}

export async function updateBlog(dto: UpdateBlogDTO, blogId: string, authorId: string, dbUrl: AppConfig['DATABASE_URL']): Promise<UpdateBlogDTO> {
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

export async function getAllBlogs(page: number, dbUrl: AppConfig['DATABASE_URL']): Promise<GetBlogDTO[]> {
    try {
        { !page || page < 0 ? page = 1 : page }
        const prisma = getPrismaClient(dbUrl)
        const allBlogs = await prisma.blog.findMany({
            where: {
                published: true
            },
            orderBy: { updatedAt: 'desc' },
            skip: (page - 1) * 10,
            take: 10,
            select: {
                id: true,
                title: true,
                content: true,
                tag: true,
                createdAt: true,
                updatedAt: true,
                like: true,
                published: true,
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
        return allBlogs.map(blog => ({ ...blog, tag: blog.tag as BlogTag }))

    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}

export async function getUserBlogs(userId: string, dbUrl: AppConfig['DATABASE_URL']): Promise<GetBlogDTO[]> {
    try {
        const prisma = getPrismaClient(dbUrl)
        const blogs = await prisma.blog.findMany({
            where: {
                authorId: userId
            },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                content: true,
                tag: true,
                createdAt: true,
                updatedAt: true,
                like: true,
                published: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        })
        return blogs.map(blog => ({ ...blog, tag: blog.tag as BlogTag }))
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}

export async function deleteBlog(id: string, authorId: string, dbUrl: AppConfig['DATABASE_URL']): Promise<DeletedBlogDTO> {
    try {
        const prisma = getPrismaClient(dbUrl)
        const deletedBlog = await prisma.blog.delete({
            where: {
                authorId,
                id
            }
        })
        return { ...deletedBlog, tag: deletedBlog.tag as BlogTag }
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}

export async function getBlogById(id: string, dbUrl: AppConfig['DATABASE_URL']): Promise<GetBlogDTO | null> {
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
                updatedAt: true,
                like: true,
                published: true,
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
        if (!blog) return null
        return { ...blog, tag: blog.tag as BlogTag }
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}

export async function likeBlog(blogId: string, userId: string, dbUrl: AppConfig['DATABASE_URL']): Promise<{ like: number; hasLiked: boolean }> {
    try {
        const prisma = getPrismaClient(dbUrl)

        // Check if user already liked this blog
        const existingLike = await prisma.blogLike.findUnique({
            where: {
                blogId_userId: {
                    blogId,
                    userId
                }
            }
        })

        if (existingLike) {
            // User already liked - remove the like (unlike)
            await prisma.$transaction([
                prisma.blogLike.delete({
                    where: {
                        blogId_userId: {
                            blogId,
                            userId
                        }
                    }
                }),
                prisma.blog.update({
                    where: { id: blogId },
                    data: { like: { decrement: 1 } }
                })
            ])

            const blog = await prisma.blog.findUnique({
                where: { id: blogId },
                select: { like: true }
            })

            return { like: blog?.like ?? 0, hasLiked: false }
        } else {
            // User hasn't liked - add the like
            await prisma.$transaction([
                prisma.blogLike.create({
                    data: {
                        blogId,
                        userId
                    }
                }),
                prisma.blog.update({
                    where: { id: blogId },
                    data: { like: { increment: 1 } }
                })
            ])

            const blog = await prisma.blog.findUnique({
                where: { id: blogId },
                select: { like: true }
            })

            return { like: blog?.like ?? 0, hasLiked: true }
        }
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}

export async function hasUserLikedBlog(blogId: string, userId: string, dbUrl: AppConfig['DATABASE_URL']): Promise<boolean> {
    try {
        const prisma = getPrismaClient(dbUrl)
        const like = await prisma.blogLike.findUnique({
            where: {
                blogId_userId: {
                    blogId,
                    userId
                }
            }
        })
        return !!like
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}