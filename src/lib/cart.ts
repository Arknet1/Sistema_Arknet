import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProductVariant } from './data-store'

export type Product = {
  id: string
  name: string
  description: string
  /** `null` = sob consulta */
  price: number | null
  image?: string
  category?: string
  inStock?: boolean
  featured?: boolean
  sku?: string
  variants?: ProductVariant[]
}

export type CartItem = {
  id: string // Identificador único do item no carrinho: `${product.id}` ou `${product.id}_${variant.id}`
  product: Product
  variant?: ProductVariant
  variantLabel?: string // Ex: "16GB RAM / 512GB SSD / Prata"
  variantSku?: string // Ex: "HP-15-16-512-SLV"
  selectedOptions?: Record<string, string> // Ex: { "RAM": "16GB", "SSD": "512GB", "Cor": "Prata" }
  price: number | null // Preço unitário efetivo (variante ou base)
  quantity: number
}

export interface AddItemOptions {
  variant?: ProductVariant
  variantLabel?: string
  variantSku?: string
  selectedOptions?: Record<string, string>
  quantity?: number
  price?: number | null
}

interface CartState {
  items: CartItem[]
  /** `null` quando algum item tem preço sob consulta */
  total: number | null
  itemCount: number
  addItem: (product: Product, optionsOrVariant?: AddItemOptions | ProductVariant, quantity?: number) => void
  removeItem: (itemIdOrProductId: string) => void
  updateQuantity: (itemIdOrProductId: string, quantity: number) => void
  clearCart: () => void
}

function getItemEffectivePrice(item: CartItem): number | null {
  if (item.price !== undefined) return item.price
  if (item.variant && item.variant.price !== undefined && item.variant.price !== null) return item.variant.price
  return item.product.price
}

function calculateTotal(items: CartItem[]): number | null {
  if (items.some((item) => getItemEffectivePrice(item) == null)) return null
  return items.reduce((sum, item) => sum + (getItemEffectivePrice(item) as number) * item.quantity, 0)
}

function getCartItemId(product: Product, variant?: ProductVariant): string {
  if (variant && variant.id) {
    return `${product.id}_${variant.id}`
  }
  return product.id
}

const isClient = typeof window !== 'undefined'

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (product: Product, optionsOrVariant?: AddItemOptions | ProductVariant, qtyParam?: number) => {
        let variant: ProductVariant | undefined = undefined
        let variantLabel: string | undefined = undefined
        let variantSku: string | undefined = undefined
        let selectedOptions: Record<string, string> | undefined = undefined
        let quantityToAdd = typeof qtyParam === 'number' && qtyParam > 0 ? qtyParam : 1
        let customPrice: number | null | undefined = undefined

        if (optionsOrVariant) {
          if ('sku' in optionsOrVariant && 'stock' in optionsOrVariant) {
            // É um ProductVariant direto
            variant = optionsOrVariant as ProductVariant
            variantSku = variant.sku
            if (variant.options && variant.options.length > 0) {
              variantLabel = variant.options.map(o => o.value).join(' / ')
            }
          } else {
            // É um AddItemOptions
            const opts = optionsOrVariant as AddItemOptions
            variant = opts.variant
            variantLabel = opts.variantLabel
            variantSku = opts.variantSku || opts.variant?.sku
            selectedOptions = opts.selectedOptions
            if (typeof opts.quantity === 'number' && opts.quantity > 0) {
              quantityToAdd = opts.quantity
            }
            if (opts.price !== undefined) {
              customPrice = opts.price
            }
          }
        }

        const effectivePrice = customPrice !== undefined ? customPrice : (variant?.price ?? product.price)
        const cartItemId = getCartItemId(product, variant)
        const items = get().items
        const existingIndex = items.findIndex(item => item.id === cartItemId || (!item.id && item.product.id === cartItemId))

        let updatedItems: CartItem[]
        if (existingIndex >= 0) {
          updatedItems = items.map((item, idx) =>
            idx === existingIndex
              ? { ...item, quantity: item.quantity + quantityToAdd, price: effectivePrice }
              : item
          )
        } else {
          const newItem: CartItem = {
            id: cartItemId,
            product,
            variant,
            variantLabel,
            variantSku,
            selectedOptions,
            price: effectivePrice,
            quantity: quantityToAdd,
          }
          updatedItems = [...items, newItem]
        }

        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        })
      },

      removeItem: (idOrKey: string) => {
        const items = get().items
        const filteredItems = items.filter(item => item.id !== idOrKey && item.product.id !== idOrKey)
        set({
          items: filteredItems,
          total: calculateTotal(filteredItems),
          itemCount: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
        })
      },

      updateQuantity: (idOrKey: string, quantity: number) => {
        const items = get().items
        const updatedItems = items
          .map(item =>
            (item.id === idOrKey || item.product.id === idOrKey)
              ? { ...item, quantity: Math.max(0, quantity) }
              : item
          )
          .filter(item => item.quantity > 0)

        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
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
