'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Clock, ChefHat, Package, CheckCircle, ArrowLeft, Utensils, ChevronDown, Loader2, CalendarDays } from 'lucide-react'
import { useOrders, Order } from '@/components/OrdersProvider'
import { useAuth } from '@/components/AuthProvider'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

const STATUS_STEPS = ['pending', 'preparing', 'ready', 'completed'] as const

/* Vertical timeline */
function OrderTimeline({ status }: { status: Order['status'] }) {
    const t = useTranslations('Orders')
    const currentIdx = STATUS_STEPS.indexOf(status)

    const STATUS_CONFIG = {
        pending: { label: t('orderReceived'), sublabel: t('inProgress'), icon: CheckCircle, activeColor: 'text-red-500', activeBg: 'bg-red-500' },
        preparing: { label: t('preparing'), sublabel: t('beingCooked'), icon: Clock, activeColor: 'text-amber-500', activeBg: 'bg-amber-500' },
        ready: { label: t('readyForPickup'), sublabel: t('waitingAtCounter'), icon: Package, activeColor: 'text-green-500', activeBg: 'bg-green-500' },
        completed: { label: t('pickedUp'), sublabel: t('completed'), icon: Utensils, activeColor: 'text-[var(--muted-foreground)]', activeBg: 'bg-[var(--muted-foreground)]' }
    }

    return (
        <div className="space-y-0">
            {STATUS_STEPS.map((step, idx) => {
                const config = STATUS_CONFIG[step]
                const Icon = config.icon
                const isCompleted = idx < currentIdx
                const isActive = idx === currentIdx
                const isFuture = idx > currentIdx

                return (
                    <div key={step} className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
                                isCompleted && `${config.activeBg} text-white`,
                                isActive && `${config.activeBg} text-white animate-pulse-glow`,
                                isFuture && "bg-[var(--card-elevated)] text-[var(--muted-foreground)]"
                            )}>
                                <Icon className="h-5 w-5" />
                            </div>
                            {idx < STATUS_STEPS.length - 1 && (
                                <div className={cn(
                                    "w-0.5 h-8 my-1 rounded-full transition-colors",
                                    idx < currentIdx ? config.activeBg : "bg-[var(--border)]"
                                )} />
                            )}
                        </div>
                        <div className="pt-2">
                            <p className={cn(
                                "text-sm font-medium",
                                isActive ? config.activeColor : isCompleted ? "" : "text-[var(--muted-foreground)]"
                            )}>
                                {config.label}
                            </p>
                            {isActive && (
                                <p className="text-xs text-[var(--muted-foreground)]">{config.sublabel}</p>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

interface HistoryDay {
    date: string
    orders: Order[]
    orderCount: number
    totalRevenue: number
}

const MONTH_KEYS = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
] as const

export default function OrdersPage() {
    const { orders, updateOrderStatus } = useOrders()
    const { user } = useAuth()
    const t = useTranslations('Orders')
    const tCommon = useTranslations('Common')

    const [historyDays, setHistoryDays] = useState<HistoryDay[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState<string>('all')
    const [showMonthDropdown, setShowMonthDropdown] = useState(false)

    const activeOrders = orders.filter(o => o.status !== 'completed')

    // Fetch order history from API
    const fetchHistory = useCallback(async () => {
        if (!user?.id) return
        setIsLoadingHistory(true)
        try {
            let url = `/api/orders/history?user_id=${user.id}`
            if (selectedMonth !== 'all') {
                const now = new Date()
                url += `&month=${selectedMonth}&year=${now.getFullYear()}`
            }
            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                setHistoryDays(data.days || [])
            }
        } catch (err) {
            console.error('Failed to fetch history:', err)
        } finally {
            setIsLoadingHistory(false)
        }
    }, [user?.id, selectedMonth])

    useEffect(() => {
        fetchHistory()
    }, [fetchHistory])

    const formatDateHeader = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00')
        const today = new Date()
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) return tCommon('today')
        if (date.toDateString() === yesterday.toDateString()) return tCommon('yesterday')

        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }

    // Active order tracking view
    if (activeOrders.length > 0) {
        const order = activeOrders[0]

        return (
            <div className="container mx-auto max-w-md px-4 py-6 pb-32">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
                    <Link href="/canteens" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--border)]">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold">{t('orderTracking')}</h1>
                        <p className="text-xs text-[var(--muted-foreground)]">{order.token_number || `ORD-${order.id}`}</p>
                    </div>
                </div>

                {/* Order Status Card */}
                <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 mb-4 animate-fade-in-up delay-1">
                    <h2 className="text-base font-semibold mb-4">{t('orderStatus')}</h2>
                    <OrderTimeline status={order.status} />
                </div>

                {/* Order Details */}
                <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 mb-4 animate-fade-in-up delay-2">
                    <h2 className="text-base font-semibold mb-3">{t('orderDetails')}</h2>
                    <div className="space-y-2">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-[var(--muted-foreground)]">{item.quantity}x {item.name}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                        <div className="border-t border-[var(--border)] pt-2 flex justify-between font-medium">
                            <span>{tCommon('total')}</span>
                            <span className="text-red-500">₹{order.total}</span>
                        </div>
                    </div>
                </div>

                {order.status === 'ready' && (
                    <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="w-full h-12 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all active:scale-[0.98] animate-fade-in-up delay-3"
                    >
                        {t('markPickedUp')}
                    </button>
                )}

                {/* Other active orders */}
                {activeOrders.length > 1 && (
                    <div className="mt-6 space-y-3">
                        <h3 className="text-sm font-medium text-[var(--muted-foreground)]">{t('otherActiveOrders')}</h3>
                        {activeOrders.slice(1).map(o => (
                            <div key={o.id} className="rounded-xl bg-[var(--card)] border border-[var(--border)] p-3 flex items-center justify-between">
                                <div>
                                    <p className="font-mono text-sm font-bold">{o.token_number || o.id}</p>
                                    <p className="text-xs text-[var(--muted-foreground)]">{o.items.length} {tCommon('items', { count: o.items.length })} · ₹{o.total}</p>
                                </div>
                                <span className="text-xs font-medium text-amber-500">
                                    {t(o.status === 'pending' ? 'received' : o.status)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Past orders section below active */}
                {historyDays.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">{t('pastOrders')}</h3>
                        {historyDays.map(day => (
                            <div key={day.date} className="mb-4">
                                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase mb-2">{formatDateHeader(day.date)}</p>
                                {day.orders.filter(o => o.status === 'completed').map(o => (
                                    <div key={o.id} className="rounded-xl bg-[var(--card)] border border-[var(--border)] p-3 flex items-center justify-between mb-2 opacity-60">
                                        <div>
                                            <p className="font-mono text-sm font-bold">{o.token_number || o.id}</p>
                                            <p className="text-xs text-[var(--muted-foreground)]">{formatTime(o.created_at)} · ₹{o.total}</p>
                                        </div>
                                        <span className="text-xs text-[var(--muted-foreground)]">{t('completed')}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // Order History View (no active orders)
    return (
        <div className="container mx-auto max-w-md px-4 py-6 pb-32">
            {/* Header with month filter */}
            <div className="flex items-center justify-between mb-5 animate-fade-in-up">
                <h1 className="text-lg font-semibold">{t('title')}</h1>
                <div className="relative">
                    <button
                        onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-sm font-medium hover:bg-[var(--card-elevated)] transition-colors"
                    >
                        <CalendarDays className="h-3.5 w-3.5" />
                        {selectedMonth === 'all' ? t('allMonths') : t(MONTH_KEYS[parseInt(selectedMonth) - 1])}
                        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showMonthDropdown && "rotate-180")} />
                    </button>

                    {showMonthDropdown && (
                        <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                            <button
                                onClick={() => { setSelectedMonth('all'); setShowMonthDropdown(false) }}
                                className={cn(
                                    "w-full px-3 py-2 text-left text-sm hover:bg-[var(--card-elevated)] transition-colors",
                                    selectedMonth === 'all' && "text-red-500 font-medium"
                                )}
                            >
                                {t('allMonths')}
                            </button>
                            {MONTH_KEYS.map((key, idx) => (
                                <button
                                    key={key}
                                    onClick={() => { setSelectedMonth(String(idx + 1)); setShowMonthDropdown(false) }}
                                    className={cn(
                                        "w-full px-3 py-2 text-left text-sm hover:bg-[var(--card-elevated)] transition-colors",
                                        selectedMonth === String(idx + 1) && "text-red-500 font-medium"
                                    )}
                                >
                                    {t(key)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Loading state */}
            {isLoadingHistory && (
                <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)] mb-2" />
                    <p className="text-sm text-[var(--muted-foreground)]">{t('loadingHistory')}</p>
                </div>
            )}

            {/* Empty state */}
            {!isLoadingHistory && historyDays.length === 0 && (
                <div className="text-center py-16 animate-fade-in">
                    <Clock className="mx-auto h-12 w-12 text-[var(--muted-foreground)] opacity-30 mb-4" />
                    <p className="text-[var(--muted-foreground)] mb-4">{t('noOrdersYet')}</p>
                    <Link href="/canteens" className="text-red-500 underline hover:no-underline font-medium">
                        {t('browseCanteens')}
                    </Link>
                </div>
            )}

            {/* Date-grouped orders */}
            {!isLoadingHistory && historyDays.map((day, dayIndex) => (
                <div key={day.date} className={`mb-6 animate-fade-in-up delay-${Math.min(dayIndex + 1, 8)}`}>
                    {/* Date header */}
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                            {formatDateHeader(day.date)}
                        </h2>
                        <span className="text-xs text-[var(--muted-foreground)]">
                            {t('ordersCount', { count: day.orderCount })}
                        </span>
                    </div>

                    {/* Orders for this date */}
                    <div className="space-y-3">
                        {day.orders.map((order) => (
                            <div key={order.id} className="rounded-xl bg-[var(--card)] border border-[var(--border)] p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-mono font-bold">{order.token_number || order.id}</p>
                                    <span className="text-xs text-[var(--muted-foreground)]">{formatTime(order.created_at)}</span>
                                </div>
                                <div className="space-y-1">
                                    {order.items.map((item: any, idx: number) => (
                                        <p key={idx} className="text-sm text-[var(--muted-foreground)]">{item.quantity}x {item.name}</p>
                                    ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-[var(--border)] flex justify-between text-sm font-medium">
                                    <span>{tCommon('total')}</span>
                                    <span>₹{order.total}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
