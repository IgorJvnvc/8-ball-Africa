import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/products/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        reviews: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/products/:id (Admin)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        brand: body.brand,
        price: body.price,
        comparePrice: body.comparePrice,
        stock: body.stock,
        featured: body.featured,
        published: body.published,
        categoryId: body.categoryId,
      },
      include: { category: true, images: true },
    })

    if (Array.isArray(body.images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } })

      const imageUrls = body.images
        .map((url: unknown) => String(url).trim())
        .filter((url: string) => url.length > 0)

      if (imageUrls.length > 0) {
        await prisma.productImage.createMany({
          data: imageUrls.map((url: string, index: number) => ({
            productId: id,
            url,
            sortOrder: index,
          })),
        })
      }
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/products/:id (Admin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
