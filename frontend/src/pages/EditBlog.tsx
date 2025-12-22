import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BACKEND_URL } from '../config'
import { toast } from 'sonner'
import { RichTextEditor } from '../components/RichTextEditor'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import Appbar from '../components/Appbar'
import { useBlog } from '../hooks/queries'
import Loading from '../components/Loading'

export default function EditBlog() {
  const { id } = useParams<{ id: string }>()
  const { data: blog, isLoading: blogLoading } = useBlog(id || '')
  const navigate = useNavigate()

  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (blog) {
      setTitle(blog.title)
      setContent(blog.content)
      // Note: thumbnail might not be in BlogDTO, adjust if needed
    }
  }, [blog])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required')
      return
    }

    // Strip HTML tags for length validation
    const textContent = content.replace(/<[^>]*>/g, '')
    
    if (title.length < 10) {
      toast.error('Title must be at least 10 characters')
      return
    }

    if (textContent.length < 150) {
      toast.error('Content must be at least 150 characters')
      return
    }

    setSaving(true)
    try {
      await axios.patch(
        `${BACKEND_URL}/api/v1/blog/updateBlog/${id}`,
        { 
          title, 
          content, 
          thumbnail: thumbnail || undefined 
        },
        { withCredentials: true }
      )
      toast.success('Blog updated successfully!')
      navigate(`/blog/${id}`)
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error?.message
        : 'Failed to update blog'
      toast.error(message || 'Failed to update blog')
    } finally {
      setSaving(false)
    }
  }

  if (blogLoading) {
    return (
      <div>
        <Appbar />
        <Loading />
      </div>
    )
  }

  if (!blog) {
    return (
      <div>
        <Appbar />
        <div className="container mx-auto py-8 text-center">
          <p>Blog not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Appbar />
      <div className="container mx-auto py-4 md:py-8 max-w-4xl px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Edit Blog</CardTitle>
            <CardDescription>Update your blog post</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  minLength={10}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
                <Input
                  id="thumbnail"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  type="url"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/blog/${id}`)} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


