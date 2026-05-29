'use client'

import { motion } from 'framer-motion'

type Brand = {
  name: string
  tag: string
}

const BRANDS: Brand[] = [
  { name: 'Diamond', tag: 'Pro Tables' },
  { name: 'Brunswick', tag: 'Legend Gear' },
  { name: 'Predator', tag: 'Cue Tech' },
  { name: 'Aramith', tag: 'Match Balls' },
  { name: 'Mezz', tag: 'Japanese Cues' },
  { name: 'Cuetec', tag: 'Carbon Series' },
  { name: 'McDermott', tag: 'Craft Cues' },
]

function BrandPill({ brand }: { brand: Brand }) {
  return (
    <div className="group flex min-w-[180px] items-center gap-3 rounded-full border border-white/10 bg-background/80 px-4 py-2.5 text-text-muted transition-colors hover:border-primary-light/40 hover:text-text">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-black shadow-inner shadow-white/20">
        <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">
          8
        </span>
      </span>
      <span className="flex items-baseline gap-2">
        <span className="text-sm font-semibold tracking-wide">{brand.name}</span>
        <span className="text-[11px] uppercase tracking-[0.16em] text-text-dark">{brand.tag}</span>
      </span>
    </div>
  )
}

export function BrandMarquee() {
  const topRow = [...BRANDS, ...BRANDS]
  const offsetBrands = [...BRANDS.slice(3), ...BRANDS.slice(0, 3)]
  const bottomRow = [...offsetBrands, ...offsetBrands]

  return (
    <section className="border-y border-white/5 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-light">
            Trusted Equipment Partners
          </p>
          <h2 className="mt-3 text-2xl font-bold text-text sm:text-3xl">
            Built Around the Brands Pros Play With
          </h2>
        </motion.div>

        <div className="relative mt-9 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface to-transparent sm:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface to-transparent sm:w-24" />

          <div className="brand-marquee-track py-2">
            {topRow.map((brand, index) => (
              <BrandPill key={`top-${brand.name}-${index}`} brand={brand} />
            ))}
          </div>

          <div className="brand-marquee-track brand-marquee-track-reverse mt-3 py-2">
            {bottomRow.map((brand, index) => (
              <BrandPill key={`bottom-${brand.name}-${index}`} brand={brand} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
