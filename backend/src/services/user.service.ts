import { createHash, compareHash } from "../utils/hash";
import { userSignUpSchema, userSignInSchema, CreatedUser, UserSignUpDTO, UserSignInDTO } from "../types/user.types"
import { createUser, findUniqueUser } from "../repositories/user.repository";

import { Bindings } from "../types/binding.types";
import { generateAccessToken, generateTokens } from "../utils/jwt";
import { AppError, BadRequestError, ErrorCode, ValidationError } from "../errors/app-error";
import { Token } from "../types/jwt.types";




class UserService {
  constructor(private env: Bindings) { }

  async signup(dto: UserSignUpDTO): Promise<CreatedUser> {
    try {
      const hashedPass = await createHash(dto.password)
      if (!hashedPass) throw new AppError("Hashing failed")
      const userCreated = await createUser(dto.name, dto.email, hashedPass, this.env.DATABASE_URL)
      console.log("User created", userCreated)
      return userCreated

    } catch (error) {
      throw new BadRequestError("User already exists")
    }
  }

  async signin(dto: UserSignInDTO): Promise<Token> {
    try {
      // const t0 = performance.now()
      const user = await findUniqueUser(dto.email, this.env.DATABASE_URL)
      // const t1 = performance.now()
      // console.log("From user service: ", t1 - t0)
      if (!user) {
        throw new BadRequestError("User not found")
      }
      const hasValidPass = await compareHash(dto.password, user.password)

      if (!hasValidPass) {
        throw new ValidationError("Invalid pass")
      }
      const {id, name} = user
      const payload = {id, name}
      const { accessToken, refreshToken } = generateTokens(payload, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
      return { accessToken: accessToken, refreshToken: refreshToken }

    } catch (error) {
     throw new BadRequestError("User does not exist")
    }
  }
}

// factory function : User to create instance of class
export function createUserService(env: Bindings) {
  return new UserService(env)
}

// export async function signup(dbUrl: string, user: UserSignUpDTO) {


//   try {
//       const hashedPass = await hashPassword(user.password)
//       if (!hashPassword) throw new Error("Invalid input")
//       const { name, email } = user
//       const userCreated = await createUser(name, email, hashedPass, dbUrl)

//       return userCreated

//   } catch (error) {
//     throw new Error("Prisma error")
//   }
//   //    finally {
//   //     await prisma.$disconnect()
//   //   }
// }





// export async function signin(dbUrl: string, user: UserSignInDTO) {
//   try {
//     const validation = userSignInSchema.safeParse(user)
//     if (validation.success) {
//       const userFound = await findUniqueUser(user.email, dbUrl)

//       if (userFound) {
//         const isValidPassword = await bcrypt.compare(user.password, userFound.password)
//         if (isValidPassword) return true

//         else {
//           throw new Error("Incorrect password")
//         }
//       } else {
//         throw new Error("Cannot find user")
//       }
//     } else {
//       console.log("Invalid user")
//     }
//   } catch (error) {
//     throw new Error("Cannot find user")
//   }

// }

