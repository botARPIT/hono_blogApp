/**
 * AI Integration Types
 * Shared types for Blogify ↔ Blogify-AI communication
 */

import { z } from 'zod';

// ============================================
// AI JOB TYPES
// ============================================

export enum AIJobStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

export interface AIJob {
    id: string;
    userId: string;
    topic: string;
    audience: string | null;
    tone: string;
    status: AIJobStatus;
    stage: string | null;
    progress: number;
    blogId: string | null;
    errorCode: string | null;
    errorMessage: string | null;
    retryCount: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date | null;
}

// Repository DTOs
export interface CreateAIJobDTO {
    userId: string;
    topic: string;
    audience: string;
    tone: string;
}

export interface UpdateAIJobDTO {
    status?: AIJobStatus;
    stage?: string;
    progress?: number;
    blogId?: string;
    errorCode?: string;
    errorMessage?: string;
    retryCount?: number;
    completedAt?: Date;
}

export interface CreateConversationDTO {
    userId: string;
    blogId?: string;
}

export interface CreateMessageDTO {
    conversationId: string;
    role: MessageRole;
    content: string;
    commands?: object[];
    tokenCount?: number;
}


// Request to start AI generation
export const aiGenerateRequestSchema = z.object({
    topic: z.string().min(10, 'Topic must be at least 10 characters').max(500),
    tag: z.string(),
    audience: z.string().max(200).optional(),
    tone: z.enum(['professional', 'casual', 'technical']).default('professional')
});

export type AIGenerateRequest = z.infer<typeof aiGenerateRequestSchema>;

// Response from AI generation initiation
export interface AIGenerateResponse {
    job_id: string;
    status: 'pending';
    estimated_time_seconds: number;
    poll_url: string;
}

// AI job status response
export interface AIJobStatusResponse {
    job_id: string;
    status: AIJobStatus;
    stage?: string;
    progress_percent?: number;
    blog_id?: string;
    error?: string;
}

// ============================================
// BLOGIFY-AI API TYPES
// ============================================

// Request TO Blogify-AI for blog generation
export interface BlogifyAIBlogRequest {
    job_id: string;
    user_id: string;
    topic: string;
    audience: string;
    tone: string;
    user_plan: string;
    callback_url: string;
}

// Response FROM Blogify-AI
export interface BlogifyAIBlogResponse {
    job_id: string;
    accepted: boolean;
    message: string;
}

// ============================================
// WEBHOOK TYPES
// ============================================

export type AIEventType = 'job_completed' | 'job_failed' | 'job_progress';

export interface AIEventPayload {
    event_type: AIEventType;
    job_id: string;
    timestamp: string;

    // For job_completed
    result?: {
        title: string;
        content: string;
        word_count: number;
        sources: Array<{ title: string; url: string }>;
        outline: object;
    };

    // For job_failed
    error?: {
        code: string;
        message: string;
        retryable: boolean;
    };

    // For job_progress
    progress?: {
        stage: string;
        percent: number;
    };
}

// Webhook verification
export const webhookPayloadSchema = z.object({
    event_type: z.enum(['job_completed', 'job_failed', 'job_progress']),
    job_id: z.string().uuid(),
    timestamp: z.string(),
    result: z.object({
        title: z.string(),
        content: z.string(),
        word_count: z.number(),
        sources: z.array(z.object({
            title: z.string(),
            url: z.string()
        })),
        outline: z.object({}).passthrough()
    }).optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        retryable: z.boolean()
    }).optional(),
    progress: z.object({
        stage: z.string(),
        percent: z.number()
    }).optional()
});

// ============================================
// CHAT/COPILOT TYPES
// ============================================

export enum MessageRole {
    USER = 'USER',
    ASSISTANT = 'ASSISTANT',
    SYSTEM = 'SYSTEM'
}

export enum ConversationStatus {
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
    DELETED = 'DELETED'
}

// AI Command types
export enum CommandType {
    EDIT_BLOG_SECTION = 'EDIT_BLOG_SECTION',
    GENERATE_OUTLINE = 'GENERATE_OUTLINE',
    REWRITE_TONE = 'REWRITE_TONE',
    SEO_OPTIMIZE = 'SEO_OPTIMIZE',
    SUMMARIZE_DRAFT = 'SUMMARIZE_DRAFT',
    GENERATE_TITLE = 'GENERATE_TITLE',
    ADD_SOURCES = 'ADD_SOURCES',
    EXPAND_SECTION = 'EXPAND_SECTION'
}

export interface AICommand {
    type: CommandType;
    payload: object;
    confidence: number;
    explanation: string;
    requires_approval: boolean;
}

// Chat request schema
export const chatRequestSchema = z.object({
    conversation_id: z.string().uuid().optional(),
    blog_id: z.string().uuid().optional(),
    message: z.string().min(1).max(2000)
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

// Chat response
export interface ChatResponse {
    conversation_id: string;
    message_id: string;
    assistant_message: string;
    commands: AICommand[];
    can_apply: boolean;
    tokens_used: number;
    response_time_ms: number;
}

// Apply commands request
export const applyCommandsRequestSchema = z.object({
    conversation_id: z.string().uuid(),
    message_id: z.string().uuid(),
    command_indices: z.array(z.number().int().min(0))
});

export type ApplyCommandsRequest = z.infer<typeof applyCommandsRequestSchema>;

// Apply commands response
export interface ApplyCommandsResponse {
    success: boolean;
    applied_commands: number[];
    blog_updated: boolean;
    new_blog_state?: {
        title: string;
        content: string;
    };
    errors?: Array<{
        index: number;
        message: string;
    }>;
}

// ============================================
// INTERNAL API TYPES (Blogify → Blogify-AI)
// ============================================

export interface BlogStateContext {
    id: string;
    title: string;
    content: string;
    tag: string;
    word_count: number;
    published: boolean;
}

export interface UserProfileContext {
    id: string;
    name: string;
    plan: string;
}

export interface SystemContext {
    blog_state?: BlogStateContext;
    user_profile: UserProfileContext;
    available_commands: CommandType[];
}

export interface InternalChatRequest {
    conversation_id: string;
    user_id: string;
    user_plan: string;
    system_context: SystemContext;
    recent_messages: Array<{
        role: MessageRole;
        content: string;
    }>;
    user_message: string;
}

export interface InternalChatResponse {
    assistant_message: string;
    commands: AICommand[];
    reasoning_trace?: string;
    tokens_used: number;
    model_used: string;
}
