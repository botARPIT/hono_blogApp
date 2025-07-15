import {createHash, compareHash} from "../utils/hash";
import { userSignUpSchema, userSignInSchema } from "../types/user.types"
import bcrypt from "bcryptjs";
import { createUser, findUniqueUser } from "../repositories/user.repository";
import { UserSignInDTO, UserSignUpDTO } from "../routes/user.route";
import { Bindings } from "../types/binding.types";
import { generateAccessToken, generateTokens } from "../utils/jwt";



class UserService{
  constructor(private env: Bindings ){}

  async signup(dto : UserSignUpDTO){
  try {
      const hashedPass = await createHash(dto.password)
      if (!createHash) throw new Error("Invalid input")
      const userCreated = await createUser(dto.name, dto.email, hashedPass, this.env.DATABASE_URL)

      return userCreated
    
  } catch (error) {
    throw new Error("Cannot create user")
  }
  }

  async signin(dto: UserSignInDTO){
    try {
      const t0 = performance.now()
      const existingUser = await findUniqueUser(dto.email, this.env.DATABASE_URL)
           const t1 = performance.now()
          console.log("From user service: ", t1-t0)
      if(existingUser) {
        
        const hasValidPass = await compareHash(dto.password, existingUser.password)
        
          
        if(hasValidPass) {
          const {accessToken, refreshToken} = generateTokens(dto, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
     
        
          return {accessToken: accessToken, refreshToken: refreshToken}
        } 
      } else return 
      
    } catch (error) {
      throw new Error ("SignIn error")
    }
  }
}

// factory function : User to create instance of class
export function createUserService(env: Bindings){
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





export async function signin(dbUrl: string, user: UserSignInDTO) {
  try {
    const validation = userSignInSchema.safeParse(user)
    if (validation.success) {
      const userFound = await findUniqueUser(user.email, dbUrl)

      if (userFound) {
        const isValidPassword = await bcrypt.compare(user.password, userFound.password)
        if (isValidPassword) return true

        else {
          throw new Error("Incorrect password")
        }
      } else {
        throw new Error("Cannot find user")
      }
    } else {
      console.log("Invalid user")
    }
  } catch (error) {
    throw new Error("Cannot find user")
  }

}

