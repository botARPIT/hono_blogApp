import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import { BACKEND_URL } from '../config'

/**
 * Centralized API client with interceptors for error handling
 * This provides a single point for all API configurations
 */
const apiClient = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
})

// Request interceptor - can add auth headers, logging, etc.
apiClient.interceptors.request.use(
    (config) => {
        // You can add request timestamp for debugging
        config.metadata = { startTime: Date.now() }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor - centralized error handling
apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error: AxiosError) => {
        // Error handling is done by the calling code
        // Could add error reporting service here (e.g., Sentry)
        return Promise.reject(error)
    }
)

// Type-safe API helper functions
export const api = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        apiClient.get<T>(url, config).then(res => res.data),

    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        apiClient.post<T>(url, data, config).then(res => res.data),

    patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        apiClient.patch<T>(url, data, config).then(res => res.data),

    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        apiClient.delete<T>(url, config).then(res => res.data),
}

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
    export interface AxiosRequestConfig {
        metadata?: {
            startTime: number
        }
    }
}

export default apiClient
