import { cn } from '../lib/utils'

// Skeleton component for loading states
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/70",
        className
      )}
      {...props}
    />
  )
}

// Page-level skeleton loader
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Skeleton className="h-8 w-24" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="space-y-6">
          {/* Title skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>

          {/* Card skeletons */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-4/5" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Blog list skeleton
export function BlogListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-xl p-6 space-y-4 bg-card">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-6 w-4/5" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Blog detail skeleton
export function BlogDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 px-4 md:px-6 lg:px-8 py-6">
      <div className="lg:col-span-8 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-3/4" />
        <div className="flex gap-4 items-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex gap-4 items-center pb-4 border-b">
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className={cn("h-4", i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-5/6" : "w-4/5")} />
          ))}
        </div>
      </div>
      <div className="lg:col-span-4">
        <div className="border rounded-lg p-6 space-y-4 sticky top-20">
          <Skeleton className="h-5 w-16 mx-auto" />
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-5 w-32 mx-auto" />
        </div>
      </div>
    </div>
  )
}

// Profile skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="text-center space-y-4">
        <Skeleton className="h-24 w-24 rounded-full mx-auto" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

// Default loading component (backwards compatible)
const Loading: React.FC = () => {
  return (
    <PageSkeleton />
  )
}

export default Loading