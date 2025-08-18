
import {z} from "zod";


export const userSignUpSchema = z.object({
    name: z.string().toLowerCase().trim(),
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(8, {message: "Minimum length should be 8"}).max(100, {message: "Maximum length can be upto 100"}).optional(),

})

export const userSignInSchema = z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(8, {message: "Minimum length should be 8"}).max(100, {message: "Maximum length can be upto 100"}).optional(),

})
export enum AuthProvider {
    LOCAL = "LOCAL",
    GOOGLE = "GOOGLE"
}

 type UserDTO = {
    id: string,
    name: string,
    email: string,
    password: string | null,
    authProvider: AuthProvider
    createdAt: Date,
    updatedAt: Date,
    isAdmin: boolean,
}

export type CreatedUser = Pick<UserDTO, 'id' | 'email' | 'name' | 'createdAt'>
export type UserSignUpDTO = Pick<UserDTO, 'name' | 'email' | 'password'| 'authProvider'>
export type UserSignInDTO = Pick<UserDTO, 'email' | 'password'| 'authProvider'>