import Avatar from "./Avatar"

const Appbar:React.FC = () => {
    return <div className="border-b flex justify-between flex-row px-10 py-2">
     
         <div className="flex flex-col justify-center">
            Blogify
        </div>
        <div className="flex flex-col justify-center">
            <Avatar prop="Tester" />
        </div>
    

    </div>
}

export default Appbar