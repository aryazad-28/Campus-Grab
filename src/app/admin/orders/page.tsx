'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, ChefHat, Package, CheckCircle, Loader2, RefreshCw, CalendarDays, ChevronDown, History, IndianRupee } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { useOrders, Order } from '@/components/OrdersProvider'
import { useAI } from '@/components/AIProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

interface DaySummary {
    date: string
    orderCount: number
    totalRevenue: number
}

interface DayOrders {
    date: string
    orders: any[]
    orderCount: number
    totalRevenue: number
}

const MONTH_KEYS = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
] as const

export default function AdminOrdersPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading, admin } = useAdmin()
    const { orders, updateOrderStatus } = useOrders()
    const { markOrderComplete } = useAI()
    const [filter, setFilter] = useState<Order['status'] | 'all'>('all')
    const [activeTab, setActiveTab] = useState<'live' | 'history'>('live')
    const t = useTranslations('Admin')
    const tOrders = useTranslations('Orders')

    // History state
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear] = useState(new Date().getFullYear())
    const [daySummaries, setDaySummaries] = useState<DaySummary[]>([])
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [dayOrders, setDayOrders] = useState<DayOrders | null>(null)
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [showMonthDropdown, setShowMonthDropdown] = useState(false)

    const STATUS_CONFIG: Record<Order['status'], { label: string; icon: typeof Clock; color: string; nextStatus?: Order['status']; nextLabel?: string }> = {
        pending: { label: t('newOrders'), icon: Clock, color: 'bg-amber-100 text-amber-800 border-amber-200', nextStatus: 'preparing', nextLabel: t('acceptStart') },
        preparing: { label: t('preparing'), icon: ChefHat, color: 'bg-blue-100 text-blue-800 border-blue-200', nextStatus: 'ready', nextLabel: t('markReady') },
        ready: { label: t('ready'), icon: Package, color: 'bg-emerald-100 text-emerald-800 border-emerald-200', nextStatus: 'completed', nextLabel: t('complete') },
        completed: { label: t('completed'), icon: CheckCircle, color: 'bg-neutral-100 text-neutral-600 border-neutral-200' }
    }

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/admin/login')
        }
    }, [authLoading, isAuthenticated, router])

    // Fetch month summaries
    const fetchMonthSummaries = useCallback(async () => {
        if (!admin?.id) return
        setIsLoadingHistory(true)
        try {
            const res = await fetch(`/api/orders/vendor?admin_id=${admin.id}&month=${selectedMonth}&year=${selectedYear}`)
            if (res.ok) {
                const data = await res.json()
                setDaySummaries(data.days || [])
            }
        } catch (err) {
            console.error('Failed to fetch month summaries:', err)
        } finally {
            setIsLoadingHistory(false)
        }
    }, [admin?.id, selectedMonth, selectedYear])

    // Fetch day details
    const fetchDayOrders = useCallback(async (date: string) => {
        if (!admin?.id) return
        setIsLoadingHistory(true)
        try {
            const res = await fetch(`/api/orders/vendor?admin_id=${admin.id}&date=${date}`)
            if (res.ok) {
                const data = await res.json()
                setDayOrders(data)
            }
        } catch (err) {
            console.error('Failed to fetch day orders:', err)
        } finally {
            setIsLoadingHistory(false)
        }
    }, [admin?.id])

    useEffect(() => {
        if (activeTab === 'history') {
            if (selectedDate) {
                fetchDayOrders(selectedDate)
            } else {
                fetchMonthSummaries()
            }
        }
    }, [activeTab, selectedDate, fetchMonthSummaries, fetchDayOrders])

    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
        )
    }

    // Filter out 'pending' orders - only show paid orders
    const paidOrders = orders.filter(o => o.status !== 'pending')
    const filteredOrders = filter === 'all' ? paidOrders : paidOrders.filter(o => o.status === filter)
    const preparingCount = paidOrders.filter(o => o.status === 'preparing').length
    const readyCount = paidOrders.filter(o => o.status === 'ready').length

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }

    const formatDateHeader = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Admin Header */}
            <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-800">
                <div className="container mx-auto flex h-14 items-center justify-between px-4">
                    <Link href="/admin" className="flex items-center gap-2 text-slate-400 hover:text-white">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">{t('dashboard')}</span>
                    </Link>
                    <h1 className="text-lg font-semibold">{t('orders')}</h1>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => window.location.reload()}>
                        <RefreshCw className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Tabs: Live / History */}
            <div className="border-b border-slate-700 bg-slate-800/50">
                <div className="container mx-auto flex px-4">
                    <button
                        onClick={() => { setActiveTab('live'); setSelectedDate(null) }}
                        className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'live' ? 'border-red-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-300'
                            }`}
                    >
                        {t('orders')}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'history' ? 'border-red-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-300'
                            }`}
                    >
                        <History className="h-4 w-4" />
                        {t('orderHistory')}
                    </button>
                </div>
            </div>

            {/* LIVE ORDERS TAB */}
            {activeTab === 'live' && (
                <>
                    {/* Status Filters */}
                    <div className="border-b border-slate-700 bg-slate-800/50">
                        <div className="container mx-auto flex gap-2 overflow-x-auto px-4 py-3">
                            <Button variant={filter === 'all' ? 'default' : 'ghost'} size="sm"
                                onClick={() => setFilter('all')}
                                className={filter === 'all' ? 'bg-slate-600' : 'text-slate-400'}>
                                All ({paidOrders.length})
                            </Button>
                            <Button variant={filter === 'preparing' ? 'default' : 'ghost'} size="sm"
                                onClick={() => setFilter('preparing')}
                                className={filter === 'preparing' ? 'bg-blue-600' : 'text-slate-400'}>
                                {t('preparing')} ({preparingCount})
                            </Button>
                            <Button variant={filter === 'ready' ? 'default' : 'ghost'} size="sm"
                                onClick={() => setFilter('ready')}
                                className={filter === 'ready' ? 'bg-emerald-600' : 'text-slate-400'}>
                                {t('ready')} ({readyCount})
                            </Button>
                        </div>
                    </div>

                    {/* Orders List */}
                    <main className="container mx-auto px-4 py-6">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-slate-400 mb-2">{t('noOrders')}</p>
                                <p className="text-sm text-slate-500">{t('noOrdersHint')}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredOrders.map(order => {
                                    const config = STATUS_CONFIG[order.status]
                                    const Icon = config.icon
                                    return (
                                        <Card key={order.id} className="bg-slate-800 border-slate-700">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <p className="font-mono text-xl font-bold text-white">{order.token_number || order.id}</p>
                                                        <p className="text-xs text-slate-500">{formatTime(order.created_at)}</p>
                                                    </div>
                                                    <Badge className={`${config.color} border gap-1`}>
                                                        <Icon className="h-3 w-3" />
                                                        {config.label}
                                                    </Badge>
                                                </div>
                                                <div className="mb-4 space-y-1">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <span className="text-white">{item.quantity}x {item.name}</span>
                                                            <span className="text-slate-400">₹{item.price * item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                                                    <div className="font-semibold text-lg">₹{order.total}</div>
                                                    {config.nextStatus && (
                                                        <Button size="sm"
                                                            onClick={() => {
                                                                updateOrderStatus(order.id, config.nextStatus!)
                                                                if (config.nextStatus === 'completed') markOrderComplete(order.id)
                                                            }}
                                                            className={
                                                                order.status === 'pending' ? 'bg-amber-600 hover:bg-amber-700' :
                                                                    order.status === 'preparing' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                                                        'bg-slate-600 hover:bg-slate-500'
                                                            }>
                                                            {config.nextLabel}
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </main>
                </>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
                <main className="container mx-auto px-4 py-6">
                    {/* Month Selector */}
                    {!selectedDate && (
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-semibold">{t('selectMonth')}</h2>
                            <div className="relative">
                                <button
                                    onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-sm font-medium hover:bg-slate-700 transition-colors"
                                >
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    {tOrders(MONTH_KEYS[selectedMonth - 1])}
                                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showMonthDropdown && (
                                    <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-slate-800 border border-slate-700 shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                                        {MONTH_KEYS.map((key, idx) => (
                                            <button key={key}
                                                onClick={() => { setSelectedMonth(idx + 1); setShowMonthDropdown(false) }}
                                                className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-700 transition-colors ${selectedMonth === idx + 1 ? 'text-red-400 font-medium' : 'text-slate-300'
                                                    }`}>
                                                {tOrders(key)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Back button for day view */}
                    {selectedDate && (
                        <button
                            onClick={() => { setSelectedDate(null); setDayOrders(null) }}
                            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t('backToMonthView')}
                        </button>
                    )}

                    {/* Loading */}
                    {isLoadingHistory && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500">{tOrders('loadingHistory')}</p>
                        </div>
                    )}

                    {/* Month View: Day Summaries */}
                    {!isLoadingHistory && !selectedDate && (
                        <>
                            {daySummaries.length === 0 ? (
                                <div className="text-center py-16">
                                    <p className="text-slate-400">{t('noOrders')}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Monthly total */}
                                    <div className="rounded-xl bg-gradient-to-r from-red-900/40 to-red-800/20 border border-red-800/40 p-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase">{t('monthlyRevenue')}</p>
                                                <p className="text-2xl font-bold text-white">
                                                    ₹{daySummaries.reduce((sum, d) => sum + d.totalRevenue, 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400 uppercase">{t('totalOrders')}</p>
                                                <p className="text-2xl font-bold text-white">
                                                    {daySummaries.reduce((sum, d) => sum + d.orderCount, 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {daySummaries.map(day => (
                                        <button
                                            key={day.date}
                                            onClick={() => setSelectedDate(day.date)}
                                            className="w-full rounded-xl bg-slate-800 border border-slate-700 p-4 flex items-center justify-between hover:bg-slate-750 hover:border-slate-600 transition-colors text-left"
                                        >
                                            <div>
                                                <p className="font-semibold text-white">{formatDateHeader(day.date)}</p>
                                                <p className="text-xs text-slate-400">{tOrders('ordersCount', { count: day.orderCount })}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-emerald-400">₹{day.totalRevenue.toLocaleString()}</p>
                                                <p className="text-xs text-slate-500">{t('viewDetails')} →</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Day View: All orders for a specific date */}
                    {!isLoadingHistory && selectedDate && dayOrders && (
                        <>
                            {/* Day revenue header */}
                            <div className="rounded-xl bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 border border-emerald-800/40 p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase">{t('dailyRevenue')}</p>
                                        <p className="text-2xl font-bold text-white">₹{dayOrders.totalRevenue.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 uppercase">{t('totalOrders')}</p>
                                        <p className="text-2xl font-bold text-white">{dayOrders.orderCount}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Day's orders */}
                            <div className="space-y-3">
                                {dayOrders.orders.map((order: any) => (
                                    <Card key={order.id} className="bg-slate-800 border-slate-700">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="font-mono text-lg font-bold text-white">{order.token_number || order.id}</p>
                                                    <p className="text-xs text-slate-500">{formatTime(order.created_at)}</p>
                                                </div>
                                                <Badge className="bg-neutral-100 text-neutral-600 border-neutral-200 border gap-1">
                                                    <CheckCircle className="h-3 w-3" />
                                                    {t('completed')}
                                                </Badge>
                                            </div>
                                            <div className="mb-3 space-y-1">
                                                {order.items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-white">{item.quantity}x {item.name}</span>
                                                        <span className="text-slate-400">₹{item.price * item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-2 border-t border-slate-700 flex justify-end">
                                                <span className="font-semibold text-lg">₹{order.total}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </main>
            )}
        </div>
    )
}
