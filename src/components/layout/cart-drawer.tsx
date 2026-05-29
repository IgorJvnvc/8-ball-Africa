'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore, type CartItemType } from '@/stores/cart-store'
import Image from 'next/image'
import Link from 'next/link'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h2 className="text-lg font-semibold text-text">Your Cart</h2>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="text-text-muted transition-colors hover:text-text"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <svg
                    className="mb-4 h-16 w-16 text-text-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <p className="text-text-muted">Your cart is empty</p>
                  <button
                    onClick={closeCart}
                    className="mt-4 text-sm text-primary-light hover:underline"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.productId}
                      item={item}
                      onRemove={() => removeItem(item.productId)}
                      onUpdateQuantity={(qty) => updateQuantity(item.productId, qty)}
                    />
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/5 px-6 py-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="text-lg font-semibold text-text">
                    ${totalPrice().toFixed(2)}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full rounded-lg bg-primary py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-light"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function CartItemRow({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItemType
  onRemove: () => void
  onUpdateQuantity: (qty: number) => void
}) {
  return (
    <motion.li
      layout
      exit={{ opacity: 0, x: 50 }}
      className="flex gap-4 rounded-lg bg-background p-3"
    >
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-surface-light">
        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <p className="text-sm font-medium text-text">{item.name}</p>
          <button onClick={onRemove} aria-label={`Remove ${item.name}`} className="text-text-dark hover:text-danger">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              aria-label={`Decrease quantity of ${item.name}`}
              className="flex h-6 w-6 items-center justify-center rounded bg-surface-light text-text-muted hover:text-text"
            >
              -
            </button>
            <span className="text-sm text-text">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              aria-label={`Increase quantity of ${item.name}`}
              disabled={item.quantity >= item.stock}
              className="flex h-6 w-6 items-center justify-center rounded bg-surface-light text-text-muted hover:text-text disabled:opacity-50"
            >
              +
            </button>
          </div>
          <p className="text-sm font-medium text-primary-light">
            ${(item.price * item.quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </motion.li>
  )
}
