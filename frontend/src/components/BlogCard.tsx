import Avatar from './Avatar'
import { Heart } from 'lucide-react'
import { Badge } from './ui/badge'

interface BlogCardProps {
  authorName: string
  title: string
  content: string
  createdAt: string
  likes?: number
  tag?: string
}

const BlogCard = ({
  authorName,
  title,
  content,
  createdAt,
  likes,
  tag,
}: BlogCardProps) => {
  // Strip HTML tags and replace with spaces to prevent word joining
  const plainText = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return (
    <div className="cursor-pointer border-b border-slate-200 p-4 transition-colors hover:bg-muted/50 md:p-6 dark:border-slate-700">
      {/* Author info and metadata */}
      <div className="mb-2 flex flex-wrap items-center gap-2 md:gap-3">
        <Avatar prop={authorName} showLink={false} />
        <span className="text-sm font-semibold text-foreground md:text-base">
          {authorName}
        </span>
        <span className="text-muted-foreground/50">·</span>
        <span className="text-xs text-muted-foreground md:text-sm">{createdAt}</span>
        {tag && (
          <>
            <span className="text-muted-foreground/50">·</span>
            <Badge variant="secondary" className="text-xs font-normal">
              {tag}
            </Badge>
          </>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-bold text-foreground sm:text-xl md:text-2xl">
        {title}
      </h3>

      {/* Content preview */}
      <p className="line-clamp-3 text-sm font-normal text-muted-foreground md:text-base">
        {plainText.slice(0, 200)}...
      </p>

      {/* Footer with likes */}
      {likes !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-muted-foreground">
          <Heart className="h-4 w-4" />
          <span className="text-sm">{likes}</span>
        </div>
      )}
    </div>
  )
}

export default BlogCard
