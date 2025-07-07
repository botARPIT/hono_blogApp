
import {z} from "zod";

const userSchema = z.object({
    name: z.string().toLowerCase(),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8, {message: "Minimum length should be 8"}).max(18, {message: "Maximum length is 18 characters"}),

})

export default userSchema;