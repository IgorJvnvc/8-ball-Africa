'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { FadeIn } from '@/components/animations/fade-in'

type AnalyticsData = {
  totals: {
    revenueAllTime: number
    revenue30Days: number
    revenueTrendPct: number
    totalOrders: number
    ordersLast30Days: number
    paidOrdersLast30Days: number
    totalUsers: number
    usersThisMonth: number
  }
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>
  orderStatus: Array<{ status: string; count: number }>
  topProducts: Array<{
    productId: string
    name: string
    quantity: number
    revenue: number
    orderCount: number
  }>
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F6C85F',
  PAID: '#3BA272',
  PROCESSING: '#4E79A7',
  SHIPPED: '#59A14F',
  DELIVERED: '#2E8B57',
  CANCELLED: '#D9534F',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatTrend(value: number) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

function tooltipFormatter(value: ValueType | undefined, name: NameType | undefined) {
  const numeric = typeof value === 'number' ? value : Number(value ?? 0)
  return name === 'revenue' ? formatCurrency(numeric) : numeric
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/analytics', { cache: 'no-store' })
      const body = (await res.json()) as { success: boolean; data?: AnalyticsData; error?: string }

      if (!res.ok || !body.success || !body.data) {
        setError(body.error || 'Failed to load analytics')
        return
      }

      setAnalytics(body.data)
    } catch {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchAnalytics()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [fetchAnalytics])

  const revenueChartData = useMemo(
    () =>
      (analytics?.revenueByDay || []).map((point) => ({
        ...point,
        day: point.date.slice(5),
      })),
    [analytics],
  )

  if (loading) {
    return (
      <div className="bg-surface text-text-muted mt-8 rounded-xl border border-white/5 p-6 text-sm">
        Loading analytics...
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="border-danger/30 bg-danger/5 text-danger mt-8 rounded-xl border p-6 text-sm">
        {error || 'Unable to load analytics'}
      </div>
    )
  }

  const trendClass =
    analytics.totals.revenueTrendPct > 0
      ? 'text-success'
      : analytics.totals.revenueTrendPct < 0
        ? 'text-danger'
        : 'text-text-muted'

  return (
    <div className="mt-8 space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FadeIn>
          <div className="bg-surface rounded-xl border border-white/5 p-5">
            <p className="text-text-muted text-xs tracking-wider uppercase">Revenue (All Time)</p>
            <p className="text-primary-light mt-2 text-2xl font-bold">
              {formatCurrency(analytics.totals.revenueAllTime)}
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="bg-surface rounded-xl border border-white/5 p-5">
            <p className="text-text-muted text-xs tracking-wider uppercase">Revenue (30 Days)</p>
            <p className="text-text mt-2 text-2xl font-bold">
              {formatCurrency(analytics.totals.revenue30Days)}
            </p>
            <p className={`mt-1 text-xs ${trendClass}`}>
              {formatTrend(analytics.totals.revenueTrendPct)}
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="bg-surface rounded-xl border border-white/5 p-5">
            <p className="text-text-muted text-xs tracking-wider uppercase">Orders</p>
            <p className="text-text mt-2 text-2xl font-bold">{analytics.totals.totalOrders}</p>
            <p className="text-text-dark mt-1 text-xs">
              {analytics.totals.ordersLast30Days} in last 30 days
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="bg-surface rounded-xl border border-white/5 p-5">
            <p className="text-text-muted text-xs tracking-wider uppercase">Customers</p>
            <p className="text-text mt-2 text-2xl font-bold">{analytics.totals.totalUsers}</p>
            <p className="text-text-dark mt-1 text-xs">
              {analytics.totals.usersThisMonth} new this month
            </p>
          </div>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <FadeIn className="xl:col-span-2">
          <div className="bg-surface rounded-xl border border-white/5 p-6">
            <h2 className="text-text mb-1 text-lg font-semibold">Revenue Trend (Last 30 Days)</h2>
            <p className="text-text-muted mb-6 text-sm">Daily paid revenue and order count.</p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="day" tick={{ fill: '#8A94A6', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#8A94A6', fontSize: 12 }} />
                  <Tooltip
                    formatter={tooltipFormatter}
                    contentStyle={{
                      backgroundColor: '#0E1628',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4DA3FF"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#6CCB5F"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-surface rounded-xl border border-white/5 p-6">
            <h2 className="text-text mb-1 text-lg font-semibold">Order Status</h2>
            <p className="text-text-muted mb-6 text-sm">Current distribution by status.</p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.orderStatus}
                    dataKey="count"
                    nameKey="status"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {analytics.orderStatus.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#4DA3FF'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E1628',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="text-text-muted mt-3 space-y-1 text-xs">
              {analytics.orderStatus.map((status) => (
                <li key={status.status} className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[status.status] || '#4DA3FF' }}
                    />
                    {status.status}
                  </span>
                  <span>{status.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={0.15}>
        <div className="bg-surface rounded-xl border border-white/5 p-6">
          <h2 className="text-text mb-1 text-lg font-semibold">Top Products</h2>
          <p className="text-text-muted mb-6 text-sm">Top 10 products by units sold.</p>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topProducts} margin={{ left: 16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" hide />
                <YAxis tick={{ fill: '#8A94A6', fontSize: 12 }} />
                <Tooltip
                  formatter={tooltipFormatter}
                  contentStyle={{
                    backgroundColor: '#0E1628',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="quantity" fill="#4DA3FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-text-muted border-b border-white/10 text-xs tracking-wider uppercase">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Units</th>
                  <th className="pb-2">Orders</th>
                  <th className="pb-2">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analytics.topProducts.map((product) => (
                  <tr key={product.productId}>
                    <td className="text-text py-2">{product.name}</td>
                    <td className="text-text-muted py-2">{product.quantity}</td>
                    <td className="text-text-muted py-2">{product.orderCount}</td>
                    <td className="text-text py-2">{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
