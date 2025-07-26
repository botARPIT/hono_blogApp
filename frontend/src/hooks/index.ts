import axios from "axios"
import { useEffect, useState } from "react"
import { BACKEND_URL } from "../config"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"


export type BlogDTO = {
    author: {
        name: string
    },
    title: string,
    content: string,
    createdAt: Date,
    id: string
}

export const useBlog = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true)
    const [blog, setBlog] = useState<BlogDTO>()

    useEffect(() => {
        try {
            axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
                withCredentials: true
            }).then(response => {
                setBlog(response.data)
                setLoading(false)
            })
        } catch (error) {
            toast.error("Error loading the blog")
        }
    }, [id])

    return {
        loading,
        blog
    }
}

export const useBlogs = () => {
    const [loading, setLoading] = useState(true)
    const [blogs, setBlogs] = useState<BlogDTO[]>([])
    const navigate = useNavigate()
 
    useEffect(() => {
        try {
            axios.get(`${BACKEND_URL}/api/v1/blogs/1`, {
                // headers: {
                //     Authorization: `Bearer ${localStorage.getItem("token")}`
                // }
                withCredentials: true
            })
                .then(response => {
                    if(response.status == 401) {
                       navigate('/signin')
                    } else  setBlogs(response.data);
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