'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthProvider'

interface RewardTransaction {
    id: string
    type: 'earned' | 'redeemed' | 'expired'
    points: number
    description: string
    created_at: string
}

interface RewardsData {
    balance: number
    lifetime_earned: number
    total_orders: number
    first_order_claimed: boolean
    streak_3_day: number
    streak_7_day: number
    next_expiry: string | null
    expiring_points: number
    can_redeem_frequency: boolean
    days_until_next_redemption: number
    transactions: RewardTransaction[]
}

interface RewardsContextType {
    rewards: RewardsData | null
    isLoading: boolean
    refreshRewards: () => Promise<void>
    redeemPoints: (points: number, orderTotal: number, orderId: string) => Promise<{ success: boolean; error?: string }>
}

const defaultRewards: RewardsData = {
    balance: 0,
    lifetime_earned: 0,
    total_orders: 0,
    first_order_claimed: false,
    streak_3_day: 0,
    streak_7_day: 0,
    next_expiry: null,
    expiring_points: 0,
    can_redeem_frequency: true,
    days_until_next_redemption: 0,
    transactions: [],
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined)

export function RewardsProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth()
    const [rewards, setRewards] = useState<RewardsData | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const fetchRewards = useCallback(async () => {
        if (!user?.id) return
        setIsLoading(true)
        try {
            const res = await fetch(`/api/rewards?userId=${user.id}`)
            if (res.ok) {
                const data = await res.json()
                setRewards(data)
            }
        } catch (err) {
            console.error('Failed to fetch rewards:', err)
        } finally {
            setIsLoading(false)
        }
    }, [user?.id])

    // Load rewards when user authenticates
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchRewards()
        } else {
            setRewards(null)
        }
    }, [isAuthenticated, user?.id, fetchRewards])

    const redeemPoints = useCallback(async (points: number, orderTotal: number, orderId: string) => {
        if (!user?.id) return { success: false, error: 'Not authenticated' }

        try {
            const res = await fetch('/api/rewards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    orderId,
                    orderTotal,
                }),
            })

            const data = await res.json()

            if (!res.ok || data.success === false) {
                return { success: false, error: data.error || 'Failed to redeem points' }
            }

            // Update local state by forcing a refresh
            await fetchRewards()

            return { success: true }
        } catch (err) {
            return { success: false, error: 'Network error' }
        }
    }, [user?.id, fetchRewards])

    return (
        <RewardsContext.Provider value={{
            rewards: rewards || defaultRewards,
            isLoading,
            refreshRewards: fetchRewards,
            redeemPoints,
        }}>
            {children}
        </RewardsContext.Provider>
    )
}

export function useRewards() {
    const context = useContext(RewardsContext)
    if (!context) {
        throw new Error('useRewards must be used within a RewardsProvider')
    }
    return context
}
