import axios from "axios"
import { BACKEND_URL } from "../config"
import { useState } from "react"


export const ImageUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null)
    const[imageUrl, setImageUrl] = useState<string>("")

    async function onSubmit(){
        if (!file) return
    const formData =  new FormData()
    formData.append('file', file)
   
    const fileToBase64 = (file:File)=>{
        return new Promise((resolve, reject)=> {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = error => reject(error)
        })
    
    }
         const base64 = await fileToBase64(file)
    const response = await axios.post(`${BACKEND_URL}/api/v1/uploadImage`, base64, {
        withCredentials: true 
    })
    console.log(response)
    alert(response.data.data.publicUrl)
}
    return <div>
        
<form className="max-w-lg mx-auto">
  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Upload file</label>
  <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
  onChange={(e) => setFile(e.target.files?.[0] || null)} accept="image/"
  aria-describedby="user_avatar_help" id="user_avatar" type="file" />
  <button type="button" onClick={onSubmit}>Upload</button>
  <div className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="user_avatar_help">{}</div>
</form>

    </div>
}

