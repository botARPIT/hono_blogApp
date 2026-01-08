// import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from "../config"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { BACKEND_URL } from "@/config"


export const Login = ({ label }: { label: string }) => {

  async function loginHandler() {
    window.location.href = `${BACKEND_URL}/api/v1/auth/google`
    toast.info("Redirecting to Google...")
  }

  return (
    <Button
      onClick={loginHandler}
      type="button"
      variant="outline"
      className="w-full"
    >
      <svg
        className="w-4 h-4 mr-2"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 18 19"
      >
        <path
          fillRule="evenodd"
          d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
          clipRule="evenodd"
        />
      </svg>
      {label} with Google
    </Button>
  )
}
