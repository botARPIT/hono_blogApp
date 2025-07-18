import { AuthError, ValidationError } from "../types/error.types";
import { Result } from "../types/result.type";

export interface SignUpPolicy<T>{
    validateSignUp(data: T) : Result<T, ValidationError>
}


export interface SignInPolicy<T>{
    validateSignIn(data: T) : Result<T, AuthError>
}