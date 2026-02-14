'use client'

import Image from 'next/image'
import { Clock, Plus, Check } from 'lucide-react'
import { useState } from 'react'
import { MenuItem } from '@/lib/supabase'
import { useCart } from './CartProvider'
import { formatPrice, formatTime } from '@/lib/utils'

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
        setTimeout(() => setAdded(false), 1200)
    }

    return (
        <div className="group">
            {/* Food Image with time badge */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#252525] dark:bg-[#252525] mb-2.5">
                {item.image_url ? (
                    <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-[#1E1E1E]">
                        <span className="text-4xl">🍽️</span>
                    </div>
                )}

                {/* Time badge - top right like Figma */}
                <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-green-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                    <Clock className="h-2.5 w-2.5" />
                    {item.eta_minutes}m
                </div>
            </div>

            {/* Name + Price + Add button row */}
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium leading-tight truncate">{item.name}</h3>
                    <span className="text-sm font-semibold text-red-500">{formatPrice(item.price)}</span>
                </div>

                {/* Circular red + button (matching Figma exactly) */}
                <button
                    onClick={handleAdd}
                    disabled={added}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all active:scale-90 ${added
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                >
                    {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </button>
            </div>
        </div>
    )
}
