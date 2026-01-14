'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CartItem } from '@/lib/supabase'

interface CartContextType {
    items: CartItem[]
    addToCart: (item: Omit<CartItem, 'quantity'>) => void
    removeFromCart: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    cartTotal: number
    cartCount: number
    maxEta: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'campus-grab-cart'

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isHydrated, setIsHydrated] = useState(false)

    // Load cart from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(CART_STORAGE_KEY)
        if (stored) {
            try {
                setItems(JSON.parse(stored))
            } catch {
                localStorage.removeItem(CART_STORAGE_KEY)
            }
        }
        setIsHydrated(true)
    }, [])

    // Save cart to localStorage when items change
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
        }
    }, [items, isHydrated])

    const addToCart = (item: Omit<CartItem, 'quantity'>) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id)
            if (existing) {
                return prev.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                )
            }
            return [...prev, { ...item, quantity: 1 }]
        })
    }

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id))
    }

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id)
            return
        }
        setItems(prev => prev.map(i =>
            i.id === id ? { ...i, quantity } : i
        ))
    }

    const clearCart = () => {
        setItems([])
    }

    const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const maxEta = items.length > 0 ? Math.max(...items.map(i => i.eta_minutes)) : 0

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount,
            maxEta
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
