'use client'

import Image from 'next/image'
import { Clock, Plus, Check } from 'lucide-react'
import { useState } from 'react'
import { MenuItem } from '@/lib/supabase'
import { useCart } from './CartProvider'
import { formatPrice, formatTime } from '@/lib/utils'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

interface MenuCardProps {
    item: MenuItem
}

export function MenuCard({ item }: MenuCardProps) {
    const { addToCart } = useCart()
    const [added, setAdded] = useState(false)

    const handleAdd = () => {
        addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            eta_minutes: item.eta_minutes
        })
        setAdded(true)
        setTimeout(() => setAdded(false), 1500)
    }

    return (
        <Card className="overflow-hidden transition-all hover:shadow-lg active:shadow-sm active:scale-[0.98] group">
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-50 dark:bg-slate-800 sm:aspect-[4/3]">
                {item.image_url ? (
                    <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <span className="text-3xl">🍽️</span>
                    </div>
                )}
                <Badge className="absolute right-2 top-2 text-xs" variant="secondary">
                    {item.category}
                </Badge>
            </div>

            <CardContent className="p-3 sm:p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold leading-tight sm:text-base">{item.name}</h3>
                    <span className="shrink-0 text-sm font-bold text-red-600 dark:text-red-400 sm:text-base">{formatPrice(item.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span>{formatTime(item.eta_minutes)}</span>
                    </div>
                    <Button
                        size="sm"
                        variant={added ? "emerald" : "default"}
                        onClick={handleAdd}
                        className="h-9 min-w-[80px] gap-1 text-xs sm:h-8 sm:text-sm"
                        disabled={added}
                    >
                        {added ? (
                            <>
                                <Check className="h-3.5 w-3.5" />
                                Added
                            </>
                        ) : (
                            <>
                                <Plus className="h-3.5 w-3.5" />
                                Add
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
