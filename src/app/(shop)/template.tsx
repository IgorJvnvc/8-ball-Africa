'use client'

import { PageTransition } from '@/components/animations'

export default function ShopTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}
