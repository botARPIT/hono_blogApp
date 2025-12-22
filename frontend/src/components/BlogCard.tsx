import Avatar from './Avatar'

type BlogCardProps = {
  authorName: string
  title: string
  content: string
  createdAt: string
}

const BlogCard = ({ authorName, title, content, createdAt }: BlogCardProps) => {
  // Strip HTML tags and replace with spaces to prevent word joining
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  
  return (
    <div className='p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-muted/50 transition-colors'>
      <div className='flex items-center gap-2 md:gap-3 mb-2'>
        <Avatar prop={authorName} />
        <div className='font-semibold text-sm md:text-base text-foreground'>{authorName}</div>
        <div className='text-xs md:text-sm text-muted-foreground'>{createdAt}</div>
      </div>
      <div className='text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2'>
        {title}
      </div>
      <div className='text-sm md:text-base font-normal text-muted-foreground line-clamp-3'>
        {plainText.slice(0, 200)}...
      </div>
    </div>
  )
}

export default BlogCard
