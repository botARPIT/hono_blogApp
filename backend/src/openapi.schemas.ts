import { z } from '@hono/zod-openapi'

// ============================================
// Shared Constants
// ============================================

export const BlogTagValues = ['SOCIAL', 'TECH', 'ENTERTAINMENT', 'INFOTAINMENT', 'SPORTS', 'MOVIES', 'GAMING', 'PHILOSOPHY', 'SCIENCE', 'ART', 'NATURE', 'WILDLIFE', 'GENERAL'] as const
export type BlogTagType = typeof BlogTagValues[number]

export const AuthProviderValues = ['LOCAL', 'GOOGLE'] as const
export type AuthProviderType = typeof AuthProviderValues[number]

export const ErrorCodeValues = [
    'BAD REQUEST',
    'UNAUTHORIZED',
    'NOT FOUND',
    'VALIDATION FAILED',
    'INTERNAL ERROR',
    'ZOD_ERROR',
    'DB_ERROR',
    'AUTH_ERROR',
    'CONFIG_ERROR'
] as const
export type ErrorCodeType = typeof ErrorCodeValues[number]

// ============================================
// Auth Schemas
// ============================================

export const SignUpRequestSchema = z.object({
    name: z.string().toLowerCase().trim().openapi({
        example: 'john doe',
        description: 'User full name'
    }),
    email: z.string().email().toLowerCase().trim().openapi({
        example: 'john@example.com',
        description: 'User email address'
    }),
    password: z.string().min(8).max(100).openapi({
        example: 'securePassword123',
        description: 'User password (min 8, max 100 characters)'
    }),
    authProvider: z.enum(['LOCAL', 'GOOGLE']).optional().openapi({
        example: 'LOCAL',
        description: 'Authentication provider'
    })
}).openapi('SignUpRequest')

export const SignInRequestSchema = z.object({
    email: z.string().email().toLowerCase().trim().openapi({
        example: 'john@example.com',
        description: 'User email address'
    }),
    password: z.string().min(8).max(100).openapi({
        example: 'securePassword123',
        description: 'User password'
    })
}).openapi('SignInRequest')

export const AuthResponseSchema = z.object({
    id: z.string().openapi({ example: 'user_123' }),
    email: z.string().openapi({ example: 'john@example.com' }),
    name: z.string().openapi({ example: 'john doe' }),
    createdAt: z.string().openapi({ example: '2024-01-01T00:00:00.000Z' })
}).openapi('AuthResponse')

// ============================================
// Blog Schemas
// ============================================

export const AddBlogRequestSchema = z.object({
    title: z.string().min(10).max(100).trim().openapi({
        example: 'Introduction to TypeScript',
        description: 'Blog title (min 10, max 100 characters)'
    }),
    content: z.string().min(150).max(5000).trim().openapi({
        example: 'TypeScript is a strongly typed programming language...',
        description: 'Blog content (min 150, max 5000 characters)'
    }),
    thumbnail: z.string().trim().openapi({
        example: 'https://example.com/image.jpg',
        description: 'Blog thumbnail URL'
    }),
    tag: z.enum(['SOCIAL', 'TECH', 'ENTERTAINMENT', 'INFOTAINMENT', 'SPORTS', 'MOVIES', 'GAMING', 'PHILOSOPHY', 'SCIENCE', 'ART', 'NATURE', 'WILDLIFE', 'GENERAL']).openapi({
        example: 'TECH',
        description: 'Blog category tag'
    }),
    published: z.boolean().optional().default(false).openapi({
        example: true,
        description: 'Whether the blog is published'
    })
}).openapi('AddBlogRequest')

export const UpdateBlogRequestSchema = z.object({
    title: z.string().min(10).max(100).trim().optional().openapi({
        example: 'Updated Blog Title'
    }),
    content: z.string().min(150).max(2000).trim().optional().openapi({
        example: 'Updated content...'
    }),
    thumbnail: z.string().trim().optional().openapi({
        example: 'https://example.com/new-image.jpg'
    }),
    published: z.boolean().optional().openapi({
        example: true
    })
}).openapi('UpdateBlogRequest')

