import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import axios from 'axios'
import { BACKEND_URL } from '../config'
import { toast } from 'sonner'
import { Login } from './Login'
import { useAuth } from '../context/AuthContext'

type UserAuthDTO = {
  name?: string
  email: string
  password: string
}

const Auth = ({ type }: { type: 'signup' | 'signin' }) => {
  const navigate = useNavigate()
  const { setUserName } = useAuth()
  const [postInputs, setPostInputs] = useState<UserAuthDTO>({
    name: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  async function sendRequest() {
    if (!postInputs.email || !postInputs.password) {
      toast.error('Email and password are required')
      return
    }

    if (type === 'signup' && !postInputs.name) {
      toast.error('Name is required')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/auth/${type === "signup" ? "signup" : "signin"}`, postInputs, {
        withCredentials: true
      })
      
      // Save user info and update context
      let name = ''
      if (type === 'signup' && postInputs.name) {
        name = postInputs.name
      } else if (response.data.name) {
        name = response.data.name
      } else if (response.data.user?.name) {
        name = response.data.user.name
      }
      
      if (name) {
        setUserName(name)
      }

      toast.success(`${type === 'signup' ? "User created" : "Signed in"} successfully`)
      navigate('/blogs')
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error?.message
        : `Unable to ${type === 'signin' ? "sign in" : "sign up"}. Check your email/password`
      toast.error(message || `Unable to ${type === 'signin' ? "sign in" : "sign up"}. Check your email/password`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='h-screen flex justify-center items-center bg-background px-4'>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">
            {type === 'signup' ? 'Create an account' : 'Login to your account'}
          </CardTitle>
          <CardDescription>
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
          {type === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={postInputs.name}
                onChange={e => {
                  setPostInputs(c => ({
                    ...c,
                    name: e.target.value
                  }))
                }}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={postInputs.email}
              onChange={e => {
                setPostInputs(c => ({
                  ...c,
                  email: e.target.value
                }))
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={postInputs.password}
              onChange={e => {
                setPostInputs(c => ({
                  ...c,
                  password: e.target.value
                }))
              }}
              required
              minLength={8}
            />
          </div>
          <Button 
            className="w-full" 
            onClick={sendRequest}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (type === 'signup' ? 'Sign up' : 'Sign in')}
          </Button>
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
