
import { UserDetailsDTO } from "../types/user.types"
import { getUserProfile, updateProfile } from "../repositories/user.repository";
import { EnvironmentVariables } from "../types/env.types";



import { GetBlogDTO } from "../types/blog.types";
import { NotFoundError, ServiceName } from "../errors/app-error";
import { AppConfig } from "../config";

class UserService {
  constructor(private env: AppConfig) { }

  async getProfileInfo(userId: string): Promise<UserDetailsDTO> {
    const userProfile = await getUserProfile(userId, this.env.DATABASE_URL)
    if (userProfile === null) throw new NotFoundError("Unable to find the user", { meta: "Kindly check user details" })
    return userProfile
  }

  async updateProfile(userId: string, data: { name?: string, email?: string }): Promise<UserDetailsDTO> {
    return await updateProfile(userId, data, this.env.DATABASE_URL)
  }

}

// factory function : User to create instance of class
export function createUserService(env: AppConfig) {
  return new UserService(env)
}
