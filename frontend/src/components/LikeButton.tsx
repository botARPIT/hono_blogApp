import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from './ui/button'
import { useLikeBlog, useLikeStatus } from '../hooks/queries'
import { cn } from '../lib/utils'

interface LikeButtonProps {
  blogId: string
  initialLikes: number
  className?: string
}

export function LikeButton({ blogId, initialLikes, className }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const { mutate: likeBlog, isPending } = useLikeBlog()
  const { data: likeStatus } = useLikeStatus(blogId)
  const [isLiked, setIsLiked] = useState(false)

  // Sync with server like status
  useEffect(() => {
    if (likeStatus) {
      setIsLiked(likeStatus.hasLiked)
    }
  }, [likeStatus])

  // Keep likes in sync with initialLikes prop
  useEffect(() => {
    setLikes(initialLikes)
  }, [initialLikes])

  const handleLike = () => {
    if (isPending) return

    // Optimistic update
    const wasLiked = isLiked
    setLikes((prev) => (wasLiked ? prev - 1 : prev + 1))
    setIsLiked(!wasLiked)

    likeBlog(blogId, {
      onSuccess: (data) => {
        setLikes(data.like)
        setIsLiked(data.hasLiked)
      },
      onError: () => {
        // Rollback on error
        setLikes((prev) => (wasLiked ? prev + 1 : prev - 1))
        setIsLiked(wasLiked)
      },
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isPending}
      className={cn(
        'gap-2 transition-all',
        isLiked && 'text-red-500 hover:text-red-600',
        className
      )}
    >
      <Heart
        className={cn('h-5 w-5 transition-all', isLiked && 'fill-current scale-110')}
      />
      <span className="font-medium">{likes}</span>
    </Button>
  )
}
