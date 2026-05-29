import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import type { Metadata } from 'next'
import { ProductGrid } from './product-grid'
import { FilterSidebar } from './filter-sidebar'
import { FadeIn } from '@/components/animations/fade-in'

const DEFAULT_LIMIT = 12

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback
  }
  return parsed
}

function parseOptionalFloat(value: string | undefined) {
  const parsed = Number.parseFloat(value ?? '')
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseSort(sort: string | undefined, order: string | undefined) {
  const [rawSortField, rawInlineOrder] = (sort || 'createdAt').split('-')
  const sortField = rawSortField === 'price' || rawSortField === 'name' ? rawSortField : 'createdAt'

  const sortOrder: Prisma.SortOrder =
    order === 'asc' || order === 'desc'
      ? order
      : rawInlineOrder === 'desc'
        ? 'desc'
        : sortField === 'name'
          ? 'asc'
          : 'desc'

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sortField === 'price'
      ? { price: sortOrder }
      : sortField === 'name'
        ? { name: sortOrder }
        : { createdAt: sortOrder }

  return { sortField, sortOrder, orderBy }
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams
  const searchQuery = params.q?.trim()

  let title = 'All Products'
  let description =
    'Browse premium pool tables, cues, balls, chalk, gloves, and accessories from trusted billiards brands.'

  if (params.category) {
    const category = await prisma.category.findUnique({
      where: { slug: params.category },
      select: { name: true, description: true },
    })

    if (category) {
      title = `${category.name} Products`
      description =
        category.description ||
        `Shop ${category.name.toLowerCase()} from 8-Ball Africa with fast delivery across the region.`
    }
  }

  if (searchQuery) {
    title = `Search results for "${searchQuery}"`
    description = `Find billiards products matching "${searchQuery}" across top pool and snooker brands.`
  }

  const canonicalParams = new URLSearchParams()
  if (params.category) canonicalParams.set('category', params.category)
  if (searchQuery) canonicalParams.set('q', searchQuery)
  const canonical = canonicalParams.size > 0 ? `/products?${canonicalParams.toString()}` : '/products'

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    brand?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    order?: string
    page?: string
    q?: string
    limit?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const searchQuery = params.q?.trim() || ''

  // Build filters
  const where: Prisma.ProductWhereInput = { published: true }

  if (params.category) {
    where.category = { slug: params.category }
  }
  if (params.brand) {
    where.brand = { in: params.brand.split(',') }
  }
  const minPrice = parseOptionalFloat(params.minPrice)
  const maxPrice = parseOptionalFloat(params.maxPrice)

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    }
  }
  if (searchQuery) {
    const terms = searchQuery
      .split(/\s+/)
      .map((term) => term.trim())
      .filter(Boolean)

    if (terms.length === 1) {
      where.OR = [
        { name: { contains: terms[0], mode: 'insensitive' } },
        { description: { contains: terms[0], mode: 'insensitive' } },
        { brand: { contains: terms[0], mode: 'insensitive' } },
      ]
    } else {
      where.AND = terms.map((term) => ({
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { brand: { contains: term, mode: 'insensitive' } },
        ],
      }))
    }
  }

  // Sorting
  const { sortField, sortOrder, orderBy } = parseSort(params.sort, params.order)

  // Pagination
  const page = parsePositiveInt(params.page, 1)
  const limit = Math.min(parsePositiveInt(params.limit, DEFAULT_LIMIT), 48)
  const skip = (page - 1) * limit

  const [products, total, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, category: true },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.product.findMany({
      where: { published: true },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn>
        <h1 className="text-3xl font-bold text-text">
          {params.category
            ? categories.find((c) => c.slug === params.category)?.name || 'Products'
            : 'All Products'}
        </h1>
        <p className="mt-2 text-text-muted">
          {total} product{total !== 1 ? 's' : ''} found
        </p>
        {searchQuery && (
          <p className="mt-1 text-sm text-text-dark">
            Search: <span className="text-text">{searchQuery}</span>
          </p>
        )}
      </FadeIn>

      <div className="mt-8 flex gap-8">
        {/* Filters */}
          <FilterSidebar
            categories={categories}
            brands={brands.map((b) => b.brand)}
            currentFilters={{
              ...params,
              q: searchQuery || undefined,
              sort: sortField,
              order: sortOrder,
              limit: String(limit),
            }}
          />

        {/* Products Grid */}
        <div className="flex-1">
          <ProductGrid products={products} currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  )
}
