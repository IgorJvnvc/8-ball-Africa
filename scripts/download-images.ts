import { PrismaClient } from '@prisma/client'
import { loadEnvConfig } from '@next/env'
import fs from 'node:fs/promises'
import path from 'node:path'

loadEnvConfig(process.cwd())

type UnsplashPhoto = {
  id: string
  urls: {
    raw: string
    regular: string
  }
  alt_description: string | null
  description: string | null
  user: {
    name: string
    username: string
    links: {
      html: string
    }
  }
  links: {
    html: string
  }
}

type ProductRecord = {
  id: string
  name: string
  slug: string
  brand: string
  category: {
    name: string
    slug: string
  }
  images: Array<{
    url: string
    sortOrder: number
  }>
}

type DownloadTarget = {
  product: ProductRecord
  imageUrl: string
  imageIndex: number
}

type AttributionEntry = {
  file: string
  product: string
  productSlug: string
  brand: string
  category: string
  unsplashPhotoId: string
  unsplashPhotoUrl: string
  photographerName: string
  photographerUrl: string
  description: string | null
  status: 'downloaded' | 'skipped'
  downloadedAt: string
}

const prisma = new PrismaClient()
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
const SEARCH_REQUEST_BUDGET = Number(process.env.UNSPLASH_SEARCH_BUDGET ?? 45)

const CATEGORY_QUERIES: Record<string, string[]> = {
  'pool-tables': ['professional pool table', 'billiard table interior'],
  cues: ['pool cue close up', 'billiard cue on table'],
  balls: ['billiard balls rack', 'pool balls close up'],
  chalk: ['billiard chalk cue tip', 'pool chalk cube'],
  gloves: ['billiard glove', 'pool player glove'],
  accessories: ['billiards accessories', 'pool cue case and rack'],
  'cloth-rails': ['pool table felt', 'billiard cloth and rails'],
}

const args = process.argv.slice(2)
const overwrite = args.includes('--overwrite')
const limitArg = args.find((arg) => arg.startsWith('--limit='))
const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined

let searchRequestCount = 0

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function dedupePhotos(photos: UnsplashPhoto[]): UnsplashPhoto[] {
  const seen = new Set<string>()
  const unique: UnsplashPhoto[] = []

  for (const photo of photos) {
    if (seen.has(photo.id)) {
      continue
    }
    seen.add(photo.id)
    unique.push(photo)
  }

  return unique
}

