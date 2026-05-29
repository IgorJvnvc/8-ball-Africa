'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { FadeIn } from '@/components/animations/fade-in'
import { ProductForm, type ProductFormValues } from '../../product-form'

type CategoryOption = { id: string; name: string }

type ProductResponse = {
  id: string
  name: string
  slug: string
  description: string | null
  brand: string
  price: number
  comparePrice: number | null
  stock: number
  categoryId: string
  featured: boolean
  published: boolean
  images: Array<{ url: string }>
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const productId = params?.id

  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [initialValues, setInitialValues] = useState<ProductFormValues | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchPageData = useCallback(async () => {
    if (!productId) {
      setLoadError('Invalid product id')
      setLoading(false)
      return
    }

    setLoading(true)
    setLoadError(null)

    try {
      const [productRes, categoriesRes] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch('/api/categories?page=1&limit=100'),
      ])

      const productData = (await productRes.json()) as {
        success: boolean
        data?: ProductResponse
        error?: string
      }

      const categoriesData = (await categoriesRes.json()) as {
        success: boolean
        data?: Array<{ id: string; name: string }>
        error?: string
      }

      if (!productRes.ok || !productData.success || !productData.data) {
        setLoadError(productData.error || 'Failed to load product')
        setInitialValues(null)
        return
      }

      if (!categoriesRes.ok || !categoriesData.success || !categoriesData.data) {
        setLoadError(categoriesData.error || 'Failed to load categories')
        setInitialValues(null)
        return
      }

      setCategories(
        categoriesData.data.map((category) => ({ id: category.id, name: category.name })),
      )

      const product = productData.data
      setInitialValues({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        brand: product.brand,
        price: String(product.price),
        comparePrice: product.comparePrice != null ? String(product.comparePrice) : '',
        stock: String(product.stock),
        categoryId: product.categoryId,
        featured: product.featured,
        published: product.published,
        images: product.images.length > 0 ? product.images.map((image) => image.url) : [''],
      })
    } catch {
      setLoadError('Failed to load product details')
      setInitialValues(null)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchPageData()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [fetchPageData])

  if (loading) {
    return (
      <FadeIn>
        <div className="bg-surface rounded-xl border border-white/5 p-6">
          <h1 className="text-text text-3xl font-bold">Edit Product</h1>
          <p className="text-text-muted mt-3 text-sm">Loading product details...</p>
        </div>
      </FadeIn>
    )
  }

  if (loadError || !initialValues || !productId) {
    return (
      <FadeIn>
        <div className="bg-surface rounded-xl border border-white/5 p-6">
          <h1 className="text-text text-3xl font-bold">Edit Product</h1>
          <div className="border-danger/30 bg-danger/10 text-danger mt-4 rounded-lg border px-3 py-2 text-sm">
            {loadError || 'Failed to load product'}
          </div>
          <button
            type="button"
            onClick={() => void fetchPageData()}
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
        mode="edit"
        initialValues={initialValues}
        categories={categories}
        onSubmit={async (payload) => {
          const res = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

          const data = (await res.json()) as { success: boolean; error?: string }

          if (!res.ok || !data.success) {
            return { success: false, error: data.error || 'Failed to update product' }
          }

          return { success: true }
        }}
      />
    </FadeIn>
  )
}
