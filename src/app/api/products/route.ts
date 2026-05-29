import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

const DEFAULT_LIMIT = 12

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback
  }
  return parsed
}

function parseOptionalFloat(value: string | null) {
  const parsed = Number.parseFloat(value ?? '')
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseSort(sort: string, order: string) {
  const [rawSortField, rawInlineOrder] = sort.split('-')
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

// GET /api/products - List products with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const page = parsePositiveInt(searchParams.get('page'), 1)
    const limit = Math.min(parsePositiveInt(searchParams.get('limit'), DEFAULT_LIMIT), 48)
    const q = searchParams.get('q')?.trim() || ''

    const where: Prisma.ProductWhereInput = { published: true }

    if (category) where.category = { slug: category }
    if (brand) where.brand = { in: brand.split(',') }
    const min = parseOptionalFloat(minPrice)
    const max = parseOptionalFloat(maxPrice)

    if (min !== undefined || max !== undefined) {
      where.price = {
        ...(min !== undefined ? { gte: min } : {}),
        ...(max !== undefined ? { lte: max } : {}),
      }
    }
    if (q) {
      const terms = q
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

    const { orderBy } = parseSort(sort, order)

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, category: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/products - Create product (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        brand: body.brand,
        price: body.price,
        comparePrice: body.comparePrice,
        stock: body.stock,
        featured: body.featured || false,
        categoryId: body.categoryId,
      },
      include: { category: true },
    })

    // Create images if provided
    if (body.images?.length) {
      await prisma.productImage.createMany({
        data: body.images.map((url: string, index: number) => ({
          url,
          sortOrder: index,
          productId: product.id,
        })),
      })
    }

    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
