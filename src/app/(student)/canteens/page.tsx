'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Store, Clock, Loader2, LocateFixed, Navigation, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { requestUserLocation, calculateDistance, formatDistance, type UserLocation } from '@/lib/geolocation'
import { Input } from '@/components/ui/input'
import { SkeletonGrid } from '@/components/SkeletonCard'

interface CanteenInfo {
    id: string
    canteen_name: string
    college_name: string
    area: string
    status: string
    latitude: number | null
    longitude: number | null
    is_open: boolean
    canteen_image: string | null
    distance?: number
}

export default function CanteensPage() {
    const router = useRouter()
    const [canteens, setCanteens] = useState<CanteenInfo[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
    const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle')

    useEffect(() => {
        const getLocation = async () => {
            setLocationStatus('requesting')
            try {
                const location = await requestUserLocation()
                setUserLocation(location)
                setLocationStatus('granted')
            } catch {
                setLocationStatus('denied')
            }
        }
        getLocation()
    }, [])

    useEffect(() => {
        const loadCanteens = async () => {
            if (!supabase) { setIsLoading(false); return }
            try {
                const { data, error } = await supabase
                    .from('admin_profiles')
                    .select('id, canteen_name, college_name, area, status, latitude, longitude, is_open, canteen_image')
                    .eq('status', 'approved')
                if (!error && data) setCanteens(data)
            } catch (err) {
                console.error('Failed to load canteens:', err)
            }
            setIsLoading(false)
        }
        loadCanteens()
    }, [])

    const sortedCanteens = useMemo(() => {
        let result = [...canteens]
        if (userLocation) {
            result = result.map(canteen => ({
                ...canteen,
                distance: canteen.latitude && canteen.longitude
                    ? calculateDistance(userLocation.latitude, userLocation.longitude, canteen.latitude, canteen.longitude)
                    : undefined
            }))
            result.sort((a, b) => {
                if (a.distance !== undefined && b.distance !== undefined) return a.distance - b.distance
                if (a.distance !== undefined) return -1
                if (b.distance !== undefined) return 1
                return 0
            })
        }
        return result
    }, [canteens, userLocation])

    const filteredCanteens = useMemo(() => {
        if (!searchQuery) return sortedCanteens
        const q = searchQuery.toLowerCase()
        return sortedCanteens.filter(c =>
            c.canteen_name.toLowerCase().includes(q) ||
            c.college_name.toLowerCase().includes(q) ||
            c.area.toLowerCase().includes(q)
        )
    }, [sortedCanteens, searchQuery])

    return (
        <div className="container mx-auto px-4 py-6 pb-32">
            {/* Brand Header */}
            <div className="mb-6 animate-fade-in-up">
                <h1 className="text-2xl font-bold text-red-500 sm:text-3xl">Campus Grab</h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Find food near you</p>
            </div>

            {/* Location Card */}
            <div className="mb-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 animate-fade-in-up delay-1">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
                        <MapPin className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">Your location</p>
                        <p className="font-semibold">Main Campus</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6 animate-fade-in-up delay-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400" />
                <Input
                    type="search"
                    placeholder="Search canteens..."
                    className="pl-10 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* AI Recommendations header */}
            <div className="flex items-center gap-2 mb-4 animate-fade-in-up delay-3">
                <Sparkles className="h-4 w-4 text-red-500" />
                <h2 className="text-base font-semibold">AI Recommendations</h2>
            </div>

            {/* Canteen Cards — Figma style: hero image card */}
            {isLoading ? (
                <div className="space-y-4">
                    <SkeletonGrid count={3} variant="canteen" />
                </div>
            ) : filteredCanteens.length > 0 ? (
                <div className="space-y-4">
                    {filteredCanteens.map((canteen, index) => (
                        <div
                            key={canteen.id}
                            onClick={() => {
                                localStorage.setItem('campus-grab-selected-canteen', canteen.id)
                                router.push(`/menu?canteen=${canteen.id}`)
                            }}
                            className={`cursor-pointer rounded-2xl overflow-hidden bg-[var(--card)] border border-[var(--border)] transition-all hover:border-red-500/30 active:scale-[0.98] animate-fade-in-up delay-${Math.min(index + 3, 8)}`}
                        >
                            {/* Hero Image */}
                            <div className="relative h-48 bg-[var(--card-elevated)]">
                                {canteen.canteen_image ? (
                                    <img
                                        src={canteen.canteen_image}
                                        alt={canteen.canteen_name}
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-500/20 via-orange-400/20 to-amber-300/20 dark:from-red-900/30 dark:via-orange-900/20 dark:to-amber-900/10">
                                        <Store className="h-10 w-10 text-[var(--muted-foreground)] opacity-30" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                {/* Best Choice badge */}
                                {index === 0 && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-semibold text-white">
                                        ✦ Best Choice
                                    </div>
                                )}

                                {/* Distance badge */}
                                {canteen.distance !== undefined && (
                                    <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2 py-1 text-[11px] font-medium text-white">
                                        <MapPin className="h-3 w-3 text-red-400" />
                                        {formatDistance(canteen.distance)}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-base">{canteen.canteen_name}</h3>
                                    <p className="text-sm text-[var(--muted-foreground)]">{canteen.college_name}</p>
                                </div>
                                <span className={`text-sm font-medium ${canteen.is_open !== false ? 'text-green-500' : 'text-red-400'}`}>
                                    {canteen.is_open !== false ? 'Open' : 'Closed'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-16 text-center animate-fade-in">
                    <Store className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4 opacity-30" />
                    <p className="text-[var(--muted-foreground)]">
                        {searchQuery ? 'No canteens found' : 'No canteens available yet'}
                    </p>
                </div>
            )}
        </div>
    )
}
