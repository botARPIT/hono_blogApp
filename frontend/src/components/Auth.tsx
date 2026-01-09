import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { BACKEND_URL } from '../config'
import { Login } from './Login'
import { useRateLimit } from '../hooks/useRateLimit'
import { AlertTriangle } from 'lucide-react'

type UserAuthDTO = {
  name?: string
  email: string
  password: string
}

const Auth = ({ type }: { type: 'signup' | 'signin' }) => {
  const [postInputs, setPostInputs] = useState<UserAuthDTO>({
    name: '',
    email: '',
    password: ''
  })
  const [loading] = useState(false)

  // Rate limiting for auth attempts
  const { 
    isLocked, 
    remainingAttempts,
    getRemainingLockTime
  } = useRateLimit(`auth_${type}`, {
    maxAttempts: 5,
    windowMs: 60000,      // 1 minute window
    lockoutMs: 300000,    // 5 minute lockout
  })



  return (
    <div className='h-screen flex justify-center items-center bg-background px-4'>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img src="/favicon.png" alt="Blogify Logo" className="h-12 w-12 rounded-lg" />
          </div>
          <CardTitle className="text-3xl text-center">
            {type === 'signup' ? 'Create an account' : 'Login to your account'}
          </CardTitle>
          <CardDescription className="text-center">
            {type === 'signup'
              ? 'Already have an account?'
              : "Don't have an account?"}
            <Link
              className='pl-2 underline text-primary'
              to={type === 'signin' ? '/signup' : '/signin'}
            >
              {type === 'signin' ? 'Sign Up' : 'Sign In'}
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rate limit warning */}
          {isLocked && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                Too many attempts. Please wait {getRemainingLockTime()} seconds.
              </span>
            </div>
          )}

          {/* Remaining attempts warning */}
          {!isLocked && remainingAttempts <= 2 && remainingAttempts > 0 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
              </span>
            </div>
          )}

          <form action={`${BACKEND_URL}/api/v1/auth/${type === 'signup' ? 'signup' : 'signin'}`} method="POST">
          {type === 'signup' && (
            <div className="space-y-2 mb-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={postInputs.name}
                onChange={e => {
                  setPostInputs(c => ({
                    ...c,
                    name: e.target.value
                  }))
                }}
                disabled={isLocked}
                required
              />
            </div>
          )}
          <div className="space-y-2 mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={postInputs.email}
              onChange={e => {
                setPostInputs(c => ({
                  ...c,
                  email: e.target.value
                }))
              }}
              disabled={isLocked}
              required
            />
          </div>
          <div className="space-y-2 mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={postInputs.password}
              onChange={e => {
                setPostInputs(c => ({
                  ...c,
                  password: e.target.value
                }))
              }}
              disabled={isLocked}
              required
              minLength={8}
            />
          </div>
          {type === 'signin' && <input type="hidden" name="authProvider" value="LOCAL" />}
          
          <Button 
            className="w-full" 
            type="submit"
            disabled={loading || isLocked}
          >
            {loading ? 'Please wait...' : (type === 'signup' ? 'Sign up' : 'Sign in')}
          </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Login label={type === 'signup' ? 'Sign up' : 'Sign in'} />
        </CardContent>
      </Card>
    </div>
  )
}

export { Auth }

