import api from "../lib/axios"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useQueryClient } from "@tanstack/react-query"

export const LogoutButton = () => {
  const navigate = useNavigate()
  const { clearSession } = useAuth()
  const queryClient = useQueryClient()
  
  async function handleLogout() {
    try {
      await api.post('/api/v1/auth/logout')
      clearSession()
      queryClient.clear()
      toast.success("Logged out successfully")
      navigate('/signin')
    } catch {
      // Even if backend fails (e.g., expired token), we should still logout locally
      // This is the key fix for when users can't logout due to expired tokens
      clearSession()
      queryClient.clear()
      toast.success("Logged out successfully")
      navigate('/signin')
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
