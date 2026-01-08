import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import { LogoutButton } from './LogoutButton'
import { Button } from './ui/button'
import { Plus, Menu, X } from 'lucide-react'
import { ModeToggle } from './ModeToggle'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Appbar: React.FC = () => {
  const { userName } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className='border-b bg-background sticky top-0 z-50'>
      <div className='flex justify-between items-center px-4 md:px-6 lg:px-10 py-3 md:py-4'>
        <Link
          to={'/blogs'}
          className='flex items-center gap-2 text-lg md:text-xl font-bold text-primary hover:opacity-80 transition-opacity'
        >
          <img src="/favicon.png" alt="Blogify Logo" className="h-6 w-6 rounded-sm md:h-8 md:w-8" />
          <span>Blogify</span>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden md:flex items-center gap-2 lg:gap-4'>
          <ModeToggle />
          <Link to={'/my-blogs'}>
            <Button variant="ghost" size="sm">
              My Blogs
            </Button>
          </Link>
          <Link to={'/publish'}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Blog
            </Button>
          </Link>
          <Avatar prop={userName} />
          <LogoutButton />
        </div>

        {/* Mobile Menu Button */}
        <button
          className='md:hidden p-2 hover:bg-muted rounded-md transition-colors'
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className='md:hidden border-t bg-background'>
          <div className='flex flex-col gap-2 p-4'>
            <div className='flex items-center justify-between pb-2 border-b'>
              <Avatar prop={userName} />
              <ModeToggle />
            </div>
            <Link to={'/my-blogs'} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                My Blogs
              </Button>
            </Link>
            <Link to={'/publish'} onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                New Blog
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  )
}

export default Appbar
