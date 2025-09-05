
import {  UserSignUpDTO, UserSignInDTO, AuthProvider } from "../types/user.types"
import { createUser, findUniqueUser } from "../repositories/user.repository";
import {  EnvironmentVariables } from "../types/env.types";
import { generateTokens } from "../utils/jwt";
import { AppError, BadRequestError, ErrorCode, ServiceName, SeverityLevel, ValidationError } from "../errors/app-error";
import { Token } from "../types/jwt.types";
import { compareHash, hashPassword } from "../utils/hashUsingWebCrypto";

class UserService {
  constructor(private env: EnvironmentVariables) { }

  async signup(dto: UserSignUpDTO): Promise<Token> {
    console.log("Signup service hit!")
    const user = await findUniqueUser(dto.email, this.env.DATABASE_URL)
    console.log("User found from user service")
    if (user && user.password == null) throw new BadRequestError("User already exists", ServiceName.BUSINESS, { message: "Try to sign in with your google account" })
    else if (user && user.password != null) throw new BadRequestError("User already exists", ServiceName.BUSINESS, { message: "Try to sign in with your registered credentials" })
    let hashedPass;
    if (dto.password != null) { hashedPass = await hashPassword(dto.password) }
    if (!hashedPass) throw new AppError("Hashing service failed", 500, ErrorCode.INTERNAL_ERROR, false, Date.now(), SeverityLevel.CRITICAL, { message: "Enter the password again" }, ServiceName.BUSINESS)
    console.log("This is hashed passwrod", hashedPass)
    const userCreated = await createUser(dto.name, dto.email, hashedPass, this.env.DATABASE_URL, AuthProvider.LOCAL)
    const { id, name } = userCreated
    console.log("User created", userCreated)
    const payload = { id, name }
    const token: Token = generateTokens(payload, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
    return token

  }

  async signin(dto: UserSignInDTO): Promise<Token> {
    let hasValidPass;
    const user = await findUniqueUser(dto.email, this.env.DATABASE_URL)
    if (!user) {
      throw new BadRequestError("User not found", ServiceName.BUSINESS, { message: "Kindly signup first" })
    }
    console.log(user)
    if (dto.password != null && user.password != null) { hasValidPass = await compareHash(dto.password, user.password) }
    console.log()
    if (!hasValidPass) {
      throw new ValidationError("Password does not match", ServiceName.BUSINESS, { message: "Enter correct password" })
    }
    const { id, name } = user
    const payload = { id, name }
    const { accessToken, refreshToken } = generateTokens(payload, this.env.JWT_ACCESS_SECRET, this.env.JWT_REFRESH_SECRET)
    return { accessToken: accessToken, refreshToken: refreshToken }
  }
}

// factory function : User to create instance of class
export function createUserService(env: EnvironmentVariables) {
  return new UserService(env)
}
