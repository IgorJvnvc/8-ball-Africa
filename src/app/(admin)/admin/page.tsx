import { prisma } from '@/lib/prisma'
import { FadeIn } from '@/components/animations/fade-in'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children'
import { AnalyticsDashboard } from './analytics-dashboard'

export default async function AdminDashboard() {
  const [totalProducts, totalOrders, totalUsers, totalRevenue, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.aggregate({
      where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, items: true },
    }),
  ])

  const stats = [
    { label: 'Total Products', value: totalProducts, color: 'text-primary-light' },
    { label: 'Total Orders', value: totalOrders, color: 'text-accent' },
    { label: 'Total Customers', value: totalUsers, color: 'text-success' },
    {
      label: 'Revenue',
      value: `$${(totalRevenue._sum.total || 0).toFixed(2)}`,
      color: 'text-warning',
    },
  ]

  return (
    <div>
      <FadeIn>
        <h1 className="text-text text-3xl font-bold">Dashboard</h1>
        <p className="text-text-muted mt-2">Overview of your store performance</p>
      </FadeIn>

      {/* Stats */}
      <StaggerChildren className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StaggerItem key={stat.label}>
            <div className="bg-surface rounded-xl border border-white/5 p-6">
              <p className="text-text-muted text-sm">{stat.label}</p>
              <p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>

      {/* Recent Orders */}
      <FadeIn delay={0.3}>
        <div className="bg-surface mt-8 rounded-xl border border-white/5">
          <div className="border-b border-white/5 px-6 py-4">
            <h2 className="text-text text-lg font-semibold">Recent Orders</h2>
          </div>
          <div className="divide-y divide-white/5">
            {recentOrders.length === 0 ? (
              <p className="text-text-muted px-6 py-8 text-center">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-text text-sm font-medium">
                      {order.user.name || order.user.email}
                    </p>
                    <p className="text-text-muted text-xs">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} &bull;{' '}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-text text-sm font-semibold">${order.total.toFixed(2)}</p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.status === 'DELIVERED'
                          ? 'bg-success/10 text-success'
                          : order.status === 'CANCELLED'
                            ? 'bg-danger/10 text-danger'
                            : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.35}>
        <AnalyticsDashboard />
      </FadeIn>
    </div>
  )
}
