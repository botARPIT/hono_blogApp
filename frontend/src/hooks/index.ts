import axios from "axios"
import { useEffect, useState } from "react"
import { BACKEND_URL } from "../config"
import { toast } from "sonner"

type Blog = {
    author : {
        name: string
    },
    title: string,
    content : string,
    createdAt: Date
}

export const useBlogs = () => {
    const [loading, setLoading] = useState(true)
    const [blogs, setBlogs] = useState<Blog []>([])

    useEffect(( ) => {
     try {
        axios.get(`${BACKEND_URL}/api/v1/blogs/1`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
         .then(response => {
            setBlogs(response.data);
            setLoading(false)
         })
     } catch (error) {
        toast.error("Cannot get blogs")
     }
    }, [])

    return {
        loading, 
        blogs
    }
}