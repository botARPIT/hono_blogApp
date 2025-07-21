import { Link } from 'react-router-dom'
import Appbar from '../components/Appbar'
import BlogCard from '../components/BlogCard'
import Loading from '../components/Loading'

import { useBlogs } from '../hooks'

export default function Blogs () {
  const { loading, blogs } = useBlogs()
  if (loading) {
    return (
      <div className=''>
        <Loading />
      </div>
    )
  }
  return (
    <div>
      <Appbar />
      <div className='flex justify-center'>
        <div className='max-w-xl'>
          {blogs.map(blog => (
            <Link to={`/blog/${blog.id}`}>
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
          ))}
        </div>
      </div>
    </div>
  )
}
