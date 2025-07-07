

import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate"
import hashPassword from "../../utils/hashPassword";
import userSchema from "../types/user.types"


interface User {
    name: string,
    email: string,
    password: string
}
export async function register(dbUrl: string, user: User) {

    const validation = userSchema.safeParse(user);
    if (validation.success) {
        const hashedPass = await hashPassword(user.password)
        const{name, email} = validation.data
        const prisma = new PrismaClient({
            datasourceUrl: dbUrl,
        }).$extends(withAccelerate())
      try {
          await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPass
            }
        })
        return true
      } catch (error) {
        throw new Error("Prisma error")
      } finally {
        await prisma.$disconnect()
      }
    }
    else return
}

