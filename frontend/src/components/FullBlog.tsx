import type { BlogDTO } from '../hooks'
import DOMPurify from 'dompurify'

export const FullBlog = ({ blog }: { blog: BlogDTO }) => {
  // Sanitize HTML content to prevent XSS
  const sanitizedContent = DOMPurify.sanitize(blog.content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'span', 'mark'
    ],
    ALLOWED_ATTR: ['style', 'class'],
  })

  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 px-4 md:px-6 lg:px-8 py-6'>
      <div className='lg:col-span-8'>
        <div className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-3'>
          {blog.title}
        </div>
        <div className='text-sm md:text-md font-semibold text-muted-foreground pt-2 mb-6'>
          {`Posted on - `}
          {new Date(blog.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
        <div 
          className='text-base md:text-lg font-medium prose dark:prose-invert max-w-none text-foreground'
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>
      <div className='lg:col-span-4'>
        <div className='flex justify-center flex-col pt-4 border rounded-lg p-4 md:p-6 bg-muted/30 sticky top-20'>
          <div className='flex justify-center text-lg md:text-xl font-extrabold text-muted-foreground'>
            {"Author"}
          </div>
          <div className='text-base md:text-lg font-medium flex justify-center text-foreground mt-2'>
            {blog.author.name}
          </div>
        </div>
      </div>
    </div>
  )
}
