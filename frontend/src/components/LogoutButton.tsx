import axios from "axios"
import { BACKEND_URL } from "../config"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useQueryClient } from "@tanstack/react-query"

export const LogoutButton = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const queryClient = useQueryClient()
  
  async function handleLogout() {
    try {
      await axios.post(`${BACKEND_URL}/api/v1/auth/logout`, {}, { withCredentials: true })
      logout()
      queryClient.clear()
      toast.success("Logged out successfully")
      navigate('/signin')
    } catch {
      toast.error("Unable to logout, try again")
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )
}
