import { Auth } from '../components/Auth'
import { Quote } from '../components/Quote'

export default function Signup () {
  return (
    <>
      <div className='grid grid-cols-1 lg:grid-cols-2'>
        <div>
            <Auth type='signup'/>
        </div>
      <div className='hidden lg:block'>
          <Quote
          message={`“I'm selfish, impatient and a little insecure. I make mistakes, I am out of control and at times hard to handle. But if you can't handle me at my worst, then you sure as hell don't deserve me at my best.”`}
          author={'― Marilyn Monroe'}
        />
      </div>
      </div>
    </>
  )
}
