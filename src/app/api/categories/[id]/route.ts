import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// PUT /api/categories/:id (Admin)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const data: {
      name?: string
      slug?: string
      description?: string | null
      image?: string | null
      parentId?: string | null
      sortOrder?: number
    } = {}

    if (typeof body.name === 'string') data.name = body.name.trim()
    if (typeof body.slug === 'string') data.slug = body.slug.trim()

    if ('description' in body) {
      data.description = body.description?.trim() ? body.description.trim() : null
    }

    if ('image' in body) {
      data.image = body.image?.trim() ? body.image.trim() : null
    }

    if ('parentId' in body) {
      data.parentId = body.parentId?.trim() ? body.parentId.trim() : null
    }

    if ('sortOrder' in body) {
      const parsedSortOrder = Number.parseInt(String(body.sortOrder), 10)
      if (Number.isFinite(parsedSortOrder)) {
        data.sortOrder = parsedSortOrder
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: category })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/categories/:id (Admin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete category with assigned products',
        },
        { status: 400 },
      )
    }

    if (category._count.children > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete category with child categories',
        },
        { status: 400 },
      )
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true, data: null })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
