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

export interface Voucher {
    id: string
    title: string
    description: string
    discount_amount: number
    expires_at: string
}

interface RewardsData {
    balance: number
    lifetime_earned: number
    total_orders: number
    first_order_claimed: boolean
    streak_3_day: number
    streak_7_day: number
    streak_7_day: number
    active_vouchers: Voucher[]
    transactions: RewardTransaction[]
    meter_max: number
}

interface RewardsContextType {
    rewards: RewardsData | null
    isLoading: boolean
    refreshRewards: () => Promise<void>
}

const defaultRewards: RewardsData = {
    balance: 0,
    lifetime_earned: 0,
    total_orders: 0,
    first_order_claimed: false,
    streak_3_day: 0,
    streak_7_day: 0,
    active_vouchers: [],
    transactions: [],
    meter_max: 200
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

    return (
        <RewardsContext.Provider value={{
            rewards: rewards || defaultRewards,
            isLoading,
            refreshRewards: fetchRewards,
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
