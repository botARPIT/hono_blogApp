import {BrowserRouter, Route, Routes} from "react-router-dom"
import {Toaster} from "sonner"
import './App.css'
import Signup from "./pages/Signup"
import Signin from "./pages/Signin"
import Blog from "./pages/Blog"
import Blogs from "./pages/Blogs"
import { Publish } from "./pages/Publish"

function App() {

  return (
    <>  
    <Toaster position="top-center" />
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/blog/:id" element={<Blog />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/publish" element={<Publish />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
