'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Zap, Clock, Loader2, Brain, TrendingUp, ArrowLeft, Store } from 'lucide-react'
import { useMenu } from '@/components/MenuProvider'
import { useAI } from '@/components/AIProvider'
import { supabase } from '@/lib/supabase'
import { MenuCard } from '@/components/MenuCard'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SkeletonGrid } from '@/components/SkeletonCard'

export default function MenuPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#F75412]" />
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

    useEffect(() => {
        if (!canteenId) {
            router.push('/canteens')
        }
    }, [canteenId, router])

    useEffect(() => {
        if (!canteenId || !supabase) return
        supabase
            .from('admin_profiles')
            .select('canteen_name')
            .eq('id', canteenId)
            .single()
            .then(({ data }) => {
                if (data) setCanteenName(data.canteen_name)
            })
    }, [canteenId])

    const canteenItems = useMemo(() => {
        if (!canteenId) return []
        return menuItems.filter(item => {
            const itemAdminId = (item as unknown as { admin_id?: string }).admin_id
            return itemAdminId === canteenId
        })
    }, [menuItems, canteenId])

    const availableItems = useMemo(() => {
        return canteenItems.filter(item => item.available)
    }, [canteenItems])

    const categories = useMemo(() => {
        const cats = [...new Set(availableItems.map(item => item.category))]
        return cats.sort()
    }, [availableItems])

    const staticFastestItem = useMemo(() => {
        if (availableItems.length === 0) return null
        return availableItems.reduce((fastest, item) =>
            item.eta_minutes < fastest.eta_minutes ? item : fastest
        )
    }, [availableItems])

    const aiFastestItem = useMemo(() => {
        if (fastestItems.length === 0) return null
        const topAI = fastestItems[0]
        return availableItems.find(item => item.id === topAI.itemId) || null
    }, [fastestItems, availableItems])

    const recommendedFastest = aiFastestItem || staticFastestItem
    const isAIRecommendation = aiFastestItem !== null && dataConfidence !== 'low'

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
                <div className="mb-6 flex items-center gap-3">
                    <div className="h-5 w-5 rounded skeleton" />
                    <div className="h-7 w-48 rounded skeleton" />
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <SkeletonGrid count={8} variant="menu" />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6 pb-32">
            <div className="mb-4 flex items-center gap-3 animate-fade-in-up">
                <Link href="/canteens" className="flex items-center gap-1 text-sm text-[#8a7060] hover:text-[#F75412] transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-[#F75412]" />
                    <h1 className="text-xl font-bold sm:text-2xl">{canteenName || 'Menu'}</h1>
                </div>
            </div>

            <div className="mb-6 space-y-3 animate-fade-in-up delay-1">
                {totalOrdersAnalyzed > 0 && (
                    <div className="flex items-center gap-2 text-xs text-[#8a7060]">
                        <Brain className="h-3.5 w-3.5" />
                        <span>AI learning from {totalOrdersAnalyzed} orders</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {dataConfidence} confidence
                        </Badge>
                    </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                    {recommendedFastest && (
                        <Card className={`${isAIRecommendation
                            ? 'border-purple-200 bg-purple-50 dark:border-purple-800/40 dark:bg-purple-900/10'
                            : 'border-[#FB882C]/30 bg-[#fdf5f0] dark:border-[#FB882C]/20 dark:bg-[#241a15]'}`}
                        >
                            <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isAIRecommendation ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-[#F75412]/10'} sm:h-10 sm:w-10`}>
                                    {isAIRecommendation ? (
                                        <TrendingUp className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
                                    ) : (
                                        <Zap className="h-4 w-4 text-[#F75412] sm:h-5 sm:w-5" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-xs ${isAIRecommendation ? 'text-purple-700 dark:text-purple-400' : 'text-[#C33811]'} sm:text-sm`}>
                                        {isAIRecommendation ? 'AI Pick — Fastest' : 'Fastest Option'}
                                    </p>
                                    <p className="truncate text-sm font-medium sm:text-base">
                                        {recommendedFastest.name} — {recommendedFastest.eta_minutes} min
                                    </p>
                                    {isAIRecommendation && fastestItems[0] && (
                                        <p className="text-[10px] text-purple-600 dark:text-purple-400">
                                            Actual avg: {fastestItems[0].avgActualTime} min ({fastestItems[0].orderCount} orders)
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {bestCanteen && (
                        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/10">
                            <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 sm:h-10 sm:w-10">
                                    <Clock className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-700 dark:text-blue-400 sm:text-sm">Best Canteen</p>
                                    <p className="text-sm font-medium sm:text-base">
                                        Canteen {bestCanteen.canteenId} — avg {bestCanteen.avgPrepTime} min
                                    </p>
                                    {bestCanteen.reliabilityScore > 0 && (
                                        <p className="text-[10px] text-blue-600 dark:text-blue-400">
                                            {Math.round(bestCanteen.reliabilityScore * 100)}% on-time delivery
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {peakHourRecommendation && (
                    <p className="text-xs text-[#8a7060] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {peakHourRecommendation}
                    </p>
                )}
            </div>

            <div className="mb-6 space-y-3 animate-fade-in-up delay-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7060]" />
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

            {filteredItems.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredItems.map((item, index) => (
                        <div key={item.id} className={`animate-fade-in-up delay-${Math.min(index + 1, 8)}`}>
                            <MenuCard item={item} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center text-[#8a7060] animate-fade-in">
                    {availableItems.length === 0
                        ? 'This canteen hasn\'t added any menu items yet.'
                        : 'No items found matching your search.'
                    }
                </div>
            )}
        </div>
    )
}
