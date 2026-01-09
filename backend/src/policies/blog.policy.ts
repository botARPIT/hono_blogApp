import { AddBlogPolicy, UpdateBlogPolicy } from "../interfaces/blog.interface";
import { AddBlogDTO, blogSchema, UpdateBlogDTO, updateBlogSchema } from "../types/blog.types";
import { ValidationError } from "../types/error.types";
import { Result } from "../types/result.type";


class StrictBlogPolicy implements AddBlogPolicy<AddBlogDTO>, UpdateBlogPolicy<UpdateBlogDTO> {
    validateAddBlog(dto: AddBlogDTO): Result<AddBlogDTO, ValidationError> {
        const result = blogSchema.safeParse(dto)
        if (result.success) return { success: true, data: result.data }
        else return { success: false, error: { error: result.error } }

    }

    validateUpdateBlog(dto: UpdateBlogDTO): Result<UpdateBlogDTO, ValidationError> {
        const result = updateBlogSchema.safeParse(dto)
        if (!result.success) return { success: false, error: { error: result.error } }
        return { success: true, data: result.data }
    }
}

export const blogPolicy = new StrictBlogPolicy();