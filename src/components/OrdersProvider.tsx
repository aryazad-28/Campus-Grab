'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

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
    addOrder: (order: Omit<Order, 'id' | 'token_number' | 'created_at'>) => Promise<Order>
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
        const storedCounter = localStorage.getItem(ORDER_COUNTER_KEY)
        counter = storedCounter ? parseInt(storedCounter, 10) + 1 : 1
    } else {
        localStorage.setItem(ORDER_DATE_KEY, today)
        counter = 1
    }

    localStorage.setItem(ORDER_COUNTER_KEY, counter.toString())
    return `#${String(counter).padStart(4, '0')}`
}

export function OrdersProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([])

    // Load orders from Supabase on mount
    useEffect(() => {
        const loadOrders = async () => {
            if (supabase) {
                try {
                    const { data, error } = await supabase
                        .from('orders')
                        .select('*')
                        .order('created_at', { ascending: false })

                    if (!error && data) {
                        setOrders(data as Order[])
                        // Clear stale localStorage since Supabase is the source of truth
                        localStorage.removeItem(ORDERS_STORAGE_KEY)
                        return
                    }
                } catch (err) {
                    console.error('Supabase orders fetch error:', err)
                }
            }

            // Fallback to localStorage ONLY if Supabase failed
            const stored = localStorage.getItem(ORDERS_STORAGE_KEY)
            if (stored) {
                try {
                    setOrders(JSON.parse(stored))
                } catch {
                    localStorage.removeItem(ORDERS_STORAGE_KEY)
                }
            }
        }

        loadOrders()

        // Real-time subscription for orders
        if (supabase) {
            const channel = supabase
                .channel('orders-realtime')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
                    const newOrder = payload.new as Order
                    setOrders(prev => {
                        // Avoid duplicates (we already added it optimistically)
                        if (prev.some(o => o.id === newOrder.id)) return prev
                        return [newOrder, ...prev]
                    })
                })
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
                    const updated = payload.new as Order
                    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
                })
                .subscribe()

            return () => {
                supabase!.removeChannel(channel)
            }
        }
    }, [])

    // Save to localStorage only if Supabase is not available
    useEffect(() => {
        if (!supabase && orders.length > 0) {
            localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
        }
    }, [orders])

    const addOrder = useCallback(async (orderData: Omit<Order, 'id' | 'token_number' | 'created_at'>): Promise<Order> => {
        const id = 'ORD-' + Date.now().toString(36).toUpperCase()
        const token_number = generateTokenNumber()
        const newOrder: Order = {
            ...orderData,
            id,
            token_number,
            created_at: new Date().toISOString()
        }

        // Add optimistically to local state
        setOrders(prev => [newOrder, ...prev])

        // Save to Supabase
        if (supabase) {
            try {
                const { error } = await supabase.from('orders').insert({
                    id: newOrder.id,
                    token_number: newOrder.token_number,
                    items: newOrder.items,
                    total: newOrder.total,
                    estimated_time: newOrder.estimated_time,
                    status: newOrder.status,
                    created_at: newOrder.created_at,
                    completed_at: newOrder.completed_at || null
                })
                if (error) {
                    console.error('Supabase order insert error:', error)
                }
            } catch (err) {
                console.error('Supabase order save failed:', err)
            }
        }

        return newOrder
    }, [])

    const updateOrderStatus = useCallback((id: string, status: Order['status']) => {
        const completed_at = status === 'completed' ? new Date().toISOString() : undefined

        // Update locally first
        setOrders(prev => prev.map(order => {
            if (order.id === id) {
                const updatedOrder = { ...order, status }
                if (completed_at && !order.completed_at) {
                    updatedOrder.completed_at = completed_at
                }
                return updatedOrder
            }
            return order
        }))

        // Update in Supabase
        if (supabase) {
            const updateData: Record<string, unknown> = { status }
            if (completed_at) {
                updateData.completed_at = completed_at
            }

            supabase.from('orders').update(updateData).eq('id', id).then(({ error }) => {
                if (error) console.error('Supabase order status update error:', error)
            })
        }
    }, [])

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
