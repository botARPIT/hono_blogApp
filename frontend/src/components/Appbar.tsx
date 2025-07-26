import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import { LogoutButton } from './LogoutButton'

const Appbar: React.FC = () => {
  return (
    <div className='border-b flex justify-between flex-row px-10 py-2'>
      <Link
        to={'/blogs'}
        className='flex flex-col justify-center text-xl font-bold text-teal-700'
      >
        {' '}
        {'Blogify'}
      </Link>
       

      <div className='flex justify-center mt-2'>
        <Link to={'/publish'}> <button type="button" className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-black font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2">{"New Blog"}</button></Link>
        <Avatar prop='Tester' />
        <LogoutButton />
      </div>
    </div>
  )
}

export default Appbar
