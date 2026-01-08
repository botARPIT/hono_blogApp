// Duck typed workaround solution for error handling since cloudflare workers dont have direct access to prisma error instances

import { DBError } from "./app-error"

export type prismaErrorObject = {
    code? : string | null,
    message: string,
    clientVersion: string,
    meta? : Record<string, string> | null,
    name: string | null,
    fields? : string 

}


export function prismaErrorWrapper(error: prismaErrorObject ) : DBError{
  if(error.code === 'P2002'){
    return new DBError(`Duplicate field already exists`, {code: error.code, name: error.name, meta: error.meta, version: error.clientVersion})
  }
  if(error.code){
    return new DBError(error.message, {code: error.code, name:error.name, meta: error.meta, version: error.clientVersion} )
  }
  return new DBError("Unknown DB error", {message: "Something is wrong with database"})
}
