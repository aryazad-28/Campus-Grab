'use client'

import { useState, useMemo } from 'react'
import { Search, Zap, Clock, Loader2, Brain, TrendingUp } from 'lucide-react'
import { useMenu } from '@/components/MenuProvider'
import { useAI } from '@/components/AIProvider'
import { MenuCard } from '@/components/MenuCard'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function MenuPage() {
    const { items: menuItems, isLoading } = useMenu()
    const { fastestItems, bestCanteen, dataConfidence, totalOrdersAnalyzed, peakHourRecommendation } = useAI()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    // Only show available items to students
    const availableItems = useMemo(() => {
        return menuItems.filter(item => item.available)
    }, [menuItems])

    // Get unique categories
    const categories = useMemo(() => {
        const cats = [...new Set(availableItems.map(item => item.category))]
        return cats.sort()
    }, [availableItems])

    // Fallback: Static fastest item (used when AI has no data)
    const staticFastestItem = useMemo(() => {
        if (availableItems.length === 0) return null
        return availableItems.reduce((fastest, item) =>
            item.eta_minutes < fastest.eta_minutes ? item : fastest
        )
    }, [availableItems])

    // AI-learned fastest item (if we have data)
    const aiFastestItem = useMemo(() => {
        if (fastestItems.length === 0) return null
        const topAI = fastestItems[0]
        return availableItems.find(item => item.id === topAI.itemId) || null
    }, [fastestItems, availableItems])

    // Use AI recommendation if available, otherwise fallback to static
    const recommendedFastest = aiFastestItem || staticFastestItem
    const isAIRecommendation = aiFastestItem !== null && dataConfidence !== 'low'

    // Filter items
    const filteredItems = useMemo(() => {
        return availableItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = !selectedCategory || item.category === selectedCategory
            return matchesSearch && matchesCategory
        })
    }, [availableItems, searchQuery, selectedCategory])

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

            {/* AI Recommendations Section */}
            <div className="mb-6 space-y-3">
                {/* AI Badge */}
                {totalOrdersAnalyzed > 0 && (
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Brain className="h-3.5 w-3.5" />
                        <span>AI learning from {totalOrdersAnalyzed} orders</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {dataConfidence} confidence
                        </Badge>
                    </div>
                )}

                {/* Recommendation Cards */}
                <div className="grid gap-3 sm:grid-cols-2">
                    {recommendedFastest && (
                        <Card className={`${isAIRecommendation ? 'border-purple-200 bg-purple-50' : 'border-emerald-200 bg-emerald-50'}`}>
                            <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isAIRecommendation ? 'bg-purple-100' : 'bg-emerald-100'} sm:h-10 sm:w-10`}>
                                    {isAIRecommendation ? (
                                        <TrendingUp className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
                                    ) : (
                                        <Zap className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-xs ${isAIRecommendation ? 'text-purple-700' : 'text-emerald-700'} sm:text-sm`}>
                                        {isAIRecommendation ? 'AI Pick — Fastest' : 'Fastest Option'}
                                    </p>
                                    <p className="truncate text-sm font-medium sm:text-base">
                                        {recommendedFastest.name} — {recommendedFastest.eta_minutes} min
                                    </p>
                                    {isAIRecommendation && fastestItems[0] && (
                                        <p className="text-[10px] text-purple-600">
                                            Actual avg: {fastestItems[0].avgActualTime} min ({fastestItems[0].orderCount} orders)
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {bestCanteen && (
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-10 sm:w-10">
                                    <Clock className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-700 sm:text-sm">Best Canteen</p>
                                    <p className="text-sm font-medium sm:text-base">
                                        Canteen {bestCanteen.canteenId} — avg {bestCanteen.avgPrepTime} min
                                    </p>
                                    {bestCanteen.reliabilityScore > 0 && (
                                        <p className="text-[10px] text-blue-600">
                                            {Math.round(bestCanteen.reliabilityScore * 100)}% on-time delivery
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Peak Hour Insight */}
                {peakHourRecommendation && (
                    <p className="text-xs text-neutral-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {peakHourRecommendation}
                    </p>
                )}
            </div>

            {/* Search & Filters */}
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

            {/* Menu Grid */}
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
