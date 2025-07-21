import type { BlogDTO } from '../hooks'

export const FullBlog = ({ blog }: { blog: BlogDTO }) => {
  return (
    <div className='grid grid-cols-12 px-8 '>
      <div className='col-span-8'>
        <div className='text-5xl font-extrabold'>{blog.title}</div>
        <div className='text-md font-semibold text-slate-400 pt-2'>
          {`Posted on - `}
          {new Date(blog.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
        <div className='text-lg font-medium pt-4'>{blog.content}</div>
      </div>
      <div className='col-span-4 '>
        <div className='flex justify-center flex-col pt-4'>
          <div className='flex justify-center text-xl font-extrabold  text-slate-400'>{"Author"}</div>
          <div className='text-lg font-medium  flex justify-center'>
            - {blog.author.name}
          </div>
        </div>
      </div>
    </div>
  )
}
