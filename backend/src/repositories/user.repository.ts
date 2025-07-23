
import { AppError, BadRequestError, ErrorCode, ServiceName } from "../errors/app-error";
import { getPrismaClient } from "../lib/prisma";
import { prismaErrorObject, prismaErrorWrapper } from "../utils/prismaErrorWrapper";

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
        if(!user) throw new BadRequestError("User already exists", ServiceName.DB, {message: "Kindly login"})
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
                password: true
            }
        })
        if(!user) throw new BadRequestError("User does not exist", ServiceName.DB, {message: "Register your email first"})
        else return user 
    } catch (error) {
        console.log(error)
        throw prismaErrorWrapper(error as prismaErrorObject)
    }
}