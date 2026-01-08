import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import { ThemeProvider } from './components/theme-provider'
import { AuthProvider } from './context/AuthContext'
import Loading from './components/Loading'
import { ProtectedRoute } from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load pages for code splitting
const Signup = lazy(() => import('./pages/Signup'))
const Signin = lazy(() => import('./pages/Signin'))
const Blog = lazy(() => import('./pages/Blog'))
const Blogs = lazy(() => import('./pages/Blogs'))
const Publish = lazy(() => import('./pages/Publish'))
const EditBlog = lazy(() => import('./pages/EditBlog'))
const MyBlogs = lazy(() => import('./pages/MyBlogs'))
const UserInfo = lazy(() => import('./pages/UserInfo'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Create a client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes default stale time
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection time
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="medium-theme">
            <Toaster position='top-center' richColors closeButton />
            <BrowserRouter>
              <Suspense fallback={<Loading />}>
                <Routes>
                  {/* Public routes */}
                  <Route path='/' element={<Navigate to="/signin" />} />
                  <Route path='/signup' element={<Signup />} />
                  <Route path='/signin' element={<Signin />} />
                  <Route path='/blog/:id' element={<Blog />} />
                  <Route path='/blogs' element={<Blogs />} />
                  
                  {/* Protected routes - require authentication */}
                  <Route path='/publish' element={
                    <ProtectedRoute>
                      <Publish />
                    </ProtectedRoute>
                  } />
                  <Route path='/edit/:id' element={
                    <ProtectedRoute>
                      <EditBlog />
                    </ProtectedRoute>
                  } />
                  <Route path='/my-blogs' element={
                    <ProtectedRoute>
                      <MyBlogs />
                    </ProtectedRoute>
                  } />
                  <Route path='/user-info' element={
                    <ProtectedRoute>
                      <UserInfo />
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 Not Found */}
                  <Route path='*' element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App


