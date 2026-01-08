import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import {
    SignUpRequestSchema,
    SignInRequestSchema,
    AuthResponseSchema,
    AddBlogRequestSchema,
    UpdateBlogRequestSchema,
    BlogResponseSchema,
    BlogWithAuthorSchema,
    BlogsListResponseSchema,
    UserProfileSchema,
    UpdateProfileRequestSchema,
    ErrorResponseSchema,
    SuccessMessageSchema,
    HealthCheckSchema,
    BlogIdParamSchema,
    PageParamSchema,
    BlogTagType
} from './openapi.schemas'

const app = new OpenAPIHono()

// ============================================
// Health Check
// ============================================

const healthRoute = createRoute({
    method: 'get',
    path: '/health',
    tags: ['Health'],
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: HealthCheckSchema
                }
            },
            description: 'Health check successfull'
        }
    }
})

app.openapi(healthRoute, (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    })
})

// ============================================
// Auth Routes
// ============================================

const signupRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/signup',
    tags: ['Authentication'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: SignUpRequestSchema
                }
            }
        }
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: AuthResponseSchema
                }
            },
            description: 'User registered successfully'
        },
        400: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Validation error'
        },
        503: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Server configuration error'
        }
    }
})

const signinRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/signin',
    tags: ['Authentication'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: SignInRequestSchema
                }
            }
        }
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: AuthResponseSchema
                }
            },
            description: 'User signed in successfully'
        },
        400: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Invalid credentials'
        },
        503: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Server configuration error'
        }
    }
})

const logoutRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/logout',
    tags: ['Authentication'],
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: SuccessMessageSchema
                }
            },
            description: 'User logged out successfully'
        }
    }
})

const googleCallbackRoute = createRoute({
    method: 'get',
    path: '/api/v1/auth/google/callback',
    tags: ['Authentication'],
    responses: {
        302: {
            description: 'Redirect to frontend after authentication'
        },
        400: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Missing authorization code'
        },
        500: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Server configuration error'
        }
    }
})

const refreshTokenRoute = createRoute({
    method: 'get',
    path: '/api/v1/auth/refresh',
    tags: ['Authentication'],
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: SuccessMessageSchema
                }
            },
            description: 'Token refreshed successfully'
        },
        401: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Unauthorized - missing refresh token'
        }
    }
})

// Register auth routes (dummy handlers for documentation only)
app.openapi(signupRoute, (c) => c.json({ id: '', email: '', name: '', createdAt: '' }, 200))
app.openapi(signinRoute, (c) => c.json({ id: '', email: '', name: '', createdAt: '' }, 200))
app.openapi(logoutRoute, (c) => c.json({ message: 'User logged out' }))
app.openapi(googleCallbackRoute, (c) => c.redirect('/'))
app.openapi(refreshTokenRoute, (c) => c.json({ message: 'Token refreshed' }, 200))

// ============================================
// Blog Routes (All require authentication)
// ============================================

const getBlogsRoute = createRoute({
    method: 'get',
    path: '/api/v1/blog/blogs/{page}',
    tags: ['Blog'],
    security: [{ Bearer: [] }],
    request: {
        params: PageParamSchema
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: BlogsListResponseSchema
                }
            },
            description: 'Paginated list of blogs'
        },
        400: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Invalid page number'
        },
        500: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Server error'
        }
    }
})

const addBlogRoute = createRoute({
    method: 'post',
    path: '/api/v1/blog/addBlog',
    tags: ['Blog'],
    security: [{ Bearer: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: AddBlogRequestSchema
                }
            }
        }
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: BlogResponseSchema
                }
            },
            description: 'Blog created successfully'
        },
        400: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Validation error'
        },
        401: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Unauthorized'
        }
    }
})

const updateBlogRoute = createRoute({
    method: 'patch',
    path: '/api/v1/blog/updateBlog/{id}',
    tags: ['Blog'],
    security: [{ Bearer: [] }],
    request: {
        params: BlogIdParamSchema,
        body: {
            content: {
                'application/json': {
                    schema: UpdateBlogRequestSchema
                }
            }
        }
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: BlogResponseSchema
                }
            },
            description: 'Blog updated successfully'
        },
        400: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Validation error or missing ID'
        },
        401: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Unauthorized'
        }
    }
})

