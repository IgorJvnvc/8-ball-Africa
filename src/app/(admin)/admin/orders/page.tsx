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
        <h1 className="text-text text-3xl font-bold">Orders</h1>
        <p className="text-text-muted mt-2">Manage and track customer orders</p>
      </FadeIn>

      <div className="bg-surface mt-6 overflow-hidden rounded-xl border border-white/5">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-text-muted px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                Order
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                Customer
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                Total
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                Status
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-text-muted px-6 py-8 text-center">
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-text-muted px-6 py-8 text-center">
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
                    <p className="text-text font-mono text-sm">#{order.id.slice(-8)}</p>
                    <p className="text-text-muted text-xs">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-text text-sm">{order.user.name || 'N/A'}</p>
                    <p className="text-text-muted text-xs">{order.user.email}</p>
                  </td>
                  <td className="text-text px-6 py-4 text-sm font-medium">
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
                  <td className="text-text-muted px-6 py-4 text-sm">
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
