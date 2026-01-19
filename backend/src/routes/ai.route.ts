/**
 * AI Routes
 * Endpoints for AI blog generation
 */

import { Hono } from 'hono';
import { Bindings } from '../types/env.types';
import { createAIService } from '../services/ai.service';
import { createAIController } from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { handleError } from '../errors/handle-error';
import { getConfig } from '../config';

const aiRouter = new Hono<{ Bindings: Bindings }>();

// Public routes require auth
aiRouter.use('/ai-generate', authMiddleware);
aiRouter.use('/ai-job/*', authMiddleware);

/**
 * POST /api/v1/blog/ai-generate
 * Initiate AI blog generation
 */
aiRouter.post('/ai-generate', async (c) => {
    try {
        const config = getConfig(c.env);
        const service = createAIService(config);
        const controller = createAIController(service);
        return await controller.initiateGeneration(c);
    } catch (error) {
        return handleError(c, error);
    }
});

/**
 * GET /api/v1/blog/ai-job/:jobId
 * Get AI job status
 */
aiRouter.get('/ai-job/:jobId', async (c) => {
    try {
        const config = getConfig(c.env);
        const service = createAIService(config);
        const controller = createAIController(service);
        return await controller.getJobStatus(c);
    } catch (error) {
        return handleError(c, error);
    }
});

export { aiRouter };


/**
 * Internal Webhook Routes
 * Receives callbacks from Blogify-AI
 */
const webhookRouter = new Hono<{ Bindings: Bindings }>();

// Verify internal API key
webhookRouter.use('/*', async (c, next) => {
    const apiKey = c.req.header('X-Internal-API-Key');
    const config = getConfig(c.env);

    if (!apiKey || apiKey !== config.INTERNAL_API_KEY) {
        return c.json({ message: 'Unauthorized' }, 401);
    }

    await next();
});

/**
 * POST /internal/webhooks/ai-events
 * Receive AI job events
 */
webhookRouter.post('/ai-events', async (c) => {
    try {
        const config = getConfig(c.env);
        const service = createAIService(config);
        const controller = createAIController(service);
        return await controller.handleWebhook(c);
    } catch (error) {
        console.error('Webhook error:', error);
        return c.json({ message: 'Webhook processing failed' }, 500);
    }
});

export { webhookRouter };
