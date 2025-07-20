
import { AppError, BadRequestError, ErrorCode } from "../errors/app-error";
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
        if(!user) throw new BadRequestError("User already exists")
         return user 
    } catch (error) {
         console.log(error)
         throw new AppError("Cannot create user", 500, ErrorCode.PRISMA_ERROR, error)
    }
}

export async function findUniqueUser(email: string, dbUrl: string) {
    try {
        const prisma = getPrismaClient(dbUrl);
        const user = await prisma.user.findUnique({
            where: {
                email
            }, 
            select: {
                id: true,
                name: true,
                password: true
            }
        })
        if(!user) throw new BadRequestError("User does not exist")
        else return user 
    } catch (error) {
        console.log(error)
        throw new AppError("Cannot find user", 500, ErrorCode.PRISMA_ERROR, error)
    }
}