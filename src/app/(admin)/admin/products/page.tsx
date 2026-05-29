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
            <h1 className="text-text text-3xl font-bold">Products</h1>
            <p className="text-text-muted mt-2">Manage your product catalog</p>
          </div>
          <Link
            href="/admin/products/new"
            className="bg-primary hover:bg-primary-light rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            + Add Product
          </Link>
        </div>
      </FadeIn>

      <div className="bg-surface mt-6 overflow-hidden rounded-xl border border-white/5">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-text-muted px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                Product
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                Category
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                Price
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                Stock
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                Status
              </th>
              <th className="text-text-muted px-6 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-text-muted px-6 py-8 text-center">
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
                      <div className="bg-surface-light h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
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
                        <p className="text-text text-sm font-medium">{product.name}</p>
                        <p className="text-text-muted text-xs">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-text-muted px-6 py-4 text-sm">{product.category.name}</td>
                  <td className="text-text px-6 py-4 text-sm font-medium">
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
                        className="text-primary-light text-xs hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id)}
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
      </div>
    </div>
  )
}
