'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/ui/product-card'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductGridProps {
  products: Array<{
    id: string
    name: string
    slug: string
    brand: string
    price: number
    comparePrice: number | null
    stock: number
    images: { url: string; alt: string | null }[]
    category: { name: string; slug: string }
  }>
  currentPage: number
  totalPages: number
}

export function ProductGrid({ products, currentPage, totalPages }: ProductGridProps) {
  const searchParams = useSearchParams()

  const pagesToShow = (() => {
    const pages = new Set<number>()
    pages.add(1)
    pages.add(totalPages)

    for (let offset = -1; offset <= 1; offset++) {
      const page = currentPage + offset
      if (page > 1 && page < totalPages) {
        pages.add(page)
      }
    }

    return [...pages].sort((a, b) => a - b)
  })()

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `/products?${params.toString()}`
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <svg
          className="text-text-dark mb-4 h-16 w-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <p className="text-text-muted text-lg font-medium">No products found</p>
        <p className="text-text-dark mt-1 text-sm">Try adjusting your filters</p>
      </motion.div>
    )
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        <StaggerChildren className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12">
          <p className="text-text-dark mb-3 text-center text-xs">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={getPageUrl(currentPage - 1)}
                className="text-text-muted hover:border-primary hover:text-text rounded-lg border border-white/10 px-4 py-2 text-sm transition-colors"
              >
                Previous
              </Link>
            )}
            {pagesToShow.map((page, index) => {
              const previousPage = pagesToShow[index - 1]
              const showGap = previousPage && page - previousPage > 1

              return (
                <div key={page} className="contents">
                  {showGap && <span className="text-text-dark px-1 text-sm">...</span>}
                  <Link
                    href={getPageUrl(page)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-primary text-white'
                        : 'text-text-muted hover:bg-surface hover:text-text'
                    }`}
                  >
                    {page}
                  </Link>
                </div>
              )
            })}
            {currentPage < totalPages && (
              <Link
                href={getPageUrl(currentPage + 1)}
                className="text-text-muted hover:border-primary hover:text-text rounded-lg border border-white/10 px-4 py-2 text-sm transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
