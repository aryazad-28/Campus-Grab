// AI Learning Module for Campus Grab
// Collects order data and learns optimal recommendations

export interface OrderAnalytics {
    orderId: string
    items: {
        itemId: string
        itemName: string
        canteenId: number | string
        estimatedTime: number
    }[]
    orderedAt: string
    completedAt: string | null
    actualPrepTime: number | null // in minutes
    hourOfDay: number
    dayOfWeek: number
}

export interface ItemPerformance {
    itemId: string
    itemName: string
    avgActualTime: number
    avgEstimatedTime: number
    orderCount: number
    speedRating: number // 0-1, higher = faster
    reliabilityScore: number // how often it beats estimate
}

export interface CanteenPerformance {
    canteenId: number | string
    avgPrepTime: number
    peakHourAvg: number // 11am-2pm, 6pm-8pm
    offPeakAvg: number
    totalOrders: number
    reliabilityScore: number
}

interface AIInsights {
    fastestItems: ItemPerformance[]
    bestCanteen: CanteenPerformance | null
    peakHourRecommendation: string
    dataConfidence: 'low' | 'medium' | 'high'
    totalOrdersAnalyzed: number
}

const STORAGE_KEY = 'campus-grab-ai-data'

// Load stored analytics data
function loadAnalytics(): OrderAnalytics[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    try {
        return JSON.parse(stored)
    } catch {
        return []
    }
}

