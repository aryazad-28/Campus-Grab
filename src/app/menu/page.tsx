'use client'

import { useState, useMemo } from 'react'
import { Search, Zap, Clock } from 'lucide-react'
import { MenuItem } from '@/lib/supabase'
import { MenuCard } from '@/components/MenuCard'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// Mock menu data - will be replaced with Supabase fetch
const mockMenuItems: MenuItem[] = [
    {
        id: '1',
        name: 'Masala Dosa',
        category: 'Breakfast',
        price: 60,
        image_url: null,
        eta_minutes: 8,
        canteen_id: 1,
        available: true
    },
    {
        id: '2',
        name: 'Veg Biryani',
        category: 'Main Course',
        price: 120,
        image_url: null,
        eta_minutes: 15,
        canteen_id: 1,
        available: true
    },
    {
        id: '3',
        name: 'Paneer Butter Masala',
        category: 'Main Course',
        price: 140,
        image_url: null,
        eta_minutes: 12,
        canteen_id: 2,
        available: true
    },
    {
        id: '4',
        name: 'Cold Coffee',
        category: 'Beverages',
        price: 50,
        image_url: null,
        eta_minutes: 5,
        canteen_id: 1,
        available: true
    },
    {
        id: '5',
        name: 'Samosa',
        category: 'Snacks',
        price: 20,
        image_url: null,
        eta_minutes: 3,
        canteen_id: 2,
        available: true
    },
    {
        id: '6',
        name: 'Idli Sambar',
        category: 'Breakfast',
        price: 40,
        image_url: null,
        eta_minutes: 6,
        canteen_id: 1,
        available: true
    },
    {
        id: '7',
        name: 'Chicken Fried Rice',
        category: 'Main Course',
        price: 100,
        image_url: null,
        eta_minutes: 10,
        canteen_id: 2,
        available: true
    },
    {
        id: '8',
        name: 'Vada Pav',
        category: 'Snacks',
        price: 25,
        image_url: null,
        eta_minutes: 4,
        canteen_id: 1,
        available: true
    }
]

export default function MenuPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const menuItems = mockMenuItems // Will be replaced with Supabase data

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
            return matchesSearch && matchesCategory && item.available
        })
    }, [menuItems, searchQuery, selectedCategory])

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-2xl font-semibold">Menu</h1>

            {/* AI Recommendations */}
            {(fastestItem || fasterCanteen) && (
                <div className="mb-8 grid gap-4 md:grid-cols-2">
                    {fastestItem && (
                        <Card className="border-emerald-200 bg-emerald-50">
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                                    <Zap className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-700">Fastest Option</p>
                                    <p className="font-medium">{fastestItem.name} — {fastestItem.eta_minutes} min</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {fasterCanteen && (
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-700">Faster Canteen</p>
                                    <p className="font-medium">Canteen {fasterCanteen.canteenId} — avg {fasterCanteen.avgEta} min</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Search & Filters */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                        type="search"
                        placeholder="Search menu..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge
                        variant={selectedCategory === null ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(null)}
                    >
                        All
                    </Badge>
                    {categories.map(category => (
                        <Badge
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Menu Grid */}
            {filteredItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
