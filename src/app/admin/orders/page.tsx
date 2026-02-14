'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, ChefHat, Package, CheckCircle, Loader2, RefreshCw } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { useOrders, Order } from '@/components/OrdersProvider'
import { useAI } from '@/components/AIProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

export default function AdminOrdersPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading } = useAdmin()
    const { orders, updateOrderStatus } = useOrders()
    const { markOrderComplete } = useAI()
    const [filter, setFilter] = useState<Order['status'] | 'all'>('all')
    const t = useTranslations('Admin')

    // Moved configuration inside component to use translations
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

    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
        )
    }

    // Filter out 'pending' orders - only show paid orders (preparing and above)
    const paidOrders = orders.filter(o => o.status !== 'pending')

    const filteredOrders = filter === 'all'
        ? paidOrders
        : paidOrders.filter(o => o.status === filter)

    const preparingCount = paidOrders.filter(o => o.status === 'preparing').length
    const readyCount = paidOrders.filter(o => o.status === 'ready').length

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
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

            {/* Status Filters */}
            <div className="border-b border-slate-700 bg-slate-800/50">
                <div className="container mx-auto flex gap-2 overflow-x-auto px-4 py-3">
                    <Button
                        variant={filter === 'all' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('all')}
                        className={filter === 'all' ? 'bg-slate-600' : 'text-slate-400'}
                    >
                        All ({paidOrders.length})
                    </Button>
                    <Button
                        variant={filter === 'preparing' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('preparing')}
                        className={filter === 'preparing' ? 'bg-blue-600' : 'text-slate-400'}
                    >
                        Preparing ({preparingCount})
                    </Button>
                    <Button
                        variant={filter === 'ready' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('ready')}
                        className={filter === 'ready' ? 'bg-emerald-600' : 'text-slate-400'}
                    >
                        Ready ({readyCount})
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
                                        {/* Header */}
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

                                        {/* Items */}
                                        <div className="mb-4 space-y-1">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-white">{item.quantity}x {item.name}</span>
                                                    <span className="text-slate-400">₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                                            <div className="font-semibold text-lg">₹{order.total}</div>

                                            {config.nextStatus && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        updateOrderStatus(order.id, config.nextStatus!)
                                                        // Trigger AI learning when order is completed
                                                        if (config.nextStatus === 'completed') {
                                                            markOrderComplete(order.id)
                                                        }
                                                    }}
                                                    className={
                                                        order.status === 'pending' ? 'bg-amber-600 hover:bg-amber-700' :
                                                            order.status === 'preparing' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                                                'bg-slate-600 hover:bg-slate-500'
                                                    }
                                                >
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
        </div>
    )
}
