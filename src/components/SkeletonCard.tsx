'use client'

export function SkeletonCard({ variant = 'menu' }: { variant?: 'menu' | 'canteen' | 'order' }) {
    if (variant === 'canteen') {
        return (
            <div className="rounded-2xl border border-[#f0e0d6] dark:border-[#2d1f1a] bg-white dark:bg-[#1a1210] p-4">
                <div className="flex items-start gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-xl skeleton" />
                    <div className="flex-1 space-y-2">
                        <div className="h-5 w-3/4 skeleton" />
                        <div className="h-4 w-1/2 skeleton" />
                        <div className="flex gap-2 mt-2">
                            <div className="h-5 w-16 rounded-full skeleton" />
                            <div className="h-5 w-12 rounded-full skeleton" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (variant === 'order') {
        return (
            <div className="rounded-2xl border border-[#f0e0d6] dark:border-[#2d1f1a] bg-white dark:bg-[#1a1210] p-4 space-y-3">
                <div className="flex justify-between">
                    <div className="space-y-2">
                        <div className="h-5 w-20 skeleton" />
                        <div className="h-4 w-32 skeleton" />
                    </div>
                    <div className="h-6 w-20 rounded-full skeleton" />
                </div>
                <div className="space-y-1">
                    <div className="h-4 w-full skeleton" />
                    <div className="h-4 w-3/4 skeleton" />
                </div>
                <div className="border-t border-[#f0e0d6] dark:border-[#2d1f1a] pt-3 flex justify-between">
                    <div className="h-5 w-12 skeleton" />
                    <div className="h-5 w-16 skeleton" />
                </div>
            </div>
        )
    }

    // Menu card skeleton (default)
    return (
        <div className="rounded-2xl border border-[#f0e0d6] dark:border-[#2d1f1a] bg-white dark:bg-[#1a1210] overflow-hidden">
            <div className="aspect-[16/10] sm:aspect-[4/3] skeleton" />
            <div className="p-3 sm:p-4 space-y-3">
                <div className="flex justify-between gap-2">
                    <div className="h-5 w-2/3 skeleton" />
                    <div className="h-5 w-16 skeleton" />
                </div>
                <div className="flex justify-between items-center">
                    <div className="h-4 w-20 skeleton" />
                    <div className="h-9 w-20 rounded-xl skeleton" />
                </div>
            </div>
        </div>
    )
}

export function SkeletonGrid({ count = 6, variant = 'menu' }: { count?: number; variant?: 'menu' | 'canteen' | 'order' }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`animate-fade-in-up delay-${Math.min(i + 1, 8)}`}>
                    <SkeletonCard variant={variant} />
                </div>
            ))}
        </>
    )
}
