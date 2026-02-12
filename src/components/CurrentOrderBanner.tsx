'use client'

import { useOrders, Order } from './OrdersProvider'
import { Clock, ChefHat, CheckCircle, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<Order['status'], { label: string; icon: typeof Clock; color: string }> = {
    pending: { label: 'Order Received', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    preparing: { label: 'Preparing', icon: ChefHat, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    ready: { label: 'Ready for Pickup', icon: Package, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    completed: { label: 'Completed', icon: CheckCircle, color: 'text-neutral-600 bg-neutral-50 border-neutral-200' }
}

export function CurrentOrderBanner() {
    const { currentOrder } = useOrders()

    if (!currentOrder) return null

    const config = STATUS_CONFIG[currentOrder.status]
    const Icon = config.icon

    return (
        <div className={cn(
            "fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border p-4 shadow-lg",
            config.color
        )}>
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium">{config.label}</p>
                    <p className="text-xs opacity-75">Order #{currentOrder.id}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium">{currentOrder.items.length} items</p>
                    <p className="text-xs opacity-75">₹{currentOrder.total}</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 flex gap-1">
                {(['pending', 'preparing', 'ready'] as const).map((status, idx) => {
                    const isActive = ['pending', 'preparing', 'ready', 'completed'].indexOf(currentOrder.status) >= idx
                    return (
                        <div
                            key={status}
                            className={cn(
                                "h-1 flex-1 rounded-full transition-colors",
                                isActive ? "bg-current opacity-60" : "bg-current opacity-20"
                            )}
                        />
                    )
                })}
            </div>
        </div>
    )
}
