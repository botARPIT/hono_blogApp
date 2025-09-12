import bcrypt from "bcryptjs";

const SALT_ROUNDS = 13;

const createHash = async(password : string) => {
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    console.log(hash)
    return hash
} 

const compareHash = async(password: string, hash: string) => {
    return bcrypt.compare(password, hash)
}
export {createHash, compareHash} ;
