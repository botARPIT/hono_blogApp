import { Context } from "hono";
import { createUserService } from "../services/user.service";

import { userInputPolicy } from "../policies/user.policy";
import { UserSignInDTO, UserSignUpDTO } from "../types/user.types";
import { ZodError } from "../errors/app-error";

 class UserController{
    constructor(private userService : ReturnType<typeof createUserService> ){}
    async signup(c: Context){
        const body = await c.req.json<UserSignUpDTO>();
        const inputValidation = userInputPolicy.validateSignUp(body)
        if(!inputValidation.success) throw new ZodError("Zod validation failed")
        const result = await this.userService.signup(inputValidation.data)
        return c.json(result)
        
    }

    async signin(c: Context){
        const body = await c.req.json<UserSignInDTO>()
        const inputValidation = userInputPolicy.validateSignIn(body)
        if(!inputValidation.success) throw new ZodError("Zod validation failed")
            const result = await this.userService.signin(inputValidation.data)
        return c.json(result)
    }
}   

export default function createController(obj: ReturnType<typeof createUserService>){
    return new UserController(obj)
}

