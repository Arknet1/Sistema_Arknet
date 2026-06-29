import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Product = {
  id: string
  name: string
  description: string
  /** `null` = sob consulta */
  price: number | null
  image?: string
  category?: string
  inStock?: boolean
}

export type CartItem = {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  /** `null` quando algum item tem preço sob consulta */
  total: number | null
  itemCount: number
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

function calculateTotal(items: CartItem[]): number | null {
  if (items.some((item) => item.product.price == null)) return null
  return items.reduce((sum, item) => sum + (item.product.price as number) * item.quantity, 0)
}

const isClient = typeof window !== 'undefined'

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (product: Product) => {
        const items = get().items
        const existingItem = items.find(item => item.product.id === product.id)

        if (existingItem) {
          const updatedItems = items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
          set({
            items: updatedItems,
            total: calculateTotal(updatedItems),
            itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
          })
        } else {
          const newItems = [...items, { product, quantity: 1 }]
          set({
            items: newItems,
            total: calculateTotal(newItems),
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0)
          })
        }
      },

      removeItem: (id: string) => {
        const items = get().items
        const filteredItems = items.filter(item => item.product.id !== id)
        set({
          items: filteredItems,
          total: calculateTotal(filteredItems),
          itemCount: filteredItems.reduce((sum, item) => sum + item.quantity, 0)
        })
      },

      updateQuantity: (id: string, quantity: number) => {
        const items = get().items
        const updatedItems = items
          .map(item =>
            item.product.id === id
              ? { ...item, quantity: Math.max(0, quantity) }
              : item
          )
          .filter(item => item.quantity > 0)

        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        })
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 })
      },
    }),
    {
      name: 'arknet-cart',
      skipHydration: true,
      storage: {
        getItem: (name) => {
          if (!isClient) return null
          const str = localStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: (name, value) => {
          if (!isClient) return
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          if (!isClient) return
          localStorage.removeItem(name)
        },
      },
    }
  )
)
