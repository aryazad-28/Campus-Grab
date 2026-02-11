'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Store, Clock, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CanteenInfo {
    id: string
    canteen_name: string
    college_name: string
    area: string
    status: string
}

export default function CanteensPage() {
    const router = useRouter()
    const [canteens, setCanteens] = useState<CanteenInfo[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const loadCanteens = async () => {
            if (!supabase) {
                setIsLoading(false)
                return
            }

            try {
                const { data, error } = await supabase
                    .from('admin_profiles')
                    .select('id, canteen_name, college_name, area, status')
                    .eq('status', 'approved')

                if (!error && data) {
                    setCanteens(data)
                }
            } catch (err) {
                console.error('Failed to load canteens:', err)
            }

            setIsLoading(false)
        }

        loadCanteens()
    }, [])

    const filteredCanteens = useMemo(() => {
        if (!searchQuery) return canteens
        const q = searchQuery.toLowerCase()
        return canteens.filter(c =>
            c.canteen_name.toLowerCase().includes(q) ||
            c.college_name.toLowerCase().includes(q) ||
            c.area.toLowerCase().includes(q)
        )
    }, [canteens, searchQuery])

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6 pb-32">
            <div className="mb-6">
                <h1 className="text-xl font-semibold sm:text-2xl mb-1">Canteens Near You</h1>
                <p className="text-sm text-neutral-500">Select a canteen to browse their menu</p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                    type="search"
                    placeholder="Search by name, college, or area..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Canteen Cards */}
            {filteredCanteens.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCanteens.map(canteen => (
                        <Card
                            key={canteen.id}
                            className="cursor-pointer border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-md transition-all active:scale-[0.98]"
                            onClick={() => {
                                localStorage.setItem('campus-grab-selected-canteen', canteen.id)
                                router.push(`/menu?canteen=${canteen.id}`)
                            }}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30">
                                        <Store className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-base truncate">{canteen.canteen_name}</h3>
                                        <p className="text-sm text-neutral-500 truncate">{canteen.college_name}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="flex items-center gap-1 text-xs text-neutral-400">
                                                <MapPin className="h-3 w-3" />
                                                {canteen.area}
                                            </span>
                                            <Badge variant="secondary" className="text-[10px] px-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                <Clock className="h-2.5 w-2.5 mr-0.5" />
                                                Open
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-16 text-center">
                    <Store className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600 mb-4" />
                    <h2 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                        {searchQuery ? 'No canteens found' : 'No canteens available yet'}
                    </h2>
                    <p className="text-sm text-neutral-400">
                        {searchQuery ? 'Try a different search term' : 'Check back later — canteens are being set up'}
                    </p>
                </div>
            )}
        </div>
    )
}
