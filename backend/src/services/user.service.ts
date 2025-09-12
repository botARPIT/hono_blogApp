
import { UserDetailsDTO } from "../types/user.types"
import { getUserBlogs, getUserProfile } from "../repositories/user.repository";
import {  EnvironmentVariables } from "../types/env.types";



import { GetBlogDTO } from "../types/blog.types";
import { NotFoundError, ServiceName } from "../errors/app-error";

class UserService {
  constructor(private env: EnvironmentVariables) { }

async getProfileInfo(userId:string): Promise<UserDetailsDTO | null>{
  const userProfile = await getUserProfile(userId, this.env.DATABASE_URL)
  if(userProfile === null) throw new NotFoundError("Unable to find the user",{meta: "Kindly check user details"})
  return userProfile
}

async getBlogs(userId: string): Promise<GetBlogDTO[] | null>{
  const userBlogs = await getUserBlogs(userId, this.env.DATABASE_URL)
  console.log("user blogs", userBlogs)
  if(userBlogs === null) throw new NotFoundError("No blogs found for the user", {meta: "Kindly post some blogs first"})
  return userBlogs
}

}

// factory function : User to create instance of class
export function createUserService(env: EnvironmentVariables) {
  return new UserService(env)
}
