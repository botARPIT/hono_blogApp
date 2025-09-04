import bcrypt from "bcryptjs";

const SALT_ROUNDS = 13;

// const createHash = async(password : string) => {
//     return await bcrypt.hash(password, SALT_ROUNDS)
// } 

const createHash = async(password : string) => {
    // const start = performance.now()
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    console.log(hash)
    // console.log("Time required to create hash", performance.now() - start)
    return hash
} 

const compareHash = async(password: string, hash: string) => {
    return bcrypt.compare(password, hash)
}
export {createHash, compareHash} ;

// import {hash, verify} from 'argon2-browser';

// export const createHash = async(password: string) => {
//     const SALT_ROUNDS = crypto.getRandomValues(new Uint8Array(16))
//     const msg =  await hash({pass: password, salt: SALT_ROUNDS, time: 3, mem: 65536, hashLen: 32  })
//     console.log(msg)
//     return msg.encoded
// }

// export const compareHash = async(password: string, hash: string) => {
//     return await verify({pass: password, encoded: hash})
// }
// export async function webCrypto(){
//     const password = "This is a password for testing the web crypto api"
// const myText = new TextEncoder().encode(password)
// console.log(myText)
// const hash = await crypto.subtle.digest({
//     name: 'SHA-256'
// }, myText)

// console.log(hash)
// console.log(new Uint8Array(hash))
// }