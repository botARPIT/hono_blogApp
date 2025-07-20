
import {z} from "zod";
import { Token } from "./jwt.types";

export const userSignUpSchema = z.object({
    name: z.string().toLowerCase().trim(),
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(8, {message: "Minimum length should be 8"}).max(100, {message: "Maximum length can be upto 100"}),

})

export const userSignInSchema = z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(8, {message: "Minimum length should be 8"}).max(100, {message: "Maximum length can be upto 100"}),

})

 type UserDTO = {
    id: string,
    name: string,
    email: string,
    password: string,
    createdAt: Date,
    updatedAt: Date,
    isAdmin: boolean,
}

export type CreatedUser = Pick<UserDTO, 'id' | 'email' | 'name' | 'createdAt'>
export type UserSignUpDTO = Pick<UserDTO, 'name' | 'email' | 'password'>
export type UserSignInDTO = Pick<UserDTO, 'email' | 'password'>