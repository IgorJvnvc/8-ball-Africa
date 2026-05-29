'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/animations/fade-in'

interface User {
  id: string
  email: string
  name: string | null
  role: 'CUSTOMER' | 'ADMIN'
  createdAt: string
  _count: { orders: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    const res = await fetch(`/api/users?${params.toString()}`)
    const data = await res.json()
    if (data.success) setUsers(data.data)
    setLoading(false)
  }, [search])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchUsers()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [fetchUsers])

  const updateRole = async (userId: string, role: string) => {
    await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    fetchUsers()
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    await fetch(`/api/users/${userId}`, { method: 'DELETE' })
    fetchUsers()
  }

  return (
    <div>
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Users</h1>
            <p className="mt-2 text-text-muted">Manage customer and admin accounts</p>
          </div>
        </div>
      </FadeIn>

      {/* Search */}
      <div className="mt-6">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-white/10 bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-dark focus:border-primary focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-white/5 bg-surface">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
                Actions
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
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-background/50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-text">{user.name || 'No name'}</p>
                      <p className="text-xs text-text-muted">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      className="rounded-md border border-white/10 bg-background px-2 py-1 text-xs text-text"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">{user._count.orders}</td>
                  <td className="px-6 py-4 text-sm text-text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-xs text-danger hover:underline"
                    >
                      Delete
                    </button>
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
