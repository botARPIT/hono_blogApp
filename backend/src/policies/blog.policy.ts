import { BlogPolicy } from "../interfaces/blog.interface";
import { BlogDTO, AddBlogDTO, blogSchema } from "../types/blog.types";
import { ValidationError } from "../types/error";
import { Result } from "../types/result";


class StrictBlogPolicy implements BlogPolicy<AddBlogDTO>{
    validate(dto: AddBlogDTO) : Result<AddBlogDTO, ValidationError>{
        const result = blogSchema.safeParse(dto)
        if(result.success)  return {success: true, data: dto}
        else return {success: false, error : {message: "Either title or content is too small"}}
        
    }
}

export const blogPolicy = new StrictBlogPolicy();