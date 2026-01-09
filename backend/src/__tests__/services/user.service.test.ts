
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createUserService } from "../../services/user.service";
import * as userRepo from '../../repositories/user.repository'
import { AppError } from '../../errors/app-error';

vi.mock('../../repositories/user.repository')
describe('Tests for user service', () => {
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
    const service = createUserService(mockedEnv)
    describe("tests for getProfileInfo method", () => {
        it('should return the user profile', async () => {
            const mockedUserDetails = {
                id: "123",
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

    describe("tests for updateProfile method", () => {
        it('should update and return the user profile', async () => {
            const mockedUpdatedUser = {
                id: "123",
                name: "Updated Name",
                email: "updated@mail.com",
                createdAt: new Date()
            }
            vi.mocked(userRepo.updateProfile).mockResolvedValue(mockedUpdatedUser)

            const result = await service.updateProfile("123", { name: "Updated Name" })
            expect(result).toEqual(mockedUpdatedUser)
            expect(userRepo.updateProfile).toHaveBeenCalledWith("123", { name: "Updated Name" }, mockedEnv.DATABASE_URL)
        })
    })
})