import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'

interface RateLimitConfig {
    maxAttempts: number
    windowMs: number
    lockoutMs: number
}

interface RateLimitState {
    attempts: number
    lastAttemptTime: number
    lockedUntil: number | null
}

const DEFAULT_CONFIG: RateLimitConfig = {
    maxAttempts: 5,      // 5 attempts
    windowMs: 60000,     // per 1 minute
    lockoutMs: 300000,   // 5 minute lockout
}

/**
 * Rate limiting hook for auth forms
 * Prevents brute force attacks on login/signup
 */
export function useRateLimit(key: string, config: Partial<RateLimitConfig> = {}) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config }
    const storageKey = `rate_limit_${key}`

    const getState = useCallback((): RateLimitState => {
        try {
            const stored = localStorage.getItem(storageKey)
            if (stored) {
                return JSON.parse(stored)
            }
        } catch {
            // If parsing fails, return fresh state
        }
        return { attempts: 0, lastAttemptTime: 0, lockedUntil: null }
    }, [storageKey])

    const [state, setState] = useState<RateLimitState>(getState)

    // Persist state to localStorage
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(state))
    }, [state, storageKey])

    const isLocked = useCallback((): boolean => {
        if (state.lockedUntil && Date.now() < state.lockedUntil) {
            return true
        }
        return false
    }, [state.lockedUntil])

    const getRemainingLockTime = useCallback((): number => {
        if (state.lockedUntil) {
            const remaining = state.lockedUntil - Date.now()
            return Math.max(0, Math.ceil(remaining / 1000))
        }
        return 0
    }, [state.lockedUntil])

    const recordAttempt = useCallback((): boolean => {
        const now = Date.now()

        // Check if locked
        if (state.lockedUntil && now < state.lockedUntil) {
            const remainingSecs = Math.ceil((state.lockedUntil - now) / 1000)
            toast.error(`Too many attempts. Please try again in ${remainingSecs} seconds.`)
            return false
        }

        // Reset lock if expired
        if (state.lockedUntil && now >= state.lockedUntil) {
            setState({ attempts: 1, lastAttemptTime: now, lockedUntil: null })
            return true
        }

        // Reset attempts if window has passed
        if (now - state.lastAttemptTime > finalConfig.windowMs) {
            setState({ attempts: 1, lastAttemptTime: now, lockedUntil: null })
            return true
        }

        // Check if max attempts reached
        if (state.attempts >= finalConfig.maxAttempts) {
            const lockedUntil = now + finalConfig.lockoutMs
            setState({ ...state, lockedUntil })
            const lockoutMins = Math.ceil(finalConfig.lockoutMs / 60000)
            toast.error(`Too many attempts. Please try again in ${lockoutMins} minutes.`)
            return false
        }

        // Record attempt
        setState({
            attempts: state.attempts + 1,
            lastAttemptTime: now,
            lockedUntil: null
        })
        return true
    }, [state, finalConfig])

    const resetAttempts = useCallback(() => {
        setState({ attempts: 0, lastAttemptTime: 0, lockedUntil: null })
        localStorage.removeItem(storageKey)
    }, [storageKey])

    const remainingAttempts = finalConfig.maxAttempts - state.attempts

    return {
        isLocked: isLocked(),
        recordAttempt,
        resetAttempts,
        remainingAttempts,
        getRemainingLockTime,
    }
}

/**
 * Form submission hook with debouncing to prevent double submissions
 */
export function useSubmitGuard(delayMs: number = 1000) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const startSubmission = useCallback(() => {
        if (isSubmitting) return false
        setIsSubmitting(true)
        return true
    }, [isSubmitting])

    const endSubmission = useCallback(() => {
        // Add small delay before allowing resubmission
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
            setIsSubmitting(false)
        }, delayMs)
    }, [delayMs])

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return {
        isSubmitting,
        startSubmission,
        endSubmission,
    }
}
