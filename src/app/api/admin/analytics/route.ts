import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

const REVENUE_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
]

type RevenueByDayPoint = {
  date: string
  revenue: number
  orders: number
}

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    const startOf30DaysAgo = new Date(startOfToday)
    startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 29)

    const startOfPrevious30Days = new Date(startOf30DaysAgo)
    startOfPrevious30Days.setDate(startOfPrevious30Days.getDate() - 30)

    const [
      allTimeRevenue,
      recentRevenue,
      previousRevenue,
      recentOrders,
      orderStatusCounts,
      topProducts,
      totalOrders,
      totalUsers,
      usersThisMonth,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: REVENUE_STATUSES } },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        where: {
          status: { in: REVENUE_STATUSES },
          createdAt: { gte: startOf30DaysAgo },
        },
        select: { createdAt: true, total: true },
      }),
      prisma.order.aggregate({
        where: {
          status: { in: REVENUE_STATUSES },
          createdAt: {
            gte: startOfPrevious30Days,
            lt: startOf30DaysAgo,
          },
        },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: startOf30DaysAgo } },
        select: { createdAt: true, status: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productId', 'name'],
        _sum: { quantity: true },
        _count: { productId: true },
        _max: { price: true },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 10,
      }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        },
      }),
    ])

    const revenueByDayMap = new Map<string, RevenueByDayPoint>()

    for (let i = 0; i < 30; i++) {
      const date = new Date(startOf30DaysAgo)
      date.setDate(startOf30DaysAgo.getDate() + i)
      const key = date.toISOString().slice(0, 10)
      revenueByDayMap.set(key, { date: key, revenue: 0, orders: 0 })
    }

    for (const order of recentRevenue) {
      const key = order.createdAt.toISOString().slice(0, 10)
      const point = revenueByDayMap.get(key)
      if (!point) continue
      point.revenue += order.total
      point.orders += 1
    }

    const revenueByDay = [...revenueByDayMap.values()]
    const recentRevenueTotal = recentRevenue.reduce((sum, order) => sum + order.total, 0)
    const previousRevenueTotal = previousRevenue._sum.total || 0
    const revenueTrendPct =
      previousRevenueTotal > 0
        ? ((recentRevenueTotal - previousRevenueTotal) / previousRevenueTotal) * 100
        : recentRevenueTotal > 0
          ? 100
          : 0

    const orderStatus = Object.values(OrderStatus).map((status) => ({
      status,
      count: orderStatusCounts.find((entry) => entry.status === status)?._count.status ?? 0,
    }))

    const topProductsWithRevenue = topProducts.map((item) => {
      const quantity = item._sum.quantity ?? 0
      const unitPrice = item._max.price ?? 0
      return {
        productId: item.productId,
        name: item.name,
        quantity,
        revenue: quantity * unitPrice,
        orderCount: item._count.productId,
      }
    })

    const ordersLast30Days = recentOrders.length
    const paidOrdersLast30Days = recentOrders.filter((order) =>
      REVENUE_STATUSES.includes(order.status),
    ).length

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          revenueAllTime: allTimeRevenue._sum.total || 0,
          revenue30Days: recentRevenueTotal,
          revenueTrendPct,
          totalOrders,
          ordersLast30Days,
          paidOrdersLast30Days,
          totalUsers,
          usersThisMonth,
        },
        revenueByDay,
        orderStatus,
        topProducts: topProductsWithRevenue,
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
