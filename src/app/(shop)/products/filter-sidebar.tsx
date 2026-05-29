'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface FilterSidebarProps {
  categories: { id: string; name: string; slug: string }[]
  brands: string[]
  currentFilters: {
    category?: string
    brand?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    order?: string
    q?: string
    limit?: string
  }
}

export function FilterSidebar({ categories, brands, currentFilters }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const debounceTimeoutRef = useRef<number | null>(null)
  const [searchTerm, setSearchTerm] = useState(currentFilters.q || '')
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.minPrice ? parseInt(currentFilters.minPrice) : 0,
    max: currentFilters.maxPrice ? parseInt(currentFilters.maxPrice) : 10000,
  })

  const updateFilters = useCallback(
    (
      updates: Record<string, string | null>,
      options: {
        resetPage?: boolean
      } = { resetPage: true },
    ) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })

      if (options.resetPage ?? true) {
        params.delete('page')
      }

      router.push(`/products?${params.toString()}`)
    },
    [router, searchParams],
  )

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      updateFilters({ [key]: value })
    },
    [updateFilters],
  )

  const selectedBrands = currentFilters.brand?.split(',') || []

  const toggleBrand = (brand: string) => {
    const updated = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand]
    updateFilter('brand', updated.length > 0 ? updated.join(',') : null)
  }

  const applyPriceRange = () => {
    updateFilters({
      minPrice: priceRange.min > 0 ? priceRange.min.toString() : null,
      maxPrice: priceRange.max < 10000 ? priceRange.max.toString() : null,
    })
  }

  const sortValue = `${
    currentFilters.sort || 'createdAt'
  }-${
    currentFilters.order || ((currentFilters.sort || 'createdAt') === 'name' ? 'asc' : 'desc')
  }`

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split('-')
    updateFilters({ sort, order })
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)

    if (debounceTimeoutRef.current) {
      window.clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      const trimmed = value.trim()
      updateFilters({ q: trimmed || null })
    }, 300)
  }

  return (
    <aside className="hidden w-64 flex-shrink-0 lg:block">
      <div className="sticky top-24 space-y-8">
        {/* Search */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text">Search</h3>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Brand, product, keyword"
            className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dark focus:border-primary focus:outline-none"
          />
        </div>

        {/* Page Size */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text">Items Per Page</h3>
          <select
            value={currentFilters.limit || '12'}
            onChange={(e) => updateFilter('limit', e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="36">36</option>
            <option value="48">48</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text">Sort By</h3>
          <select
            value={sortValue}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
          >
            <option value="createdAt-desc">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
          </select>
        </div>

        {/* Categories */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text">
            Category
          </h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => updateFilter('category', null)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  !currentFilters.category
                    ? 'bg-primary/10 text-primary-light'
                    : 'text-text-muted hover:bg-surface hover:text-text'
                }`}
              >
                All Categories
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => updateFilter('category', cat.slug)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    currentFilters.category === cat.slug
                      ? 'bg-primary/10 text-primary-light'
                      : 'text-text-muted hover:bg-surface hover:text-text'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text">
            Price Range
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={priceRange.min}
                onChange={(e) => setPriceRange((prev) => ({ ...prev, min: +e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                placeholder="Min"
              />
              <span className="text-text-dark">-</span>
              <input
                type="number"
                min={0}
                value={priceRange.max}
                onChange={(e) => setPriceRange((prev) => ({ ...prev, max: +e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                placeholder="Max"
              />
            </div>
            {/* Range slider */}
            <input
              type="range"
              min={0}
              max={10000}
              step={50}
              value={priceRange.max}
              onChange={(e) => setPriceRange((prev) => ({ ...prev, max: +e.target.value }))}
              className="w-full accent-primary"
            />
            <p className="text-xs text-text-muted">
              ${priceRange.min} — ${priceRange.max}
            </p>
            <button
              onClick={applyPriceRange}
              className="w-full rounded-lg bg-surface-light px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-primary/20 hover:text-primary-light"
            >
              Apply Price Filter
            </button>
          </div>
        </div>

        {/* Brands */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text">Brand</h3>
          <ul className="space-y-1 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <li key={brand}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-surface hover:text-text">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="h-4 w-4 rounded border-white/20 bg-surface accent-primary"
                  />
                  {brand}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Clear filters */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/products')}
          className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-text-muted transition-colors hover:border-danger/50 hover:text-danger"
        >
          Clear All Filters
        </motion.button>
      </div>
    </aside>
  )
}
