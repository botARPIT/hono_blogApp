import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { BACKEND_URL } from '../config'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import type { BlogDTO, UserProfile, UpdateProfileRequest } from '../types'

// Re-export types for backward compatibility
export type { BlogDTO, UserProfile }

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

const updateUserProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
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

const likeBlogApi = async (id: string): Promise<{ like: number; hasLiked: boolean }> => {
    const { data } = await axios.post(`${BACKEND_URL}/api/v1/blog/like/${id}`, {}, {
        withCredentials: true
    })
    return data
}

const checkLikeStatusApi = async (id: string): Promise<{ hasLiked: boolean }> => {
    const { data } = await axios.get(`${BACKEND_URL}/api/v1/blog/like-status/${id}`, {
        withCredentials: true
    })
    return data
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
        // Optimistic update for profile
        onMutate: async (newData) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.userProfile })

            // Snapshot previous value
            const previousProfile = queryClient.getQueryData<UserProfile>(queryKeys.userProfile)

            // Optimistically update
            if (previousProfile) {
                queryClient.setQueryData<UserProfile>(queryKeys.userProfile, {
                    ...previousProfile,
                    ...newData,
                })
            }

            return { previousProfile }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.userProfile })
            if (data.name) {
                setUserName(data.name)
            }
            toast.success('Profile updated successfully')
        },
        onError: (error, _variables, context) => {
            // Rollback on error
            if (context?.previousProfile) {
                queryClient.setQueryData(queryKeys.userProfile, context.previousProfile)
            }
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
        // Optimistic update for delete
        onMutate: async (deletedId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.userBlogs })
            await queryClient.cancelQueries({ queryKey: queryKeys.blogs })

            // Snapshot previous values
            const previousUserBlogs = queryClient.getQueryData<BlogDTO[]>(queryKeys.userBlogs)
            const previousBlogs = queryClient.getQueryData<BlogDTO[]>(queryKeys.blogs)

            // Optimistically remove the blog from user blogs
            if (previousUserBlogs) {
                queryClient.setQueryData<BlogDTO[]>(
                    queryKeys.userBlogs,
                    previousUserBlogs.filter(blog => blog.id !== deletedId)
                )
            }

            // Optimistically remove from all blogs
            if (previousBlogs) {
                queryClient.setQueryData<BlogDTO[]>(
                    queryKeys.blogs,
                    previousBlogs.filter(blog => blog.id !== deletedId)
                )
            }

            // Show optimistic toast
            toast.loading('Deleting blog...', { id: `delete-${deletedId}` })

            return { previousUserBlogs, previousBlogs, deletedId }
        },
        onSuccess: (_data, _variables, context) => {
            // Dismiss loading toast and show success
            toast.dismiss(`delete-${context?.deletedId}`)
            toast.success('Blog deleted successfully')

            // Invalidate to ensure consistency
            queryClient.invalidateQueries({ queryKey: queryKeys.userBlogs })
            queryClient.invalidateQueries({ queryKey: queryKeys.blogs })
        },
        onError: (error, _variables, context) => {
            // Dismiss loading toast
            toast.dismiss(`delete-${context?.deletedId}`)

            // Rollback on error
            if (context?.previousUserBlogs) {
                queryClient.setQueryData(queryKeys.userBlogs, context.previousUserBlogs)
            }
            if (context?.previousBlogs) {
                queryClient.setQueryData(queryKeys.blogs, context.previousBlogs)
            }

            const message = axios.isAxiosError(error)
                ? error.response?.data?.error?.message
                : 'Failed to delete blog'
            toast.error(message || 'Failed to delete blog')
        },
    })
}

export function useLikeBlog() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: likeBlogApi,
        onSuccess: (data, blogId) => {
            // Update cache with actual like count from server
            const currentBlog = queryClient.getQueryData<BlogDTO>(queryKeys.blog(blogId))
            if (currentBlog) {
                queryClient.setQueryData<BlogDTO>(queryKeys.blog(blogId), {
                    ...currentBlog,
                    like: data.like
                })
            }

            // Invalidate blogs list to refresh like counts
            queryClient.invalidateQueries({ queryKey: queryKeys.blogs })

            // Show appropriate message based on action
            if (data.hasLiked) {
                toast.success('You liked this blog!')
            } else {
                toast.success('Like removed')
            }
        },
        onError: (error) => {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.error?.message
                : 'Failed to update like'
            toast.error(message || 'Failed to update like')
        },
    })
}

export function useLikeStatus(blogId: string) {
    return useQuery({
        queryKey: ['likeStatus', blogId],
        queryFn: () => checkLikeStatusApi(blogId),
        enabled: !!blogId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
