import { useParams } from "react-router-dom"
import { FullBlog } from "../components/FullBlog"
import Loading from "../components/Loading"
import { useBlog } from "../hooks/queries"
import Appbar from "../components/Appbar"
import { toast } from "sonner"

export default function Blog() {
  const { id } = useParams()
  const { data: blog, isLoading, isError } = useBlog(id || "")

  if (isLoading) {
    return (
      <div className="">
        <Appbar />
        <Loading />
      </div>
    )
  }

  if (isError || !blog) {
    toast.error("Unable to find the blog")
    return (
      <div>
        <Appbar />
        <div className="container mx-auto py-8 text-center">
          <p>Unable to get blog</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Appbar />
      <div className="container mx-auto py-8 max-w-4xl px-4">
        <div className="pt-4">
          <FullBlog blog={blog} />
        </div>
      </div>
    </div>
  )
}
