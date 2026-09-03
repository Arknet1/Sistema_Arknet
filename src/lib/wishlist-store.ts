'use client'

import { useState, useEffect } from 'react'
import { StoreProduct } from './data-store'

const WISHLIST_STORAGE_KEY = 'arknet_wishlist_items_v1'

class WishlistManager {
  private items: StoreProduct[] = []
  private listeners: Set<() => void> = new Set()

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage()
      window.addEventListener('storage', (e) => {
        if (e.key === WISHLIST_STORAGE_KEY) {
          this.loadFromStorage()
        }
      })
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
      if (stored) {
        this.items = JSON.parse(stored)
      } else {
        this.items = []
      }
    } catch {
      this.items = []
    }
    this.notify()
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(this.items))
    } catch (e) {
      console.error('Failed to save wishlist to storage', e)
    }
    this.notify()
  }

  private notify() {
    this.listeners.forEach((fn) => fn())
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public getItems(): StoreProduct[] {
    return this.items
  }

  public isInWishlist(productId: string): boolean {
    return this.items.some((p) => p.id === productId)
  }

  public toggleItem(product: StoreProduct): boolean {
    const exists = this.isInWishlist(product.id)
    if (exists) {
      this.items = this.items.filter((p) => p.id !== product.id)
      this.saveToStorage()
      return false
    } else {
      this.items = [product, ...this.items]
      this.saveToStorage()
      return true
    }
  }

  public removeItem(productId: string): void {
    this.items = this.items.filter((p) => p.id !== productId)
    this.saveToStorage()
  }

  public clear(): void {
    this.items = []
    this.saveToStorage()
  }
}

export const wishlistStore = new WishlistManager()

export function useWishlist() {
  const [items, setItems] = useState<StoreProduct[]>([])

  useEffect(() => {
    setItems(wishlistStore.getItems())
    const unsubscribe = wishlistStore.subscribe(() => {
      setItems([...wishlistStore.getItems()])
    })
    return () => unsubscribe()
  }, [])

  return {
    items,
    count: items.length,
    isInWishlist: (productId: string) => wishlistStore.isInWishlist(productId),
    toggleWishlist: (product: StoreProduct) => wishlistStore.toggleItem(product),
    removeFromWishlist: (productId: string) => wishlistStore.removeItem(productId),
    clearWishlist: () => wishlistStore.clear(),
  }
}
