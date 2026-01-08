import { Context } from "hono";
import { createUserService } from "../services/user.service";
import { updateProfileSchema } from "../types/user.types";
import { BadRequestError, ServiceName, ZodValidationError } from "../errors/app-error";

class UserController {
    constructor(private userService: ReturnType<typeof createUserService>) { }
    async getProfileInfo(c: Context) {
        const { id: userId } = c.get('jwtPayload')
        if (!userId) throw new BadRequestError("User id missing", ServiceName.CONTROLLER)
        const userProfile = await this.userService.getProfileInfo(userId)
        return c.json({ userProfile: userProfile })
    }

    async updateProfile(c: Context) {
        const { id: userId } = c.get('jwtPayload')
        if (!userId) throw new BadRequestError("User id missing", ServiceName.CONTROLLER)

        const body = await c.req.json()
        const parsed = updateProfileSchema.safeParse(body)
        if (!parsed.success) {
            throw new ZodValidationError("Invalid input", { message: parsed.error })
        }

        const result = await this.userService.updateProfile(userId, parsed.data)
        return c.json(result)
    }

}

export default function createController(obj: ReturnType<typeof createUserService>) {
    return new UserController(obj)
}

