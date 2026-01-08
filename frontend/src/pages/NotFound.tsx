import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader className="pb-2">
          {/* Animated 404 Number */}
          <div className="relative mb-6">
            <div className="text-[120px] md:text-[160px] font-extrabold text-primary/10 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Search className="h-10 w-10 md:h-12 md:w-12 text-primary" />
              </div>
            </div>
          </div>
          
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Oops! The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Helpful suggestions */}
          <div className="bg-muted/50 rounded-lg p-4 text-left">
            <p className="text-sm font-medium text-foreground mb-2">Here's what you can do:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check the URL for typos</li>
              <li>• Go back to the previous page</li>
              <li>• Return to the homepage</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Link to="/blogs">
              <Button className="gap-2 w-full sm:w-auto">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Footer text */}
          <p className="text-xs text-muted-foreground pt-4">
            If you believe this is an error, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
