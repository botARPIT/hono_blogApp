import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createBlogService } from '../../services/blog.service'
import * as blogRepo from '../../repositories/blog.repository'
import { BlogTag } from '@prisma/client/edge'
import {EnvironmentVariables } from '../../types/env.types'
import { DBError, NotFoundError } from '../../errors/app-error'

vi.mock('../../repositories/blog.repository')

describe('Blog service tests', () => {
    const mockedEnv: EnvironmentVariables = {
        DATABASE_URL: "abc",
        JWT_ACCESS_SECRET: "abc",
        JWT_REFRESH_SECRET: "abc",
        GOOGLE_CLIENT_ID: "abc",
        GOOGLE_CLIENT_SECRET: "abc",
        REDIRECT_URI: "abc",
        RATE_LIMIT_KV: "abc"
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

   describe('tests for create blog method', () => {

     it('should create a blog successfully', async () => {
        //Arrange (creating the mock data i.e. expected structure)
        const mockBlog = {
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
            {title: 'Test blog', content: 'Test content', thumbnail: 'test.jpg', tag: 'GENERAL'},
            'author123')

        //Assert (checking if the mocked data is equal to the response returned by the service)
        expect(result).toEqual(mockBlog)
        expect(blogRepo.createBlog).toHaveBeenCalledWith(
            {title: 'Test blog', content: 'Test content', thumbnail: 'test.jpg', tag: 'GENERAL'},
            'author123',
             mockedEnv.DATABASE_URL
        )

    })
         it('should throw an error', async() => {
            //Testing the scenario where the infra(database) fails/throws unexpected errors
            vi.mocked(blogRepo.createBlog).mockRejectedValue(new Error("DB Error"))
            const service = createBlogService(mockedEnv)

            const result = await expect(service.addBlog(
                {title: 'a', content: 'a', tag: 'ART', thumbnail: 'a.jpg'},
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
        const updatedBlog = await service.update({content: 'Updated content'},
            '456',
            'author456'
        )
        expect(blogRepo.updateBlog).toHaveBeenCalledWith({content: "Updated content"},
            '456',
            'author456',
            mockedEnv.DATABASE_URL
        )

        expect(updatedBlog).toEqual(updatedMockBlog)
    
    })

    it('should throw an error', async() => {
        vi.mocked(blogRepo.updateBlog).mockRejectedValue(new Error('DB Error'))
        const service =  createBlogService(mockedEnv)
        const result = await expect(service.update({title: 'x'}, '456', 'author123'))
        .rejects.toThrow("DB Error")
    })
   })

   describe('tests for delete blog method', () => {
    it('should delete a blog', async() => {
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

    it('should throw an error', async() => {
        vi.mocked(blogRepo.deleteBlog).mockRejectedValue(new Error('DB Error'))
        const service = createBlogService(mockedEnv)
        const result = await expect(service.delete('abc', '123'))
        .rejects.toThrow("DB Error")
    })
   })

   describe('tests for getBlogById method', () => {
        it('should return a blog', async() => {
            const returnedMockBlog = {
                id: '567',
                title: "Test title",
                content: 'Test content',
                thumbnail: 'test.jpg',
                tag: BlogTag.MOVIES,
                createdAt: new Date(),
                published: true,
                like: 1
            }

            vi.mocked(blogRepo.getBlogById).mockResolvedValue(returnedMockBlog)
            const service = createBlogService(mockedEnv)
            const result = await service.getBlog('567')
            expect(result).toEqual(returnedMockBlog)
            expect(blogRepo.getBlogById).toHaveBeenCalledWith('567', mockedEnv.DATABASE_URL)
        })

        it('should return null', async() => {
            vi.mocked(blogRepo.getBlogById).mockResolvedValue(null)

            const service = createBlogService(mockedEnv)
            const result = await expect(service.getBlog('123')).rejects.toThrow("Blog not found")
            
            expect(blogRepo.getBlogById).toHaveBeenCalledWith('123', mockedEnv.DATABASE_URL)
        })

        it('should throw an error', async() => {
            vi.mocked(blogRepo.getBlogById).mockRejectedValue(new Error("DB Error"))

            const service = createBlogService(mockedEnv)
            await expect(service.getBlog('789')).rejects.toThrow('DB Error')
        })
   })
   describe('test for getBlogs method', () => {
        it('should return 10 blogs at a time', async() => {
            const mockedBlogs = [{
            id: '1',
            title: 'Test blog',
            content: 'Test content',
            tag: BlogTag.GENERAL,
            createdAt: new Date(),
            like: 3
            }, {
            id: '2',
            title: 'Test blog',
            content: 'Test content',
            tag: BlogTag.GENERAL,
            createdAt: new Date(),
            like: 3
            }, {
            id: '3',
            title: 'Test blog',
            content: 'Test content',
            tag: BlogTag.GENERAL,
            createdAt: new Date(),
            like: 3
            }, {
            id: '4',
            title: 'Test blog',
            content: 'Test content',
            tag: BlogTag.GENERAL,
            createdAt: new Date(),
            like: 3
            }, {
            id: '5',
            title: 'Test blog',
            content: 'Test content',
            tag: BlogTag.GENERAL,
            createdAt: new Date(),
            like: 3
            }, {
            id: '6',
            title: 'Test blog',
            content: 'Test content',
            tag: BlogTag.GENERAL,
            createdAt: new Date(),
            like: 3
            }, {
            id: '7',
            title: 'Test blog',
            content: 'Test content',
            tag: BlogTag.GENERAL,
            createdAt: new Date(),
            like: 3
            }, {
            id: '8',
            title: 'Test blog',
            content: 'Test content',
            tag: BlogTag.GENERAL,
            createdAt: new Date(),
            like: 3
            }, {
            id: '9',
            title: 'Test blog',
            content: 'Test content',
            tag: BlogTag.GENERAL,
            createdAt: new Date(),
            like: 3
            }, {
            id: '10',
            title: 'Test blog',
            content: 'Test content',
            tag: BlogTag.GENERAL,
            createdAt: new Date(),
            like: 3
            },{
            id: '11',
            title: 'Test blog',
            content: 'Test content',
            tag: BlogTag.GENERAL,
            createdAt: new Date(),
            like: 3
            }, {
            id: '12',
            title: 'Test blog',
            content: 'Test content',
            tag: BlogTag.GENERAL,
            createdAt: new Date(),
            like: 3
            }]

            const pageOneBlogs = mockedBlogs.slice(0, 10)
            vi.mocked(blogRepo.getAllBlogs).mockResolvedValue(pageOneBlogs)
            const service = createBlogService(mockedEnv);
            const result = await service.getBlogs(1)
            expect(result).toEqual(pageOneBlogs)
            expect(result?.length).toEqual(10)
            expect(blogRepo.getAllBlogs).toHaveBeenCalledWith(1, mockedEnv.DATABASE_URL)
        })

        it('should return null if no blogs found', async() => {
            vi.mocked(blogRepo.getAllBlogs).mockResolvedValue([])

            const service = createBlogService(mockedEnv)
            const result = service.getBlogs(1)
            await expect(result).rejects.toThrow("Cannot find blogs")
            await expect(result).rejects.toBeInstanceOf(Error)
            expect(blogRepo.getAllBlogs).toHaveBeenCalledWith(1, mockedEnv.DATABASE_URL)
        })

        it('should return an error', async() => {
            vi.mocked(blogRepo.getAllBlogs).mockRejectedValue(new Error("DB Error"))
            const service = createBlogService(mockedEnv)
            await expect(service.getBlogs(1)).rejects.toThrow("DB Error")
        })
    })
})
