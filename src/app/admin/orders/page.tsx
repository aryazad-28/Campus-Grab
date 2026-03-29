'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, ChefHat, Package, CheckCircle, Loader2, RefreshCw, Volume2, VolumeX } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { useOrders, Order } from '@/components/OrdersProvider'
import { useAI } from '@/components/AIProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { unlockAudio, isAudioReady } from '@/lib/notification-sound'

export default function AdminOrdersPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading, admin } = useAdmin()
    const { orders, updateOrderStatus } = useOrders()
    const { markOrderComplete } = useAI()
    const [filter, setFilter] = useState<Order['status'] | 'all'>('all')
    const t = useTranslations('Admin')
    const tOrders = useTranslations('Orders')

    // Aggressively attempt to keep audio unlocked on any interaction
    useEffect(() => {
        const handleInteraction = () => {
            unlockAudio()
        }
        document.addEventListener('click', handleInteraction, { capture: true })
        document.addEventListener('touchstart', handleInteraction, { capture: true, passive: true })
        return () => {
            document.removeEventListener('click', handleInteraction, { capture: true })
            document.removeEventListener('touchstart', handleInteraction, { capture: true })
        }
    }, [])

    const STATUS_CONFIG: Record<Order['status'], { label: string; icon: typeof Clock; color: string; nextStatus?: Order['status']; nextLabel?: string }> = {
        pending: { label: t('newOrders'), icon: Clock, color: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30', nextStatus: 'preparing', nextLabel: t('acceptStart') },
        preparing: { label: t('preparing'), icon: ChefHat, color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30', nextStatus: 'ready', nextLabel: t('markReady') },
        ready: { label: t('ready'), icon: Package, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30', nextStatus: 'completed', nextLabel: t('complete') },
        completed: { label: t('completed'), icon: CheckCircle, color: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700' }
    }

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/admin/login')
        }
    }, [authLoading, isAuthenticated, router])

    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[color:var(--muted-foreground)]" />
            </div>
        )
    }

    // Filter out unverified payments (only show orders where payment was successful)
    // Note: older orders might not have the payment_verified flag, so we also show orders that are past 'pending' state
    const paidOrders = orders.filter(o => (o as any).payment_verified === true || o.status !== 'pending')
    
    const filteredOrders = filter === 'all' ? paidOrders : paidOrders.filter(o => o.status === filter)
    const preparingCount = paidOrders.filter(o => o.status === 'preparing').length
    const readyCount = paidOrders.filter(o => o.status === 'ready').length

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="animate-in fade-in">
            {/* Top Controls & Filters sticky header */}
            <div className="sticky top-[4rem] z-40 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-xl font-bold">{t('orders')}</h1>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]" onClick={() => window.location.reload()}>
                                <RefreshCw className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                    
                    {/* Status Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm"
                            onClick={() => setFilter('all')}
                            className={filter === 'all' ? '' : 'text-[var(--muted-foreground)]'}>
                            All ({paidOrders.length})
                        </Button>
                        <Button variant={filter === 'preparing' ? 'default' : 'outline'} size="sm"
                            onClick={() => setFilter('preparing')}
                            className={filter === 'preparing' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-[var(--muted-foreground)]'}>
                            {t('preparing')} ({preparingCount})
                        </Button>
                        <Button variant={filter === 'ready' ? 'default' : 'outline'} size="sm"
                            onClick={() => setFilter('ready')}
                            className={filter === 'ready' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-[var(--muted-foreground)]'}>
                            {t('ready')} ({readyCount})
                        </Button>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <main className="container mx-auto px-4 py-6 pb-24">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-[var(--muted-foreground)] mb-2">{t('noOrders')}</p>
                        <p className="text-sm text-[var(--muted-foreground)] opacity-70">{t('noOrdersHint')}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => {
                            const config = STATUS_CONFIG[order.status]
                            const Icon = config.icon
                            return (
                                <Card key={order.id} className="relative overflow-hidden">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                        order.status === 'preparing' ? 'bg-blue-500' :
                                        order.status === 'ready' ? 'bg-emerald-500' :
                                        order.status === 'completed' ? 'bg-stone-500' : 'bg-red-500'
                                    }`} />
                                    <CardContent className="p-4 pl-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-mono text-xl font-bold">{order.token_number || order.id}</p>
                                                <p className="text-xs text-[var(--muted-foreground)]">{formatTime(order.created_at)}</p>
                                            </div>
                                            <Badge className={`${config.color} border gap-1 shadow-none font-medium`}>
                                                <Icon className="h-3 w-3" />
                                                {config.label}
                                            </Badge>
                                        </div>
                                        <div className="mb-4 space-y-2">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="font-medium text-[var(--foreground)]">{item.quantity}x {item.name}</span>
                                                    <span className="text-[var(--muted-foreground)]">₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                                            <div className="font-bold text-lg text-red-500">₹{order.total}</div>
                                            {config.nextStatus && (
                                                <Button size="sm"
                                                    onClick={() => {
                                                        updateOrderStatus(order.id, config.nextStatus!)
                                                        if (config.nextStatus === 'completed') markOrderComplete(order.id)
                                                    }}
                                                    className={
                                                        order.status === 'pending' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                                                            order.status === 'preparing' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                                                                ''
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
        </div>
    )
}
