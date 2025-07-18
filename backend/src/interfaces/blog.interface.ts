import { ValidationError } from "../types/error.types";
import { Result } from "../types/result.type";



export interface AddBlogPolicy<T> {
    validateAddBlog(dto: T) : Result<T, ValidationError>
}

export interface UpdateBlogPolicy<T>{
    validateUpdateBlog(dto: T) : Result<T, ValidationError>
}