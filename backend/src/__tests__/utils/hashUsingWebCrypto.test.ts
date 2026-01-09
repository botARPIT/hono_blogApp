
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { hashPassword } from '../../utils/hashUsingWebCrypto'
vi.mock('../../utils/hexToBytes')

describe('Password hashing security tests', () => {
    let mockedCrypto: any
    let originalCrypto: Crypto
    beforeEach(() => {
        vi.clearAllMocks()
        //Saving the original type
        originalCrypto = crypto

        //Mocking the crypto API
        mockedCrypto = {
            subtle: {
                importKey: vi.fn(),
                deriveBits: vi.fn()
            },
            getRandomValues: vi.fn()
        }
        vi.stubGlobal('crypto', mockedCrypto)

    })
    afterEach(() => {
        vi.unstubAllGlobals()
    })



    describe('Checking unique salt generation', () => {
        it("Generate unique salt for identical passwords", async () => {
            const mockKeyMaterial = { type: 'secret' }
            const mockHashBuffer = new ArrayBuffer(32)

            new Uint8Array(mockHashBuffer).set([0xAB, 0xCD, 0xEF, 0x00])
            mockedCrypto.subtle.importKey.mockResolvedValue(mockKeyMaterial)
            mockedCrypto.subtle.deriveBits.mockResolvedValue(mockHashBuffer)


            mockedCrypto.getRandomValues.mockReturnValueOnce(
                new Uint8Array([1, 2, 3, 4])
            )

            mockedCrypto.getRandomValues.mockReturnValueOnce(
                new Uint8Array([5, 6, 7, 8])
            )
            const hash1 = await hashPassword("password")
            const hash2 = await hashPassword('password')
            console.log(hash1)
            console.log(hash2)
            expect(hash1).not.toBe(hash2)
            expect(hash1).toContain("01020304")
            expect(hash2).toContain('05060708')
        })
    })

    it("Must be called with correct PKDF2 parameters", async () => {
        const mockKeyMaterial = { type: 'secret' }
        const mockSalt = new Uint8Array(32).fill(42)
        const mockHashBuffer = new Array(32)

        mockedCrypto.getRandomValues.mockReturnValue(mockSalt)
        mockedCrypto.subtle.importKey.mockReturnValue(mockKeyMaterial)
        mockedCrypto.subtle.deriveBits.mockReturnValue(mockHashBuffer)


        await hashPassword("Testing")

        expect(mockedCrypto.subtle.deriveBits).toHaveBeenCalledWith({
            name: 'PBKDF2',
            salt: mockSalt,
            iterations: 100000,
            hash: "SHA-256"
        },
            mockKeyMaterial,
            256)
    })

})