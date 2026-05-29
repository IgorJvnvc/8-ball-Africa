'use client'

import { useCallback, useEffect, useState } from 'react'
import { FadeIn } from '@/components/animations/fade-in'
import { ProductForm, type ProductFormValues } from '../product-form'

type CategoryOption = { id: string; name: string }

const initialValues: ProductFormValues = {
  name: '',
  slug: '',
  description: '',
  brand: '',
  price: '',
  comparePrice: '',
  stock: '0',
  categoryId: '',
  featured: false,
  published: true,
  images: [''],
}

export default function NewProductPage() {
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setLoadError(null)

    try {
      const res = await fetch('/api/categories?page=1&limit=100')
      const data = (await res.json()) as {
        success: boolean
        data?: Array<{ id: string; name: string }>
        error?: string
      }

      if (!res.ok || !data.success || !data.data) {
        setLoadError(data.error || 'Failed to load categories')
        setCategories([])
        return
      }

      setCategories(data.data.map((category) => ({ id: category.id, name: category.name })))
    } catch {
      setLoadError('Failed to load categories')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchCategories()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [fetchCategories])

  if (loading) {
    return (
      <FadeIn>
        <div className="bg-surface rounded-xl border border-white/5 p-6">
          <h1 className="text-text text-3xl font-bold">Create Product</h1>
          <p className="text-text-muted mt-3 text-sm">Loading categories...</p>
        </div>
      </FadeIn>
    )
  }

  if (loadError) {
    return (
      <FadeIn>
        <div className="bg-surface rounded-xl border border-white/5 p-6">
          <h1 className="text-text text-3xl font-bold">Create Product</h1>
          <div className="border-danger/30 bg-danger/10 text-danger mt-4 rounded-lg border px-3 py-2 text-sm">
            {loadError}
          </div>
          <button
            type="button"
            onClick={() => void fetchCategories()}
            className="text-text hover:border-primary-light hover:text-primary-light mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </FadeIn>
    )
  }

  return (
    <FadeIn>
      <ProductForm
        mode="create"
        initialValues={initialValues}
        categories={categories}
        onSubmit={async (payload) => {
          const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

          const data = (await res.json()) as { success: boolean; error?: string }

          if (!res.ok || !data.success) {
            return { success: false, error: data.error || 'Failed to create product' }
          }

          return { success: true }
        }}
      />
    </FadeIn>
  )
}
