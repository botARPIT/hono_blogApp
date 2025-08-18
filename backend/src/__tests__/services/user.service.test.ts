
import {describe, it, expect } from 'vitest'
import { createUserService } from "../../services/user.service";
import { EnvironmentVariables } from '../../types/env.types';

 const mockBindings:  EnvironmentVariables = {
        DATABASE_URL : "xyv",
        JWT_ACCESS_SECRET: "vdv",
        JWT_REFRESH_SECRET: "dwd"
    }



describe('UserService', () => {
   
    const userService = createUserService(mockBindings)
})