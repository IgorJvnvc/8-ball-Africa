'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/animations/fade-in'

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  user: { name: string | null; email: string }
  items: { name: string; quantity: number; price: number }[]
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-text-dark/10 text-text-dark',
  PAID: 'bg-primary/10 text-primary-light',
  PROCESSING: 'bg-warning/10 text-warning',
  SHIPPED: 'bg-accent/10 text-accent',
  DELIVERED: 'bg-success/10 text-success',
  CANCELLED: 'bg-danger/10 text-danger',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/orders?limit=50')
    const data = await res.json()
    if (data.success) setOrders(data.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchOrders()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [fetchOrders])

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchOrders()
  }

  return (
    <div>
      <FadeIn>
        <h1 className="text-3xl font-bold text-text">Orders</h1>
        <p className="mt-2 text-text-muted">Manage and track customer orders</p>
      </FadeIn>

      <div className="mt-6 overflow-hidden rounded-xl border border-white/5 bg-surface">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-background/50"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono text-text">#{order.id.slice(-8)}</p>
                    <p className="text-xs text-text-muted">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-text">{order.user.name || 'N/A'}</p>
                    <p className="text-xs text-text-muted">{order.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-text">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`rounded-full border-0 px-2 py-1 text-xs font-medium ${statusColors[order.status] || ''}`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
