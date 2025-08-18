import axios from "axios"
import { BACKEND_URL } from "../config"
import { useNavigate } from "react-router-dom"

export const LogoutButton = () => {
const navigate = useNavigate()
    async function handleLogout (){
    try {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/logout`, {}, {withCredentials: true}) 
        console.log(response)
         navigate('/signin')
    } catch (error) {
        console.log(error)
    }}

  return (
    <div >
      <button
        type='button'
        onClick={handleLogout}
        className='text-white cursor-pointer     bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-lg rounded-full text-sm p-3 text-center inline-flex items-center mb-0.5'
      >
        <svg
          className='w-4 h-4' 
          aria-hidden='true'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 14 10'
        >
          <path
            stroke='currentColor'
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='2'
            d='M1 5h12m0 0L9 1m4 4L9 9'
          />
        </svg>
        <span className='sr-only'>Icon description</span>
      </button>
    </div>
  )
}

