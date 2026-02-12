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
    payment_method: string
    completed_at?: string  // For analytics timing
    admin_id?: string       // Scopes order to a specific canteen
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
// Token generation logic moved to database function 'create_order'

export function OrdersProvider({ children, adminId }: { children: ReactNode; adminId?: string }) {
    const [orders, setOrders] = useState<Order[]>([])

    // Load orders from Supabase on mount
    useEffect(() => {
        const loadOrders = async () => {
            if (supabase) {
                try {
                    let query = supabase
                        .from('orders')
                        .select('*')
                        .order('created_at', { ascending: false })

                    // If adminId provided, filter by it
                    if (adminId) {
                        query = query.eq('admin_id', adminId)
                    }

                    const { data, error } = await query

                    if (!error && data) {
                        setOrders(data as Order[])
                        // Clear stale localStorage since Supabase is source of truth
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
                    // Only process events for this admin's orders
                    if (adminId && newOrder.admin_id !== adminId) return
                    setOrders(prev => {
                        if (prev.some(o => o.id === newOrder.id)) return prev
                        return [newOrder, ...prev]
                    })
                })
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
                    const updated = payload.new as Order
                    if (adminId && updated.admin_id !== adminId) return
                    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
                })
                .subscribe()

            return () => {
                supabase!.removeChannel(channel)
            }
        }
    }, [adminId])

    // Save to localStorage only if Supabase is not available
    useEffect(() => {
        if (!supabase && orders.length > 0) {
            localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
        }
    }, [orders])

    const addOrder = useCallback(async (orderData: Omit<Order, 'id' | 'token_number' | 'created_at'>): Promise<Order> => {
        // Fallback ID and token for optimistic update / offline
        // Note: Real token number will be assigned by server
        const tempId = 'ORD-' + Date.now().toString(36).toUpperCase()
        const tempToken = '#PEND'

        const newOrder: Order = {
            ...orderData,
            id: tempId,
            token_number: tempToken,
            created_at: new Date().toISOString()
        }

        // Add optimistically (will be updated by Realtime or response)
        setOrders(prev => [newOrder, ...prev])

        if (supabase) {
            try {
                // Use RPC call for atomic token generation
                const rpcParams = {
                    p_id: tempId, // Pass the ID we generated
                    p_admin_id: newOrder.admin_id || adminId,
                    p_items: newOrder.items,
                    p_total: newOrder.total,
                    p_estimated_time: newOrder.estimated_time,
                    p_status: newOrder.status,
                    p_payment_method: newOrder.payment_method
                }

                console.log('Attempting create_order RPC via addOrder. Params:', JSON.stringify(rpcParams, null, 2))

                if (!rpcParams.p_admin_id) {
                    console.error('ABORTING RPC: Missing p_admin_id (canteen ID).')
                    throw new Error('Missing admin_id/canteen_id. Cannot place order.')
                }

                const { data, error } = await supabase.rpc('create_order', rpcParams)

                if (error) {
                    console.error('Supabase create_order RPC error:', error)
                    // Revert optimistic update on error
                    setOrders(prev => prev.filter(o => o.id !== tempId))
                    throw error
                }

                if (data) {
                    // Replace temp order with real one from DB
                    const confirmOrder = data as Order
                    setOrders(prev => prev.map(o => o.id === tempId ? confirmOrder : o))
                    return confirmOrder
                }
            } catch (err: any) {
                console.error('Supabase order save failed:', err)
                if (err?.message) console.error('Error Message:', err.message)
                if (err?.details) console.error('Error Details:', err.details)

                // Revert optimistic update
                setOrders(prev => prev.filter(o => o.id !== tempId))
                throw err // Re-throw to caller so UI knows it failed
            }
        }

        // If Supabase is not available (shouldn't happen in production for this critical path), throw error?
        // Or return newOrder if offline mode is truly supported (but RPC implies online).
        // For now, if supabase exists but we fell through (no data?), it's an error.
        throw new Error('Failed to create order on server.')
    }, [adminId])

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
