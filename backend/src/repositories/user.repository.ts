
import { getPrismaClient } from "../lib/prisma";

export async function createUser(name: string, email: string, password: string, dbUrl: string) {
    const prisma = getPrismaClient(dbUrl)
    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password
            }, 
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        })
        return user
    } catch (error) {
        throw new Error("Prisma error")
    }
}

export async function findUniqueUser(email: string, dbUrl: string) {
    try {
        const prisma = getPrismaClient(dbUrl);
        const user = prisma.user.findUnique({
            where: {
                email
            }, 
            select: {
                id: true,
                name: true,
                password: true
            }
        })
        if(user) return user
        else throw new Error("User already exists")
    } catch (error) {
        throw new Error("Prisma error")
    }
}