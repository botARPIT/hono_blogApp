
import {z} from "zod";

export const userSignUpSchema = z.object({
    name: z.string().toLowerCase().trim(),
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(8, {message: "Minimum length should be 8"}).max(100, {message: "Maximum length can be upto 100"}),

})

export const userSignInSchema = z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(8, {message: "Minimum length should be 8"}).max(100, {message: "Maximum length can be upto 100"}),

})

export type UserDTO = {
    id: string,
    name: string,
    email: string,
    password: string,
    createdAt: string,
    updatedAt: string,
    isAdmin: boolean
}