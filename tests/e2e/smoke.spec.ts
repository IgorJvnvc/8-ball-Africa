import { expect, test } from '@playwright/test'

test.describe('Storefront smoke tests', () => {
  test('home page loads and highlights 8-Ball Africa brand story', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: /elevate your game/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /inside the 8-ball scene/i })).toBeVisible()
  })

  test('products list supports search and pagination URL params', async ({ page }) => {
    await page.goto('/products')

    const searchInput = page.getByPlaceholder(/brand, product, keyword/i)
    await searchInput.fill('predator cue')

    await expect(page).toHaveURL(/q=predator\+cue/)

    const nextLink = page.getByRole('link', { name: /^next$/i })
    const hasNext = await nextLink.isVisible().catch(() => false)

    if (hasNext) {
      await nextLink.click()
      await expect(page).toHaveURL(/page=2/)
    }
  })

  test('admin pages redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
  })

  test('admin categories page is available for admin users', async ({ page }) => {
    await page.goto('/login')

    await page.getByPlaceholder(/you@example.com/i).fill('admin@8ballafrica.com')
    await page.getByLabel(/^password$/i).fill('admin123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/$/)

    await page.goto('/admin/categories')
    await expect(page).toHaveURL(/\/admin\/categories/)
    await expect(page.getByRole('heading', { name: /^categories$/i })).toBeVisible()
  })
})
