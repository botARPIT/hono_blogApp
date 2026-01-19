/**
 * AI Service
 * Orchestrates AI generation jobs and copilot interactions
 * Uses repository layer for database operations
 */

import { AppConfig } from '../config';
import { createAIClient, AIClient, AIServiceError } from '../utils/ai-client';
import {
    AIJobStatus,
    AIGenerateRequest,
    AIGenerateResponse,
    AIJobStatusResponse,
    BlogifyAIBlogRequest,
    AIEventPayload,
    ChatRequest,
    ChatResponse,
    ApplyCommandsRequest,
    ApplyCommandsResponse,
    CommandType,
    InternalChatRequest,
    MessageRole
} from '../types/ai.types';
import { BlogTag } from '../types/blog.types';
import { NotFoundError, BadRequestError } from '../errors/app-error';

// Repository imports
import {
    createAIJob,
    getAIJobById,
    getAIJobByIdAndUser,
    updateAIJob
} from '../repositories/ai-job.repository';
import {
    createConversation,
    getConversationById,
    createMessage,
    getMessageWithConversation,
    markCommandsApplied
} from '../repositories/conversation.repository';
import { createBlog, updateBlog, getBlogById } from '../repositories/blog.repository';

export class AIService {
    private aiClient: AIClient;
    private config: AppConfig;

    constructor(config: AppConfig) {
        this.config = config;
        this.aiClient = createAIClient(config);
    }

    // ============================================
    // BLOG GENERATION
    // ============================================

    /**
     * Initiate AI blog generation job
     */
    async initiateGeneration(
        userId: string,
        request: AIGenerateRequest
    ): Promise<AIGenerateResponse> {
        // Check if AI service is healthy
        const isHealthy = await this.aiClient.healthCheck();
        if (!isHealthy) {
            throw new AIServiceError('AI service is temporarily unavailable', 503);
        }

        // Create job record via repository
        const job = await createAIJob({
            userId,
            topic: request.topic,
            audience: request.audience || 'general readers',
            tone: request.tone || 'professional'
        }, this.config.DATABASE_URL);

        // Build callback URL
        const callbackUrl = `${this.config.BACKEND_URL}/internal/webhooks/ai-events`;

        // Submit to Blogify-AI
        const aiRequest: BlogifyAIBlogRequest = {
            job_id: job.id,
            user_id: userId,
            topic: request.topic,
            audience: request.audience || 'general readers',
            tone: request.tone || 'professional',
            user_plan: 'free', // TODO: Get from user record
            callback_url: callbackUrl
        };

        await this.aiClient.submitBlogGeneration(aiRequest);

        // Update job status to processing
        await updateAIJob(job.id, { status: AIJobStatus.PROCESSING }, this.config.DATABASE_URL);

        return {
            job_id: job.id,
            status: 'pending',
            estimated_time_seconds: 60,
            poll_url: `/api/v1/blog/ai-job/${job.id}`
        };
    }

    /**
     * Get AI job status
     */
    async getJobStatus(jobId: string, userId: string): Promise<AIJobStatusResponse> {
        const job = await getAIJobByIdAndUser(jobId, userId, this.config.DATABASE_URL);

        if (!job) {
            throw new NotFoundError('Job not found');
        }

        return {
            job_id: job.id,
            status: job.status as AIJobStatus,
            stage: job.stage || undefined,
            progress_percent: job.progress,
            blog_id: job.blogId || undefined,
            error: job.errorMessage || undefined
        };
    }

    /**
     * Handle webhook event from Blogify-AI
     */
    async handleWebhookEvent(payload: AIEventPayload): Promise<void> {
        const job = await getAIJobById(payload.job_id, this.config.DATABASE_URL);

        if (!job) {
            console.error(`Webhook received for unknown job: ${payload.job_id}`);
            return;
        }

        switch (payload.event_type) {
            case 'job_completed':
                await this.handleJobCompleted(job, payload);
                break;
            case 'job_failed':
                await this.handleJobFailed(job, payload);
                break;
            case 'job_progress':
                await this.handleJobProgress(job.id, payload);
                break;
        }
    }

