'use client'

import Link from 'next/link'
import { Clock, ChefHat, Package, CheckCircle, ArrowLeft } from 'lucide-react'
import { useOrders, Order } from '@/components/OrdersProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

const STATUS_CONFIG: Record<Order['status'], { icon: typeof Clock; variant: 'default' | 'secondary' | 'success' | 'warning' }> = {
    pending: { icon: Clock, variant: 'warning' },
    preparing: { icon: ChefHat, variant: 'secondary' },
    ready: { icon: Package, variant: 'success' },
    completed: { icon: CheckCircle, variant: 'default' }
}

export default function OrdersPage() {
    const { orders, updateOrderStatus } = useOrders()
    const t = useTranslations('Orders')
    const tCommon = useTranslations('Common')

    const statusLabels: Record<Order['status'], string> = {
        pending: t('received'),
        preparing: t('preparing'),
        ready: t('ready'),
        completed: t('completed')
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <Link href="/profile" className="mb-6 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900">
                <ArrowLeft className="h-4 w-4" />
                {t('backToProfile')}
            </Link>

            <h1 className="mb-6 text-2xl font-semibold">{t('title')}</h1>

            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map(order => {
                        const config = STATUS_CONFIG[order.status]
                        const Icon = config.icon

                        return (
                            <Card key={order.id}>
                                <CardContent className="p-4">
                                    <div className="mb-3 flex items-start justify-between">
                                        <div>
                                            <p className="font-mono text-lg font-bold">{order.token_number || order.id}</p>
                                            <p className="text-sm text-neutral-500">{formatDate(order.created_at)}</p>
                                        </div>
                                        <Badge variant={config.variant} className="gap-1">
                                            <Icon className="h-3 w-3" />
                                            {statusLabels[order.status]}
                                        </Badge>
                                    </div>

                                    <div className="mb-3 space-y-1">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span>{item.quantity}x {item.name}</span>
                                                <span className="text-neutral-500">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
                                        <span className="font-medium">{t('total')}</span>
                                        <span className="font-semibold">₹{order.total}</span>
                                    </div>

                                    {/* Mark as completed button for ready orders */}
                                    {order.status === 'ready' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'completed')}
                                            className="mt-3 w-full rounded-lg bg-emerald-500 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                                        >
                                            {t('markPickedUp')}
                                        </button>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="py-16 text-center">
                    <p className="mb-4 text-neutral-500">{tCommon('noOrders')}</p>
                    <Link href="/menu" className="text-neutral-900 underline hover:no-underline">
                        {t('browseMenu')}
                    </Link>
                </div>
            )}
        </div>
    )
}
