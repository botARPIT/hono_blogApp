import React from 'react'
interface ErrorAlertProps {
    type: "signin" | "signup" | "blog"
    message: string
}

const Error:React.FC<ErrorAlertProps> = ({type, message}) => {
  return (
    <div>
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
  <span className="font-medium">Unable to {type == "signin" ? "signin": "signup"}!</span> <div>
    {message}
  </div>
</div>
    </div>
  )
}

export default Error