export const BlogResponseSchema = z.object({
    id: z.string().openapi({ example: 'blog_123' }),
    title: z.string().openapi({ example: 'Introduction to TypeScript' }),
    content: z.string().openapi({ example: 'TypeScript is...' }),
    thumbnail: z.string().openapi({ example: 'https://example.com/image.jpg' }),
    tag: z.enum(['SOCIAL', 'TECH', 'ENTERTAINMENT', 'INFOTAINMENT', 'SPORTS', 'MOVIES', 'GAMING', 'PHILOSOPHY', 'SCIENCE', 'ART', 'NATURE', 'WILDLIFE', 'GENERAL']).openapi({ example: 'TECH' }),
    authorId: z.string().openapi({ example: 'user_123' }),
    createdAt: z.string().openapi({ example: '2024-01-01T00:00:00.000Z' }),
    published: z.boolean().openapi({ example: true }),
    like: z.number().openapi({ example: 42 })
}).openapi('BlogResponse')

export const BlogWithAuthorSchema = z.object({
    id: z.string().openapi({ example: 'blog_123' }),
    title: z.string().openapi({ example: 'Introduction to TypeScript' }),
    content: z.string().openapi({ example: 'TypeScript is...' }),
    tag: z.enum(['SOCIAL', 'TECH', 'ENTERTAINMENT', 'INFOTAINMENT', 'SPORTS', 'MOVIES', 'GAMING', 'PHILOSOPHY', 'SCIENCE', 'ART', 'NATURE', 'WILDLIFE', 'GENERAL']).openapi({ example: 'TECH' }),
    createdAt: z.string().openapi({ example: '2024-01-01T00:00:00.000Z' }),
    published: z.boolean().openapi({ example: true }),
    like: z.number().openapi({ example: 42 }),
    author: z.object({
        name: z.string().openapi({ example: 'john doe' })
    })
}).openapi('BlogWithAuthor')

export const BlogsListResponseSchema = z.object({
    blogs: z.array(BlogWithAuthorSchema),
    totalPages: z.number().openapi({ example: 10 }),
    currentPage: z.number().openapi({ example: 1 })
}).openapi('BlogsListResponse')

// ============================================
// User Schemas
// ============================================

export const UserProfileSchema = z.object({
    name: z.string().openapi({ example: 'john doe' }),
    email: z.string().openapi({ example: 'john@example.com' }),
    createdAt: z.string().openapi({ example: '2024-01-01T00:00:00.000Z' })
}).openapi('UserProfile')

export const UpdateProfileRequestSchema = z.object({
    name: z.string().toLowerCase().trim().optional().openapi({
        example: 'jane doe'
    }),
    email: z.string().email().toLowerCase().trim().optional().openapi({
        example: 'jane@example.com'
    })
}).openapi('UpdateProfileRequest')

// ============================================
// Common Schemas
// ============================================

export const ErrorResponseSchema = z.object({
    success: z.literal(false).openapi({
        example: false,
        description: 'Always false for error responses'
    }),
    error: z.object({
        code: z.enum([
            'BAD REQUEST',
            'UNAUTHORIZED',
            'NOT FOUND',
            'VALIDATION FAILED',
            'INTERNAL ERROR',
            'ZOD_ERROR',
            'DB_ERROR',
            'AUTH_ERROR',
            'CONFIG_ERROR'
        ]).openapi({
            example: 'VALIDATION FAILED',
            description: 'Error code indicating the type of error'
        }),
        message: z.string().openapi({
            example: 'Validation failed',
            description: 'Human-readable error message'
        }),
        details: z.record(z.string(), z.unknown()).nullable().optional().openapi({
            example: { field: 'email', reason: 'Invalid format' },
            description: 'Additional error details and metadata'
        })
    })
}).openapi('ErrorResponse')

export const SuccessMessageSchema = z.object({
    message: z.string().openapi({ example: 'Operation successful' })
}).openapi('SuccessMessage')

export const HealthCheckSchema = z.object({
    status: z.string().openapi({ example: 'ok' }),
    timestamp: z.string().openapi({ example: '2024-01-01T00:00:00.000Z' })
}).openapi('HealthCheck')

// ============================================
// Path Parameters
// ============================================

export const BlogIdParamSchema = z.object({
    id: z.string().openapi({
        param: {
            name: 'id',
            in: 'path'
        },
        example: 'blog_123',
        description: 'Blog ID'
    })
})

export const PageParamSchema = z.object({
    page: z.string().openapi({
        param: {
            name: 'page',
            in: 'path'
        },
        example: '1',
        description: 'Page number for pagination'
    })
})
