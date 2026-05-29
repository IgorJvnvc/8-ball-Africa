'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/stores/cart-store'

export function CartSessionSync() {
  const { data: session } = useSession()
  const syncSessionUser = useCartStore((state) => state.syncSessionUser)

  useEffect(() => {
    syncSessionUser(session?.user?.id ?? null)
  }, [session?.user?.id, syncSessionUser])

  return null
}
