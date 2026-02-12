'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { supabase, MenuItem } from '@/lib/supabase'

const STORAGE_KEY = 'campus-grab-menu'

interface MenuContextType {
    items: MenuItem[]
    isLoading: boolean
    addItem: (item: Omit<MenuItem, 'id'>) => void
    deleteItem: (id: string) => void
    toggleAvailability: (id: string) => void
    updateItem: (id: string, updates: Partial<MenuItem>) => void
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export function MenuProvider({ children, adminId }: { children: ReactNode; adminId?: string }) {
    const [items, setItems] = useState<MenuItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Load items from Supabase or localStorage
    useEffect(() => {
        const loadItems = async () => {
            // Try Supabase first
            if (supabase) {
                try {
                    let query = supabase
                        .from('menu_items')
                        .select('*')
                        .order('created_at', { ascending: false })

                    // If adminId provided, filter by it
                    if (adminId) {
                        query = query.eq('admin_id', adminId)
                    }

                    const { data, error } = await query

                    if (!error && data) {
                        setItems(data)
                        // Clear stale localStorage
                        localStorage.removeItem(STORAGE_KEY)
                        setIsLoading(false)
                        return
                    }
                } catch (err) {
                    console.error('Supabase fetch error:', err)
                }
            }

            // Fallback to localStorage (no defaults — start empty)
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                try {
                    setItems(JSON.parse(stored))
                } catch {
                    setItems([])
                }
            } else {
                setItems([])
            }
            setIsLoading(false)
        }

        loadItems()

        // Real-time subscription
        if (supabase) {
            const supabaseClient = supabase
            const channel = supabaseClient
                .channel('menu-realtime')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, (payload) => {
                    const newItem = payload.new as MenuItem & { admin_id?: string }
                    const oldItem = payload.old as MenuItem & { admin_id?: string }

                    // Only process events for this admin's items
                    if (adminId && payload.eventType !== 'DELETE' && newItem.admin_id !== adminId) return
                    if (adminId && payload.eventType === 'DELETE' && oldItem.admin_id !== adminId) return

                    if (payload.eventType === 'INSERT') {
                        setItems(prev => {
                            if (prev.some(i => i.id === newItem.id)) return prev
                            return [newItem, ...prev]
                        })
                    } else if (payload.eventType === 'UPDATE') {
                        setItems(prev => prev.map(item => item.id === newItem.id ? newItem : item))
                    } else if (payload.eventType === 'DELETE') {
                        setItems(prev => prev.filter(item => item.id !== oldItem.id))
                    }
                })
                .subscribe()

            return () => {
                supabaseClient.removeChannel(channel)
            }
        }
    }, [adminId])

    // Save to localStorage only if Supabase is not available
    useEffect(() => {
        if (!supabase && !isLoading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
        }
    }, [items, isLoading])

    const addItem = useCallback((itemData: Omit<MenuItem, 'id'>) => {
        // Add to Supabase if available
        if (supabase) {
            // Prepare payload: Clean up data (remove id, canteen_id)
            const payload = { ...itemData } as any
            delete payload.id
            delete payload.canteen_id

            if (adminId) {
                payload.admin_id = adminId
            }

            supabase.from('menu_items')
                .insert(payload)
                .select()
                .then(({ data, error }) => {
                    if (error) {
                        console.error('Supabase insert error:', error)
                        alert('Failed to add item: ' + error.message)
                    } else if (data) {
                        // Add resolved item to state
                        const savedItem = data[0] as MenuItem
                        setItems(prev => {
                            if (prev.some(i => i.id === savedItem.id)) return prev
                            return [savedItem, ...prev]
                        })
                    }
                })
        }
    }, [adminId])

    const deleteItem = useCallback((id: string) => {
        if (supabase) {
            supabase.from('menu_items').delete().eq('id', id).then(({ error }) => {
                if (error) console.error('Supabase delete error:', error)
            })
        }
        setItems(prev => prev.filter(item => item.id !== id))
    }, [])

    const toggleAvailability = useCallback((id: string) => {
        setItems(prev => {
            const item = prev.find(i => i.id === id)
            if (!item) return prev

            const newAvailable = !item.available

            if (supabase) {
                supabase.from('menu_items').update({ available: newAvailable }).eq('id', id).then(({ error }) => {
                    if (error) console.error('Supabase update error:', error)
                })
            }

            return prev.map(i => i.id === id ? { ...i, available: newAvailable } : i)
        })
    }, [])

    const updateItem = useCallback((id: string, updates: Partial<MenuItem>) => {
        if (supabase) {
            supabase.from('menu_items').update(updates).eq('id', id).then(({ error }) => {
                if (error) console.error('Supabase update error:', error)
            })
        }
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
    }, [])

    return (
        <MenuContext.Provider value={{ items, isLoading, addItem, deleteItem, toggleAvailability, updateItem }}>
            {children}
        </MenuContext.Provider>
    )
}

export function useMenu() {
    const context = useContext(MenuContext)
    if (!context) {
        throw new Error('useMenu must be used within a MenuProvider')
    }
    return context
}
