import { Context } from "hono";
import { createUserService } from "../services/user.service";

import { userInputPolicy } from "../policies/user.policy";
import { UserSignInDTO, UserSignUpDTO } from "../types/user.types";
import { ZodValidationError } from "../errors/app-error";
import { setCookies } from "../utils/setCookies";

class UserController {
    constructor(private userService: ReturnType<typeof createUserService>) { }
    async getProfileInfo(c: Context) {
        const { id: userId } = c.get('jwtPayload')
        console.log("user id", userId)
        if (!userId) return c.json({ message: "Unable to find the id, kindly provide user id" })
        const userProfile = await this.userService.getProfileInfo(userId)
        console.log(userProfile)
        return c.json({ userProfile: userProfile })
    }

    async getUserBlogs(c: Context){
        const {id: userId} = c.get('jwtPayload')
        if(!userId) return c.json({message: "Unable to find user id"})
        const userBlogs = await this.userService.getBlogs(userId)
        if(userBlogs === null) return c.json({message: "You haven't posted any blog, kindly write one"})
        return c.json({blogs: userBlogs})
    }

}

export default function createController(obj: ReturnType<typeof createUserService>) {
    return new UserController(obj)
}

