type AvatarProp = {
    prop : string
}

const Avatar: React.FC <AvatarProp> = ({prop}) => {
    return <div className="cursor-pointer"> 

<div className="relative inline-flex mr-2 items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
    <span className="font-medium text-gray-600 dark:text-gray-300">{prop[0]}</span>
</div>

    </div>
}

export default Avatar