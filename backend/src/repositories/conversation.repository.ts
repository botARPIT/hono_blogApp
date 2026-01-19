/**
 * Conversation Repository
 * Handles database operations for chat conversations and messages
 * 
 * NOTE: Requires Conversation, Message models in schema.prisma
 * Run: npx prisma migrate dev after adding models
 */

import { getPrismaClient } from '../lib/prisma';
import { AppConfig } from '../config';
import {
    MessageRole,
    ConversationStatus,
    CreateConversationDTO,
    CreateMessageDTO
} from '../types/ai.types';
import { prismaErrorWrapper, prismaErrorObject } from '../errors/prismaErrorWrapper';

export async function createConversation(
    dto: CreateConversationDTO,
    dbUrl: AppConfig['DATABASE_URL']
) {
    try {
        const prisma = getPrismaClient(dbUrl);
        // @ts-expect-error - Conversation model needs to be added to schema.prisma
        return await prisma.conversation.create({
            data: {
                userId: dto.userId,
                blogId: dto.blogId || null,
                status: ConversationStatus.ACTIVE
            },
            include: {
                messages: true
            }
        });
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject);
    }
}

export async function getConversationById(
    conversationId: string,
    userId: string,
    dbUrl: AppConfig['DATABASE_URL']
) {
    try {
        const prisma = getPrismaClient(dbUrl);
        // @ts-expect-error - Conversation model needs to be added to schema.prisma
        return await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        });
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject);
    }
}

export async function getUserConversations(
    userId: string,
    limit: number = 20,
    dbUrl: AppConfig['DATABASE_URL']
) {
    try {
        const prisma = getPrismaClient(dbUrl);
        // @ts-expect-error - Conversation model needs to be added to schema.prisma
        return await prisma.conversation.findMany({
            where: {
                userId,
                status: ConversationStatus.ACTIVE
            },
            orderBy: { updatedAt: 'desc' },
            take: limit,
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                blog: {
                    select: { id: true, title: true }
                }
            }
        });
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject);
    }
}

export async function createMessage(
    dto: CreateMessageDTO,
    dbUrl: AppConfig['DATABASE_URL']
) {
    try {
        const prisma = getPrismaClient(dbUrl);
        // @ts-expect-error - Message model needs to be added to schema.prisma
        return await prisma.message.create({
            data: {
                conversationId: dto.conversationId,
                role: dto.role,
                content: dto.content,
                commands: dto.commands as object,
                tokenCount: dto.tokenCount
            }
        });
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject);
    }
}

export async function getMessageWithConversation(
    messageId: string,
    conversationId: string,
    userId: string,
    dbUrl: AppConfig['DATABASE_URL']
) {
    try {
        const prisma = getPrismaClient(dbUrl);
        // @ts-expect-error - Message model needs to be added to schema.prisma
        return await prisma.message.findFirst({
            where: {
                id: messageId,
                conversation: {
                    id: conversationId,
                    userId
                }
            },
            include: {
                conversation: true
            }
        });
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject);
    }
}

export async function markCommandsApplied(
    messageId: string,
    dbUrl: AppConfig['DATABASE_URL']
) {
    try {
        const prisma = getPrismaClient(dbUrl);
        // @ts-expect-error - Message model needs to be added to schema.prisma
        return await prisma.message.update({
            where: { id: messageId },
            data: { commandsApplied: true }
        });
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject);
    }
}

export async function getConversationWithMessages(
    conversationId: string,
    userId: string,
    dbUrl: AppConfig['DATABASE_URL']
) {
    try {
        const prisma = getPrismaClient(dbUrl);
        // @ts-expect-error - Conversation model needs to be added to schema.prisma
        return await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                },
                blog: {
                    select: { id: true, title: true, content: true }
                }
            }
        });
    } catch (error) {
        throw prismaErrorWrapper(error as prismaErrorObject);
    }
}
