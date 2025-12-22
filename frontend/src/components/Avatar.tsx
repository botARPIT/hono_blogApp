import { Link } from 'react-router-dom'

type AvatarProp = {
  prop: string
}

const Avatar: React.FC<AvatarProp> = ({ prop }) => {
  // Get the first letter, fallback to 'A' if prop is empty or undefined
  const initial = prop && prop.length > 0 ? prop[0].toUpperCase() : 'A'
  
  return (
    <Link to="/user-info" className="cursor-pointer">
      <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-primary/10 rounded-full hover:bg-primary/20 transition-colors">
        <span className="font-medium text-primary">{initial}</span>
      </div>
    </Link>
  )
}

export default Avatar
