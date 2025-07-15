import bcrypt from "bcryptjs";

const SALT_ROUNDS = 14;

const createHash = async(password : string) => {
    return await bcrypt.hash(password, SALT_ROUNDS)
} 

const compareHash = async(password: string, hash: string) => {
    return bcrypt.compare(password, hash)
}
export {createHash, compareHash} ;