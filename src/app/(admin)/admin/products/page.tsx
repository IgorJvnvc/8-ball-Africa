'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/animations/fade-in'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  stock: number
  featured: boolean
  published: boolean
  category: { name: string }
  images: { url: string }[]
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/products?limit=50')
    const data = await res.json()
    if (data.success) setProducts(data.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchProducts()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [fetchProducts])

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    fetchProducts()
  }

  const togglePublished = async (id: string, published: boolean) => {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !published }),
    })
    fetchProducts()
  }

  return (
    <div>
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Products</h1>
            <p className="mt-2 text-text-muted">Manage your product catalog</p>
          </div>
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
          >
            + Add Product
          </Link>
        </div>
      </FadeIn>

      <div className="mt-6 overflow-hidden rounded-xl border border-white/5 bg-surface">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                  Loading...
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-background/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-surface-light">
                        {product.images[0] && (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">{product.name}</p>
                        <p className="text-xs text-text-muted">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">{product.category.name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-text">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm ${product.stock <= 5 ? 'text-warning' : 'text-text-muted'}`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePublished(product.id, product.published)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.published
                          ? 'bg-success/10 text-success'
                          : 'bg-text-dark/10 text-text-dark'
                      }`}
                    >
                      {product.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-xs text-primary-light hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-xs text-danger hover:underline"
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
      </div>
    </div>
  )
}
