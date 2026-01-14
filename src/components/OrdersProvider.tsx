'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Order {
    id: string
    items: { name: string; quantity: number; price: number }[]
    total: number
    status: 'pending' | 'preparing' | 'ready' | 'completed'
    created_at: string
    estimated_time: number
}

interface OrdersContextType {
    orders: Order[]
    currentOrder: Order | null
    addOrder: (order: Omit<Order, 'id' | 'created_at'>) => string
    updateOrderStatus: (id: string, status: Order['status']) => void
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

const ORDERS_STORAGE_KEY = 'campus-grab-orders'

export function OrdersProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([])

    // Load orders from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(ORDERS_STORAGE_KEY)
        if (stored) {
            try {
                setOrders(JSON.parse(stored))
            } catch {
                localStorage.removeItem(ORDERS_STORAGE_KEY)
            }
        }
    }, [])

    // Save orders to localStorage
    useEffect(() => {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
    }, [orders])

    const addOrder = (orderData: Omit<Order, 'id' | 'created_at'>): string => {
        const id = 'ORD-' + Date.now().toString(36).toUpperCase()
        const newOrder: Order = {
            ...orderData,
            id,
            created_at: new Date().toISOString()
        }
        setOrders(prev => [newOrder, ...prev])

        // Simulate order status updates
        setTimeout(() => updateOrderStatus(id, 'preparing'), 3000)
        setTimeout(() => updateOrderStatus(id, 'ready'), 8000)

        return id
    }

    const updateOrderStatus = (id: string, status: Order['status']) => {
        setOrders(prev => prev.map(order =>
            order.id === id ? { ...order, status } : order
        ))
    }

    // Current order is the most recent non-completed order
    const currentOrder = orders.find(o => o.status !== 'completed') || null

    return (
        <OrdersContext.Provider value={{
            orders,
            currentOrder,
            addOrder,
            updateOrderStatus
        }}>
            {children}
        </OrdersContext.Provider>
    )
}

export function useOrders() {
    const context = useContext(OrdersContext)
    if (!context) {
        throw new Error('useOrders must be used within an OrdersProvider')
    }
    return context
}
