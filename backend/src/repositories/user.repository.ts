
import { AppError, BadRequestError, ErrorCode, ServiceName } from "../errors/app-error";
import { getPrismaClient } from "../lib/prisma";
import { AuthProvider } from "../types/user.types";
import { prismaErrorObject, prismaErrorWrapper } from "../errors/prismaErrorWrapper";

export async function createUser(name: string, email: string, password: string | null, dbUrl: string, authProvider: AuthProvider.LOCAL | AuthProvider.GOOGLE) {
    const prisma = getPrismaClient(dbUrl)
    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password,
                providerId: authProvider
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
         console.log(error)
         throw prismaErrorWrapper(error as prismaErrorObject)
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
                password: true,
                providerId: true
            }
        })
        return user 
    } catch (error) {
        console.log(error)
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}