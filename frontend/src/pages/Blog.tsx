import { useParams } from "react-router-dom";
import { FullBlog } from "../components/FullBlog";
import Loading from "../components/Loading";
import { useBlog,} from "../hooks"
import Appbar from "../components/Appbar";
import { toast } from "sonner";


export default function Blog() {
  const {id} = useParams()
  const {loading, blog} = useBlog({id: id || "1"});
  if(loading){
     return <div className="">
            <Loading />
        </div>
  } 
  if(!blog){
    toast.error("Unable to find the blog")
    return <div>
      Unable to get blog
    </div>
  }
  return (
    <div>
      <Appbar />
    
    <div className="pt-10">
     
      <FullBlog blog={blog}/>
    </div>
    </div>
  )
}