// Save analytics data
function saveAnalytics(data: OrderAnalytics[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Track a new order
export function trackOrder(order: {
    orderId: string
    items: { itemId: string; itemName: string; canteenId: number | string; estimatedTime: number }[]
}): void {
    const now = new Date()
    const analytics: OrderAnalytics = {
        orderId: order.orderId,
        items: order.items,
        orderedAt: now.toISOString(),
        completedAt: null,
        actualPrepTime: null,
        hourOfDay: now.getHours(),
        dayOfWeek: now.getDay()
    }

    const data = loadAnalytics()
    data.unshift(analytics)

    // Keep last 500 orders for analysis
    if (data.length > 500) data.pop()
    saveAnalytics(data)
}

// Mark order as completed and calculate actual prep time
export function completeOrder(orderId: string): void {
    const data = loadAnalytics()
    const order = data.find(o => o.orderId === orderId)

    if (order && !order.completedAt) {
        const now = new Date()
        order.completedAt = now.toISOString()

        const orderedAt = new Date(order.orderedAt)
        order.actualPrepTime = Math.round((now.getTime() - orderedAt.getTime()) / 60000) // in minutes

        saveAnalytics(data)
    }
}

// Calculate item performance from historical data
export function calculateItemPerformance(): ItemPerformance[] {
    const data = loadAnalytics()
    const completedOrders = data.filter(o => o.actualPrepTime !== null)

    // Group by item
    const itemStats: Record<string, {
        itemId: string
        itemName: string
        actualTimes: number[]
        estimatedTimes: number[]
    }> = {}

    completedOrders.forEach(order => {
        order.items.forEach(item => {
            if (!itemStats[item.itemId]) {
                itemStats[item.itemId] = {
                    itemId: item.itemId,
                    itemName: item.itemName,
                    actualTimes: [],
                    estimatedTimes: []
                }
            }
            if (order.actualPrepTime) {
                itemStats[item.itemId].actualTimes.push(order.actualPrepTime)
                itemStats[item.itemId].estimatedTimes.push(item.estimatedTime)
            }
        })
    })

    // Calculate metrics for each item
    const performances: ItemPerformance[] = Object.values(itemStats).map(stats => {
        const avgActual = stats.actualTimes.reduce((a, b) => a + b, 0) / stats.actualTimes.length
        const avgEstimated = stats.estimatedTimes.reduce((a, b) => a + b, 0) / stats.estimatedTimes.length

        // Count how often actual < estimated (beat the estimate)
        const beatCount = stats.actualTimes.filter((actual, i) => actual <= stats.estimatedTimes[i]).length
        const reliabilityScore = beatCount / stats.actualTimes.length

        // Speed rating: inverse of actual time, normalized
        const maxTime = 20 // assume 20 min is max
        const speedRating = Math.max(0, Math.min(1, 1 - (avgActual / maxTime)))

        return {
            itemId: stats.itemId,
            itemName: stats.itemName,
            avgActualTime: Math.round(avgActual * 10) / 10,
            avgEstimatedTime: Math.round(avgEstimated * 10) / 10,
            orderCount: stats.actualTimes.length,
            speedRating,
            reliabilityScore
        }
    })

    // Sort by speed rating (fastest first)
    return performances.sort((a, b) => b.speedRating - a.speedRating)
}

// Calculate canteen performance
export function calculateCanteenPerformance(): CanteenPerformance[] {
    const data = loadAnalytics()
    const completedOrders = data.filter(o => o.actualPrepTime !== null)

    const canteenStats: Record<string, {
        canteenId: number | string
        allTimes: number[]
        peakTimes: number[]
        offPeakTimes: number[]
        estimatedTimes: number[]
    }> = {}

    completedOrders.forEach(order => {
        const isPeakHour = (order.hourOfDay >= 11 && order.hourOfDay <= 14) ||
            (order.hourOfDay >= 18 && order.hourOfDay <= 20)

        order.items.forEach(item => {
            if (!canteenStats[item.canteenId]) {
                canteenStats[item.canteenId] = {
                    canteenId: item.canteenId,
                    allTimes: [],
                    peakTimes: [],
                    offPeakTimes: [],
                    estimatedTimes: []
                }
            }

            if (order.actualPrepTime) {
                canteenStats[item.canteenId].allTimes.push(order.actualPrepTime)
                canteenStats[item.canteenId].estimatedTimes.push(item.estimatedTime)

                if (isPeakHour) {
                    canteenStats[item.canteenId].peakTimes.push(order.actualPrepTime)
                } else {
                    canteenStats[item.canteenId].offPeakTimes.push(order.actualPrepTime)
                }
            }
        })
    })

    return Object.values(canteenStats).map(stats => {
        const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

        const beatCount = stats.allTimes.filter((actual, i) => actual <= stats.estimatedTimes[i]).length
        const reliabilityScore = stats.allTimes.length > 0 ? beatCount / stats.allTimes.length : 0

        return {
            canteenId: stats.canteenId,
            avgPrepTime: Math.round(avg(stats.allTimes) * 10) / 10,
            peakHourAvg: Math.round(avg(stats.peakTimes) * 10) / 10,
            offPeakAvg: Math.round(avg(stats.offPeakTimes) * 10) / 10,
            totalOrders: stats.allTimes.length,
            reliabilityScore
        }
    }).sort((a, b) => a.avgPrepTime - b.avgPrepTime)
}

// Get AI insights for recommendations
export function getAIInsights(): AIInsights {
    const data = loadAnalytics()
    const completedOrders = data.filter(o => o.actualPrepTime !== null)

    const itemPerf = calculateItemPerformance()
    const canteenPerf = calculateCanteenPerformance()

    // Determine data confidence
    let dataConfidence: 'low' | 'medium' | 'high' = 'low'
    if (completedOrders.length >= 50) dataConfidence = 'high'
    else if (completedOrders.length >= 20) dataConfidence = 'medium'

    // Peak hour recommendation
    const now = new Date()
    const isPeakHour = (now.getHours() >= 11 && now.getHours() <= 14) ||
        (now.getHours() >= 18 && now.getHours() <= 20)

    let peakRec = ''
    if (canteenPerf.length > 0) {
        const bestPeakCanteen = canteenPerf.sort((a, b) =>
            isPeakHour ? a.peakHourAvg - b.peakHourAvg : a.offPeakAvg - b.offPeakAvg
        )[0]
        peakRec = `Canteen ${bestPeakCanteen.canteenId} is ${isPeakHour ? 'fastest during peak hours' : 'currently quick'}`
    }

    return {
        fastestItems: itemPerf.slice(0, 5), // Top 5 fastest
        bestCanteen: canteenPerf[0] || null,
        peakHourRecommendation: peakRec,
        dataConfidence,
        totalOrdersAnalyzed: completedOrders.length
    }
}

// Get learned ETA for an item (if we have data)
export function getLearnedETA(itemId: string): number | null {
    const itemPerf = calculateItemPerformance()
    const item = itemPerf.find(p => p.itemId === itemId)

    if (item && item.orderCount >= 3) {
        return item.avgActualTime
    }
    return null // Not enough data, use default
}
