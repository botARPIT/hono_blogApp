/**
 * Chat Controller
 * Handles request validation and response formatting for chat/copilot endpoints
 */

import { Context } from 'hono';
import { createAIService, AIService } from '../services/ai.service';
import { chatRequestSchema, applyCommandsRequestSchema } from '../types/ai.types';
import { BadRequestError } from '../errors/app-error';
import { getUserConversations, getConversationWithMessages } from '../repositories/conversation.repository';
import { AppConfig } from '../config';

export class ChatController {
    constructor(
        private service: AIService,
        private config: AppConfig
    ) { }

    /**
     * Send message to AI copilot
     */
    async chat(c: Context) {
        const payload = c.get('jwtPayload');
        const userId = payload?.userId as string;

        if (!userId) {
            return c.json({ message: 'Unauthorized' }, 401);
        }

        // Validate request body
        const body = await c.req.json();
        const parseResult = chatRequestSchema.safeParse(body);

        if (!parseResult.success) {
            throw new BadRequestError(
                parseResult.error.errors.map(e => e.message).join(', ')
            );
        }

        const result = await this.service.chat(userId, parseResult.data);
        return c.json(result);
    }

    /**
     * Apply AI commands to blog
     */
    async applyCommands(c: Context) {
        const payload = c.get('jwtPayload');
        const userId = payload?.userId as string;

        if (!userId) {
            return c.json({ message: 'Unauthorized' }, 401);
        }

        // Validate request body
        const body = await c.req.json();
        const parseResult = applyCommandsRequestSchema.safeParse(body);

        if (!parseResult.success) {
            throw new BadRequestError(
                parseResult.error.errors.map(e => e.message).join(', ')
            );
        }

        const result = await this.service.applyCommands(userId, parseResult.data);
        return c.json(result);
    }

    /**
     * List user's conversations
     */
    async listConversations(c: Context) {
        const payload = c.get('jwtPayload');
        const userId = payload?.userId as string;

        if (!userId) {
            return c.json({ message: 'Unauthorized' }, 401);
        }

        const conversations = await getUserConversations(userId, 20, this.config.DATABASE_URL);

        return c.json(conversations.map(conv => ({
            id: conv.id,
            title: conv.title || conv.messages[0]?.content.slice(0, 50) || 'New conversation',
            blog: conv.blog,
            last_message: conv.messages[0]?.content.slice(0, 100),
            updated_at: conv.updatedAt
        })));
    }

    /**
     * Get conversation with messages
     */
    async getConversation(c: Context) {
        const payload = c.get('jwtPayload');
        const userId = payload?.userId as string;
        const conversationId = c.req.param('id');

        if (!userId) {
            return c.json({ message: 'Unauthorized' }, 401);
        }

        if (!conversationId) {
            throw new BadRequestError('Conversation ID is required');
        }

        const conversation = await getConversationWithMessages(
            conversationId,
            userId,
            this.config.DATABASE_URL
        );

        if (!conversation) {
            return c.json({ message: 'Conversation not found' }, 404);
        }

        return c.json({
            id: conversation.id,
            blog: conversation.blog,
            messages: conversation.messages.map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                commands: m.commands,
                commands_applied: m.commandsApplied,
                created_at: m.createdAt
            }))
        });
    }
}

// Factory function
export function createChatController(service: AIService, config: AppConfig): ChatController {
    return new ChatController(service, config);
}
