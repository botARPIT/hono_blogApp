/**
 * Blogify-AI HTTP Client
 * Handles communication with the AI subsystem
 */

import { AppConfig } from '../config';
import {
    BlogifyAIBlogRequest,
    BlogifyAIBlogResponse,
    InternalChatRequest,
    InternalChatResponse
} from '../types/ai.types';

export class AIClient {
    private baseUrl: string;
    private apiKey: string;
    private timeout: number;

    constructor(config: AppConfig) {
        this.baseUrl = config.BLOGIFY_AI_URL || 'http://localhost:8000';
        this.apiKey = config.BLOGIFY_AI_API_KEY || '';
        this.timeout = 30000; // 30 seconds
    }

    private async request<T>(
        endpoint: string,
        method: 'GET' | 'POST',
        body?: object
    ): Promise<T> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Internal-API-Key': this.apiKey,
                    'X-Request-ID': crypto.randomUUID()
                },
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorBody = await response.text();
                throw new AIServiceError(
                    `AI service returned ${response.status}: ${errorBody}`,
                    response.status
                );
            }

            return await response.json() as T;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof AIServiceError) {
                throw error;
            }

            if (error instanceof Error && error.name === 'AbortError') {
                throw new AIServiceError('AI service timeout', 504);
            }

            throw new AIServiceError(
                `AI service connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                503
            );
        }
    }

    /**
     * Check if AI service is healthy
     */
    async healthCheck(): Promise<boolean> {
        try {
            await this.request<{ status: string }>('/api/health', 'GET');
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Submit blog generation job
     */
    async submitBlogGeneration(request: BlogifyAIBlogRequest): Promise<BlogifyAIBlogResponse> {
        return this.request<BlogifyAIBlogResponse>(
            '/internal/ai/blogs',
            'POST',
            request
        );
    }

    /**
     * Get job status directly (fallback for webhook failures)
     */
    async getJobStatus(jobId: string): Promise<{
        status: string;
        stage?: string;
        progress?: number;
        result?: object;
        error?: object;
    }> {
        return this.request(
            `/internal/ai/jobs/${jobId}`,
            'GET'
        );
    }

    /**
     * Send chat message to AI copilot
     */
    async chat(request: InternalChatRequest): Promise<InternalChatResponse> {
        return this.request<InternalChatResponse>(
            '/internal/ai/chat',
            'POST',
            request
        );
    }
}

export class AIServiceError extends Error {
    constructor(
        message: string,
        public statusCode: number
    ) {
        super(message);
        this.name = 'AIServiceError';
    }
}

// Factory function
export function createAIClient(config: AppConfig): AIClient {
    return new AIClient(config);
}
