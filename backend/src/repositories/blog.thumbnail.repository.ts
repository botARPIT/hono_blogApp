
import {createClient} from "@supabase/supabase-js"
import {decode} from "base64-arraybuffer"
import { DBError, NotFoundError } from '../errors/app-error';

const BUCKET_NAME = "blog-thumbnail"
export const getSupabaseClient = async() => {
  return  createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string)
    

}
export const getStorageInfo = async() => {
    const supabase = await getSupabaseClient()
    const {data, error} = await supabase.storage.getBucket("blog-thumbnail")
return !data ? new DBError("Unable to get supabase storage info", {message: "Cannot access storage, try after sometime"}) : data
}

export const uploadFile = async (file: File, userId : string) => {
    if(!file || !userId) throw new NotFoundError("User id or file name is missing", {message: "Kindly provide the file"})
    const arrayBuffer =  await file.arrayBuffer()
const fileName = `${userId}/thumbnails/${Date.now()}_${file.name}`
    const arrayBufferToString = String(arrayBuffer)
    const supabase = await getSupabaseClient()
    if(!supabase) return new DBError("Unable to get supabase client", {message: "Unable to connect to storage, try after sometime"})
    const {data, error} = await supabase.storage.from(BUCKET_NAME).upload(fileName, decode(arrayBufferToString), {contentType: file.type})
    if(error){
        throw new DBError("Failed to upload file", {message: "Unable to upload file, try again after sometime"})
    }

    const uploadedImage = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)
    const url = uploadedImage.data

    return {
        ...data,
        uploadedImage,
        url
    }
}