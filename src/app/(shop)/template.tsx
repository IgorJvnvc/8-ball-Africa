'use client'

import { Suspense } from 'react'
import { PageTransition } from '@/components/animations'

export default function ShopTemplate({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={children}>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  )
}
