'use client'

import { SessionProvider } from 'next-auth/react'
import { type ReactNode } from 'react'
import { CartSessionSync } from '@/components/cart-session-sync'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartSessionSync />
      {children}
    </SessionProvider>
  )
}
