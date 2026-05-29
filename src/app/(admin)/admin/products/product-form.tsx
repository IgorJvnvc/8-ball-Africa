'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

export type ProductFormValues = {
  name: string
  slug: string
  description: string
  brand: string
  price: string
  comparePrice: string
  stock: string
  categoryId: string
  featured: boolean
  published: boolean
  images: string[]
}

type ProductFormProps = {
  mode: 'create' | 'edit'
  initialValues: ProductFormValues
  categories: Array<{ id: string; name: string }>
  onSubmit: (payload: {
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
    images: string[]
  }) => Promise<{ success: boolean; error?: string }>
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function ProductForm({ mode, initialValues, categories, onSubmit }: ProductFormProps) {
  const router = useRouter()
  const [formValues, setFormValues] = useState<ProductFormValues>(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues.slug.trim()))

  const title = mode === 'create' ? 'Create Product' : 'Edit Product'
  const subtitle =
    mode === 'create'
      ? 'Add a new product to your storefront catalog.'
      : 'Update product details and image URLs.'
  const submitLabel = mode === 'create' ? 'Create Product' : 'Save Changes'

  const imageUrls = useMemo(
    () => formValues.images.map((url) => url.trim()).filter((url) => url.length > 0),
    [formValues.images],
  )

  const updateField = <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const updateImage = (index: number, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      images: prev.images.map((url, i) => (i === index ? value : url)),
    }))
  }

  const addImage = () => {
    setFormValues((prev) => ({ ...prev, images: [...prev.images, ''] }))
  }

  const removeImage = (index: number) => {
    setFormValues((prev) => {
      const nextImages = prev.images.filter((_, i) => i !== index)
      return { ...prev, images: nextImages.length > 0 ? nextImages : [''] }
    })
  }

  const resetToInitial = () => {
    setFormValues(initialValues)
    setError(null)
    setSlugTouched(Boolean(initialValues.slug.trim()))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const name = formValues.name.trim()
    const slug = (formValues.slug.trim() || slugify(name)).trim()
    const brand = formValues.brand.trim()
    const description = formValues.description.trim() || null
    const price = Number.parseFloat(formValues.price)
    const comparePriceRaw = formValues.comparePrice.trim()
    const comparePrice = comparePriceRaw.length === 0 ? null : Number.parseFloat(comparePriceRaw)
    const stock = Number.parseInt(formValues.stock, 10)
    const categoryId = formValues.categoryId

    if (!name) {
      setError('Product name is required')
      return
    }

    if (!slug) {
      setError('Product slug is required')
      return
    }

    if (!brand) {
      setError('Brand is required')
      return
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError('Price must be a number greater than 0')
      return
    }

    if (comparePrice !== null && (!Number.isFinite(comparePrice) || comparePrice <= 0)) {
      setError('Compare price must be a number greater than 0')
      return
    }

    if (!Number.isFinite(stock) || stock < 0) {
      setError('Stock must be a number 0 or greater')
      return
    }

    if (!categoryId) {
      setError('Category is required')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await onSubmit({
        name,
        slug,
        description,
        brand,
        price,
        comparePrice,
        stock,
        categoryId,
        featured: formValues.featured,
        published: formValues.published,
        images: imageUrls,
      })

      if (!result.success) {
        setError(result.error || 'Failed to save product')
        return
      }

      router.push('/admin/products')
      router.refresh()
    } catch {
      setError('Failed to save product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-white/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-text text-3xl font-bold">{title}</h1>
          <p className="text-text-muted mt-2 text-sm">{subtitle}</p>
        </div>
      </div>

      {error && (
        <div className="border-danger/30 bg-danger/10 text-danger mt-5 rounded-lg border px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <section>
          <h2 className="text-text text-sm font-semibold tracking-wide uppercase">Basic Info</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="product-name"
                className="text-text-muted text-xs font-semibold tracking-wide uppercase"
              >
                Product Name
              </label>
              <input
                id="product-name"
                type="text"
                required
                value={formValues.name}
                onChange={(event) => {
                  const nextName = event.target.value
                  setFormValues((prev) => {
                    const next: ProductFormValues = { ...prev, name: nextName }
                    if (!slugTouched) {
                      next.slug = slugify(nextName)
                    }
                    return next
                  })
                }}
                className="bg-background text-text focus:border-primary mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="product-slug"
                className="text-text-muted text-xs font-semibold tracking-wide uppercase"
              >
                Slug
              </label>
              <input
                id="product-slug"
                type="text"
                required
                value={formValues.slug}
                onChange={(event) => {
                  setSlugTouched(true)
                  updateField('slug', slugify(event.target.value))
                }}
                className="bg-background text-text focus:border-primary mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="product-brand"
                className="text-text-muted text-xs font-semibold tracking-wide uppercase"
              >
                Brand
              </label>
              <input
                id="product-brand"
                type="text"
                required
                value={formValues.brand}
                onChange={(event) => updateField('brand', event.target.value)}
                className="bg-background text-text focus:border-primary mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="product-category"
                className="text-text-muted text-xs font-semibold tracking-wide uppercase"
              >
                Category
              </label>
              <select
                id="product-category"
                required
                value={formValues.categoryId}
                onChange={(event) => updateField('categoryId', event.target.value)}
                className="bg-background text-text focus:border-primary mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="product-description"
                className="text-text-muted text-xs font-semibold tracking-wide uppercase"
              >
                Description
              </label>
              <textarea
                id="product-description"
                value={formValues.description}
                onChange={(event) => updateField('description', event.target.value)}
                rows={4}
                className="bg-background text-text focus:border-primary mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
                placeholder="Optional product description"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-text text-sm font-semibold tracking-wide uppercase">
            Pricing & Stock
          </h2>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="product-price"
                className="text-text-muted text-xs font-semibold tracking-wide uppercase"
              >
                Price (USD)
              </label>
              <input
                id="product-price"
                type="number"
                required
                min="0"
                step="0.01"
                value={formValues.price}
                onChange={(event) => updateField('price', event.target.value)}
                className="bg-background text-text focus:border-primary mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="product-compare-price"
                className="text-text-muted text-xs font-semibold tracking-wide uppercase"
              >
                Compare Price (optional)
              </label>
              <input
                id="product-compare-price"
                type="number"
                min="0"
                step="0.01"
                value={formValues.comparePrice}
                onChange={(event) => updateField('comparePrice', event.target.value)}
                className="bg-background text-text focus:border-primary mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="product-stock"
                className="text-text-muted text-xs font-semibold tracking-wide uppercase"
              >
                Stock
              </label>
              <input
                id="product-stock"
                type="number"
                required
                min="0"
                step="1"
                value={formValues.stock}
                onChange={(event) => updateField('stock', event.target.value)}
                className="bg-background text-text focus:border-primary mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-text text-sm font-semibold tracking-wide uppercase">Images</h2>
          <p className="text-text-muted mt-1 text-sm">Provide one or more image URLs.</p>

          <div className="mt-3 space-y-3">
            {formValues.images.map((image, index) => (
              <div key={`image-${index}`} className="flex items-center gap-2">
                <input
                  type="url"
                  value={image}
                  onChange={(event) => updateImage(index, event.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-background text-text focus:border-primary w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-danger hover:border-danger/60 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addImage}
              className="text-text hover:border-primary-light hover:text-primary-light rounded-lg border border-white/10 px-3 py-2 text-sm font-medium transition-colors"
            >
              + Add Image URL
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-text text-sm font-semibold tracking-wide uppercase">Visibility</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="bg-background/70 flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={formValues.featured}
                onChange={(event) => updateField('featured', event.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-text">Featured Product</span>
            </label>

            <label className="bg-background/70 flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={formValues.published}
                onChange={(event) => updateField('published', event.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-text">Published</span>
            </label>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary-light rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>

          <button
            type="button"
            onClick={resetToInitial}
            disabled={isSubmitting}
            className="text-text hover:border-primary-light hover:text-primary-light rounded-lg border border-white/10 px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            disabled={isSubmitting}
            className="text-text-muted hover:text-text rounded-lg border border-transparent px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