    private async handleJobCompleted(
        job: { id: string; userId: string },
        payload: AIEventPayload
    ): Promise<void> {
        if (!payload.result) {
            throw new Error('Completed event missing result');
        }

        // Create blog from AI result via repository
        const blog = await createBlog({
            title: payload.result.title,
            content: payload.result.content,
            thumbnail: '',
            tag: BlogTag.GENERAL,
            published: false
        }, job.userId, this.config.DATABASE_URL);

        // Update job as completed
        await updateAIJob(job.id, {
            status: AIJobStatus.COMPLETED,
            blogId: blog.id,
            progress: 100,
            completedAt: new Date()
        }, this.config.DATABASE_URL);
    }

    private async handleJobFailed(
        job: { id: string; retryCount: number },
        payload: AIEventPayload
    ): Promise<void> {
        const maxRetries = 3;
        const error = payload.error;

        if (error?.retryable && job.retryCount < maxRetries) {
            // Schedule retry
            await updateAIJob(job.id, {
                status: AIJobStatus.PENDING,
                retryCount: job.retryCount + 1,
                errorCode: error.code,
                errorMessage: `Retry ${job.retryCount + 1}/${maxRetries}: ${error.message}`
            }, this.config.DATABASE_URL);
        } else {
            // Mark as failed
            await updateAIJob(job.id, {
                status: AIJobStatus.FAILED,
                errorCode: error?.code || 'UNKNOWN',
                errorMessage: error?.message || 'Unknown error'
            }, this.config.DATABASE_URL);
        }
    }

    private async handleJobProgress(jobId: string, payload: AIEventPayload): Promise<void> {
        if (payload.progress) {
            await updateAIJob(jobId, {
                stage: payload.progress.stage,
                progress: payload.progress.percent
            }, this.config.DATABASE_URL);
        }
    }

    // ============================================
    // CHAT COPILOT
    // ============================================

    /**
     * Process chat message with AI copilot
     */
    async chat(
        userId: string,
        request: ChatRequest
    ): Promise<ChatResponse> {
        const startTime = Date.now();

        // Get or create conversation via repository
        let conversation;
        if (request.conversation_id) {
            conversation = await getConversationById(
                request.conversation_id,
                userId,
                this.config.DATABASE_URL
            );
            if (!conversation) {
                throw new NotFoundError('Conversation not found');
            }
        } else {
            conversation = await createConversation({
                userId,
                blogId: request.blog_id
            }, this.config.DATABASE_URL);
        }

        // Store user message via repository
        await createMessage({
            conversationId: conversation.id,
            role: MessageRole.USER,
            content: request.message
        }, this.config.DATABASE_URL);

        // Build context for AI
        const blogState = request.blog_id
            ? await this.getBlogContext(request.blog_id, userId)
            : undefined;

        const internalRequest: InternalChatRequest = {
            conversation_id: conversation.id,
            user_id: userId,
            user_plan: 'free',
            system_context: {
                blog_state: blogState,
                user_profile: {
                    id: userId,
                    name: 'User',
                    plan: 'free'
                },
                available_commands: Object.values(CommandType)
            },
            recent_messages: conversation.messages.reverse().map((m: { role: string; content: string }) => ({
                role: m.role as MessageRole,
                content: m.content
            })),
            user_message: request.message
        };

        // Call AI service
        const aiResponse = await this.aiClient.chat(internalRequest);

        // Store assistant message via repository
        const assistantMessage = await createMessage({
            conversationId: conversation.id,
            role: MessageRole.ASSISTANT,
            content: aiResponse.assistant_message,
            commands: aiResponse.commands as object[],
            tokenCount: aiResponse.tokens_used
        }, this.config.DATABASE_URL);

        const responseTime = Date.now() - startTime;

        return {
            conversation_id: conversation.id,
            message_id: assistantMessage.id,
            assistant_message: aiResponse.assistant_message,
            commands: aiResponse.commands,
            can_apply: aiResponse.commands.some(c => !c.requires_approval),
            tokens_used: aiResponse.tokens_used,
            response_time_ms: responseTime
        };
    }

