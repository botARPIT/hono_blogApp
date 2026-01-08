import { Link } from 'react-router-dom'

type AvatarProp = {
  prop: string
  showLink?: boolean // When false, don't wrap in Link (prevents nested <a> tags)
}

const Avatar: React.FC<AvatarProp> = ({ prop, showLink = true }) => {
  // Get the first letter, fallback to 'A' if prop is empty or undefined
  const initial = prop && prop.length > 0 ? prop[0].toUpperCase() : 'A'
  
  const avatarContent = (
    <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-primary/10 rounded-full hover:bg-primary/20 transition-colors">
      <span className="font-medium text-primary">{initial}</span>
    </div>
  )

  if (!showLink) {
    return avatarContent
  }

  return (
    <Link to="/user-info" className="cursor-pointer">
      {avatarContent}
    </Link>
  )
}

export default Avatar
