import { describe, it, expect } from 'vitest'

describe('Cart Store', () => {
  it('should sync user and clear cart when user changes', async () => {
    const { useCartStore } = await import('@/stores/cart-store')
    const store = useCartStore.getState()

    store.clearCart()
    store.syncSessionUser('user-1')
    store.addItem({
      id: '3',
      productId: '3',
      name: 'Carry Case',
      price: 45,
      image: '/test.jpg',
      stock: 5,
    })

    expect(useCartStore.getState().items).toHaveLength(1)

    store.syncSessionUser('user-2')

    expect(useCartStore.getState().items).toHaveLength(0)
    expect(useCartStore.getState().sessionUserId).toBe('user-2')
  })
})

describe('Cart Store', () => {
  it('should add items to cart', async () => {
    const { useCartStore } = await import('@/stores/cart-store')
    const store = useCartStore.getState()

    store.addItem({
      id: '1',
      productId: '1',
      name: 'Test Cue',
      price: 100,
      image: '/test.jpg',
      stock: 10,
    })

    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].name).toBe('Test Cue')
    expect(useCartStore.getState().items[0].quantity).toBe(1)
  })

  it('should increment quantity for existing items', async () => {
    const { useCartStore } = await import('@/stores/cart-store')
    const store = useCartStore.getState()

    store.addItem({
      id: '1',
      productId: '1',
      name: 'Test Cue',
      price: 100,
      image: '/test.jpg',
      stock: 10,
    })

    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  it('should remove items from cart', async () => {
    const { useCartStore } = await import('@/stores/cart-store')
    const store = useCartStore.getState()

    store.removeItem('1')
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('should calculate total price', async () => {
    const { useCartStore } = await import('@/stores/cart-store')
    const store = useCartStore.getState()

    store.addItem({
      id: '1',
      productId: '1',
      name: 'Item 1',
      price: 50,
      image: '/test.jpg',
      stock: 10,
    })
    store.addItem({
      id: '2',
      productId: '2',
      name: 'Item 2',
      price: 75,
      image: '/test.jpg',
      stock: 5,
    })

    expect(store.totalPrice()).toBe(125)
  })

  it('should clear cart', async () => {
    const { useCartStore } = await import('@/stores/cart-store')
    const store = useCartStore.getState()

    store.clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})
