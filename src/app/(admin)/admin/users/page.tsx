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
            <h1 className="text-text text-3xl font-bold">Users</h1>
            <p className="text-text-muted mt-2">Manage customer and admin accounts</p>
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
          className="bg-surface text-text placeholder:text-text-dark focus:border-primary w-full max-w-md rounded-lg border border-white/10 px-4 py-2.5 text-sm focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-surface mt-6 overflow-hidden rounded-xl border border-white/5">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-text-muted px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                User
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                Role
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                Orders
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                Joined
              </th>
              <th className="text-text-muted px-6 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                Actions
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
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-text-muted px-6 py-8 text-center">
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
                      <p className="text-text text-sm font-medium">{user.name || 'No name'}</p>
                      <p className="text-text-muted text-xs">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      className="bg-background text-text rounded-md border border-white/10 px-2 py-1 text-xs"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="text-text-muted px-6 py-4 text-sm">{user._count.orders}</td>
                  <td className="text-text-muted px-6 py-4 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-danger text-xs hover:underline"
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
