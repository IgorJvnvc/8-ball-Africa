import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { OrderStatus, Prisma } from '@prisma/client'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback
  }
  return parsed
}

// GET /api/orders
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parsePositiveInt(searchParams.get('page'), 1)
    const limit = Math.min(parsePositiveInt(searchParams.get('limit'), 10), 50)
    const statusParam = searchParams.get('status')
    const status =
      statusParam && Object.values(OrderStatus).includes(statusParam as OrderStatus)
        ? (statusParam as OrderStatus)
        : null

    const where: Prisma.OrderWhereInput =
      session.user.role === 'ADMIN' ? {} : { userId: session.user.id }
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { product: { include: { images: { take: 1 } } } } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/orders - Create order (initiates Stripe checkout)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { addressId, address } = await req.json()

    let resolvedAddressId: string | null = addressId || null

    if (
      !resolvedAddressId &&
      address?.fullName &&
      address?.street &&
      address?.city &&
      address?.postalCode &&
      address?.country
    ) {
      const createdAddress = await prisma.address.create({
        data: {
          userId: session.user.id,
          fullName: String(address.fullName),
          street: String(address.street),
          city: String(address.city),
          state: address.state ? String(address.state) : null,
          postalCode: String(address.postalCode),
          country: String(address.country),
          phone: address.phone ? String(address.phone) : null,
          isDefault: false,
        },
      })

      resolvedAddressId = createdAddress.id
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 })
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const shippingCost = subtotal > 500 ? 0 : 25 // Free shipping over $500
    const total = subtotal + shippingCost

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: session.user.email,
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.name,
            description: item.product.brand,
          },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: { userId: session.user.id, addressId: resolvedAddressId || '' },
    })

    // Create order in DB
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: 'PENDING',
        subtotal,
        shippingCost,
        total,
        stripeSessionId: stripeSession.id,
        addressId: resolvedAddressId,
        items: {
          create: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            name: item.product.name,
          })),
        },
      },
    })

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } })

    return NextResponse.json({
      success: true,
      data: { orderId: order.id, checkoutUrl: stripeSession.url },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
