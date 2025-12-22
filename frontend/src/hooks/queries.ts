import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { BACKEND_URL } from '../config'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'

// Types
export type BlogDTO = {
    author: {
        name: string
    }
    title: string
    content: string
    createdAt: string
    id: string
    tag: string
    thumbnail: string
    published: boolean
    like: number
}

export type UserProfile = {
    id: string
    name: string
    email: string
    createdAt: Date
}

// Query Keys - centralized for cache invalidation
export const queryKeys = {
    blogs: ['blogs'] as const,
    blog: (id: string) => ['blog', id] as const,
    userBlogs: ['userBlogs'] as const,
    userProfile: ['userProfile'] as const,
}

// API Functions
const fetchBlogs = async (page: number = 1): Promise<BlogDTO[]> => {
    const { data } = await axios.get(`${BACKEND_URL}/api/v1/blog/blogs/${page}`, {
        withCredentials: true
    })
    return Array.isArray(data) ? data : []
}

const fetchBlog = async (id: string): Promise<BlogDTO> => {
    const { data } = await axios.get(`${BACKEND_URL}/api/v1/blog/blog/${id}`, {
        withCredentials: true
    })
    return data
}

const fetchUserBlogs = async (): Promise<BlogDTO[]> => {
    try {
        const { data } = await axios.get(`${BACKEND_URL}/api/v1/blog/my-blogs`, {
            withCredentials: true
        })
        return Array.isArray(data.blogs) ? data.blogs : []
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return []
        }
        throw error
    }
}

const fetchUserProfile = async (): Promise<UserProfile> => {
    const { data } = await axios.get(`${BACKEND_URL}/api/v1/user/profile_info`, {
        withCredentials: true
    })
    return data.userProfile
}

const updateUserProfile = async (data: { name?: string; email?: string }): Promise<UserProfile> => {
    const response = await axios.patch(`${BACKEND_URL}/api/v1/user/update_profile`, data, {
        withCredentials: true
    })
    return response.data
}

const deleteBlogApi = async (id: string): Promise<void> => {
    await axios.delete(`${BACKEND_URL}/api/v1/blog/delete/${id}`, {
        withCredentials: true
    })
}

// Hooks with React Query
export function useBlogs(page: number = 1) {
    const navigate = useNavigate()

    return useQuery({
        queryKey: [...queryKeys.blogs, page],
        queryFn: () => fetchBlogs(page),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error) => {
            if (axios.isAxiosError(error) && error?.response?.status === 401) {
                navigate('/signin')
                return false
            }
            return failureCount < 3
        },
    })
}

export function useBlog(id: string) {
    return useQuery({
        queryKey: queryKeys.blog(id),
        queryFn: () => fetchBlog(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 10, // 10 minutes
    })
}

export function useUserBlogs() {
    const navigate = useNavigate()

    return useQuery({
        queryKey: queryKeys.userBlogs,
        queryFn: fetchUserBlogs,
        staleTime: 1000 * 60 * 2, // 2 minutes
        retry: (failureCount, error) => {
            if (axios.isAxiosError(error) && error?.response?.status === 401) {
                navigate('/signin')
                return false
            }
            return failureCount < 3
        },
    })
}

export function useUserProfile() {
    const navigate = useNavigate()

    return useQuery({
        queryKey: queryKeys.userProfile,
        queryFn: fetchUserProfile,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error) => {
            if (axios.isAxiosError(error) && error?.response?.status === 401) {
                navigate('/signin')
                return false
            }
            return failureCount < 3
        },
    })
}

export function useUpdateProfile() {
    const queryClient = useQueryClient()
    const { setUserName } = useAuth()

    return useMutation({
        mutationFn: updateUserProfile,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.userProfile })
            if (data.name) {
                setUserName(data.name)
            }
            toast.success('Profile updated successfully')
        },
        onError: (error) => {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.error?.message
                : 'Failed to update profile'
            toast.error(message || 'Failed to update profile')
        },
    })
}

export function useDeleteBlog() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteBlogApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.userBlogs })
            queryClient.invalidateQueries({ queryKey: queryKeys.blogs })
            toast.success('Blog deleted successfully')
        },
        onError: (error) => {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.error?.message
                : 'Failed to delete blog'
            toast.error(message || 'Failed to delete blog')
        },
    })
}