async function searchPhotos(query: string, perPage = 30): Promise<UnsplashPhoto[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error('Missing UNSPLASH_ACCESS_KEY in environment.')
  }

  if (searchRequestCount >= SEARCH_REQUEST_BUDGET) {
    return []
  }

  const searchUrl = new URL('https://api.unsplash.com/search/photos')
  searchUrl.searchParams.set('query', query)
  searchUrl.searchParams.set('per_page', String(perPage))
  searchUrl.searchParams.set('orientation', 'landscape')
  searchUrl.searchParams.set('content_filter', 'high')

  const response = await fetch(searchUrl, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      'Accept-Version': 'v1',
    },
  })

  searchRequestCount += 1

  if (response.status === 403 || response.status === 429) {
    const remaining = response.headers.get('x-ratelimit-remaining')
    throw new Error(
      `Unsplash API rate limit reached (status ${response.status}, remaining ${remaining ?? 'unknown'}).`
    )
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Unsplash search failed (${response.status}): ${text}`)
  }

  const body = (await response.json()) as { results?: UnsplashPhoto[] }
  const remaining = response.headers.get('x-ratelimit-remaining')
  console.log(`search ${searchRequestCount}/${SEARCH_REQUEST_BUDGET}: "${query}" (${remaining ?? '?' } left)`)

  return body.results ?? []
}

function getPrimaryCategoryForBrand(products: ProductRecord[], brand: string): string {
  const counts = new Map<string, number>()

  for (const product of products) {
    if (product.brand !== brand) {
      continue
    }
    const key = product.category.slug
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  let selected = 'accessories'
  let maxCount = 0
  for (const [slug, count] of counts) {
    if (count > maxCount) {
      selected = slug
      maxCount = count
    }
  }

  return selected
}

function withImageSize(urlString: string): string {
  const url = new URL(urlString)
  url.searchParams.set('w', '1200')
  url.searchParams.set('h', '800')
  url.searchParams.set('fit', 'crop')
  url.searchParams.set('crop', 'entropy')
  url.searchParams.set('fm', 'jpg')
  url.searchParams.set('q', '80')
  return url.toString()
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function pickNextPhoto(
  key: string,
  pool: UnsplashPhoto[],
  cursors: Map<string, number>,
  usedInProduct: Set<string>,
  usedGlobally: Set<string>
): UnsplashPhoto {
  if (pool.length === 0) {
    throw new Error(`Cannot pick a photo from an empty pool: ${key}`)
  }

  const cursor = cursors.get(key) ?? 0

  for (let offset = 0; offset < pool.length; offset++) {
    const index = (cursor + offset) % pool.length
    const candidate = pool[index]
    if (!usedInProduct.has(candidate.id) && !usedGlobally.has(candidate.id)) {
      cursors.set(key, index + 1)
      return candidate
    }
  }

  for (let offset = 0; offset < pool.length; offset++) {
    const index = (cursor + offset) % pool.length
    const candidate = pool[index]
    if (!usedInProduct.has(candidate.id)) {
      cursors.set(key, index + 1)
      return candidate
    }
  }

  for (let offset = 0; offset < pool.length; offset++) {
    const index = (cursor + offset) % pool.length
    const candidate = pool[index]
    if (!usedGlobally.has(candidate.id)) {
      cursors.set(key, index + 1)
      return candidate
    }
  }

  const fallbackIndex = cursor % pool.length
  const fallback = pool[fallbackIndex]
  cursors.set(key, fallbackIndex + 1)
  return fallback
}

async function getProducts(): Promise<ProductRecord[]> {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      brand: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      images: {
        select: {
          url: true,
          sortOrder: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return products
}

async function main() {
  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error('UNSPLASH_ACCESS_KEY is not set. Add it to .env or provide it in your shell.')
  }

  const products = await getProducts()

  if (products.length === 0) {
    console.log('No products found. Seed the database first.')
    return
  }

  const targets: DownloadTarget[] = products.flatMap((product) =>
    product.images
      .filter((image) => image.url.startsWith('/images/products/'))
      .map((image, index) => ({
        product,
        imageUrl: image.url,
        imageIndex: index,
      }))
  )

  if (targets.length === 0) {
    console.log('No product image paths found under /images/products/.')
    return
  }

  const limitedTargets = limit && Number.isFinite(limit) ? targets.slice(0, limit) : targets

  const uniqueCategorySlugs = [...new Set(products.map((product) => product.category.slug))]
  const categoryPools = new Map<string, UnsplashPhoto[]>()

  for (const slug of uniqueCategorySlugs) {
    const queries = CATEGORY_QUERIES[slug] ?? ['billiards equipment']
    const collected: UnsplashPhoto[] = []

    for (const query of queries) {
      if (searchRequestCount >= SEARCH_REQUEST_BUDGET) {
        break
      }

      const photos = await searchPhotos(query, 30)
      collected.push(...photos)

      if (collected.length >= 30) {
        break
      }

      await sleep(250)
    }

    categoryPools.set(slug, dedupePhotos(collected))
  }

  const brandCounts = new Map<string, number>()
  for (const product of products) {
    if (product.brand.toLowerCase() === 'generic') {
      continue
    }
    brandCounts.set(product.brand, (brandCounts.get(product.brand) ?? 0) + 1)
  }

  const brandsByFrequency = [...brandCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([brand]) => brand)

  const brandPools = new Map<string, UnsplashPhoto[]>()

  for (const brand of brandsByFrequency) {
    if (searchRequestCount >= SEARCH_REQUEST_BUDGET) {
      break
    }

    const primaryCategorySlug = getPrimaryCategoryForBrand(products, brand)
    const categoryHint = (CATEGORY_QUERIES[primaryCategorySlug] ?? ['billiards equipment'])[0]
    const query = `${brand} ${categoryHint}`

    const photos = await searchPhotos(query, 20)
    brandPools.set(brand, dedupePhotos(photos))
    await sleep(250)
  }

  let globalPool = dedupePhotos(
    Array.from(categoryPools.values()).flatMap((pool) => pool).concat(Array.from(brandPools.values()).flatMap((pool) => pool))
  )

  if (globalPool.length === 0 && searchRequestCount < SEARCH_REQUEST_BUDGET) {
    globalPool = await searchPhotos('billiards equipment', 30)
  }

  if (globalPool.length === 0) {
    throw new Error('Could not fetch any Unsplash photos. Check API key and network connection.')
  }

  const publicRoot = path.resolve(process.cwd(), 'public')
  const cursors = new Map<string, number>()
  const attributions: AttributionEntry[] = []

  let downloaded = 0
  let skipped = 0
  let failed = 0
  const usedPhotoIdsByProduct = new Map<string, Set<string>>()
  const globallyUsedPhotoIds = new Set<string>()

  console.log(`Preparing ${limitedTargets.length} image files...`)

  for (const target of limitedTargets) {
    const relativeImagePath = target.imageUrl.replace(/^\/+/, '')
    const outputPath = path.resolve(publicRoot, relativeImagePath)

    if (!outputPath.startsWith(publicRoot)) {
      console.warn(`Skipping invalid path outside public/: ${target.imageUrl}`)
      failed += 1
      continue
    }

    const alreadyExists = await exists(outputPath)
    if (alreadyExists && !overwrite) {
      skipped += 1
      continue
    }

    const brandPool = brandPools.get(target.product.brand) ?? []
    const categoryPool = categoryPools.get(target.product.category.slug) ?? []
    const usedInProduct = usedPhotoIdsByProduct.get(target.product.id) ?? new Set<string>()
    usedPhotoIdsByProduct.set(target.product.id, usedInProduct)

    let selectedPhoto: UnsplashPhoto | null = null

    if (target.imageIndex === 0 && brandPool.length > 0) {
      selectedPhoto = pickNextPhoto(
        `brand:${target.product.brand}`,
        brandPool,
        cursors,
        usedInProduct,
        globallyUsedPhotoIds
      )
    }

    if (!selectedPhoto && categoryPool.length > 0) {
      selectedPhoto = pickNextPhoto(
        `category:${target.product.category.slug}`,
        categoryPool,
        cursors,
        usedInProduct,
        globallyUsedPhotoIds
      )
    }

    if (!selectedPhoto && brandPool.length > 0) {
      selectedPhoto = pickNextPhoto(
        `brand:${target.product.brand}`,
        brandPool,
        cursors,
        usedInProduct,
        globallyUsedPhotoIds
      )
    }

    if (!selectedPhoto) {
      selectedPhoto = pickNextPhoto('global', globalPool, cursors, usedInProduct, globallyUsedPhotoIds)
    }

    usedInProduct.add(selectedPhoto.id)

    const imageDownloadUrl = withImageSize(selectedPhoto.urls.raw || selectedPhoto.urls.regular)

    try {
      const response = await fetch(imageDownloadUrl)
      if (!response.ok) {
        throw new Error(`Image download failed (${response.status})`)
      }

      const data = Buffer.from(await response.arrayBuffer())
      await fs.mkdir(path.dirname(outputPath), { recursive: true })
      await fs.writeFile(outputPath, data)

      downloaded += 1
      globallyUsedPhotoIds.add(selectedPhoto.id)
      attributions.push({
        file: relativeImagePath,
        product: target.product.name,
        productSlug: target.product.slug,
        brand: target.product.brand,
        category: target.product.category.name,
        unsplashPhotoId: selectedPhoto.id,
        unsplashPhotoUrl: selectedPhoto.links.html,
        photographerName: selectedPhoto.user.name,
        photographerUrl: selectedPhoto.user.links.html,
        description: selectedPhoto.description ?? selectedPhoto.alt_description,
        status: 'downloaded',
        downloadedAt: new Date().toISOString(),
      })
    } catch (error) {
      failed += 1
      console.warn(`Failed for ${target.product.name} -> ${target.imageUrl}`)
      console.warn(error)
    }

    await sleep(150)
  }

  const attributionPath = path.join(publicRoot, 'images', 'products', 'unsplash-attribution.json')
  await fs.mkdir(path.dirname(attributionPath), { recursive: true })
  await fs.writeFile(attributionPath, JSON.stringify(attributions, null, 2) + '\n', 'utf-8')

  console.log('Done.')
  console.log(`- Search requests used: ${searchRequestCount}/${SEARCH_REQUEST_BUDGET}`)
  console.log(`- Downloaded: ${downloaded}`)
  console.log(`- Skipped existing: ${skipped}`)
  console.log(`- Failed: ${failed}`)
  console.log(`- Attribution file: ${path.relative(process.cwd(), attributionPath)}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
