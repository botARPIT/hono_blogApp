
import { AuthProvider } from "@prisma/client/edge";
import { z } from "zod";

// export enum AuthProvider {
//     LOCAL = "LOCAL",
//     GOOGLE = "GOOGLE"
// }
export const userSignUpSchema = z.object({
    name: z.string().toLowerCase().trim(),
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(8, { message: "Minimum length should be 8" }).max(100, { message: "Maximum length can be upto 100" }).optional(),
    authProvider: z.enum(["LOCAL", "GOOGLE"]).optional()

})

export const userSignInSchema = z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(8, { message: "Minimum length should be 8" }).max(100, { message: "Maximum length can be upto 100" }).optional(),
})

export const updateProfileSchema = z.object({
    name: z.string().toLowerCase().trim().optional(),
    email: z.string().email().toLowerCase().trim().optional(),
}).refine(data => data.name || data.email, {
    message: "At least one field (name or email) must be provided"
})


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

export type CreatedUserDTO = Pick<UserDTO, 'id' | 'email' | 'name' | 'createdAt'>
export type UserSignUpDTO = Pick<UserDTO, 'name' | 'email' | 'password'>
export type UserSignInDTO = Pick<UserDTO, 'email' | 'password' | 'authProvider'>
export type UserDetailsDTO = Pick<UserDTO, 'name' | 'email' | 'createdAt'>
export type ExistingUserDTO = Pick<UserDTO, 'id' | 'name' | 'password' | 'authProvider' | 'email'>