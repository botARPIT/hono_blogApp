
type ButtonLabel = {
    label : string, 
    submit: () => void
}
const Button: React.FC <ButtonLabel> = ({ label, submit }) => {
  return (
    <div className="pt-4  ">
      <button
      onClick={submit}
        type='button'
        className='text-white w-full mt-8 cursor-pointer bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2 me-2 mb-2'
      >
        {label}
      </button>
    </div>
  )
}

export {Button}