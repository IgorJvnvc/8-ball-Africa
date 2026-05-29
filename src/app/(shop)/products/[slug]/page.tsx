import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProductDetail } from './product-detail'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      brand: true,
      price: true,
      stock: true,
      images: { take: 1, orderBy: { sortOrder: 'asc' }, select: { url: true } },
    },
  })

  if (!product) {
    return {
      title: 'Product Not Found',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const image = product.images[0]?.url
  const canonical = `/products/${slug}`

  return {
    title: product.name,
    description: product.description || `${product.brand} - ${product.name}`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: product.name,
      description: product.description || `${product.brand} - ${product.name}`,
      type: 'website',
      url: canonical,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || `${product.brand} - ${product.name}`,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: true,
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!product) notFound()

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      published: true,
    },
    include: { images: { take: 1 }, category: true },
    take: 4,
  })

  return <ProductDetail product={product} relatedProducts={relatedProducts} />
}
