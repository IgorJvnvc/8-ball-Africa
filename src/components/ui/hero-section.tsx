'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-surface to-primary-dark/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/5"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-accent/5"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary-light">
              Premium Pool Equipment
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-4xl font-bold tracking-tight text-text sm:text-5xl lg:text-6xl"
          >
            Elevate Your{' '}
            <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              Game
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-text-muted sm:text-xl"
          >
            Professional-grade pool tables, cues, and accessories from the world&apos;s top brands.
            Delivered across Africa.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              href="/products"
              className="rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-light hover:shadow-primary-light/25 hover:scale-105"
            >
              Shop Now
            </Link>
            <Link
              href="/products?category=pool-tables"
              className="rounded-xl border border-white/10 px-8 py-4 text-sm font-semibold text-text transition-all hover:border-primary-light hover:text-primary-light"
            >
              View Tables
            </Link>
          </motion.div>
        </div>

        {/* Floating 8-ball */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block"
        >
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-black shadow-2xl shadow-black/50"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
              <span className="text-3xl font-bold text-black">8</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
