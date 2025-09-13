import { hexToBytes } from "./hexToBytes"


async function hashPassword(password: string): Promise<string> {
    //Encoding the password to array buffer
    const start = performance.now()
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)


    //Defining the key characteristics to be used by web crypto api
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        passwordBuffer,
        "PBKDF2",
        false,
        ['deriveBits']
    )

    const salt = crypto.getRandomValues(new Uint8Array(32))
    // const salt = new Uint8Array(22)
    const iterations = 100000
    //For cloudflare free tier use 100000 since iteration count above 100000 are not supported, can use 250000 for production
    // Passing the key for generating the hash
    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: iterations,
            hash: "SHA-256"
        },
        keyMaterial,
        256
    )

    //Converting the generated hash to hex format for storage
    const hashArray = new Uint8Array(hashBuffer)
    const hashBytesToHashHex = Array.from(hashArray)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    console.log("hash array from create hash", hashArray)
    //Converting the salt to hex for storage
    const saltBytesToSaltHex = Array.from(salt)
        .map(s => s.toString(16).padStart(2, '0'))
        .join('')


    const storedPassword = `Webcrypto:${iterations}:${saltBytesToSaltHex}:${hashBytesToHashHex}`
    return storedPassword
}


async function compareHash(password: string, storedHash: string): Promise<boolean> {

    const arrayOfStoredHash = storedHash.split(":")
    if (arrayOfStoredHash.length != 4) throw new Error("Invalid hash")
    const [cryptoStandard, iterations, hexedSalt, hexedHash] = arrayOfStoredHash

    if (cryptoStandard != "Webcrypto") throw new Error("Invalid format")

    const parsedIterations = parseInt(iterations)
    if (parsedIterations < 1000) throw new Error("Invalid iterations count")

    const saltBytes = hexToBytes(hexedSalt)
    const hashBytes = hexToBytes(hexedHash)
    if (!saltBytes || !hashBytes) throw new Error("Invalid hex data in stored hash")

    //Encoding
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        passwordBuffer,
        "PBKDF2",
        false,
        ['deriveBits']
    )

    const derivedHashBuffer = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: saltBytes,
            iterations: parsedIterations,
            hash: "SHA-256"
        },
        keyMaterial,
        256
    )
    const derivedHash = new Uint8Array(derivedHashBuffer)
    //Converting derived hash buffer to hash
    // const hash = Array.from(derivedHash)
    //     .map(b => b.toString(16).padStart(2, '0'))
    //     .join('')

    return compareHashInNoTime(derivedHash, hashBytes)

}

function compareHashInNoTime(a: Uint8Array, b: Uint8Array): boolean {
    //This is to prevent leaky time attack
    if (a.length != b.length) return false
    let numberOfDifferences = 0
    for (let i = 0; i < a.length; i++) {
        numberOfDifferences |= a[i] ^ b[i]
    }
    return numberOfDifferences === 0

}

export { hashPassword, compareHash }

