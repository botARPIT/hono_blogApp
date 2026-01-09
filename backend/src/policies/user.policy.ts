import { SignInPolicy, SignUpPolicy } from "../interfaces/user.interface"

import { AuthError, ValidationError } from "../types/error.types"
import { Result } from "../types/result.type"
import { UserSignInDTO, userSignInSchema, UserSignUpDTO, userSignUpSchema } from "../types/user.types"

class UserInputPolicy implements SignUpPolicy<UserSignUpDTO>, SignInPolicy<UserSignInDTO> {
    validateSignUp(dto: UserSignUpDTO): Result<UserSignUpDTO, ValidationError> {
        const result = userSignUpSchema.safeParse(dto)
        if (result.success) return { success: true, data: result.data as UserSignUpDTO }
        return { success: false, error: { error: result.error } }
    }

    validateSignIn(dto: UserSignInDTO): Result<UserSignInDTO, AuthError> {
        const result = userSignInSchema.safeParse(dto)
        if (result.success) return { success: true, data: result.data as UserSignInDTO }
        else return { success: false, error: { message: "Auth error" } }
    }
}
export const userInputPolicy = new UserInputPolicy()