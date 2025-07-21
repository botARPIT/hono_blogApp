import userProfile from '../assets/user_profile.png'

type BlogCardProps = {
  authorName: string
  title: string
  content: string
  createdAt: string
}
export default function BlogCard ({
  authorName,
  title,
  content,
  createdAt
}: BlogCardProps) {
  return (
    <div className="border-b-2 border-slate-200 pb-2 mt-2 cursor-pointer">
      <div className='flex'>
        <div className='flex justify-center flex-col'>
          <img
            className='w-8 h-8 rounded-full'
            src={userProfile}
            alt='Rounded avatar'
          ></img>
        </div>
        
          <div className='font-extralight flex justify-center flex-col pl-2 text-sm '>
            {authorName} 
          </div>
          <div className='ml-1 mt-3 w-2 h-2 bg-slate-500 border-2 border-white rounded-full'></div>
          
          <div className='font-thin flex justify-center flex-col pl-2 text-slate-600 text-sm '>{createdAt}</div>
    
      </div>
      <div className='text-xl font-bold'>{title}</div>
      <div className='text-md font-light'>{content.slice(0, 150) + ((content.length > 100 )? '...' : '')}</div>
      <div className='text-slate-600 text-sm font-thin pt-2'>{`${Math.ceil(content.length / 200)} min read`}</div>
      {/* <div>
        <img className="h-auto max-w-lg ms-auto" src="/docs/images/examples/image-1@2x.jpg" alt="image description" />
</div> */}
    </div>
  )
}
