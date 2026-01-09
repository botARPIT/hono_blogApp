import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createBlogService } from '../../services/blog.service'
import * as blogRepo from '../../repositories/blog.repository'
import { NotFoundError } from '../../errors/app-error'
import { BlogTag, type CreatedBlogDTO, type DeletedBlogDTO, type GetBlogDTO } from '../../types/blog.types'

vi.mock('../../repositories/blog.repository')

describe('Blog service tests', () => {
    const mockedEnv = {
        DATABASE_URL: "abc",
        JWT_ACCESS_SECRET: "abc",
        JWT_REFRESH_SECRET: "abc",
        GOOGLE_CLIENT_ID: "abc",
        GOOGLE_CLIENT_SECRET: "abc",
        REDIRECT_URI: "abc",
        FRONTEND_REDIRECT_URL: "abc",
        FRONTEND_ORIGIN: "http://localhost:5173",
        ENVIRONMENT: "development" as const,
        RATE_LIMIT_KV: {} as KVNamespace<string>
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('tests for create blog method', () => {

        it('should create a blog successfully', async () => {
            //Arrange (creating the mock data i.e. expected structure)
            const mockBlog: CreatedBlogDTO = {
                id: '123',
                title: 'Test blog',
                content: 'Test content',
                thumbnail: 'test.jpg',
                tag: BlogTag.GENERAL,
                authorId: 'author123',
                createdAt: new Date(),
                published: true
            }

            vi.mocked(blogRepo.createBlog).mockResolvedValue(mockBlog)
            const service = createBlogService(mockedEnv)


            //Act (passing test data to the service)
            const result = await service.addBlog(
                { title: 'Test blog', content: 'Test content', thumbnail: 'test.jpg', tag: BlogTag.GENERAL, published: true },
                'author123')

            //Assert (checking if the mocked data is equal to the response returned by the service)
            expect(result).toEqual(mockBlog)
            expect(blogRepo.createBlog).toHaveBeenCalledWith(
                { title: 'Test blog', content: 'Test content', thumbnail: 'test.jpg', tag: BlogTag.GENERAL, published: true },
                'author123',
                mockedEnv.DATABASE_URL
            )

        })
        it('should throw an error', async () => {
            //Testing the scenario where the infra(database) fails/throws unexpected errors
            vi.mocked(blogRepo.createBlog).mockRejectedValue(new Error("DB Error"))
            const service = createBlogService(mockedEnv)

            const result = await expect(service.addBlog(
                { title: 'a', content: 'a', tag: BlogTag.ART, thumbnail: 'a.jpg', published: true },
                'a123')).rejects.toThrow("DB Error")
        })
    })

    describe('tests for update blog method', () => {
        it('should update the blog', async () => {
            const updatedMockBlog = {
                id: '456',
                title: "Test title",
                content: "Updated content",
                tag: BlogTag.INFOTAINMENT,
                thumbnail: 'test.jpg',
                authorId: 'author456',
                createdAt: new Date(),
                published: true
            }
            vi.mocked(blogRepo.updateBlog).mockResolvedValue(updatedMockBlog)

            const service = createBlogService(mockedEnv)
            const updatedBlog = await service.update({ content: 'Updated content' },
                '456',
                'author456'
            )
            expect(blogRepo.updateBlog).toHaveBeenCalledWith({ content: "Updated content" },
                '456',
                'author456',
                mockedEnv.DATABASE_URL
            )

            expect(updatedBlog).toEqual(updatedMockBlog)

        })

        it('should throw an error', async () => {
            vi.mocked(blogRepo.updateBlog).mockRejectedValue(new Error('DB Error'))
            const service = createBlogService(mockedEnv)
            const result = await expect(service.update({ title: 'x' }, '456', 'author123'))
                .rejects.toThrow("DB Error")
        })
    })

    describe('tests for delete blog method', () => {
        it('should delete a blog', async () => {
            //Assign 
            const deletedMockBlog = {
                id: '124',
                title: 'Test title',
                content: 'Test content',
                thumbnail: 'Test.jpg',
                tag: BlogTag.WILDLIFE,
                createdAt: new Date(),
                updatedAt: new Date(),
                authorId: 'author123',
                like: 2,
                published: true
            }

            vi.mocked(blogRepo.deleteBlog).mockResolvedValue(deletedMockBlog)
            const service = createBlogService(mockedEnv)
            const result = await service.delete('124', 'author123')
            expect(result).toEqual(deletedMockBlog)
            expect(blogRepo.deleteBlog).toHaveBeenCalledWith('124', 'author123', mockedEnv.DATABASE_URL)

        })

        it('should throw an error', async () => {
            vi.mocked(blogRepo.deleteBlog).mockRejectedValue(new Error('DB Error'))
            const service = createBlogService(mockedEnv)
            const result = await expect(service.delete('abc', '123'))
                .rejects.toThrow("DB Error")
        })
    })

    describe('tests for getBlogById method', () => {
        it('should return a blog', async () => {
            const returnedMockBlog: GetBlogDTO = {
                id: '567',
                title: "Test title",
                content: 'Test content',
                tag: BlogTag.MOVIES,
                createdAt: new Date(),
                published: true,
                like: 1,
                author: { name: 'Test Author' }
            }

            vi.mocked(blogRepo.getBlogById).mockResolvedValue(returnedMockBlog)
            const service = createBlogService(mockedEnv)
            const result = await service.getBlog('567')
            expect(result).toEqual(returnedMockBlog)
            expect(blogRepo.getBlogById).toHaveBeenCalledWith('567', mockedEnv.DATABASE_URL)
        })

        it('should return null', async () => {
            vi.mocked(blogRepo.getBlogById).mockResolvedValue(null)

            const service = createBlogService(mockedEnv)
            const result = await expect(service.getBlog('123')).rejects.toThrow("Blog not found")

            expect(blogRepo.getBlogById).toHaveBeenCalledWith('123', mockedEnv.DATABASE_URL)
        })

        it('should throw an error', async () => {
            vi.mocked(blogRepo.getBlogById).mockRejectedValue(new Error("DB Error"))

            const service = createBlogService(mockedEnv)
            await expect(service.getBlog('789')).rejects.toThrow('DB Error')
        })
    })
    describe('test for getBlogs method', () => {
        it('should return 10 blogs at a time', async () => {
            const mockedBlogs = [{
                id: '1',
                title: 'Test blog',
                content: 'Test content',
                tag: BlogTag.GENERAL,
                createdAt: new Date(),
                like: 3,
                published: true
            }, {
                id: '2',
                title: 'Test blog',
                content: 'Test content',
                tag: BlogTag.GENERAL,
                createdAt: new Date(),
                like: 3,
                published: true
            }, {
                id: '3',
                title: 'Test blog',
                content: 'Test content',
                tag: BlogTag.GENERAL,
                createdAt: new Date(),
                like: 3,
                published: true
            }, {
                id: '4',
                title: 'Test blog',
                content: 'Test content',
                tag: BlogTag.GENERAL,
                createdAt: new Date(),
                like: 3,
                published: true
            }, {
                id: '5',
                title: 'Test blog',
                content: 'Test content',
                tag: BlogTag.GENERAL,
                createdAt: new Date(),
                like: 3,
                published: true
            }, {
                id: '6',
                title: 'Test blog',
                content: 'Test content',
                tag: BlogTag.GENERAL,
                createdAt: new Date(),
                like: 3,
                published: true
            }, {
                id: '7',
                title: 'Test blog',
                content: 'Test content',
                tag: BlogTag.GENERAL,
                createdAt: new Date(),
                like: 3,
                published: true
            }, {
                id: '8',
                title: 'Test blog',
                content: 'Test content',
                tag: BlogTag.GENERAL,
                createdAt: new Date(),
                like: 3,
                published: true
            }, {
                id: '9',
                title: 'Test blog',
                content: 'Test content',
                tag: BlogTag.GENERAL,
                createdAt: new Date(),
                like: 3,
                published: true
            }, {
                id: '10',
                title: 'Test blog',
                content: 'Test content',
                tag: BlogTag.GENERAL,
                createdAt: new Date(),
                like: 3,
                published: true
            }, {
                id: '11',
                title: 'Test blog',
                content: 'Test content',
                tag: BlogTag.GENERAL,
                createdAt: new Date(),
                like: 3,
                published: true
            }, {
                id: '12',
                title: 'Test blog',
                content: 'Test content',
                tag: BlogTag.GENERAL,
                createdAt: new Date(),
                like: 3,
                published: true
            }]

            const pageOneBlogs = mockedBlogs.slice(0, 10) as GetBlogDTO[]
            vi.mocked(blogRepo.getAllBlogs).mockResolvedValue(pageOneBlogs)
            const service = createBlogService(mockedEnv);
            const result = await service.getBlogs(1)
            expect(result).toEqual(pageOneBlogs)
            expect(result?.length).toEqual(10)
            expect(blogRepo.getAllBlogs).toHaveBeenCalledWith(1, mockedEnv.DATABASE_URL)
        })

        it('should return null if no blogs found', async () => {
            vi.mocked(blogRepo.getAllBlogs).mockResolvedValue([])

            const service = createBlogService(mockedEnv)
            const result = service.getBlogs(1)
            await expect(result).rejects.toThrow("Cannot find blogs")
            await expect(result).rejects.toBeInstanceOf(Error)
            expect(blogRepo.getAllBlogs).toHaveBeenCalledWith(1, mockedEnv.DATABASE_URL)
        })

        it('should return an error', async () => {
            vi.mocked(blogRepo.getAllBlogs).mockRejectedValue(new Error("DB Error"))
            const service = createBlogService(mockedEnv)
            await expect(service.getBlogs(1)).rejects.toThrow("DB Error")
        })
    })

    describe('tests for getUserBlogs method', () => {
        it('should return user blogs', async () => {
            const mockedUserBlogs = [{
                id: '1',
                title: 'User blog 1',
                content: 'Content 1',
                createdAt: new Date(),
                tag: BlogTag.GAMING,
                like: 2,
                published: true
            }, {
                id: '2',
                title: 'User blog 2',
                content: 'Content 2',
                createdAt: new Date(),
                tag: BlogTag.PHILOSOPHY,
                like: 6,
                published: true
            }]

            vi.mocked(blogRepo.getUserBlogs).mockResolvedValue(mockedUserBlogs as GetBlogDTO[])
            const service = createBlogService(mockedEnv)
            const result = await service.getUserBlogs('user123')
            expect(result).toEqual(mockedUserBlogs)
            expect(blogRepo.getUserBlogs).toHaveBeenCalledWith('user123', mockedEnv.DATABASE_URL)
        })

        it('should throw NotFoundError if user has no blogs', async () => {
            vi.mocked(blogRepo.getUserBlogs).mockResolvedValue([])
            const service = createBlogService(mockedEnv)
            await expect(service.getUserBlogs('user445')).rejects.toThrow("No blogs found for this user")
            expect(blogRepo.getUserBlogs).toHaveBeenCalledWith('user445', mockedEnv.DATABASE_URL)
        })

        it('should throw error on database failure', async () => {
            vi.mocked(blogRepo.getUserBlogs).mockRejectedValue(new Error("DB Error"))
            const service = createBlogService(mockedEnv)
            await expect(service.getUserBlogs('user123')).rejects.toThrow("DB Error")
        })
    })
})
