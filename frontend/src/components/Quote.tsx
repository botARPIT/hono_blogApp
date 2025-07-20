type QuoteProps = {
    message: string,
    author: string
}

const Quote:React.FC<QuoteProps> = ({message, author}) =>{
  return (
    <div className="bg-[#98A1BC] h-screen font-bold flex justify-center flex-col">
        <div className="flex justify-center">
            <div className="max-w-md text-center text-2xl italic">
            {message}
            <div>{author}</div>
        </div>
        </div>
    </div>
  )
}

export {Quote}