'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      return
    }

    // Redirect to login
    router.push('/login?registered=true')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="bg-surface rounded-2xl border border-white/5 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="bg-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <span className="text-lg font-bold text-white">8</span>
          </div>
          <h1 className="text-text text-2xl font-bold">Create an account</h1>
          <p className="text-text-muted mt-2 text-sm">Join 8-ball Africa today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-danger/10 text-danger rounded-lg px-4 py-3 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label htmlFor="name" className="text-text-muted mb-1 block text-sm font-medium">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-background text-text placeholder:text-text-dark focus:border-primary focus:ring-primary w-full rounded-lg border border-white/10 px-4 py-3 text-sm focus:ring-1 focus:outline-none"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-text-muted mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background text-text placeholder:text-text-dark focus:border-primary focus:ring-primary w-full rounded-lg border border-white/10 px-4 py-3 text-sm focus:ring-1 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-text-muted mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background text-text placeholder:text-text-dark focus:border-primary focus:ring-primary w-full rounded-lg border border-white/10 px-4 py-3 text-sm focus:ring-1 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-text-muted mb-1 block text-sm font-medium"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-background text-text placeholder:text-text-dark focus:border-primary focus:ring-primary w-full rounded-lg border border-white/10 px-4 py-3 text-sm focus:ring-1 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-light w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </motion.button>
        </form>

        <p className="text-text-muted mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-light hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
