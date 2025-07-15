import { SignInPolicy, SignUpPolicy } from "../interfaces/user.interface"
import { UserSignInDTO, UserSignUpDTO } from "../routes/user.route"
import { AuthError, ValidationError } from "../types/error"
import { Result } from "../types/result"
import {  userSignInSchema, userSignUpSchema } from "../types/user.types"

 class UserInputPolicy implements SignUpPolicy<UserSignUpDTO>, SignInPolicy<UserSignInDTO>{
    validateSignUp(dto: UserSignUpDTO): Result<UserSignUpDTO , ValidationError>{
        const result = userSignUpSchema.safeParse(dto)
        if(result.success) return {success: true, data: result.data}
        return {success: false, error: {message: "Validation error"}}
    }

    validateSignIn(dto: UserSignInDTO): Result<UserSignInDTO, AuthError>{
        const result = userSignInSchema.safeParse(dto)
        if(result.success) return {success: true, data: result.data}
        else return {success: false, error: {message: "Auth error"}}
    }
}
 export const userInputPolicy = new UserInputPolicy()