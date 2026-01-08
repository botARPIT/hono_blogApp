import { useParams } from "react-router-dom"
import { FullBlog } from "../components/FullBlog"
import { BlogDetailSkeleton } from "../components/Loading"
import { useBlog } from "../hooks/queries"
import Appbar from "../components/Appbar"
import { toast } from "sonner"

export default function Blog() {
  const { id } = useParams()
  const { data: blog, isLoading, isError } = useBlog(id || "")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Appbar />
        <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
          <BlogDetailSkeleton />
        </div>
      </div>
    )
  }

  if (isError || !blog) {
    toast.error("Unable to find the blog")
    return (
      <div className="min-h-screen bg-background">
        <Appbar />
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">Unable to load this blog</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Appbar />
      <FullBlog blog={blog} />
    </div>
  )
}
