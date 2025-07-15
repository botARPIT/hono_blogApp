import { ValidationError } from "../types/error";
import { Result } from "../types/result";



export interface BlogPolicy<T> {
    validate(dto: T) : Result<T, ValidationError>
}