const deleteBlogRoute = createRoute({
    method: 'delete',
    path: '/api/v1/blog/delete/{id}',
    tags: ['Blog'],
    security: [{ Bearer: [] }],
    request: {
        params: BlogIdParamSchema
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: SuccessMessageSchema
                }
            },
            description: 'Blog deleted successfully'
        },
        400: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Missing blog or user ID'
        },
        401: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Unauthorized'
        }
    }
})

const getBlogRoute = createRoute({
    method: 'get',
    path: '/api/v1/blog/blog/{id}',
    tags: ['Blog'],
    security: [{ Bearer: [] }],
    request: {
        params: BlogIdParamSchema
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: BlogWithAuthorSchema
                }
            },
            description: 'Blog retrieved successfully'
        },
        400: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Missing blog ID'
        },
        404: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Blog not found'
        }
    }
})

const getMyBlogsRoute = createRoute({
    method: 'get',
    path: '/api/v1/blog/my-blogs',
    tags: ['Blog'],
    security: [{ Bearer: [] }],
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: BlogsListResponseSchema
                }
            },
            description: 'User blogs retrieved successfully'
        },
        400: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Missing user ID'
        },
        401: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Unauthorized'
        }
    }
})

// Register blog routes (dummy handlers for documentation only)
app.openapi(getBlogsRoute, (c) => c.json({ blogs: [], totalPages: 0, currentPage: 1 }, 200))
app.openapi(addBlogRoute, (c) => c.json({ id: '', title: '', content: '', thumbnail: '', tag: 'GENERAL' as BlogTagType, authorId: '', createdAt: '', published: false, like: 0 }, 200))
app.openapi(updateBlogRoute, (c) => c.json({ id: '', title: '', content: '', thumbnail: '', tag: 'GENERAL' as BlogTagType, authorId: '', createdAt: '', published: false, like: 0 }, 200))
app.openapi(deleteBlogRoute, (c) => c.json({ message: 'Blog deleted' }, 200))
app.openapi(getBlogRoute, (c) => c.json({ id: '', title: '', content: '', tag: 'GENERAL' as BlogTagType, createdAt: '', published: false, like: 0, author: { name: '' } }, 200))
app.openapi(getMyBlogsRoute, (c) => c.json({ blogs: [], totalPages: 0, currentPage: 1 }, 200))


// ============================================
// User Routes (All require authentication)
// ============================================

const getProfileRoute = createRoute({
    method: 'get',
    path: '/api/v1/user/profile_info',
    tags: ['User'],
    security: [{ Bearer: [] }],
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: UserProfileSchema
                }
            },
            description: 'User profile retrieved successfully'
        },
        400: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Missing user ID'
        },
        401: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Unauthorized'
        },
        503: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Server configuration error'
        }
    }
})

const updateProfileRoute = createRoute({
    method: 'patch',
    path: '/api/v1/user/update_profile',
    tags: ['User'],
    security: [{ Bearer: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: UpdateProfileRequestSchema
                }
            }
        }
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: UserProfileSchema
                }
            },
            description: 'Profile updated successfully'
        },
        400: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Validation error or missing user ID'
        },
        401: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Unauthorized'
        },
        503: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema
                }
            },
            description: 'Server configuration error'
        }
    }
})

// Register user routes (dummy handlers for documentation only)
app.openapi(getProfileRoute, (c) => c.json({ name: '', email: '', createdAt: '' }, 200))
app.openapi(updateProfileRoute, (c) => c.json({ name: '', email: '', createdAt: '' }, 200))

// ============================================
// OpenAPI Documentation
// ============================================

app.doc('/doc', {
    openapi: '3.0.0',
    info: {
        version: '1.0.0',
        title: 'Blogify API',
        description: 'API documentation for the Blogify backend application'
    },
    servers: [
        {
            url: 'http://localhost:8787',
            description: 'Development server'
        }
    ]
})

app.get('/ui', swaggerUI({ url: './doc' }))

export default app
