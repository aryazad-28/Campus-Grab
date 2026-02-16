'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Zap, Clock, Loader2, Brain, TrendingUp, ArrowLeft, Star, Beef, Pizza, CircleDot, Salad, UtensilsCrossed, CakeSlice, Coffee, LayoutGrid, type LucideIcon } from 'lucide-react'
import { useMenu } from '@/components/MenuProvider'
import { useAI } from '@/components/AIProvider'
import { supabase } from '@/lib/supabase'
import { MenuCard } from '@/components/MenuCard'
import { Input } from '@/components/ui/input'
import { SkeletonGrid } from '@/components/SkeletonCard'
import { formatPrice, formatTime } from '@/lib/utils'

export default function MenuPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            </div>
        }>
            <MenuContent />
        </Suspense>
    )
}

function MenuContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const canteenId = searchParams.get('canteen')

    const { items: menuItems, isLoading } = useMenu()
    const { fastestItems, bestCanteen, dataConfidence, totalOrdersAnalyzed, peakHourRecommendation } = useAI()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [canteenName, setCanteenName] = useState<string | null>(null)
    const [canteenOpen, setCanteenOpen] = useState<boolean>(true)

    useEffect(() => {
        if (!canteenId) router.push('/canteens')
    }, [canteenId, router])

    useEffect(() => {
        if (!canteenId || !supabase) return
        supabase.from('admin_profiles').select('canteen_name, is_open').eq('id', canteenId).single()
            .then(({ data }) => {
                if (data) {
                    setCanteenName(data.canteen_name)
                    setCanteenOpen(data.is_open !== false)
                }
            })
    }, [canteenId])

    const canteenItems = useMemo(() => {
        if (!canteenId) return []
        return menuItems.filter(item => {
            const itemAdminId = (item as unknown as { admin_id?: string }).admin_id
            return itemAdminId === canteenId
        })
    }, [menuItems, canteenId])

    const availableItems = useMemo(() => canteenItems.filter(item => item.available), [canteenItems])

    const categories = useMemo(() => {
        const cats = [...new Set(availableItems.map(item => item.category))]
        return cats.sort()
    }, [availableItems])

    const categoryIconMap: Record<string, LucideIcon> = {
        'Burgers': Beef,
        'Classic Pizzas': Pizza,
        'Special Pizzas': Pizza,
        'Momos': CircleDot,
        'Appetizers': Salad,
        'Pastas': UtensilsCrossed,
        'Brownies': CakeSlice,
        'Beverages': Coffee,
        'Coffee': Coffee,
    }

    const navItems = useMemo(() => {
        const items = [{ name: 'All', icon: LayoutGrid }]
        categories.forEach(cat => {
            items.push({ name: cat, icon: categoryIconMap[cat] || UtensilsCrossed })
        })
        return items
    }, [categories])

    const fastItems = useMemo(() => {
        return [...availableItems]
            .sort((a, b) => a.eta_minutes - b.eta_minutes)
            .slice(0, 3)
    }, [availableItems])

    const filteredItems = useMemo(() => {
        return availableItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = !selectedCategory || item.category === selectedCategory
            return matchesSearch && matchesCategory
        })
    }, [availableItems, searchQuery, selectedCategory])

    if (!canteenId) return null

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-6 pb-32">
                <div className="mb-6 h-48 rounded-2xl skeleton" />
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                    <SkeletonGrid count={8} variant="menu" />
                </div>
            </div>
        )
    }

    return (
        <div className="pb-32">
            {/* Hero Banner — like Figma canteen page */}
            <div className="relative h-52 bg-[var(--card-elevated)] overflow-hidden animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <span className="text-6xl">🍽️</span>
                </div>

                {/* Back button */}
                <Link href="/canteens" className="absolute top-4 left-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                </Link>

                {/* Canteen name overlay at bottom */}
                <div className="absolute bottom-4 left-4 right-4 z-20">
                    <h1 className="text-xl font-bold text-white sm:text-2xl">{canteenName || 'Menu'}</h1>
                    <p className="text-sm text-white/70">{canteenName ? 'Main campus dining with diverse cuisines' : ''}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-medium text-white">4.5</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-white/60" />
                            <span className="text-xs text-white/70">~12 min</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-4">
                {/* Canteen Closed Banner */}
                {!canteenOpen && (
                    <div className="mb-6 animate-fade-in-up rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-5 text-center">
                        <div className="text-3xl mb-2">🔒</div>
                        <h3 className="text-lg font-bold text-red-500 mb-1">Canteen is Closed</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">This canteen is not accepting orders right now. Check back later!</p>
                    </div>
                )}
                {/* Fastest Items — horizontal scroll like Figma */}
                {fastItems.length > 0 && (
                    <div className="mb-6 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
                                <Zap className="h-3.5 w-3.5 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold">Fastest Items</h2>
                                <p className="text-xs text-[var(--muted-foreground)]">Ready in under 10 min</p>
                            </div>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                            {fastItems.map((item) => (
                                <div key={item.id} className="shrink-0 w-[140px]">
                                    <MenuCard item={item} disabled={!canteenOpen} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Category pills — red active like Figma */}
                <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 mb-4 scrollbar-hide animate-fade-in-up delay-1">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === null
                            ? 'bg-red-500 text-white'
                            : 'bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)]'
                            }`}
                    >
                        All
                    </button>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                ? 'bg-red-500 text-white'
                                : 'bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)]'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative mb-5 animate-fade-in-up delay-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <Input
                        type="search"
                        placeholder="Search menu..."
                        className="pl-10 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Menu Sections by Category */}
                {filteredItems.length > 0 ? (
                    <div className="space-y-8">
                        {(() => {
                            // Group items by category
                            const grouped: Record<string, typeof filteredItems> = {}
                            filteredItems.forEach(item => {
                                if (!grouped[item.category]) grouped[item.category] = []
                                grouped[item.category].push(item)
                            })

                            const categoryEmojis: Record<string, string> = {
                                'Burgers': '🍔',
                                'Classic Pizzas': '🍕',
                                'Special Pizzas': '🍕',
                                'Momos': '🥟',
                                'Appetizers': '🍟',
                                'Pastas': '🍝',
                                'Brownies': '🍫',
                                'Beverages': '🥤',
                                'Coffee': '☕',
                            }

                            return Object.entries(grouped).map(([category, items], sectionIndex) => (
                                <div key={category} className={`animate-fade-in-up delay-${Math.min(sectionIndex + 1, 4)}`}>
                                    {/* Section Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-lg">
                                            {categoryEmojis[category] || '🍽️'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold">{category}</h3>
                                            <p className="text-xs text-[var(--muted-foreground)]">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                                        </div>
                                        <div className="h-px flex-1 bg-[var(--border)]" />
                                    </div>

                                    {/* Items Grid */}
                                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                                        {items.map((item, index) => (
                                            <div key={item.id} className={`animate-fade-in-up delay-${Math.min(index + 1, 8)}`}>
                                                <MenuCard item={item} disabled={!canteenOpen} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        })()}
                    </div>
                ) : (
                    <div className="py-12 text-center text-[var(--muted-foreground)] animate-fade-in">
                        {availableItems.length === 0
                            ? 'This canteen hasn\'t added any menu items yet.'
                            : 'No items found matching your search.'
                        }
                    </div>
                )}
            </div>
        </div>
    )
}
