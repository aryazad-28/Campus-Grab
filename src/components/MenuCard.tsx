'use client'

import Image from 'next/image'
import { Clock, Plus } from 'lucide-react'
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

    const handleAdd = () => {
        addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            eta_minutes: item.eta_minutes
        })
    }

    return (
        <Card className="group overflow-hidden transition-shadow hover:shadow-md">
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                {item.image_url ? (
                    <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-neutral-400">
                        No image
                    </div>
                )}
                <Badge className="absolute right-2 top-2" variant="secondary">
                    {item.category}
                </Badge>
            </div>
            <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-medium leading-tight">{item.name}</h3>
                    <span className="shrink-0 font-semibold">{formatPrice(item.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-neutral-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatTime(item.eta_minutes)}</span>
                    </div>
                    <Button size="sm" onClick={handleAdd} className="gap-1">
                        <Plus className="h-4 w-4" />
                        Add
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
