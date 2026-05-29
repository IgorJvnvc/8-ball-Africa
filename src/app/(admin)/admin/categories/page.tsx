'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/animations/fade-in'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  sortOrder: number
  parentId: string | null
  parent: { id: string; name: string } | null
  _count: { products: number }
}

type CategoryFormState = {
  name: string
  slug: string
  description: string
  image: string
  sortOrder: string
  parentId: string
}

const emptyFormState: CategoryFormState = {
  name: '',
  slug: '',
  description: '',
  image: '',
  sortOrder: '0',
  parentId: '',
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const MAX_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MIN_IMAGE_WIDTH = 400
const MIN_IMAGE_HEIGHT = 400

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new window.Image()

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
      URL.revokeObjectURL(objectUrl)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to read image dimensions'))
    }

    image.src = objectUrl
  })
}

function isDisplayableImageSrc(value: string) {
  const trimmed = value.trim()
  return trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed)
}

export default function AdminCategoriesPage() {
  const categoryFileInputRef = useRef<HTMLInputElement | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCategories, setTotalCategories] = useState(0)
  const [formState, setFormState] = useState<CategoryFormState>(emptyFormState)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url')
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const isEditing = editingCategoryId !== null

  const availableParents = useMemo(() => {
    if (!editingCategoryId) {
      return categories
    }
    return categories.filter((category) => category.id !== editingCategoryId)
  }, [editingCategoryId, categories])

  const fetchCategories = useCallback(
    async (page = currentPage, query = search, limit = pageSize) => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', String(limit))
        if (query.trim()) {
          params.set('q', query.trim())
        }

        const res = await fetch(`/api/categories?${params.toString()}`)
        const data = await res.json()

        if (!res.ok || !data.success) {
          setError(data.error || 'Failed to load categories')
          setCategories([])
          setTotalPages(1)
          setTotalCategories(0)
        } else {
          setCategories(data.data)
          const pagination = data.pagination as
            | { page: number; limit: number; total: number; totalPages: number }
            | undefined

          setCurrentPage(pagination?.page ?? page)
          setPageSize(pagination?.limit ?? limit)
          setTotalPages(Math.max(1, pagination?.totalPages ?? 1))
          setTotalCategories(pagination?.total ?? data.data.length)
        }
      } catch {
        setError('Failed to load categories')
        setCategories([])
        setTotalPages(1)
        setTotalCategories(0)
      } finally {
        setLoading(false)
      }
    },
    [currentPage, pageSize, search],
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchCategories(currentPage, search, pageSize)
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [currentPage, pageSize, search, fetchCategories])

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) {
        URL.revokeObjectURL(uploadPreviewUrl)
      }
    }
  }, [uploadPreviewUrl])

  const clearSelectedImage = () => {
    setSelectedImageFile(null)
    setUploadPreviewUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl)
      }
      return null
    })

    if (categoryFileInputRef.current) {
      categoryFileInputRef.current.value = ''
    }
  }

  const resetUploadState = () => {
    clearSelectedImage()
    setUploadError(null)
  }

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setUploadError(null)

    if (!file) {
      clearSelectedImage()
      return
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      clearSelectedImage()
      setUploadError('Unsupported file type. Use JPG, PNG, WEBP, or GIF.')
      return
    }

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      clearSelectedImage()
      setUploadError('File is too large (max 4MB).')
      return
    }

    try {
      const { width, height } = await getImageDimensions(file)

      if (width < MIN_IMAGE_WIDTH || height < MIN_IMAGE_HEIGHT) {
        clearSelectedImage()
        setUploadError(
          `Image must be at least ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT} pixels. Selected image is ${width}x${height}.`,
        )
        return
      }
    } catch {
      clearSelectedImage()
      setUploadError('Could not read image dimensions. Please try another image.')
      return
    }

    setSelectedImageFile(file)
    setUploadPreviewUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl)
      }
      return URL.createObjectURL(file)
    })
  }

  const uploadSelectedImage = async () => {
    if (!selectedImageFile) {
      setUploadError('Select an image before uploading.')
      return
    }

    setUploadError(null)
    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedImageFile)

      const res = await fetch('/api/upload?folder=categories', {
        method: 'POST',
        body: formData,
      })

      const data = (await res.json()) as {
        success: boolean
        error?: string
        data?: { url?: string }
      }

      const uploadedUrl = data.data?.url?.trim()

      if (!res.ok || !data.success || !uploadedUrl) {
        setUploadError(data.error || 'Failed to upload image')
        return
      }

      setFormState((state) => ({ ...state, image: uploadedUrl }))
      setImageInputMode('url')
      resetUploadState()
    } catch {
      setUploadError('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const resetForm = () => {
    setFormState(emptyFormState)
    setEditingCategoryId(null)
    setError(null)
    setImageInputMode('url')
    resetUploadState()
  }

  const populateForEdit = (category: Category) => {
    setEditingCategoryId(category.id)
    setFormState({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
      sortOrder: String(category.sortOrder),
      parentId: category.parentId || '',
    })
    setError(null)
    setImageInputMode('url')
    resetUploadState()
  }

  const saveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = formState.name.trim()
    const slug = formState.slug.trim() || slugify(name)
    const sortOrder = Number.parseInt(formState.sortOrder, 10)

    if (!name) {
      setError('Category name is required')
      return
    }

    if (!slug) {
      setError('Category slug is required')
      return
    }

    if (!Number.isFinite(sortOrder)) {
      setError('Sort order must be a valid number')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      name,
      slug,
      description: formState.description.trim() || null,
      image: formState.image.trim() || null,
      sortOrder,
      parentId: formState.parentId || null,
    }

    try {
      const method = isEditing ? 'PUT' : 'POST'
      const endpoint = isEditing ? `/api/categories/${editingCategoryId}` : '/api/categories'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to save category')
        return
      }

      resetForm()
      await fetchCategories(currentPage, search, pageSize)
    } catch {
      setError('Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const deleteCategory = async (category: Category) => {
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return

    setError(null)

    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to delete category')
        return
      }

      if (editingCategoryId === category.id) {
        resetForm()
      }

      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      } else {
        await fetchCategories(currentPage, search, pageSize)
      }
    } catch {
      setError('Failed to delete category')
    }
  }

  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (value: string) => {
    const parsed = Number.parseInt(value, 10)
    if (!Number.isFinite(parsed) || parsed < 1) {
      return
    }
    setPageSize(parsed)
    setCurrentPage(1)
  }

  return (
    <div>
      <FadeIn>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-text text-3xl font-bold">Categories</h1>
            <p className="text-text-muted mt-2">
              Manage storefront categories, ordering, and optional parent groups.
            </p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="text-text hover:border-primary-light hover:text-primary-light rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            + New Category
          </button>
        </div>
      </FadeIn>

      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <FadeIn className="bg-surface rounded-xl border border-white/5 p-5">
          <h2 className="text-text text-lg font-semibold">
            {isEditing ? 'Edit Category' : 'Create Category'}
          </h2>
          <p className="text-text-muted mt-1 text-sm">
            {isEditing
              ? 'Update category details and save your changes.'
              : 'Add a new category to organize products.'}
          </p>

          {error && (
            <div className="border-danger/30 bg-danger/10 text-danger mt-4 rounded-lg border px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={saveCategory} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="category-name"
                className="text-text-muted text-xs font-semibold tracking-wide uppercase"
              >
                Name
              </label>
              <input
                id="category-name"
                type="text"
                value={formState.name}
                onChange={(e) => {
                  const name = e.target.value
                  setFormState((state) => {
                    if (isEditing || state.slug.trim().length > 0) {
                      return { ...state, name }
                    }
                    return { ...state, name, slug: slugify(name) }
                  })
                }}
                className="bg-background text-text focus:border-primary mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label
                htmlFor="category-slug"
                className="text-text-muted text-xs font-semibold tracking-wide uppercase"
              >
                Slug
              </label>
              <input
                id="category-slug"
                type="text"
                value={formState.slug}
                onChange={(e) =>
                  setFormState((state) => ({ ...state, slug: slugify(e.target.value) }))
                }
                className="bg-background text-text focus:border-primary mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label
                htmlFor="category-description"
                className="text-text-muted text-xs font-semibold tracking-wide uppercase"
              >
                Description
              </label>
              <textarea
                id="category-description"
                value={formState.description}
                onChange={(e) =>
                  setFormState((state) => ({ ...state, description: e.target.value }))
                }
                rows={3}
                className="bg-background text-text focus:border-primary mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <p className="text-text-muted text-xs font-semibold tracking-wide uppercase">Image</p>

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setImageInputMode('url')
                    setUploadError(null)
                  }}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    imageInputMode === 'url'
                      ? 'bg-primary/10 text-primary border-primary/40'
                      : 'text-text hover:border-primary-light hover:text-primary-light border-white/10'
                  }`}
                >
                  Add via URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageInputMode('upload')
                    setUploadError(null)
                  }}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    imageInputMode === 'upload'
                      ? 'bg-primary/10 text-primary border-primary/40'
                      : 'text-text hover:border-primary-light hover:text-primary-light border-white/10'
                  }`}
                >
                  Upload image
                </button>
              </div>

              {imageInputMode === 'url' ? (
                <div className="mt-3 space-y-2">
                  <label
                    htmlFor="category-image"
                    className="text-text-muted text-xs font-semibold tracking-wide uppercase"
                  >
                    Image URL
                  </label>
                  <input
                    id="category-image"
                    type="text"
                    value={formState.image}
                    onChange={(e) => setFormState((state) => ({ ...state, image: e.target.value }))}
                    placeholder="/images/categories/example.jpg"
                    className="bg-background text-text focus:border-primary w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
                  />
                  {formState.image.trim().length > 0 && !isDisplayableImageSrc(formState.image) && (
                    <p className="text-danger text-xs">
                      Enter a valid image path (starts with /) or a full http/https URL.
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-3 space-y-3 rounded-lg border border-white/10 bg-black/10 p-3">
                  <div>
                    <label
                      htmlFor="category-image-upload"
                      className="text-text-muted text-xs font-semibold tracking-wide uppercase"
                    >
                      Select Image
                    </label>
                    <input
                      ref={categoryFileInputRef}
                      id="category-image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(event) => void handleImageFileChange(event)}
                      disabled={saving || isUploadingImage}
                      className="text-text mt-2 block w-full text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-white/10 file:bg-transparent file:px-3 file:py-2 file:text-sm file:font-medium"
                    />
                    <p className="text-text-muted mt-2 text-xs">
                      JPG, PNG, WEBP, or GIF. Max 4MB and minimum 400x400px.
                    </p>
                  </div>

                  {uploadPreviewUrl && (
                    <div className="flex items-center gap-3">
                      <div
                        aria-label="Selected category image preview"
                        className="h-16 w-16 rounded-lg border border-white/10 bg-cover bg-center"
                        style={{ backgroundImage: `url('${uploadPreviewUrl}')` }}
                      />
                      <p className="text-text text-sm">{selectedImageFile?.name}</p>
                    </div>
                  )}

                  {uploadError && <p className="text-danger text-xs">{uploadError}</p>}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void uploadSelectedImage()}
                      disabled={!selectedImageFile || saving || isUploadingImage}
                      className="bg-primary hover:bg-primary-light rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                    >
                      {isUploadingImage ? 'Uploading...' : 'Upload & Use Image'}
                    </button>
                    <button
                      type="button"
                      onClick={resetUploadState}
                      disabled={saving || isUploadingImage}
                      className="text-text hover:border-primary-light hover:text-primary-light rounded-lg border border-white/10 px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="category-sort-order"
                  className="text-text-muted text-xs font-semibold tracking-wide uppercase"
                >
                  Sort Order
                </label>
                <input
                  id="category-sort-order"
                  type="number"
                  value={formState.sortOrder}
                  onChange={(e) =>
                    setFormState((state) => ({ ...state, sortOrder: e.target.value }))
                  }
                  className="bg-background text-text focus:border-primary mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="category-parent"
                  className="text-text-muted text-xs font-semibold tracking-wide uppercase"
                >
                  Parent Category
                </label>
                <select
                  id="category-parent"
                  value={formState.parentId}
                  onChange={(e) =>
                    setFormState((state) => ({ ...state, parentId: e.target.value }))
                  }
                  className="bg-background text-text focus:border-primary mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="">None</option>
                  {availableParents.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary-light rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Category'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-text-muted hover:text-text rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:border-white/20"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </FadeIn>

        <FadeIn
          className="bg-surface overflow-hidden rounded-xl border border-white/5"
          delay={0.08}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name, slug, or description"
                className="bg-background text-text placeholder:text-text-dark focus:border-primary w-72 rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
              />

              <select
                value={String(pageSize)}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                className="bg-background text-text focus:border-primary rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
                <option value="50">50 / page</option>
              </select>
            </div>

            <p className="text-text-muted text-sm">{totalCategories} categories total</p>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-text-muted px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Category
                </th>
                <th className="text-text-muted px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Slug
                </th>
                <th className="text-text-muted px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Parent
                </th>
                <th className="text-text-muted px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Products
                </th>
                <th className="text-text-muted px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Order
                </th>
                <th className="text-text-muted px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-text-muted px-4 py-8 text-center">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-text-muted px-4 py-8 text-center">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-background/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-surface-light h-10 w-10 overflow-hidden rounded-lg">
                          {category.image ? (
                            <Image
                              src={category.image}
                              alt={category.name}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-text-dark flex h-full w-full items-center justify-center text-[10px] tracking-wider uppercase">
                              N/A
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-text text-sm font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-text-muted line-clamp-1 max-w-xs text-xs">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-text-muted px-4 py-3 text-sm">{category.slug}</td>
                    <td className="text-text-muted px-4 py-3 text-sm">
                      {category.parent?.name || '-'}
                    </td>
                    <td className="text-text-muted px-4 py-3 text-sm">
                      {category._count.products}
                    </td>
                    <td className="text-text-muted px-4 py-3 text-sm">{category.sortOrder}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => populateForEdit(category)}
                          className="text-primary-light text-xs hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteCategory(category)}
                          className="text-danger text-xs hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
            <p className="text-text-muted text-sm">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canGoPrev || loading}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="text-text hover:border-primary-light hover:text-primary-light rounded-lg border border-white/10 px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!canGoNext || loading}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="text-text hover:border-primary-light hover:text-primary-light rounded-lg border border-white/10 px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
