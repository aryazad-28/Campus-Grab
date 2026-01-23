'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { supabase, MenuItem } from '@/lib/supabase'

// Default menu items with images
const DEFAULT_ITEMS: MenuItem[] = [
    { id: '1', name: 'Masala Dosa', category: 'Breakfast', price: 60, image_url: 'https://images.unsplash.com/photo-1668236543090-82eb5eaf701b?w=400&h=300&fit=crop', eta_minutes: 8, canteen_id: 1, available: true },
    { id: '2', name: 'Veg Biryani', category: 'Main Course', price: 120, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop', eta_minutes: 15, canteen_id: 1, available: true },
    { id: '3', name: 'Cold Coffee', category: 'Beverages', price: 50, image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', eta_minutes: 5, canteen_id: 1, available: true },
    { id: '4', name: 'Samosa', category: 'Snacks', price: 20, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', eta_minutes: 3, canteen_id: 2, available: true },
    { id: '5', name: 'Idli Sambar', category: 'Breakfast', price: 40, image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop', eta_minutes: 6, canteen_id: 1, available: true },
    { id: '6', name: 'Vada Pav', category: 'Snacks', price: 25, image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop', eta_minutes: 4, canteen_id: 1, available: true },
    { id: '7', name: 'Paneer Butter Masala', category: 'Main Course', price: 140, image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', eta_minutes: 12, canteen_id: 2, available: true },
    { id: '8', name: 'Fresh Lime Soda', category: 'Beverages', price: 30, image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop', eta_minutes: 3, canteen_id: 1, available: true },
]

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

export function MenuProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<MenuItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Load items from localStorage or Supabase
    useEffect(() => {
        const loadItems = async () => {
            // Try Supabase first
            if (supabase) {
                try {
                    const { data, error } = await supabase
                        .from('menu_items')
                        .select('*')
                        .order('created_at', { ascending: false })

                    if (!error && data && data.length > 0) {
                        setItems(data)
                        setIsLoading(false)
                        return
                    }
                } catch (err) {
                    console.error('Supabase fetch error:', err)
                }
            }

            // Fallback to localStorage
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                try {
                    setItems(JSON.parse(stored))
                } catch {
                    setItems(DEFAULT_ITEMS)
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ITEMS))
                }
            } else {
                setItems(DEFAULT_ITEMS)
                localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ITEMS))
            }
            setIsLoading(false)
        }

        loadItems()

        // Real-time subscription
        if (supabase) {
            const channel = supabase
                .channel('menu-realtime')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setItems(prev => [payload.new as MenuItem, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setItems(prev => prev.map(item => item.id === (payload.new as MenuItem).id ? payload.new as MenuItem : item))
                    } else if (payload.eventType === 'DELETE') {
                        setItems(prev => prev.filter(item => item.id !== (payload.old as MenuItem).id))
                    }
                })
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [])

    // Save to localStorage whenever items change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
        }
    }, [items, isLoading])

    const addItem = useCallback((itemData: Omit<MenuItem, 'id'>) => {
        const newItem: MenuItem = {
            ...itemData,
            id: 'item-' + Date.now().toString(36)
        }

        // Add to Supabase if available
        if (supabase) {
            supabase.from('menu_items').insert(newItem).then(({ error }) => {
                if (error) console.error('Supabase insert error:', error)
            })
        }

        setItems(prev => [newItem, ...prev])
    }, [])

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
