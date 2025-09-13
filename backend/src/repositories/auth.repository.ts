
import { AppError, BadRequestError, ErrorCode, ServiceName } from "../errors/app-error";
import { getPrismaClient } from "../lib/prisma";
import { CreatedUserDTO, ExistingUserDTO, UserSignUpDTO } from "../types/user.types";
import { prismaErrorObject, prismaErrorWrapper } from "../errors/prismaErrorWrapper";
import { AuthProvider } from "@prisma/client/edge";

export async function createUser(name: string, email: string, password: string | null, dbUrl: string, authProvider: AuthProvider): Promise<CreatedUserDTO | null> {
    const prisma = getPrismaClient(dbUrl)
    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password,
                authProvider
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

export async function findUniqueUser(email: string, dbUrl: string): Promise<ExistingUserDTO | null> {
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
                authProvider: true,
                email: true
            }
        })
        if(!user) return null
        return user 
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}