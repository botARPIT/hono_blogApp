import { Link } from 'react-router-dom'
import Appbar from '../components/Appbar'
import BlogCard from '../components/BlogCard'
import { BlogListSkeleton } from '../components/Loading'
import { useBlogs } from '../hooks/queries'

export default function Blogs() {
  const { data: blogs = [], isLoading, isError } = useBlogs()
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Appbar />
        <div className="container mx-auto py-4 md:py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <BlogListSkeleton count={4} />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Appbar />
        <div className='container mx-auto py-8 px-4 text-center'>
          <p className="text-muted-foreground">Error loading blogs. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Appbar />
      <div className='container mx-auto py-4 md:py-8 px-4'>
        <div className='max-w-3xl mx-auto'>
          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No blogs found. Be the first to publish one!</p>
            </div>
          ) : (
            blogs.map(blog => (
              <Link key={blog.id} to={`/blog/${blog.id}`}>
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
                  likes={blog.like}
                  tag={blog.tag}
                />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
