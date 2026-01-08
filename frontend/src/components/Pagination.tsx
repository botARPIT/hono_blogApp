import { Button } from './ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
}

/**
 * Reusable pagination component with responsive design
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5
}: PaginationProps) {
  // Don't render if there's only one page
  if (totalPages <= 1) return null

  const getVisiblePages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = []
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('ellipsis')
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <nav 
      className="flex items-center justify-center gap-1 mt-8" 
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline ml-1">Previous</span>
      </Button>

      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span 
                key={`ellipsis-${index}`} 
                className="px-2 text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            )
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
              className="min-w-[36px]"
            >
              {page}
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        <span className="hidden sm:inline mr-1">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}

// Pagination helper hook
interface UsePaginationOptions {
  totalItems: number
  itemsPerPage: number
}

export function usePagination({ 
  totalItems, 
  itemsPerPage 
}: UsePaginationOptions) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  return {
    totalPages,
    itemsPerPage,
    getPageItems: <T,>(items: T[], page: number): T[] => {
      const start = (page - 1) * itemsPerPage
      const end = start + itemsPerPage
      return items.slice(start, end)
    }
  }
}
