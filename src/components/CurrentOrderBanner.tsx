'use client'

import Link from 'next/link'
import { useOrders, Order } from './OrdersProvider'
import { Clock, ChefHat, CheckCircle, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_STEPS = ['pending', 'preparing', 'ready'] as const
const STATUS_CONFIG: Record<Order['status'], { label: string; icon: typeof Clock; bg: string; text: string }> = {
    pending: { label: 'Order Received', icon: Clock, bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' },
    preparing: { label: 'Preparing', icon: ChefHat, bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
    ready: { label: 'Ready for Pickup', icon: Package, bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
    completed: { label: 'Completed', icon: CheckCircle, bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400' }
}

export function CurrentOrderBanner() {
    const { currentOrder } = useOrders()

    if (!currentOrder) return null

    const config = STATUS_CONFIG[currentOrder.status]
    const Icon = config.icon
    const currentIdx = STATUS_STEPS.indexOf(currentOrder.status as typeof STATUS_STEPS[number])

    return (
        <Link href="/orders">
            <div className={cn(
                "fixed bottom-[68px] sm:bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl p-4 shadow-lg border transition-all animate-slide-in-bottom",
                config.bg,
                "border-slate-200 dark:border-[#2D2D2D]"
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        currentOrder.status === 'preparing' ? "bg-red-100 dark:bg-red-900/30" : "bg-white/50 dark:bg-white/10",
                        currentOrder.status !== 'completed' && "animate-pulse-glow"
                    )}>
                        <Icon className={cn("h-5 w-5", config.text)} />
                    </div>
                    <div className="flex-1">
                        <p className={cn("text-sm font-medium", config.text)}>{config.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {currentOrder.token_number || `Order #${currentOrder.id}`}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium">{currentOrder.items.length} items</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">₹{currentOrder.total}</p>
                    </div>
                </div>

                <div className="mt-3 flex gap-1">
                    {STATUS_STEPS.map((status, idx) => {
                        const isActive = currentIdx >= idx
                        return (
                            <div
                                key={status}
                                className={cn(
                                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                                    isActive
                                        ? "bg-gradient-to-r from-[#991B1B] to-[#DC2626]"
                                        : "bg-slate-200 dark:bg-slate-700"
                                )}
                            />
                        )
                    })}
                </div>
            </div>
        </Link>
    )
}
