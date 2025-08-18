import { useNavigate } from "react-router-dom";
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from "../config";
import { toast } from "sonner";

export const Login = ({label}: {label: string}) => {
const navigate = useNavigate()


function loginHandler(){
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
googleAuthUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID)
googleAuthUrl.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI)
googleAuthUrl.searchParams.set("response_type", "code")
googleAuthUrl.searchParams.set("scope", "openid email profile")
googleAuthUrl.searchParams.set("access_type", "offline")
googleAuthUrl.searchParams.set("prompt", "consent")
    window.location.href = googleAuthUrl.toString()
        toast.success(`${label == 'signup' ? "User created" : "Signed in"} successfully`)
    navigate("/blogs")

}
  return (
    <div>
      <button
        onClick={loginHandler}
        type='button'
        className='text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 w-full cursor-pointer focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mt-2'
      >
        <svg
          className='w-4 h-4 me-2'
          aria-hidden='true'
          xmlns='http://www.w3.org/2000/svg'
          fill='currentColor'
          viewBox='0 0 18 19'
        >
          <path
            fill-rule='evenodd'
            d='M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z'
            clip-rule='evenodd'
          />
        </svg>
        {label} with Google
      </button>
    </div>
  )
}

