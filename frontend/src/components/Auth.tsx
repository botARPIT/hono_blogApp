import { useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './Button'
import axios from 'axios'
import { BACKEND_URL } from '../config'

import { toast } from 'sonner'
type UserAuthDTO = {
  name?: string
  email: string
  password: string
}

const Auth = ({ type }: { type: 'signup' | 'signin' }) => {
  const navigate = useNavigate()
  const [postInputs, setPostInputs] = useState<UserAuthDTO>({
    name: '',
    email: '',
    password: ''
  })
  

  async function sendRequest () {
    try {
      // const response = 
      await axios.post(`${BACKEND_URL}/api/v1/${type == "signup" ? "signup" : "signin"}`, postInputs, {
        withCredentials: true
      })
      // const jwt = response.data.accessToken
      // localStorage.setItem('token', jwt)
      
      toast.success(`${type == 'signup' ? "User created" : "Signed in"} successfully`)
      navigate('/blogs')
    } catch (error) {
      toast.error(`Unable to ${type == 'signin' ? "sign in" : "sign up"}. Check your email/password`)
    }
  }
  return (
    <div className='h-screen flex justify-center flex-col'>

      <div className='flex justify-center'>
        <div>
          <div className='px-12  '>
            <div className='text-3xl font-bold'>
              {type == 'signup' ? 'Create an account' : 'Login your account'}
            </div>
            <div className='text-md mt-2 text-slate-400'>
              {type === 'signup'
                ? 'Already have an account?'
                : "Don't have an account"}
              <Link
                className='pl-2 underline'
                to={type === 'signin' ? '/signup' : '/signin'}
              >
                {type == 'signin' ? 'Sign Up' : 'Sign In'}
              </Link>
            </div>
          </div>
          <div>
            {type == 'signup' ? (
              <LabelledInput
                label='Name'
                placeholder='Enter your name'
                onChange={e => {
                  setPostInputs(c => ({
                    ...c,
                    name: e.target.value
                  }))
                }}
              />
            ) : null}
            <LabelledInput
              label='Email'
              placeholder='Enter your email'
              onChange={e => {
                setPostInputs(c => ({
                  ...c,
                  email: e.target.value
                }))
              }}
            />
            <LabelledInput
              label='Password'
              type={'password'}
              placeholder='Enter your password'
              onChange={e => {
                setPostInputs(c => ({
                  ...c,
                  password: e.target.value
                }))
              }}
            />

            <Button label={type === 'signup' ? 'Sign up' : 'Sign in'} submit={sendRequest}/>
          </div>
        </div>
      </div>
    </div>
  )
}

type LabelledInput = {
  label: string
  placeholder: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  type?: string
}

const LabelledInput: React.FC<LabelledInput> = ({
  label,
  placeholder,
  onChange,
  type
}) => {
  return (
    <div>
      <div>
        <label className='block mt-2 pt-4 text-semibold font-medium text-black'>
          {label}
        </label>
        <input
          type={type || 'text'}
          onChange={onChange}
          id='first_name'
          className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
          placeholder={placeholder}
          required
        />
      </div>
    </div>
  )
}

export { Auth }
