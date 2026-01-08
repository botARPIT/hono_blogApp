import { useState } from 'react'
import type { BlogDTO } from '../hooks'
import DOMPurify from 'dompurify'
import { LikeButton } from './LikeButton'
import { Badge } from './ui/badge'
import { useTheme } from './theme-provider'
import { FontSelector, getStoredFontFamily } from './FontSelector'

export const FullBlog = ({ blog }: { blog: BlogDTO }) => {
  const { resolvedTheme } = useTheme()
  const isReaderMode = resolvedTheme === 'reader'

  // Font state for reader mode
  const [fontFamily, setFontFamily] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return getStoredFontFamily()
    }
    return "'Cormorant Garamond', serif"
  })

  // Sanitize HTML content to prevent XSS
  const sanitizedContent = DOMPurify.sanitize(blog.content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'span', 'mark'
    ],
    ALLOWED_ATTR: ['style', 'class'],
  })

  // Dynamic styles for reader mode font
  const readerFontStyle = isReaderMode
    ? { fontFamily }
    : {}

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12 lg:py-16">
      {/* Font selector - only visible in reader mode */}
      {isReaderMode && (
        <div className="mb-6 flex items-center justify-end border-b border-border/30 pb-4">
          <FontSelector onFontChange={setFontFamily} />
        </div>
      )}

      {/* Header - minimal, clean */}
      <header className="mb-8 md:mb-12" style={readerFontStyle}>
        <h1
          className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
          style={readerFontStyle}
        >
          {blog.title}
        </h1>

        {/* Subtle metadata */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <time dateTime={blog.createdAt}>
            {new Date(blog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          {blog.tag && (
            <>
              <span className="text-muted-foreground/50">·</span>
              <Badge variant="secondary" className="text-xs font-normal">
                {blog.tag}
              </Badge>
            </>
          )}
        </div>

        {/* Like section - below header, before content */}
        <div className="mt-6 flex items-center gap-2 border-b border-border/50 pb-6">
          <LikeButton blogId={blog.id} initialLikes={blog.like} />
          <span className="text-sm text-muted-foreground">
            {blog.like === 1 ? '1 like' : `${blog.like} likes`}
          </span>
        </div>
      </header>

      {/* Main content - the focus */}
      <div
        className="prose prose-lg prose-neutral dark:prose-invert max-w-none
          prose-headings:font-semibold prose-headings:tracking-tight
          prose-p:leading-relaxed prose-p:text-foreground/90
          prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
          prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5
          prose-pre:bg-muted prose-pre:text-foreground
          prose-li:text-foreground/90
          md:prose-xl"
        style={readerFontStyle}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      {/* Footer - subtle author attribution, just the name */}
      <footer className="mt-12 border-t border-border/50 pt-8 md:mt-16 md:pt-10">
        <div className="flex justify-end">
          <div className="text-right" style={readerFontStyle}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground/60">
              Written by
            </p>
            <p className="text-sm font-medium text-foreground/80">
              {blog.author.name}
            </p>
          </div>
        </div>
      </footer>
    </article>
  )
}
