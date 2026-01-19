/**
 * AI Job Repository
 * Handles database operations for AI generation jobs
 * 
 * NOTE: Requires AIJob, Conversation, Message models in schema.prisma
 * Run: npx prisma migrate dev after adding models
 */

import { getPrismaClient } from '../lib/prisma';
import { AppConfig } from '../config';
import {
    AIJobStatus,
    CreateAIJobDTO,
    UpdateAIJobDTO
} from '../types/ai.types';
import { prismaErrorWrapper, prismaErrorObject } from '../errors/prismaErrorWrapper';

export async function createAIJob(
    dto: CreateAIJobDTO,
    dbUrl: AppConfig['DATABASE_URL']
) {
    try {
        const prisma = getPrismaClient(dbUrl);
        // @ts-expect-error - AIJob model needs to be added to schema.prisma
        return await prisma.aIJob.create({
            data: {
                userId: dto.userId,
                topic: dto.topic,
                audience: dto.audience,
                tone: dto.tone,
                status: AIJobStatus.PENDING,
                progress: 0
            }
        });
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject);
    }
}

export async function getAIJobById(
    jobId: string,
    dbUrl: AppConfig['DATABASE_URL']
) {
    try {
        const prisma = getPrismaClient(dbUrl);
        // @ts-expect-error - AIJob model needs to be added to schema.prisma
        return await prisma.aIJob.findUnique({
            where: { id: jobId }
        });
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject);
    }
}

export async function getAIJobByIdAndUser(
    jobId: string,
    userId: string,
    dbUrl: AppConfig['DATABASE_URL']
) {
    try {
        const prisma = getPrismaClient(dbUrl);
        // @ts-expect-error - AIJob model needs to be added to schema.prisma
        return await prisma.aIJob.findFirst({
            where: { id: jobId, userId }
        });
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject);
    }
}

export async function updateAIJob(
    jobId: string,
    dto: UpdateAIJobDTO,
    dbUrl: AppConfig['DATABASE_URL']
) {
    try {
        const prisma = getPrismaClient(dbUrl);
        // @ts-expect-error - AIJob model needs to be added to schema.prisma
        return await prisma.aIJob.update({
            where: { id: jobId },
            data: dto
        });
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject);
    }
}

export async function getUserAIJobs(
    userId: string,
    limit: number = 20,
    dbUrl: AppConfig['DATABASE_URL']
) {
    try {
        const prisma = getPrismaClient(dbUrl);
        // @ts-expect-error - AIJob model needs to be added to schema.prisma
        return await prisma.aIJob.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject);
    }
}
