import { Context } from "hono";
import { createUserService } from "../services/user.service";
import { UserSignInDTO, UserSignUpDTO } from "../routes/user.route";
import { userInputPolicy } from "../policies/user.policy";

 class Controller{
    constructor(private userService : ReturnType<typeof createUserService> ){}
    async signup(c: Context){
        const body = await c.req.json<UserSignUpDTO>();
        const inputValidation = userInputPolicy.validateSignUp(body)
        if(!inputValidation.success) return c.json({message: "Cannot validate input", error: inputValidation.error}, 400)
            const result = await this.userService.signup(inputValidation.data)
        return c.json(result)
        
    }

    async signin(c: Context){
        const body = await c.req.json<UserSignInDTO>()
        const inputValidation = userInputPolicy.validateSignIn(body)
        if(!inputValidation.success) return c.json({message: "Cannot authenticate user", error: inputValidation.error}, 400)
            const result = await this.userService.signin(inputValidation.data)
        return c.json(result)
    }
}   

export default function createController(obj: ReturnType<typeof createUserService>){
    return new Controller(obj)
}