    /**
     * Apply AI commands to blog
     */
    async applyCommands(
        userId: string,
        request: ApplyCommandsRequest
    ): Promise<ApplyCommandsResponse> {
        // Get message with commands via repository
        const message = await getMessageWithConversation(
            request.message_id,
            request.conversation_id,
            userId,
            this.config.DATABASE_URL
        );

        if (!message || !message.commands) {
            throw new NotFoundError('Message or commands not found');
        }

        const commands = message.commands as object[];
        const appliedCommands: number[] = [];
        const errors: Array<{ index: number; message: string }> = [];

        // Get blog if conversation has one
        const blogId = message.conversation.blogId;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let blog: any = blogId
            ? await getBlogById(blogId, this.config.DATABASE_URL)
            : null;

        // Process each selected command
        for (const index of request.command_indices) {
            if (index >= commands.length) {
                errors.push({ index, message: 'Command index out of range' });
                continue;
            }

            const command = commands[index] as { type: string; payload: object };

            try {
                if (blog) {
                    blog = await this.executeCommand(blog.id, command, userId);
                    appliedCommands.push(index);
                } else if (command.type === 'GENERATE_OUTLINE') {
                    appliedCommands.push(index);
                } else {
                    errors.push({ index, message: 'No blog context for this command' });
                }
            } catch (e) {
                errors.push({
                    index,
                    message: e instanceof Error ? e.message : 'Command execution failed'
                });
            }
        }

        // Mark commands as applied via repository
        await markCommandsApplied(message.id, this.config.DATABASE_URL);

        return {
            success: appliedCommands.length > 0,
            applied_commands: appliedCommands,
            blog_updated: blog !== null && appliedCommands.length > 0,
            new_blog_state: blog ? {
                title: blog.title,
                content: blog.content
            } : undefined,
            errors: errors.length > 0 ? errors : undefined
        };
    }


    private async getBlogContext(blogId: string, _userId: string) {
        const blog = await getBlogById(blogId, this.config.DATABASE_URL);

        if (!blog) return undefined;

        return {
            id: blog.id,
            title: blog.title,
            content: blog.content,
            tag: blog.tag as string,
            word_count: blog.content.split(/\s+/).length,
            published: blog.published
        };
    }

    private async executeCommand(
        blogId: string,
        command: { type: string; payload: object },
        userId: string
    ) {
        const payload = command.payload as Record<string, unknown>;

        switch (command.type) {
            case CommandType.EDIT_BLOG_SECTION:
                return await getBlogById(blogId, this.config.DATABASE_URL);

            case CommandType.REWRITE_TONE:
                if (payload.new_content) {
                    await updateBlog(
                        { content: payload.new_content as string },
                        blogId,
                        userId,
                        this.config.DATABASE_URL
                    );
                    return await getBlogById(blogId, this.config.DATABASE_URL);
                }
                return await getBlogById(blogId, this.config.DATABASE_URL);

            case CommandType.GENERATE_TITLE:
                if (payload.selected_title) {
                    await updateBlog(
                        { title: payload.selected_title as string },
                        blogId,
                        userId,
                        this.config.DATABASE_URL
                    );
                    return await getBlogById(blogId, this.config.DATABASE_URL);
                }
                return await getBlogById(blogId, this.config.DATABASE_URL);

            case CommandType.SEO_OPTIMIZE:
                return await getBlogById(blogId, this.config.DATABASE_URL);

            default:
                throw new BadRequestError(`Unknown command type: ${command.type}`);
        }
    }
}

// Factory function
export function createAIService(config: AppConfig): AIService {
    return new AIService(config);
}
