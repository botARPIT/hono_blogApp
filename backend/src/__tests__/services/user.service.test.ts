
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createUserService } from "../../services/user.service";
import { EnvironmentVariables } from '../../types/env.types';
import * as userRepo from '../../repositories/user.repository'
import { AppError } from '../../errors/app-error';
import { BlogTag } from '@prisma/client/edge';

vi.mock('../../repositories/user.repository')
describe('Tests for user service', () => {
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
    const service = createUserService(mockedEnv)
    describe("tests for getProfileInfo method", () => {
        it('should return the user profile', async () => {
            const mockedUserDetails = {
                name: "abc",
                email: "abc@mail.com",
                createdAt: new Date()
            }
            vi.mocked(userRepo.getUserProfile).mockResolvedValue(mockedUserDetails)

            const result = await service.getProfileInfo("123")
            expect(result).toEqual(mockedUserDetails)
            expect(userRepo.getUserProfile).toHaveBeenCalledWith("123", mockedEnv.DATABASE_URL)
        })

        it('should throw an NotFound Error if user not found', async () => {
            vi.mocked(userRepo.getUserProfile).mockResolvedValue(null)
            await expect(service.getProfileInfo('user123')).rejects.toThrow("Unable to find the user")
            await expect(service.getProfileInfo('user123')).rejects.toBeInstanceOf(AppError)
            expect(userRepo.getUserProfile).toHaveBeenCalledWith("user123", mockedEnv.DATABASE_URL)
        })
    })

    describe('tests for getUser blogs method', () => {
        it('should return user blogs', async () => {
            const mockedUserBlogs = [{
                id: '1',
                title: 'This is test title',
                content: 'This is test content',
                createdAt: new Date(),
                tag: BlogTag.GAMING,
                like: 2
            }, {
                id: '2',
                title: 'This is test title2',
                content: 'This is test content2',
                createdAt: new Date(),
                tag: BlogTag.PHILOSOPHY,
                like: 6
            }]

            vi.mocked(userRepo.getUserBlogs).mockResolvedValue(mockedUserBlogs)
            const result = await service.getBlogs('user123')
            expect(result).toEqual(mockedUserBlogs)
            expect(userRepo.getUserBlogs).toHaveBeenCalledWith('user123', mockedEnv.DATABASE_URL)
        })

        it('should throw NotFound Error if user has no blogs', async () => {
            vi.mocked(userRepo.getUserBlogs).mockResolvedValue(null)
            await expect(service.getBlogs('user445')).rejects.toThrow("No blogs found for the user")
            await expect(service.getBlogs('user445')).rejects.toBeInstanceOf(AppError)
            expect(userRepo.getUserBlogs).toHaveBeenCalledWith('user445', mockedEnv.DATABASE_URL)
        })
    })
})