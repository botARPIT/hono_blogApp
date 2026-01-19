/**
 * Chat Routes
 * AI Copilot endpoints
 */

import { Hono } from 'hono';
import { Bindings } from '../types/env.types';
import { createAIService } from '../services/ai.service';
import { createChatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { handleError } from '../errors/handle-error';
import { getConfig } from '../config';

const chatRouter = new Hono<{ Bindings: Bindings }>();

// All chat routes require auth
chatRouter.use('/*', authMiddleware);

/**
 * POST /api/v1/chat
 * Send message to AI copilot
 */
chatRouter.post('/', async (c) => {
    try {
        const config = getConfig(c.env);
        const service = createAIService(config);
        const controller = createChatController(service, config);
        return await controller.chat(c);
    } catch (error) {
        return handleError(c, error);
    }
});

/**
 * POST /api/v1/chat/apply-commands
 * Apply AI commands to blog
 */
chatRouter.post('/apply-commands', async (c) => {
    try {
        const config = getConfig(c.env);
        const service = createAIService(config);
        const controller = createChatController(service, config);
        return await controller.applyCommands(c);
    } catch (error) {
        return handleError(c, error);
    }
});

/**
 * GET /api/v1/chat/conversations
 * List user's conversations
 */
chatRouter.get('/conversations', async (c) => {
    try {
        const config = getConfig(c.env);
        const service = createAIService(config);
        const controller = createChatController(service, config);
        return await controller.listConversations(c);
    } catch (error) {
        return handleError(c, error);
    }
});

/**
 * GET /api/v1/chat/conversations/:id
 * Get conversation with messages
 */
chatRouter.get('/conversations/:id', async (c) => {
    try {
        const config = getConfig(c.env);
        const service = createAIService(config);
        const controller = createChatController(service, config);
        return await controller.getConversation(c);
    } catch (error) {
        return handleError(c, error);
    }
});

export { chatRouter };
