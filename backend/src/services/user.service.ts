// import { createHash, compareHash } from "../utils/hash";
import { userSignUpSchema, userSignInSchema, CreatedUser, UserSignUpDTO, UserSignInDTO, AuthProvider } from "../types/user.types"
import { createUser, findUniqueUser } from "../repositories/user.repository";

import { Bindings, EnvironmentVariables } from "../types/env.types";
import { generateAccessToken, generateTokens } from "../utils/jwt";
import { AppError, BadRequestError, ErrorCode, NotFoundError, ServiceName, SeverityLevel, ValidationError } from "../errors/app-error";
import { Token } from "../types/jwt.types";
import {compareHash, hashPassword} from "../utils/hashUsingWebCrypto";





class UserService {
  constructor(private env: EnvironmentVariables) { }

  async signup(dto: UserSignUpDTO): Promise<Token> {
    try {
      const user = await findUniqueUser(dto.email, this.env.DATABASE_URL)
      if(user && user.password == null) throw new BadRequestError("User already exists", ServiceName.BUSINESS, {message: "Try to sign in with your google account"})
        else if(user && user.password != null) throw new BadRequestError("User already exists", ServiceName.BUSINESS, {message: "Try to sign in with your registered credentials"})
      let hashedPass;
      // if(dto.password != null) {hashedPass = await createHash(dto.password)}
       if(dto.password != null) {hashedPass = await hashPassword(dto.password)}
      if (!hashedPass ) throw new AppError("Hashing service failed", 500, ErrorCode.INTERNAL_ERROR, false,  Date.now(), SeverityLevel.CRITICAL, {message: "Enter the password again"}, ServiceName.BUSINESS)
      
      const userCreated = await createUser(dto.name, dto.email, hashedPass, this.env.DATABASE_URL, AuthProvider.LOCAL )
      const {id, name} = userCreated
      const payload = {id, name}
      const token : Token = generateTokens(payload, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
     return token

    } catch (error) {
      throw new BadRequestError("User does not exist", ServiceName.BUSINESS, {message: "Try to sign in with your registered credentials"})
    }
  }

  async signin(dto: UserSignInDTO): Promise<Token> {
    try {
      // const t0 = performance.now()
      let hasValidPass;
      const user = await findUniqueUser(dto.email, this.env.DATABASE_URL)
      // const t1 = performance.now()
      // console.log("From user service: ", t1 - t0)
      if (!user) {
        throw new BadRequestError("User not found", ServiceName.BUSINESS, {message: "Kindly signup first"})
      }
      // if(dto.password == null && dto.authProvider == AuthProvider.GOOGLE) {hasValidPass = null}
      // 
      if ( dto.password != null && user.password != null) {hasValidPass = await compareHash(dto.password, user.password)}
      if (!hasValidPass) {
        throw new ValidationError("Password does not match", ServiceName.BUSINESS, {message: "Enter correct password"})
      }
      const {id, name} = user
      const payload = {id, name}
      const { accessToken, refreshToken } = generateTokens(payload, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
      return { accessToken: accessToken, refreshToken: refreshToken }

    } catch (error) {
     throw new NotFoundError("User does not exist", {message: "First register the user"})
    }
  }
}

// factory function : User to create instance of class
export function createUserService(env: EnvironmentVariables) {
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

