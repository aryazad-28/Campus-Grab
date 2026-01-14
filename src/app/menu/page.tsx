'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Zap, Clock, Loader2 } from 'lucide-react'
import { supabase, MenuItem } from '@/lib/supabase'
import { MenuCard } from '@/components/MenuCard'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// Fallback mock data
const MOCK_ITEMS: MenuItem[] = [
    { id: '1', name: 'Masala Dosa', category: 'Breakfast', price: 60, image_url: null, eta_minutes: 8, canteen_id: 1, available: true },
    { id: '2', name: 'Veg Biryani', category: 'Main Course', price: 120, image_url: null, eta_minutes: 15, canteen_id: 1, available: true },
    { id: '3', name: 'Cold Coffee', category: 'Beverages', price: 50, image_url: null, eta_minutes: 5, canteen_id: 1, available: true },
    { id: '4', name: 'Samosa', category: 'Snacks', price: 20, image_url: null, eta_minutes: 3, canteen_id: 2, available: true },
    { id: '5', name: 'Idli Sambar', category: 'Breakfast', price: 40, image_url: null, eta_minutes: 6, canteen_id: 1, available: true },
    { id: '6', name: 'Vada Pav', category: 'Snacks', price: 25, image_url: null, eta_minutes: 4, canteen_id: 1, available: true },
]

export default function MenuPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    // Fetch menu items and subscribe to real-time updates
    useEffect(() => {
        const fetchItems = async () => {
            if (!supabase) {
                setMenuItems(MOCK_ITEMS)
                setIsLoading(false)
                return
            }

            try {
                const { data, error } = await supabase
                    .from('menu_items')
                    .select('*')
                    .eq('available', true)
                    .order('category')

                if (error) {
                    console.error('Supabase error:', error)
                    setMenuItems(MOCK_ITEMS)
                } else {
                    setMenuItems(data || MOCK_ITEMS)
                }
            } catch (err) {
                console.error('Fetch error:', err)
                setMenuItems(MOCK_ITEMS)
            } finally {
                setIsLoading(false)
            }
        }

        fetchItems()

        // Real-time subscription
        if (supabase) {
            const channel = supabase
                .channel('menu-changes')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'menu_items' },
                    (payload) => {
                        console.log('Real-time update:', payload)

                        if (payload.eventType === 'INSERT') {
                            const newItem = payload.new as MenuItem
                            if (newItem.available) {
                                setMenuItems(prev => [newItem, ...prev])
                            }
                        } else if (payload.eventType === 'UPDATE') {
                            const updated = payload.new as MenuItem
                            setMenuItems(prev => {
                                if (!updated.available) {
                                    return prev.filter(item => item.id !== updated.id)
                                }
                                const exists = prev.some(item => item.id === updated.id)
                                if (exists) {
                                    return prev.map(item => item.id === updated.id ? updated : item)
                                }
                                return [updated, ...prev]
                            })
                        } else if (payload.eventType === 'DELETE') {
                            const deleted = payload.old as MenuItem
                            setMenuItems(prev => prev.filter(item => item.id !== deleted.id))
                        }
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [])

    // Get unique categories
    const categories = useMemo(() => {
        const cats = [...new Set(menuItems.map(item => item.category))]
        return cats.sort()
    }, [menuItems])

    // AI Logic: Find fastest item
    const fastestItem = useMemo(() => {
        if (menuItems.length === 0) return null
        return menuItems.reduce((fastest, item) =>
            item.eta_minutes < fastest.eta_minutes ? item : fastest
        )
    }, [menuItems])

    // AI Logic: Average ETA per canteen
    const canteenStats = useMemo(() => {
        const stats: Record<number, { total: number; count: number }> = {}
        menuItems.forEach(item => {
            if (!stats[item.canteen_id]) {
                stats[item.canteen_id] = { total: 0, count: 0 }
            }
            stats[item.canteen_id].total += item.eta_minutes
            stats[item.canteen_id].count += 1
        })
        return Object.entries(stats).map(([id, { total, count }]) => ({
            canteenId: parseInt(id),
            avgEta: Math.round(total / count)
        })).sort((a, b) => a.avgEta - b.avgEta)
    }, [menuItems])

    const fasterCanteen = canteenStats[0]

    // Filter items
    const filteredItems = useMemo(() => {
        return menuItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = !selectedCategory || item.category === selectedCategory
            return matchesSearch && matchesCategory
        })
    }, [menuItems, searchQuery, selectedCategory])

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6 pb-32">
            <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Menu</h1>

            {/* AI Recommendations - Stack on mobile */}
            {(fastestItem || fasterCanteen) && (
                <div className="mb-6 grid gap-3 sm:grid-cols-2">
                    {fastestItem && (
                        <Card className="border-emerald-200 bg-emerald-50">
                            <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 sm:h-10 sm:w-10">
                                    <Zap className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-emerald-700 sm:text-sm">Fastest Option</p>
                                    <p className="truncate text-sm font-medium sm:text-base">{fastestItem.name} — {fastestItem.eta_minutes} min</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {fasterCanteen && (
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-10 sm:w-10">
                                    <Clock className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-700 sm:text-sm">Faster Canteen</p>
                                    <p className="text-sm font-medium sm:text-base">Canteen {fasterCanteen.canteenId} — avg {fasterCanteen.avgEta} min</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Search & Filters - Mobile optimized */}
            <div className="mb-6 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                        type="search"
                        placeholder="Search menu..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    <Badge
                        variant={selectedCategory === null ? "default" : "outline"}
                        className="cursor-pointer shrink-0 px-3 py-1.5"
                        onClick={() => setSelectedCategory(null)}
                    >
                        All
                    </Badge>
                    {categories.map(category => (
                        <Badge
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            className="cursor-pointer shrink-0 px-3 py-1.5"
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Menu Grid - 1 col on mobile, 2 on tablet, 3+ on desktop */}
            {filteredItems.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredItems.map(item => (
                        <MenuCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center text-neutral-500">
                    No items found matching your search.
                </div>
            )}
        </div>
    )
}
