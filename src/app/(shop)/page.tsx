import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FadeIn } from '@/components/animations/fade-in'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children'
import { ProductCard } from '@/components/ui/product-card'
import { BrandMarquee } from '@/components/ui/brand-marquee'
import { HeroSection } from '@/components/ui/hero-section'

const SCENE_IMAGES = [
  {
    src: '/images/home/pool-hall-1.jpg',
    alt: 'A modern 8-ball pool hall with multiple professional tables',
  },
  {
    src: '/images/home/showroom-1.jpg',
    alt: 'A cue and accessories showroom wall in a billiards store',
  },
  {
    src: '/images/home/playing-1.jpg',
    alt: 'A player lining up a shot on a competition 8-ball table',
  },
  {
    src: '/images/home/pool-hall-2.jpg',
    alt: 'Billiards club atmosphere with warm lighting and full-size tables',
  },
  {
    src: '/images/home/snooker-hall-1.jpg',
    alt: 'An 8-ball lane prepared for evening league play',
  },
  {
    src: '/images/home/pool-hall-3.jpg',
    alt: 'Pool hall corner lit with neon accents and match tables',
  },
  {
    src: '/images/home/pool-hall-4.jpg',
    alt: 'A busy billiards club interior with full-size tables',
  },
  {
    src: '/images/home/tournament-table-1.jpg',
    alt: 'Tournament-ready table with polished rails and bright cloth',
  },
  {
    src: '/images/home/player-aiming-1.jpg',
    alt: 'A player aiming a precise shot during a club session',
  },
]

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { featured: true, published: true },
    include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, category: true },
    take: 6,
  })

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <>
      <HeroSection />
      <BrandMarquee />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-light">
              About 8-Ball Africa
            </p>
            <h2 className="mt-4 text-3xl font-bold text-text sm:text-4xl">
              Africa&apos;s trusted destination for serious 8-ball players
            </h2>
            <p className="mt-5 text-text-muted">
              8-Ball Africa is a specialist billiards retailer built for players who care about
              consistency, cue feel, and tournament-ready gear. From first-time buyers to club
              owners and league captains, we help every customer find the right setup.
            </p>
            <p className="mt-4 text-text-muted">
              We curate professional tables, cues, cloth, and accessories from globally respected
              brands and support delivery across major cities in Southern, East, and West Africa.
            </p>
            <p className="mt-4 text-text-muted">
              Our Johannesburg team also advises on full venue setups, replacement parts, and
              long-term maintenance so your tables stay true and your game stays sharp.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-primary-light"
              >
                Explore Catalog
              </Link>
              <Link
                href="/products?category=pool-tables"
                className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-text transition-colors hover:border-primary-light hover:text-primary-light"
              >
                Find a Table
              </Link>
            </div>
          </FadeIn>

          <FadeIn className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface" delay={0.12}>
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
            <Image
              src="/images/home/snooker-hall-1.jpg"
              alt="8-ball tables prepared for league night in a premium billiards room"
              width={1600}
              height={1000}
              className="h-[420px] w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-sm font-semibold text-text">League-Ready Setups</p>
              <p className="mt-1 text-sm text-text-muted">
                Tournament cloth, calibrated rails, and cue performance tuning.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-y border-white/5 bg-surface/35">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl font-bold text-text">Inside the 8-Ball Scene</h2>
            <p className="mt-3 max-w-3xl text-text-muted">
              A glimpse at the pool halls, club nights, and pro-grade seller spaces that inspire the
              products we stock.
            </p>
          </FadeIn>

          <StaggerChildren className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCENE_IMAGES.map((image) => (
              <StaggerItem key={image.src}>
                <div className="group overflow-hidden rounded-2xl border border-white/10 bg-surface-light/40">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={1400}
                    height={900}
                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="mb-2 text-3xl font-bold text-text">Shop by Category</h2>
          <p className="mb-10 text-text-muted">
            Find exactly what you need to elevate your game
          </p>
        </FadeIn>
        <StaggerChildren className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <StaggerItem key={category.id}>
              <Link
                href={`/products?category=${category.slug}`}
                className="group relative flex h-32 items-end overflow-hidden rounded-xl bg-surface p-4 transition-all hover:ring-2 hover:ring-primary-light"
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt={`${category.name} category`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <span className="relative text-sm font-semibold text-text group-hover:text-primary-light transition-colors">
                  {category.name}
                </span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      <section className="border-y border-white/5 bg-surface/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <FadeIn className="rounded-2xl border border-white/10 bg-background/70 p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-light">
                Visit Our Showroom
              </p>
              <h2 className="mt-4 text-3xl font-bold text-text">See and test before you buy</h2>
              <p className="mt-4 text-text-muted">
                Walk in, compare cue weights, inspect cloth textures, and get setup advice from our
                in-house team.
              </p>

              <dl className="mt-7 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-text">Address</dt>
                  <dd className="mt-1 text-text-muted">
                    127 Commissioner Street, Johannesburg CBD, 2001, South Africa
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-text">Contact</dt>
                  <dd className="mt-1 text-text-muted">+27 11 555 0142</dd>
                  <dd className="text-text-muted">info@8ballafrica.com</dd>
                </div>
                <div>
                  <dt className="font-semibold text-text">Hours</dt>
                  <dd className="mt-1 text-text-muted">Mon-Fri: 09:00-18:00</dd>
                  <dd className="text-text-muted">Sat: 09:00-15:00</dd>
                  <dd className="text-text-muted">Sun: Closed</dd>
                </div>
              </dl>
            </FadeIn>

            <FadeIn className="relative overflow-hidden rounded-2xl border border-white/10" delay={0.08}>
              <Image
                src="/images/home/pool-hall-2.jpg"
                alt="A billiards seller space with premium 8-ball tables"
                width={1600}
                height={1000}
                className="h-[420px] w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-sm backdrop-blur-sm">
                <p className="font-semibold text-text">In-store table demos</p>
                <p className="mt-1 text-text-muted">Try cue balance and table speed in person.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-text">Featured Products</h2>
              <p className="mt-2 text-text-muted">Handpicked by our team of experts</p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-primary-light hover:underline"
            >
              View all products &rarr;
            </Link>
          </div>
        </FadeIn>
        <StaggerChildren className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* CTA Section */}
      <section className="border-y border-white/5 bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl font-bold text-text sm:text-4xl">
              Ready to upgrade your game?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
              Join thousands of players across Africa who trust 8-ball Africa for their equipment
              needs.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-block rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-primary-light hover:scale-105"
            >
              Browse the Collection
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
