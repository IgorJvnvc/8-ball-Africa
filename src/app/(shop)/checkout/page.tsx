'use client'

import { useState } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/fade-in'

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  })

  const shippingCost = totalPrice() > 500 ? 0 : 25
  const total = totalPrice() + shippingCost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })

      const data = await res.json()
      if (data.success && data.data.checkoutUrl) {
        clearCart()
        window.location.href = data.data.checkoutUrl
      } else {
        setError(data.error || 'Failed to create order')
      }
    } catch {
      setError('Something went wrong while processing checkout')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-text text-2xl font-bold">Your cart is empty</h1>
        <p className="text-text-muted mt-2">Add some products before checking out</p>
        <button
          onClick={() => router.push('/products')}
          className="bg-primary mt-6 rounded-lg px-6 py-3 text-sm font-semibold text-white"
        >
          Browse Products
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn>
        <h1 className="text-text text-3xl font-bold">Checkout</h1>
      </FadeIn>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-3">
          <FadeIn delay={0.1}>
            <div className="bg-surface rounded-xl border border-white/5 p-6">
              <h2 className="text-text mb-4 text-lg font-semibold">Shipping Address</h2>
              {error && (
                <p className="border-danger/30 bg-danger/10 text-danger mb-4 rounded-lg border px-3 py-2 text-sm">
                  {error}
                </p>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-text-muted mb-1 block text-sm">Full Name</label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="bg-background text-text focus:border-primary w-full rounded-lg border border-white/10 px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-text-muted mb-1 block text-sm">Street Address</label>
                  <input
                    type="text"
                    required
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="bg-background text-text focus:border-primary w-full rounded-lg border border-white/10 px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-text-muted mb-1 block text-sm">City</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="bg-background text-text focus:border-primary w-full rounded-lg border border-white/10 px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-text-muted mb-1 block text-sm">State / Province</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="bg-background text-text focus:border-primary w-full rounded-lg border border-white/10 px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-text-muted mb-1 block text-sm">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    className="bg-background text-text focus:border-primary w-full rounded-lg border border-white/10 px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-text-muted mb-1 block text-sm">Country</label>
                  <input
                    type="text"
                    required
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    className="bg-background text-text focus:border-primary w-full rounded-lg border border-white/10 px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-text-muted mb-1 block text-sm">Phone (optional)</label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="bg-background text-text focus:border-primary w-full rounded-lg border border-white/10 px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </FadeIn>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-light w-full rounded-xl py-4 text-base font-semibold text-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
          </motion.button>
        </form>

        {/* Order Summary */}
        <FadeIn delay={0.2} className="lg:col-span-2">
          <div className="bg-surface sticky top-24 rounded-xl border border-white/5 p-6">
            <h2 className="text-text mb-4 text-lg font-semibold">Order Summary</h2>
            <ul className="divide-y divide-white/5">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3 py-3">
                  <div className="bg-surface-light relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-text text-sm font-medium">{item.name}</p>
                    <p className="text-text-muted text-xs">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-text text-sm font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Subtotal</span>
                <span className="text-text">${totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Shipping</span>
                <span className="text-text">
                  {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 text-base font-semibold">
                <span className="text-text">Total</span>
                <span className="text-primary-light">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
