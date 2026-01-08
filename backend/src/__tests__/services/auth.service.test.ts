import { describe, it, vi, expect, beforeEach } from 'vitest'
import * as authRepo from '../../repositories/auth.repository'
import { createAuthService } from '../../services/auth.service'
import * as jwtUtil from '../../utils/jwt'
import * as hashUtil from '../../utils/hashUsingWebCrypto'
import { setCookies } from '../../utils/setCookies'
import { Environment } from 'vite'
import { EnvironmentVariables } from '../../types/env.types'
import { AuthProvider } from '@prisma/client/edge'
import { ExistingUserDTO } from '../../types/user.types'
import { AppError, BadRequestError } from '../../errors/app-error'

vi.mock('../../repositories/auth.repository')
vi.mock('../../utils/jwt')
vi.mock('../../utils/hashUsingWebCrypto')
vi.mock('../../utils/setCookies')

describe('Testing the auth service', () => {
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

    const service = createAuthService(mockedEnv)


    describe('tests for signup method', () => {
        it('should return access and refresh tokens', async () => {
            const mockedSignupUser = {
                name: "Test name",
                email: "Test@mail.com",
                password: "Test password",
            }

            const mockedCreatedUser = {
                id: 'user123',
                name: mockedSignupUser.name,
                email: mockedSignupUser.email,
                createdAt: new Date()
            }

            const mockedPayload = {
                id: mockedCreatedUser.id,
                name: mockedCreatedUser.name
            }
            const mockedTokens = {
                accessToken: "Test access token",
                refreshToken: "Test refresh token"
            }
            const mockedHashedPassword = "Test hash"
            vi.mocked(authRepo.findUniqueUser).mockResolvedValue(null)
            vi.mocked(hashUtil.hashPassword).mockResolvedValue(mockedHashedPassword)
            vi.mocked(authRepo.createUser).mockResolvedValue(mockedCreatedUser)
            vi.mocked(jwtUtil.generateTokens).mockReturnValue(mockedTokens)

            const result = await service.signup(mockedSignupUser)

            expect(result).toEqual(mockedTokens)
            expect(authRepo.findUniqueUser).toHaveBeenCalledWith(mockedSignupUser.email, mockedEnv.DATABASE_URL)
            expect(hashUtil.hashPassword).toHaveBeenCalledWith(mockedSignupUser.password)
            expect(authRepo.createUser).toHaveBeenCalledWith(mockedSignupUser.name, mockedSignupUser.email, mockedHashedPassword, mockedEnv.DATABASE_URL, AuthProvider.LOCAL)
            expect(jwtUtil.generateTokens).toHaveBeenCalledWith(mockedPayload, mockedEnv.JWT_ACCESS_SECRET, mockedEnv.JWT_REFRESH_SECRET)
        })

        it('should throw BadRequestError when user already exists with password', async () => {
            const mockedSignupUser = {
                name: "Test",
                email: "test@mail.com",
                password: "Test password"
            }

            const mockedExistingUser = {
                id: "User123",
                name: mockedSignupUser.name,
                email: mockedSignupUser.email,
                password: "Hashed password",
                authProvider: AuthProvider.LOCAL
            }

            vi.mocked(authRepo.findUniqueUser).mockResolvedValue(mockedExistingUser)
            await expect(service.signup(mockedSignupUser)).rejects.toThrow("User already exists")
            expect(authRepo.findUniqueUser).toHaveBeenCalledWith(mockedSignupUser.email, mockedEnv.DATABASE_URL)
        })

        it('should throw BadRequestError when user already exists with google account', async () => {
            const mockedSignupUser = {
                name: "Test",
                email: "test@mail.com",
                password: null
            }

            const mockedExistingUser = {
                id: "User123",
                name: mockedSignupUser.name,
                email: mockedSignupUser.email,
                password: null,
                authProvider: AuthProvider.GOOGLE
            }

            vi.mocked(authRepo.findUniqueUser).mockResolvedValue(mockedExistingUser)
            await expect(service.signup(mockedSignupUser)).rejects.toThrow("User already exists")
            expect(authRepo.findUniqueUser).toHaveBeenCalledWith(mockedSignupUser.email, mockedEnv.DATABASE_URL)
        })


        it('should throw an AppError when the hashing service fails', async () => {
            const mockedSignupUser = {
                name: "Test",
                email: "test@mail.com",
                password: "Test password"
            }

            vi.mocked(authRepo.findUniqueUser).mockResolvedValue(null)
            vi.mocked(hashUtil.hashPassword).mockRejectedValue(undefined)

            await expect(service.signup(mockedSignupUser)).rejects.toThrow("Hashing service failed")

            expect(authRepo.findUniqueUser).toHaveBeenCalledWith(mockedSignupUser.email, mockedEnv.DATABASE_URL)
            expect(hashUtil.hashPassword).toHaveBeenCalledWith(mockedSignupUser.password)

        })

        it("should throw AppError when the service fails fails to create user after successfully hashing the password", async () => {
            const mockedSignupUser = {
                name: "User456",
                email: "test@mail.com",
                password: "Test password"
            }

            const mockedHashedPassword = "Hashed password"

            vi.mocked(authRepo.findUniqueUser).mockResolvedValue(null)
            vi.mocked(hashUtil.hashPassword).mockResolvedValue(mockedHashedPassword)
            vi.mocked(authRepo.createUser).mockResolvedValue(null)
            await expect(service.signup(mockedSignupUser)).rejects.toThrow("Unable to create user")
            await expect(service.signup(mockedSignupUser)).rejects.toBeInstanceOf(Error)

            expect(authRepo.findUniqueUser).toHaveBeenCalledWith(mockedSignupUser.email, mockedEnv.DATABASE_URL)
            expect(hashUtil.hashPassword).toHaveBeenCalledWith(mockedSignupUser.password)
            expect(authRepo.createUser).toHaveBeenCalledWith(mockedSignupUser.name, mockedSignupUser.email, mockedHashedPassword, mockedEnv.DATABASE_URL, AuthProvider.LOCAL)
        })

    })

    describe('tests for signin method of auth service', () => {
        const mockedSignupUser = {
            email: "test@mail.com",
            password: "Test pass",
            authProvider: AuthProvider.LOCAL
        }

        const mockedHashedPassword = "Hashed password"
        const mockedExistingUser = {
            id: 'user123',
            name: 'Test name',
            email: mockedSignupUser.email,
            password: mockedHashedPassword,
            authProvider: AuthProvider.LOCAL
        }
        const mockedTokens = {
            accessToken: "This is mocked access token",
            refreshToken: "This is mocked refresh token"
        }

        const mockedPayload = {
            id: mockedExistingUser.id,
            name: mockedExistingUser.name
        }
        it('should return tokens on successfull signin when using email and password', async () => {
            vi.mocked(authRepo.findUniqueUser).mockResolvedValue(mockedExistingUser)
            vi.mocked(hashUtil.compareHash).mockResolvedValue(true)
            vi.mocked(jwtUtil.generateTokens).mockReturnValue(mockedTokens)

            const result = await service.signin(mockedSignupUser)

            expect(result).toEqual(mockedTokens)
            expect(authRepo.findUniqueUser).toHaveBeenCalledWith(mockedSignupUser.email, mockedEnv.DATABASE_URL)
            expect(hashUtil.compareHash).toHaveBeenCalledWith(mockedSignupUser.password, mockedHashedPassword)
            expect(jwtUtil.generateTokens).toHaveBeenCalledWith(mockedPayload, mockedEnv.JWT_ACCESS_SECRET, mockedEnv.JWT_REFRESH_SECRET)
        })

        it('should throw a BadRequestError for new users', async () => {
            vi.mocked(authRepo.findUniqueUser).mockResolvedValue(null)

            await expect(service.signin(mockedSignupUser)).rejects.toThrow("User not found")
            await expect(service.signin(mockedSignupUser)).rejects.toBeInstanceOf(AppError)

            expect(authRepo.findUniqueUser).toHaveBeenCalledWith(mockedSignupUser.email, mockedEnv.DATABASE_URL)
        })

        it('should throw ValidationError is the password does not matched with the stored password', async () => {
            vi.mocked(authRepo.findUniqueUser).mockResolvedValue(mockedExistingUser)
            vi.mocked(hashUtil.compareHash).mockResolvedValue(false)

            await expect(service.signin(mockedSignupUser)).rejects.toThrow("Password does not match")
            await expect(service.signin(mockedSignupUser)).rejects.toBeInstanceOf(AppError)

            expect(authRepo.findUniqueUser).toHaveBeenCalledWith(mockedSignupUser.email, mockedEnv.DATABASE_URL)
            expect(hashUtil.compareHash).toHaveBeenCalledWith(mockedSignupUser.password, mockedHashedPassword)
        })


    })
})