'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    TrendingUp,
    DollarSign,
    Clock,
    Timer,
    Trophy,
    Loader2,
    Calendar,
    ShoppingBag
} from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { useOrders, Order } from '@/components/OrdersProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type DateFilter = 'today' | 'week' | 'all'

export default function AdminAnalyticsPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading } = useAdmin()
    const { orders } = useOrders()
    const [dateFilter, setDateFilter] = useState<DateFilter>('today')

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/admin/login')
        }
    }, [authLoading, isAuthenticated, router])

    // Filter orders based on date
    const filteredOrders = useMemo(() => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

        return orders.filter(order => {
            const orderDate = new Date(order.created_at)
            if (dateFilter === 'today') {
                return orderDate >= today
            } else if (dateFilter === 'week') {
                return orderDate >= weekAgo
            }
            return true
        })
    }, [orders, dateFilter])

    // Calculate analytics
    const analytics = useMemo(() => {
        const totalOrders = filteredOrders.length
        const completedOrders = filteredOrders.filter(o => o.status === 'completed')
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0)

        // Calculate average preparation time (from created_at to completed_at)
        let avgPrepTime = 0
        const ordersWithCompletionTime = completedOrders.filter(o => o.completed_at)
        if (ordersWithCompletionTime.length > 0) {
            const totalPrepTime = ordersWithCompletionTime.reduce((sum, order) => {
                const created = new Date(order.created_at).getTime()
                const completed = new Date(order.completed_at!).getTime()
                return sum + (completed - created)
            }, 0)
            avgPrepTime = Math.round(totalPrepTime / ordersWithCompletionTime.length / 60000) // in minutes
        }

        // Calculate most ordered items
        const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {}
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                if (!itemCounts[item.name]) {
                    itemCounts[item.name] = { name: item.name, count: 0, revenue: 0 }
                }
                itemCounts[item.name].count += item.quantity
                itemCounts[item.name].revenue += item.price * item.quantity
            })
        })
        const topItems = Object.values(itemCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        // Pending orders (waiting time indicator)
        const pendingOrders = filteredOrders.filter(o => o.status === 'pending' || o.status === 'preparing')
        let avgWaitingTime = 0
        if (pendingOrders.length > 0) {
            const now = Date.now()
            const totalWait = pendingOrders.reduce((sum, order) => {
                const created = new Date(order.created_at).getTime()
                return sum + (now - created)
            }, 0)
            avgWaitingTime = Math.round(totalWait / pendingOrders.length / 60000) // in minutes
        }

        return {
            totalOrders,
            completedOrders: completedOrders.length,
            totalRevenue,
            avgPrepTime,
            avgWaitingTime,
            topItems,
            pendingOrders: pendingOrders.length
        }
    }, [filteredOrders])

    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
        )
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-800">
                <div className="container mx-auto flex h-14 items-center justify-between px-4">
                    <Link href="/admin" className="flex items-center gap-2 text-slate-400 hover:text-white">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                    <h1 className="text-lg font-semibold">Analytics</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Date Filter */}
            <div className="border-b border-slate-700 bg-slate-800/50">
                <div className="container mx-auto flex gap-2 px-4 py-3">
                    <Button
                        variant={dateFilter === 'today' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setDateFilter('today')}
                        className={dateFilter === 'today' ? 'bg-blue-600' : 'text-slate-400'}
                    >
                        <Calendar className="h-4 w-4 mr-1" />
                        Today
                    </Button>
                    <Button
                        variant={dateFilter === 'week' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setDateFilter('week')}
                        className={dateFilter === 'week' ? 'bg-blue-600' : 'text-slate-400'}
                    >
                        Last 7 Days
                    </Button>
                    <Button
                        variant={dateFilter === 'all' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setDateFilter('all')}
                        className={dateFilter === 'all' ? 'bg-blue-600' : 'text-slate-400'}
                    >
                        All Time
                    </Button>
                </div>
            </div>

            {/* Analytics Content */}
            <main className="container mx-auto px-4 py-6">
                {/* Key Metrics */}
                <div className="grid gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Orders */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/20">
                                    <ShoppingBag className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                                    <p className="text-sm text-slate-400">Total Orders</p>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                {analytics.completedOrders} completed
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Revenue */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/20">
                                    <DollarSign className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
                                    <p className="text-sm text-slate-400">Total Revenue</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Average Prep Time */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/20">
                                    <Clock className="h-5 w-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {analytics.avgPrepTime > 0 ? `${analytics.avgPrepTime} min` : 'N/A'}
                                    </p>
                                    <p className="text-sm text-slate-400">Avg Prep Time</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Current Wait Time */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/20">
                                    <Timer className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {analytics.avgWaitingTime > 0 ? `${analytics.avgWaitingTime} min` : '0 min'}
                                    </p>
                                    <p className="text-sm text-slate-400">Avg Wait Time</p>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                {analytics.pendingOrders} orders in queue
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Items */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-white">
                            <Trophy className="h-5 w-5 text-amber-400" />
                            Most Ordered Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics.topItems.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.topItems.map((item, index) => (
                                    <div
                                        key={item.name}
                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`
                                                flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
                                                ${index === 0 ? 'bg-amber-500 text-black' :
                                                    index === 1 ? 'bg-slate-400 text-black' :
                                                        index === 2 ? 'bg-amber-700 text-white' :
                                                            'bg-slate-600 text-white'}
                                            `}>
                                                {index + 1}
                                            </span>
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{item.count} orders</p>
                                            <p className="text-xs text-slate-400">{formatCurrency(item.revenue)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-8 text-slate-400">
                                No orders yet for this period
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats Summary */}
                <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-medium">Quick Summary</span>
                    </div>
                    <p className="text-sm text-slate-400">
                        {dateFilter === 'today' && `Today you've received ${analytics.totalOrders} orders generating ${formatCurrency(analytics.totalRevenue)} in revenue.`}
                        {dateFilter === 'week' && `This week you've received ${analytics.totalOrders} orders generating ${formatCurrency(analytics.totalRevenue)} in revenue.`}
                        {dateFilter === 'all' && `All time you've received ${analytics.totalOrders} orders generating ${formatCurrency(analytics.totalRevenue)} in revenue.`}
                        {analytics.topItems[0] && ` "${analytics.topItems[0].name}" is your top seller!`}
                    </p>
                </div>
            </main>
        </div>
    )
}
