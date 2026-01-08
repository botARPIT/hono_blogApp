import { useState } from 'react'
import { useUserProfile, useUpdateProfile } from '../hooks/queries'
import Appbar from '../components/Appbar'
import Loading from '../components/Loading'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Mail, Calendar, Edit2, Check, X } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { toast } from 'sonner'

export default function UserInfo() {
  const { data: profile, isLoading, isError } = useUserProfile()
  const updateProfile = useUpdateProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')

  if (isLoading) {
    return (
      <div>
        <Appbar />
        <Loading />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Appbar />
        <div className="container mx-auto py-8 px-4">
          <p className="text-center text-muted-foreground">Profile not found</p>
        </div>
      </div>
    )
  }

  const handleEdit = () => {
    setEditedName(profile.name)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedName('')
  }

  const handleSave = () => {
    if (!editedName.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    updateProfile.mutate(
      { name: editedName },
      {
        onSuccess: () => {
          setIsEditing(false)
          setEditedName('')
        }
      }
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Appbar />
      <div className="container mx-auto py-4 md:py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-lg md:text-xl font-bold text-primary">
                  {profile.name[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Name</p>
                {isEditing ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-base md:text-lg font-semibold"
                      disabled={updateProfile.isPending}
                    />
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={updateProfile.isPending}
                      className="shrink-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updateProfile.isPending}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-base md:text-lg font-semibold text-foreground truncate">{profile.name}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEdit}
                      className="h-8 w-8 p-0 shrink-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-muted/50">
              <div className="p-2 md:p-3 rounded-full bg-primary/10 shrink-0">
                <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-base md:text-lg font-semibold text-foreground truncate">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-muted/50">
              <div className="p-2 md:p-3 rounded-full bg-primary/10 shrink-0">
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-base md:text-lg font-semibold text-foreground">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
