'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { ProductCard } from '@/components/ui/product-card'
import { FadeIn } from '@/components/animations/fade-in'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children'

interface ProductDetailProps {
  product: {
    id: string
    name: string
    slug: string
    description: string | null
    brand: string
    price: number
    comparePrice: number | null
    stock: number
    images: { id: string; url: string; alt: string | null }[]
    category: { name: string; slug: string }
    reviews: {
      id: string
      rating: number
      comment: string | null
      user: { name: string | null; image: string | null }
      createdAt: Date
    }[]
  }
  relatedProducts: Array<{
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
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const { addItem } = useCartStore()
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0
  const aggregateRating =
    product.reviews.length > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: avgRating.toFixed(1),
          reviewCount: product.reviews.length,
          bestRating: '5',
          worstRating: '1',
        }
      : undefined
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    description: product.description || `${product.brand} ${product.name}`,
    image: product.images.map((img) => img.url),
    sku: product.slug,
    category: product.category.name,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.price.toFixed(2),
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `/products/${product.slug}`,
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating,
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || '/images/placeholder.jpg',
      stock: product.stock,
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />

      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/" className="hover:text-text">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-text">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-text">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-text">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <FadeIn direction="left">
          <div className="space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square overflow-hidden rounded-2xl bg-surface-light"
            >
              {product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].alt || product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-text-dark">
                  <span className="text-6xl font-bold">8</span>
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 transition-all ${
                      index === selectedImage
                        ? 'border-primary-light'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        {/* Product Info */}
        <FadeIn direction="right">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-accent">{product.brand}</p>
              <h1 className="mt-2 text-3xl font-bold text-text">{product.name}</h1>
            </div>

            {/* Rating */}
            {product.reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`h-5 w-5 ${star <= avgRating ? 'text-warning' : 'text-text-dark'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-text-muted">
                  ({product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary-light">
                ${product.price.toFixed(2)}
              </span>
              {product.comparePrice && (
                <span className="text-lg text-text-dark line-through">
                  ${product.comparePrice.toFixed(2)}
                </span>
              )}
              {product.comparePrice && (
                <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">
                  Save ${(product.comparePrice - product.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}
              />
              <span className={`text-sm ${product.stock > 0 ? 'text-success' : 'text-danger'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-text-muted leading-relaxed">{product.description}</p>
            )}

            {/* Add to Cart */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full rounded-xl bg-primary py-4 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </motion.button>
          </div>
        </FadeIn>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section className="mt-20">
          <FadeIn>
            <h2 className="text-2xl font-bold text-text">Customer Reviews</h2>
          </FadeIn>
          <StaggerChildren className="mt-8 space-y-4">
            {product.reviews.map((review) => (
              <StaggerItem key={review.id}>
                <div className="rounded-xl border border-white/5 bg-surface p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary-light">
                        {review.user.name?.[0] || '?'}
                      </div>
                      <span className="text-sm font-medium text-text">
                        {review.user.name || 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? 'text-warning' : 'text-text-dark'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm text-text-muted">{review.comment}</p>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <FadeIn>
            <h2 className="text-2xl font-bold text-text">You Might Also Like</h2>
          </FadeIn>
          <StaggerChildren className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>
      )}
    </div>
  )
}
