import { getPrismaClient } from "../lib/prisma";
import { UserDetailsDTO } from "../types/user.types";
import { prismaErrorObject, prismaErrorWrapper } from "../errors/prismaErrorWrapper";
import { Bindings } from "../types/env.types";
import { GetBlogDTO } from "../types/blog.types";

export async function getUserProfile(id: string, dbUrl: string): Promise<UserDetailsDTO | null>{
    const prisma = getPrismaClient(dbUrl)
    try {
        const user = await prisma.user.findUnique({
            where: {
               id
            }, 
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        })
        if(!user) return null 
         return user 
    } catch (error) {
         throw prismaErrorWrapper(error as prismaErrorObject)
    }
}


export async function getUserBlogs(userId: string, dbUrl: Bindings["DATABASE_URL"]): Promise<GetBlogDTO[] | null>{
    try {
        let page = 1
    { !page ? page = 1 : page }
    const prisma = getPrismaClient(dbUrl)
    const blogs = await prisma.blog.findMany({
        orderBy: { updatedAt: 'desc' },
            skip: (page - 1) * 10,
            take: 10,
        where: {
            authorId: userId
        },select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            like: true,
            tag: true,
            author: {
                select: {
                    name: true
                }
            }
        }
    })

    if(blogs.length === 0) return null
    return blogs
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject)
    }

}
