import bcrypt from "bcryptjs";

const SALT_ROUNDS = 8;

const createHash = async(password : string) => {
    return await bcrypt.hash(password, SALT_ROUNDS)
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