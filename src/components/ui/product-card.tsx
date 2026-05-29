'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart-store'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    brand: string
    price: number
    comparePrice: number | null
    stock: number
    images: { url: string; alt: string | null }[]
    category: { name: string; slug: string }
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  const image = product.images[0]

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: image?.url || '/images/placeholder.jpg',
      stock: product.stock,
    })
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group bg-surface hover:border-primary/30 hover:shadow-primary/5 relative overflow-hidden rounded-xl border border-white/5 transition-all hover:shadow-xl"
      >
        {/* Image */}
        <div className="bg-surface-light relative aspect-square overflow-hidden">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt || product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="text-text-dark flex h-full items-center justify-center">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Sale badge */}
          {product.comparePrice && (
            <span className="bg-danger absolute top-3 left-3 rounded-full px-2 py-0.5 text-xs font-bold text-white">
              Sale
            </span>
          )}

          {/* Quick add button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleAddToCart}
            className="bg-primary absolute right-3 bottom-3 rounded-lg px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
          >
            Add to Cart
          </motion.button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-text-dark text-xs font-medium">{product.brand}</p>
          <h3 className="text-text mt-1 line-clamp-2 text-sm font-semibold">{product.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-primary-light text-lg font-bold">
              ${product.price.toFixed(2)}
            </span>
            {product.comparePrice && (
              <span className="text-text-dark text-sm line-through">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-warning mt-1 text-xs">Only {product.stock} left</p>
          )}
          {product.stock === 0 && <p className="text-danger mt-1 text-xs">Out of stock</p>}
        </div>
      </motion.article>
    </Link>
  )
}
