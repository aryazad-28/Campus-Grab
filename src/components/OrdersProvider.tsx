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

// Token generation is now handled server-side by the database trigger
// See supabase/schema.sql for implementation


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
        // For concurrent safety, we'll use the Supabase Edge Function or direct insert
        // The database trigger will auto-generate the token number

        if (supabase) {
            try {
                // Method 1: Use Edge Function (recommended for production)
                // Uncomment this block when Edge Function is deployed
                /*
                const { data: functionData, error: functionError } = await supabase.functions.invoke('create-order', {
                    body: {
                        items: orderData.items,
                        total: orderData.total,
                        estimated_time: orderData.estimated_time,
                        status: orderData.status,
                        admin_id: orderData.admin_id || adminId,
                    }
                });

                if (functionError) throw functionError;
                if (!functionData?.order) throw new Error('No order returned from function');
                
                const newOrder = functionData.order as Order;
                setOrders(prev => [newOrder, ...prev]);
                return newOrder;
                */

                // Method 2: Direct insert (fallback - database trigger generates token)
                const insertData: Record<string, unknown> = {
                    items: orderData.items,
                    total: orderData.total,
                    estimated_time: orderData.estimated_time,
                    status: orderData.status,
                    completed_at: orderData.completed_at || null
                }

                // Include admin_id if provided (from order data or prop)
                if (orderData.admin_id) {
                    insertData.admin_id = orderData.admin_id
                } else if (adminId) {
                    insertData.admin_id = adminId
                }

                // Retry logic for concurrent safety
                let retries = 3;
                let lastError: any = null;

                while (retries > 0) {
                    const { data, error } = await supabase
                        .from('orders')
                        .insert(insertData)
                        .select()
                        .single()

                    if (!error && data) {
                        const newOrder = data as Order;
                        // Add to local state optimistically
                        setOrders(prev => {
                            // Prevent duplicates
                            if (prev.some(o => o.id === newOrder.id)) return prev;
                            return [newOrder, ...prev];
                        });
                        return newOrder;
                    }

                    lastError = error;

                    // If it's a unique constraint violation, retry with exponential backoff
                    if (error?.code === '23505') { // PostgreSQL unique violation
                        retries--;
                        if (retries > 0) {
                            // Exponential backoff: 100ms, 200ms, 400ms
                            await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, 3 - retries)));
                            continue;
                        }
                    }

                    // For other errors, don't retry
                    throw error;
                }

                throw lastError || new Error('Failed to create order after retries');

            } catch (err) {
                console.error('Supabase order save failed:', err);
                throw err; // Propagate error to caller
            }
        }

        // Fallback to client-side ID generation (only if Supabase not available)
        const id = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 9);
        const token_number = `#OFFLINE-${Date.now()}`;
        const newOrder: Order = {
            ...orderData,
            id,
            token_number,
            created_at: new Date().toISOString()
        };

        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
    }, [adminId]);

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
