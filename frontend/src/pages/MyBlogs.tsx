import { Link } from 'react-router-dom'
import Appbar from '../components/Appbar'
import BlogCard from '../components/BlogCard'
import { useUserBlogs, useDeleteBlog } from '../hooks/queries'
import { DeleteBlogDialog } from '../components/DeleteBlogDialog'
import { Edit2, Plus, BookOpen, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'

export default function MyBlogs() {
  const { data: blogs = [], isLoading, isError, refetch } = useUserBlogs()
  const deleteBlog = useDeleteBlog()

  const handleDelete = (id: string) => {
    deleteBlog.mutate(id)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Appbar />
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted/40 animate-pulse rounded-xl border border-border" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Appbar />
        <div className='container mx-auto py-16 px-4 text-center max-w-md'>
          <div className="bg-destructive/10 p-6 rounded-2xl border border-destructive/20 mb-6">
            <p className="text-destructive font-medium mb-4">Failed to load your blogs</p>
            <Button variant="outline" onClick={() => refetch()} className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Appbar />
      <div className='container mx-auto py-6 md:py-10 px-4 max-w-4xl'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12'>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Your Stories</h1>
            <p className="text-muted-foreground mt-1">Manage and edit your published content</p>
          </div>
          <Link to="/publish">
            <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
              <Plus className="mr-2 h-4 w-4" /> New Story
            </Button>
          </Link>
        </div>

        {blogs.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-20 px-6 text-center border-dashed bg-muted/5">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-6">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No stories yet</h2>
            <p className="text-muted-foreground max-w-sm mb-8">
              Share your thoughts and ideas with the world. Start writing your first masterpiece today.
            </p>
            <Link to="/publish">
              <Button size="lg" variant="outline" className="rounded-full">
                Write your first story
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6">
            {blogs.map(blog => (
              <div key={blog.id} className="group relative">
                <Card className="overflow-hidden border-border/50 hover:border-primary/20 hover:shadow-xl transition-all duration-300">
                  <Link to={`/blog/${blog.id}`} className="block">
                    <BlogCard
                      authorName={blog.author.name}
                      title={blog.title}
                      content={blog.content}
                      createdAt={new Date(blog.createdAt).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }
                      )}
                    />
                  </Link>
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <Link to={`/edit/${blog.id}`}>
                      <Button size="sm" variant="secondary" className="h-9 w-9 p-0 rounded-full shadow-md" title="Edit story">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteBlogDialog 
                      blogId={blog.id} 
                      onDelete={() => handleDelete(blog.id)} 
                      trigger={
                        <Button size="sm" variant="destructive" className="h-9 w-9 p-0 rounded-full shadow-md" title="Delete story">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
