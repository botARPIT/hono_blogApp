/**
 * AI Controller
 * Handles request validation and response formatting for AI endpoints
 */

import { Context } from 'hono';
import { createAIService, AIService } from '../services/ai.service';
import { aiGenerateRequestSchema, webhookPayloadSchema } from '../types/ai.types';
import { BadRequestError } from '../errors/app-error';

export class AIController {
    constructor(private service: AIService) { }

    /**
     * Initiate AI blog generation
     */
    async initiateGeneration(c: Context) {
        const payload = c.get('jwtPayload');
        const userId = payload?.userId as string;

        if (!userId) {
            return c.json({ message: 'Unauthorized' }, 401);
        }

        // Validate request body
        const body = await c.req.json();
        const parseResult = aiGenerateRequestSchema.safeParse(body);

        if (!parseResult.success) {
            throw new BadRequestError(
                parseResult.error.errors.map(e => e.message).join(', ')
            );
        }

        const result = await this.service.initiateGeneration(userId, parseResult.data);
        return c.json(result, 202);
    }

    /**
     * Get AI job status
     */
    async getJobStatus(c: Context) {
        const payload = c.get('jwtPayload');
        const userId = payload?.userId as string;
        const jobId = c.req.param('jobId');

        if (!userId) {
            return c.json({ message: 'Unauthorized' }, 401);
        }

        if (!jobId) {
            throw new BadRequestError('Job ID is required');
        }

        const result = await this.service.getJobStatus(jobId, userId);
        return c.json(result);
    }

    /**
     * Handle webhook from Blogify-AI
     */
    async handleWebhook(c: Context) {
        const body = await c.req.json();
        const parseResult = webhookPayloadSchema.safeParse(body);

        if (!parseResult.success) {
            console.error('Invalid webhook payload:', parseResult.error);
            throw new BadRequestError('Invalid webhook payload');
        }

        await this.service.handleWebhookEvent(parseResult.data);
        return c.json({ received: true });
    }
}

// Factory function
export function createAIController(service: AIService): AIController {
    return new AIController(service);
}
