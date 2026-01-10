import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { RichTextEditor } from '../components/RichTextEditor'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import Appbar from '../components/Appbar'
import { BlogTag, type BlogTag as BlogTagType } from '../types/blog'
import { Save, Send } from 'lucide-react'
import { useCreateBlog } from '../hooks/queries'

const Publish = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tag, setTag] = useState<BlogTagType>(BlogTag.GENERAL)
  const navigate = useNavigate()
  
  // Use the mutation hook - it handles cache invalidation automatically
  const createBlogMutation = useCreateBlog()

  const validateForm = (isDraft: boolean = false) => {
    if (!title.trim()) {
      toast.error('Title is required')
      return false
    }

    if (title.length < 10) {
      toast.error('Title must be at least 10 characters')
      return false
    }

    // For drafts, we only require title
    if (isDraft) return true

    if (!content.trim()) {
      toast.error('Content is required')
      return false
    }

    // Strip HTML tags for length validation
    const textContent = content.replace(/<[^>]*>/g, '')
    
    if (textContent.length < 150) {
      toast.error('Content must be at least 150 characters')
      return false
    }

    return true
  }

  const handleSubmit = (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault()
    
    if (!validateForm(asDraft)) return

    // Use mutation - it will invalidate cache and navigate on success
    createBlogMutation.mutate({
      title, 
      content: content || '<p>Draft content...</p>', 
      thumbnail: 'https://via.placeholder.com/800x400', // TODO: Implement thumbnail upload
      tag,
      published: !asDraft
    })
  }

  const isLoading = createBlogMutation.isPending

  return (
    <div className="min-h-screen bg-background">
      <Appbar />
      <div className="container mx-auto py-4 md:py-8 max-w-4xl px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Create New Blog</CardTitle>
            <CardDescription>Share your thoughts with the world</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter blog title (min 10 characters)"
                  required
                  minLength={10}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tag">Category</Label>
                <Select value={tag} onValueChange={(value) => setTag(value as BlogTagType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.values(BlogTag) as BlogTagType[]).map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* TODO: Thumbnail upload feature - disabled for now
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
                <Input
                  id="thumbnail"
                  placeholder="https://example.com/image.jpg"
                  type="url"
                  disabled
                />
              </div>
              */}

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your blog content here..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full sm:w-auto gap-2 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  {isLoading ? 'Publishing...' : 'Publish'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  disabled={isLoading}
                  onClick={(e) => handleSubmit(e, true)}
                  className="w-full sm:w-auto gap-2 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/blogs')} 
                  className="w-full sm:w-auto cursor-pointer"
                  disabled={isLoading}
                >
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

export default Publish
