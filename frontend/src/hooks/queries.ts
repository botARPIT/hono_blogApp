import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import api from '../lib/axios'
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

// API Functions - use centralized axios instance with token refresh
const fetchBlogs = async (page: number = 1): Promise<BlogDTO[]> => {
    const { data } = await api.get(`/api/v1/blog/blogs/${page}`)
    return Array.isArray(data) ? data : []
}

const fetchBlog = async (id: string): Promise<BlogDTO> => {
    const { data } = await api.get(`/api/v1/blog/blog/${id}`)
    return data
}

const fetchUserBlogs = async (): Promise<BlogDTO[]> => {
    try {
        const { data } = await api.get(`/api/v1/blog/my-blogs`)
        // Backend returns array directly, not wrapped in { blogs: [...] }
        return Array.isArray(data) ? data : []
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return []
        }
        throw error
    }
}

const fetchUserProfile = async (): Promise<UserProfile> => {
    const { data } = await api.get(`/api/v1/user/profile_info`)
    return data.userProfile
}

const updateUserProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await api.patch(`/api/v1/user/update_profile`, data)
    return response.data
}

const deleteBlogApi = async (id: string): Promise<void> => {
    await api.delete(`/api/v1/blog/delete/${id}`)
}

const likeBlogApi = async (id: string): Promise<{ like: number; hasLiked: boolean }> => {
    const { data } = await api.post(`/api/v1/blog/like/${id}`, {})
    return data
}

const checkLikeStatusApi = async (id: string): Promise<{ hasLiked: boolean }> => {
    const { data } = await api.get(`/api/v1/blog/like-status/${id}`)
    // Backend returns boolean directly, wrap it for consistent usage
    return { hasLiked: typeof data === 'boolean' ? data : !!data }
}

const togglePublishBlogApi = async ({ id, published }: { id: string; published: boolean }): Promise<{ published: boolean }> => {
    const { data } = await api.patch(`/api/v1/blog/updateBlog/${id}`, { published })
    return data
}

// Types for create/update blog
interface CreateBlogInput {
    title: string
    content: string
    thumbnail?: string
    tag: string
    published: boolean
}

const createBlogApi = async (input: CreateBlogInput): Promise<BlogDTO> => {
    const { data } = await api.post(`/api/v1/blog/addBlog`, input)
    return data
}

const updateBlogApi = async ({ id, ...data }: { id: string } & Partial<CreateBlogInput>): Promise<BlogDTO> => {
    const response = await api.patch(`/api/v1/blog/updateBlog/${id}`, data)
    return response.data
}

// Hooks with React Query
// Note: 401 handling is now done by the axios interceptor which attempts token refresh
// If refresh fails, the interceptor dispatches 'auth:sessionExpired' event
export function useBlogs(page: number = 1) {
    const navigate = useNavigate()

    return useQuery({
        queryKey: [...queryKeys.blogs, page],
        queryFn: () => fetchBlogs(page),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error) => {
            // After axios interceptor tries to refresh, if still 401, don't retry
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

export function useTogglePublish() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: togglePublishBlogApi,
        onMutate: async ({ id, published }) => {
            // Cancel outgoing refetches for both user blogs and public blogs
            await queryClient.cancelQueries({ queryKey: queryKeys.userBlogs })
            await queryClient.cancelQueries({ queryKey: queryKeys.blogs })

            // Snapshot previous values
            const previousUserBlogs = queryClient.getQueryData<BlogDTO[]>(queryKeys.userBlogs)

            // Get all cached blog pages
            const blogQueries = queryClient.getQueriesData<BlogDTO[]>({ queryKey: queryKeys.blogs })

            // Optimistically update user blogs
            if (previousUserBlogs) {
                queryClient.setQueryData<BlogDTO[]>(
                    queryKeys.userBlogs,
                    previousUserBlogs.map(blog =>
                        blog.id === id ? { ...blog, published } : blog
                    )
                )
            }

            // Optimistically update public blogs list
            blogQueries.forEach(([queryKey, oldData]) => {
                if (oldData) {
                    if (published) {
                        // Blog is being published - it will appear after refetch
                        // Don't add it optimistically as we don't have full data
                    } else {
                        // Blog is being unpublished - remove it immediately
                        queryClient.setQueryData<BlogDTO[]>(
                            queryKey,
                            oldData.filter(blog => blog.id !== id)
                        )
                    }
                }
            })

            return { previousUserBlogs, blogQueries }
        },
        onSuccess: (_data, { published }) => {
            // Refetch to get fresh data from server
            queryClient.refetchQueries({ queryKey: queryKeys.userBlogs })
            queryClient.refetchQueries({ queryKey: queryKeys.blogs })
            toast.success(published ? 'Blog published!' : 'Blog unpublished')
        },
        onError: (error, _variables, context) => {
            // Rollback on error
            if (context?.previousUserBlogs) {
                queryClient.setQueryData(queryKeys.userBlogs, context.previousUserBlogs)
            }
            if (context?.blogQueries) {
                context.blogQueries.forEach(([queryKey, oldData]) => {
                    queryClient.setQueryData(queryKey, oldData)
                })
            }
            const message = axios.isAxiosError(error)
                ? error.response?.data?.error?.message
                : 'Failed to update blog'
            toast.error(message || 'Failed to update blog')
        },
    })
}

export function useCreateBlog() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: createBlogApi,
        onSuccess: (data, variables) => {
            // Invalidate both blogs list and user blogs to ensure fresh data
            queryClient.invalidateQueries({ queryKey: queryKeys.blogs })
            queryClient.invalidateQueries({ queryKey: queryKeys.userBlogs })

            if (variables.published) {
                toast.success('Blog published successfully!')
                navigate(`/blog/${data.id}`)
            } else {
                toast.success('Draft saved successfully! You can find it in My Blogs.')
                navigate('/my-blogs')
            }
        },
        onError: (error, variables) => {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.error?.message
                : variables.published ? 'Failed to publish blog' : 'Failed to save draft'
            toast.error(message || (variables.published ? 'Failed to publish blog' : 'Failed to save draft'))
        },
    })
}

export function useUpdateBlog() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: updateBlogApi,
        onSuccess: (_data, variables) => {
            // Invalidate specific blog, blogs list, and user blogs
            queryClient.invalidateQueries({ queryKey: queryKeys.blog(variables.id) })
            queryClient.invalidateQueries({ queryKey: queryKeys.blogs })
            queryClient.invalidateQueries({ queryKey: queryKeys.userBlogs })

            toast.success('Blog updated successfully!')
            navigate(`/blog/${variables.id}`)
        },
        onError: (error) => {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.error?.message
                : 'Failed to update blog'
            toast.error(message || 'Failed to update blog')
        },
    })
}

