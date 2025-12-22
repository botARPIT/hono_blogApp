import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'

// 1. Initialize OpenAPIHono instead of regular Hono
const docsApp = new OpenAPIHono()

// 2. Define your schemas using Zod
const ParamsSchema = z.object({
    id: z
        .string()
        .openapi({
            param: {
                name: 'id',
                in: 'path',
            },
            example: '123',
        }),
})

const UserSchema = z.object({
    id: z.string().openapi({
        example: '123',
    }),
    name: z.string().openapi({
        example: 'John Doe',
    }),
    age: z.number().openapi({
        example: 42,
    }),
}).openapi('User')

// 3. Define the route (This is where the magic happens)
const route = createRoute({
    method: 'get',
    path: '/users/{id}',
    request: {
        params: ParamsSchema,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: UserSchema,
                },
            },
            description: 'Retrieve the user',
        },
    },
})

// 4. Register the route with its handler
docsApp.openapi(route, (c) => {
    const { id } = c.req.valid('param')
    return c.json({
        id,
        age: 20,
        name: 'Ultra-Man',
    })
})

// 5. Serve the OpenAPI specification
docsApp.doc('/doc', {
    openapi: '3.0.0',
    info: {
        version: '1.0.0',
        title: 'My API',
    },
})

// 6. Optionally, serve Swagger UI
docsApp.get('/ui', swaggerUI({ url: './doc' }))

export default docsApp
