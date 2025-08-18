import { useNavigate } from 'react-router-dom'
import Appbar from '../components/Appbar'
import axios from 'axios'
import { BACKEND_URL } from '../config'
import { useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'

export const Publish = () => {
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const navigate = useNavigate()
  return (
    <div>
      <Appbar />
      <div>
        <TextEditor
          onTitleChange={e => setTitle(e.target.value)}
          onContentChange={e => setContent(e.target.value)}
        />
      </div>
      <div className='flex justify-center'>
        <button
          onClick={async (e) => {
            try {
              // if (!title.trim() || !content.trim()) {
              //   toast.error('Title and content are required')
              //   return
              // }
              e.preventDefault()
              console.log(title)
              console.log(content)
              const response = await axios.post(
                `${BACKEND_URL}/api/v1/blog/addBlog`,
                {
                  title,
                  content,
                  thumbnail: "url.com"
                },
                { withCredentials: true }
              )
              console.log(response)
              toast.success('Blog added')
              navigate(`/blog/${response.data.id}`)
            } catch (error) {
              toast.error('Failed to add the blog')
              navigate(0)
            }
          }}
          type='button'
          className=' text-white bg-black hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-black font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2'
        >
          {'Publish'}
        </button>
      </div>
    </div>
  )
}

function TextEditor ({
  onTitleChange,
  onContentChange
}: {
  onTitleChange: (e: ChangeEvent<HTMLInputElement>) => void
  onContentChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
}) {
  return (
    <div>
      <div className='grid grid-cols-6 gap-2 grid-rows-8'>
        <input
          id='title'
          type='text'
          onChange={onTitleChange}
          className='col-span-4 col-start-2 row-span-1 block mt-4 p-1 w-full text-lg text-gray-900 bg-gray-50 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          placeholder='Enter the title for your blog..'
        ></input>
        <textarea
          id='content'
          rows={8}
          onChange={onContentChange}
          className='resize-none col-span-4 col-start-2 row-span-6 block mt-4 p-1 w-full text-lg text-gray-900 bg-gray-50 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          placeholder='Add blog contents here..'
        ></textarea>
      </div>
    </div>
  )
}
