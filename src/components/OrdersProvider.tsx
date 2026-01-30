'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Order {
    id: string
    token_number: string  // Daily sequential: "#0001"
    items: { name: string; quantity: number; price: number }[]
    total: number
    status: 'pending' | 'preparing' | 'ready' | 'completed'
    created_at: string
    estimated_time: number
    completed_at?: string  // For analytics timing
}

interface OrdersContextType {
    orders: Order[]
    currentOrder: Order | null
    addOrder: (order: Omit<Order, 'id' | 'token_number' | 'created_at'>) => string
    updateOrderStatus: (id: string, status: Order['status']) => void
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

const ORDERS_STORAGE_KEY = 'campus-grab-orders'
const ORDER_COUNTER_KEY = 'campus-grab-order-counter'
const ORDER_DATE_KEY = 'campus-grab-order-date'

// Get today's date as YYYY-MM-DD string
function getTodayDateString(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// Generate daily sequential token number
function generateTokenNumber(): string {
    const today = getTodayDateString()
    const storedDate = localStorage.getItem(ORDER_DATE_KEY)
    let counter = 1

    if (storedDate === today) {
        // Same day, increment counter
        const storedCounter = localStorage.getItem(ORDER_COUNTER_KEY)
        counter = storedCounter ? parseInt(storedCounter, 10) + 1 : 1
    } else {
        // New day, reset counter
        localStorage.setItem(ORDER_DATE_KEY, today)
        counter = 1
    }

    localStorage.setItem(ORDER_COUNTER_KEY, counter.toString())
    return `#${String(counter).padStart(4, '0')}`
}

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

    const addOrder = (orderData: Omit<Order, 'id' | 'token_number' | 'created_at'>): string => {
        const id = 'ORD-' + Date.now().toString(36).toUpperCase()
        const token_number = generateTokenNumber()
        const newOrder: Order = {
            ...orderData,
            id,
            token_number,
            created_at: new Date().toISOString()
        }
        setOrders(prev => [newOrder, ...prev])
        return id
    }

    const updateOrderStatus = (id: string, status: Order['status']) => {
        setOrders(prev => prev.map(order => {
            if (order.id === id) {
                const updatedOrder = { ...order, status }
                // Track completion time for analytics
                if (status === 'completed' && !order.completed_at) {
                    updatedOrder.completed_at = new Date().toISOString()
                }
                return updatedOrder
            }
            return order
        }))
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
