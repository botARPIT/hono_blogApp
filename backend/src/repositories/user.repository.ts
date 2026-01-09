import { getPrismaClient } from "../lib/prisma";
import { UserDetailsDTO } from "../types/user.types";
import { prismaErrorObject, prismaErrorWrapper } from "../errors/prismaErrorWrapper";
import { AppConfig } from "../config";

export async function getUserProfile(id: string, dbUrl: AppConfig['DATABASE_URL']): Promise<UserDetailsDTO | null> {
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
        if (!user) return null
        return user
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}

export async function updateProfile(id: string, data: { name?: string, email?: string }, dbUrl: AppConfig['DATABASE_URL']): Promise<UserDetailsDTO> {
    const prisma = getPrismaClient(dbUrl)
    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        })
        return updatedUser
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}
