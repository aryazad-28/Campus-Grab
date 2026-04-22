'use client'

import Link from 'next/link'
import { ArrowLeft, Star, Gift, Clock, TrendingUp, Flame, AlertTriangle, Zap, Award } from 'lucide-react'
import { useRewards } from '@/components/RewardsProvider'
import { formatPrice } from '@/lib/utils'

export default function RewardsPage() {
    const { rewards, isLoading } = useRewards()

    if (isLoading || !rewards) {
        return (
            <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <p style={{ color: 'var(--muted-foreground)' }}>Loading rewards...</p>
            </div>
        )
    }

    const streakProgress3Day = Math.min(rewards.streak_3_day, 3)
    const streakProgress7Day = Math.min(rewards.streak_7_day, 5)

    return (
        <div className="container mx-auto max-w-lg px-4 py-6 pb-32">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/profile"
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-lg font-semibold">Rewards</h1>
            </div>

            {/* Balance Hero Card */}
            <div
                className="relative rounded-2xl overflow-hidden mb-6 animate-fade-in-up"
                style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                }}
            >
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white/30" />
                    <div className="absolute bottom-2 left-6 w-20 h-20 rounded-full border border-white/20" />
                </div>
                <div className="relative p-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Star className="h-5 w-5 text-white fill-white/80" />
                        <span className="text-white/80 text-sm font-medium">Your Points</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-4xl font-bold text-white">{rewards.balance}</span>
                        <span className="text-white/60 text-sm">pts</span>
                    </div>
                    
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-white/80 mb-1">
                            <span>Progress to next voucher</span>
                            <span>{rewards.balance} / 200 pts</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div 
                                className="bg-white h-1.5 rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(100, (rewards.balance / 200) * 100)}%` }} 
                            />
                        </div>
                        <p className="text-white/70 text-xs">
                            Lifetime earned: {rewards.lifetime_earned} pts • {rewards.total_orders} Total Orders
                        </p>
                    </div>
                </div>
            </div>

            {/* Active Vouchers */}
            {rewards.active_vouchers && rewards.active_vouchers.length > 0 && (
                <div className="mb-6 animate-fade-in-up delay-1">
                    <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
                        <Gift className="h-4 w-4" /> ACTIVE VOUCHERS
                    </h2>
                    <div className="space-y-3">
                        {rewards.active_vouchers.map(voucher => (
                            <div
                                key={voucher.id}
                                className="rounded-xl p-4 flex items-center gap-4"
                                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                                    <Gift className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-emerald-600 dark:text-emerald-400 truncate pr-2">
                                            {voucher.title}
                                        </h3>
                                        <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                                            -₹{voucher.discount_amount}
                                        </span>
                                    </div>
                                    <p className="text-xs mb-2 text-neutral-600 dark:text-neutral-400">
                                        {voucher.description}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 w-fit px-2 py-0.5 rounded-md">
                                        <Clock className="h-3 w-3" />
                                        Expires {new Date(voucher.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Streak Trackers */}
            <div className="mb-6 animate-fade-in-up delay-1">
                <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--muted-foreground)' }}>
                    STREAKS
                </h2>
                <div className="space-y-3">
                    {/* 3-day streak */}
                    <div
                        className="rounded-xl p-3.5"
                        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Flame className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium">3-Day Streak</span>
                            </div>
                            <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
                                {streakProgress3Day}/3 orders
                            </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--card-elevated)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${(streakProgress3Day / 3) * 100}%`,
                                    background: 'linear-gradient(90deg, #f97316, #ef4444)',
                                }}
                            />
                        </div>
                        <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted-foreground)' }}>
                            {streakProgress3Day >= 3
                                ? '🎉 Streak completed! +20 bonus pts'
                                : `${3 - streakProgress3Day} more order${3 - streakProgress3Day !== 1 ? 's' : ''} in 3 days → +20 pts`
                            }
                        </p>
                    </div>

                    {/* 7-day streak */}
                    <div
                        className="rounded-xl p-3.5"
                        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-purple-500" />
                                <span className="text-sm font-medium">7-Day Streak</span>
                            </div>
                            <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
                                {streakProgress7Day}/5 orders
                            </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--card-elevated)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${(streakProgress7Day / 5) * 100}%`,
                                    background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                                }}
                            />
                        </div>
                        <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted-foreground)' }}>
                            {streakProgress7Day >= 5
                                ? '🎉 Streak completed! +50 bonus pts'
                                : `${5 - streakProgress7Day} more order${5 - streakProgress7Day !== 1 ? 's' : ''} in 7 days → +50 pts`
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="mb-6 animate-fade-in-up delay-2">
                <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--muted-foreground)' }}>
                    HOW IT WORKS
                </h2>
                <div
                    className="rounded-xl overflow-hidden"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                >
                    <div className="p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                                style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Earn Points</p>
                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                    10 pts per order • Fills up your Reward Meter
                                </p>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)' }} />

                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                                style={{ backgroundColor: 'rgba(99,102,241,0.1)' }}>
                                <Gift className="h-4 w-4 text-indigo-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Unlock Vouchers</p>
                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                    Every 200 pts unlocks a ₹15 off voucher. Milestones & Streaks unlock bigger bonuses!
                                </p>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)' }} />

                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                                style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}>
                                <Flame className="h-4 w-4 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Streak & Milestone Bonuses</p>
                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                    3 orders in 3 days → ₹20 off voucher<br />
                                    Every 5th order → ₹30 off voucher
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="animate-fade-in-up delay-3">
                <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--muted-foreground)' }}>
                    RECENT ACTIVITY
                </h2>
                <div
                    className="rounded-xl overflow-hidden"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                >
                    {rewards.transactions.length === 0 ? (
                        <div className="p-6 text-center">
                            <Award className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                No activity yet. Place your first order to start earning!
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                            {rewards.transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-3.5">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div
                                            className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                                            style={{
                                                backgroundColor: tx.type === 'earned'
                                                    ? 'rgba(34,197,94,0.1)'
                                                    : tx.type === 'redeemed'
                                                        ? 'rgba(99,102,241,0.1)'
                                                        : 'rgba(239,68,68,0.1)',
                                            }}
                                        >
                                            {tx.type === 'earned' && <TrendingUp className="h-3.5 w-3.5 text-green-500" />}
                                            {tx.type === 'redeemed' && <Gift className="h-3.5 w-3.5 text-indigo-500" />}
                                            {tx.type === 'expired' && <Clock className="h-3.5 w-3.5 text-red-500" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{tx.description}</p>
                                            <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                                                {new Date(tx.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-semibold shrink-0 ml-3 ${tx.type === 'earned' ? 'text-green-500' :
                                        tx.type === 'redeemed' ? 'text-indigo-500' : 'text-red-500'
                                        }`}>
                                        {tx.type === 'earned' ? '+' : '−'}{tx.points}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
