'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Store, Clock, Loader2, LocateFixed, Navigation } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { requestUserLocation, calculateDistance, formatDistance, type UserLocation } from '@/lib/geolocation'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SkeletonGrid } from '@/components/SkeletonCard'

interface CanteenInfo {
    id: string
    canteen_name: string
    college_name: string
    area: string
    status: string
    latitude: number | null
    longitude: number | null
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
            if (!supabase) {
                setIsLoading(false)
                return
            }
            try {
                const { data, error } = await supabase
                    .from('admin_profiles')
                    .select('id, canteen_name, college_name, area, status, latitude, longitude')
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

    const sortedCanteens = useMemo(() => {
        let result = [...canteens]
        if (userLocation) {
            result = result.map(canteen => ({
                ...canteen,
                distance: canteen.latitude && canteen.longitude
                    ? calculateDistance(
                        userLocation.latitude, userLocation.longitude,
                        canteen.latitude, canteen.longitude
                    )
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
            <div className="mb-6 animate-fade-in-up">
                <h1 className="text-xl font-bold sm:text-2xl mb-1">
                    <span className="bg-gradient-to-r from-[#991B1B] to-[#DC2626] bg-clip-text text-transparent">Canteens</span> Near You
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Select a canteen to browse their menu</p>
            </div>

            {locationStatus === 'requesting' && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 text-sm text-indigo-700 dark:text-indigo-300 animate-fade-in">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Getting your location to find nearby canteens...</span>
                </div>
            )}

            {locationStatus === 'denied' && (
                <div className="mb-4 flex items-center justify-between gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-300 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <LocateFixed className="h-4 w-4 shrink-0" />
                        <span>Enable location to see nearby canteens</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/30"
                        onClick={async () => {
                            setLocationStatus('requesting')
                            try {
                                const location = await requestUserLocation()
                                setUserLocation(location)
                                setLocationStatus('granted')
                            } catch {
                                setLocationStatus('denied')
                            }
                        }}
                    >
                        Try Again
                    </Button>
                </div>
            )}

            {locationStatus === 'granted' && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in">
                    <Navigation className="h-3.5 w-3.5" />
                    <span>Showing canteens sorted by distance</span>
                </div>
            )}

            <div className="relative mb-6 animate-fade-in-up delay-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    type="search"
                    placeholder="Search by name, college, or area..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <SkeletonGrid count={6} variant="canteen" />
                </div>
            ) : filteredCanteens.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCanteens.map((canteen, index) => (
                        <Card
                            key={canteen.id}
                            className={`cursor-pointer hover:border-red-300 dark:hover:border-red-800 hover:shadow-md transition-all active:scale-[0.98] animate-fade-in-up delay-${Math.min(index + 1, 8)}`}
                            onClick={() => {
                                localStorage.setItem('campus-grab-selected-canteen', canteen.id)
                                router.push(`/menu?canteen=${canteen.id}`)
                            }}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10">
                                        <Store className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-base truncate">{canteen.canteen_name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{canteen.college_name}</p>
                                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                                            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                <MapPin className="h-3 w-3" />
                                                {canteen.area}
                                            </span>
                                            {canteen.distance !== undefined && (
                                                <Badge variant="indigo" className="text-[10px] px-1.5">
                                                    <Navigation className="h-2.5 w-2.5 mr-0.5" />
                                                    {formatDistance(canteen.distance)}
                                                </Badge>
                                            )}
                                            <Badge variant="success" className="text-[10px] px-1.5">
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
                <div className="py-16 text-center animate-fade-in">
                    <Store className="mx-auto h-12 w-12 text-slate-400 mb-4 opacity-40" />
                    <h2 className="text-lg font-medium mb-2">
                        {searchQuery ? 'No canteens found' : 'No canteens available yet'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {searchQuery ? 'Try a different search term' : 'Check back later — canteens are being set up'}
                    </p>
                </div>
            )}
        </div>
    )
}
