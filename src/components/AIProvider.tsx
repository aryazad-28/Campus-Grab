'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import {
    getAIInsights,
    calculateItemPerformance,
    calculateCanteenPerformance,
    trackOrder,
    completeOrder,
    ItemPerformance,
    CanteenPerformance
} from '@/lib/ai-learning'

interface AIContextType {
    // Insights
    fastestItems: ItemPerformance[]
    bestCanteen: CanteenPerformance | null
    allItemPerformance: ItemPerformance[]
    allCanteenPerformance: CanteenPerformance[]
    dataConfidence: 'low' | 'medium' | 'high'
    totalOrdersAnalyzed: number
    peakHourRecommendation: string

    // Actions
    trackNewOrder: (order: { orderId: string; items: { itemId: string; itemName: string; canteenId: number | string; estimatedTime: number }[] }) => void
    markOrderComplete: (orderId: string) => void
    refreshInsights: () => void
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({ children }: { children: ReactNode }) {
    const [fastestItems, setFastestItems] = useState<ItemPerformance[]>([])
    const [bestCanteen, setBestCanteen] = useState<CanteenPerformance | null>(null)
    const [allItemPerformance, setAllItemPerformance] = useState<ItemPerformance[]>([])
    const [allCanteenPerformance, setAllCanteenPerformance] = useState<CanteenPerformance[]>([])
    const [dataConfidence, setDataConfidence] = useState<'low' | 'medium' | 'high'>('low')
    const [totalOrdersAnalyzed, setTotalOrdersAnalyzed] = useState(0)
    const [peakHourRecommendation, setPeakHourRecommendation] = useState('')

    const refreshInsights = useCallback(() => {
        const insights = getAIInsights()
        setFastestItems(insights.fastestItems)
        setBestCanteen(insights.bestCanteen)
        setDataConfidence(insights.dataConfidence)
        setTotalOrdersAnalyzed(insights.totalOrdersAnalyzed)
        setPeakHourRecommendation(insights.peakHourRecommendation)

        setAllItemPerformance(calculateItemPerformance())
        setAllCanteenPerformance(calculateCanteenPerformance())
    }, [])

    // Load insights on mount
    useEffect(() => {
        refreshInsights()
    }, [refreshInsights])

    const trackNewOrder = useCallback((order: {
        orderId: string;
        items: { itemId: string; itemName: string; canteenId: number | string; estimatedTime: number }[]
    }) => {
        trackOrder(order)
    }, [])

    const markOrderComplete = useCallback((orderId: string) => {
        completeOrder(orderId)
        // Refresh insights after order completion
        setTimeout(refreshInsights, 100)
    }, [refreshInsights])

    return (
        <AIContext.Provider value={{
            fastestItems,
            bestCanteen,
            allItemPerformance,
            allCanteenPerformance,
            dataConfidence,
            totalOrdersAnalyzed,
            peakHourRecommendation,
            trackNewOrder,
            markOrderComplete,
            refreshInsights
        }}>
            {children}
        </AIContext.Provider>
    )
}

export function useAI() {
    const context = useContext(AIContext)
    if (!context) {
        throw new Error('useAI must be used within an AIProvider')
    }
    return context
}
