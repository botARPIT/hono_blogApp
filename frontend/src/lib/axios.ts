/**
 * Axios instance with interceptors for handling token refresh
 * This provides automatic token rotation when access tokens expire
 */

import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { BACKEND_URL } from '../config'

// Flag to prevent multiple refresh requests
let isRefreshing = false

// Queue to hold requests while refreshing
let failedQueue: Array<{
    resolve: (value: unknown) => void
    reject: (error: unknown) => void
}> = []

const processQueue = (error: Error | null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(undefined)
        }
    })
    failedQueue = []
}

// Create axios instance
const api = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // Check if error is 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't retry for refresh endpoint itself to avoid infinite loop
            if (originalRequest.url?.includes('/auth/refresh')) {
                // Refresh token is also invalid, redirect to login
                window.dispatchEvent(new CustomEvent('auth:sessionExpired'))
                return Promise.reject(error)
            }

            if (isRefreshing) {
                // If we're already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                // Attempt to refresh the token
                await api.get('/api/v1/auth/refresh')
                processQueue(null)
                // Retry the original request
                return api(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError as Error)
                // Refresh failed, dispatch session expired event
                window.dispatchEvent(new CustomEvent('auth:sessionExpired'))
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default api
