import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import { ThemeProvider } from './components/theme-provider'
import { AuthProvider } from './context/AuthContext'
import Loading from './components/Loading'

// Lazy load pages for code splitting
const Signup = lazy(() => import('./pages/Signup'))
const Signin = lazy(() => import('./pages/Signin'))
const Blog = lazy(() => import('./pages/Blog'))
const Blogs = lazy(() => import('./pages/Blogs'))
const Publish = lazy(() => import('./pages/Publish'))
const EditBlog = lazy(() => import('./pages/EditBlog'))
const MyBlogs = lazy(() => import('./pages/MyBlogs'))
const UserInfo = lazy(() => import('./pages/UserInfo'))

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="medium-theme">
          <Toaster position='top-center' />
          <BrowserRouter>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path='/' element={<Navigate to="/blogs" />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/signin' element={<Signin />} />
                <Route path='/blog/:id' element={<Blog />} />
                <Route path='/blogs' element={<Blogs />} />
                <Route path='/publish' element={<Publish />} />
                <Route path='/edit/:id' element={<EditBlog />} />
                <Route path='/my-blogs' element={<MyBlogs />} />
                <Route path='/user-info' element={<UserInfo />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
