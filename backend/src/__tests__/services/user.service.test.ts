
import {describe, it, expect } from 'vitest'
import { createUserService } from "../../services/user.service";
import { EnvironmentVariables } from '../../types/env.types';

 const mockBindings:  EnvironmentVariables = {
        DATABASE_URL : "abc",
        JWT_ACCESS_SECRET: "abc",
        JWT_REFRESH_SECRET: "abc",
        GOOGLE_CLIENT_ID: "abc",
        GOOGLE_CLIENT_SECRET: "abc"
    }



describe('UserService', () => {
   
    const userService = createUserService(mockBindings)
})