import { ValidationError } from "../types/error";
import { Result } from "../types/result";



export interface AddBlogPolicy<T> {
    validateAddBlog(dto: T) : Result<T, ValidationError>
}

export interface UpdateBlogPolicy<T>{
    validateUpdateBlog(dto: T) : Result<T, ValidationError>
}