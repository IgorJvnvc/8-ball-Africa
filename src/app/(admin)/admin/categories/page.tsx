'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
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

export default function AdminCategoriesPage() {
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

  const resetForm = () => {
    setFormState(emptyFormState)
    setEditingCategoryId(null)
    setError(null)
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
                className="bg-background text-text focus:border-primary mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-sm focus:outline-none"
              />
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
