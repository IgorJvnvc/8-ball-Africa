import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderInvoice } from '@/lib/email/send-order-invoice'
import Stripe from 'stripe'

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('Stripe secret key is not configured')
  }
  return new Stripe(secretKey)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook secret is not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = getStripeClient().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      // Update order status
      await prisma.order.update({
        where: { stripeSessionId: session.id },
        data: {
          status: 'PAID',
          stripePaymentId: session.payment_intent as string,
        },
      })

      // Decrement product stock
      const order = await prisma.order.findUnique({
        where: { stripeSessionId: session.id },
        include: { items: true, user: true },
      })

      if (order) {
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        }

        // Send invoice email with PDF attachment
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId: order.id },
          include: { product: true },
        })

        await sendOrderInvoice({
          customerName: order.user.name ?? 'Customer',
          customerEmail: order.user.email!,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          orderDate: new Date(order.createdAt).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          items: orderItems.map((oi) => ({
            name: oi.product.name,
            quantity: oi.quantity,
            price: oi.price,
          })),
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          total: order.total,
        }).catch((err) => console.error('[Invoice Email Error]', err))
      }

      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      await prisma.order.update({
        where: { stripeSessionId: session.id },
        data: { status: 'CANCELLED' },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
