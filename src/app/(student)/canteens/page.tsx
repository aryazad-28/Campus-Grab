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

interface CanteenInfo {
    id: string
    canteen_name: string
    college_name: string
    area: string
    status: string
    latitude: number | null
    longitude: number | null
    distance?: number // calculated client-side
}

export default function CanteensPage() {
    const router = useRouter()
    const [canteens, setCanteens] = useState<CanteenInfo[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
    const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle')

    // Request location on mount
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

    // Load canteens from Supabase
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

    // Calculate distances and sort
    const sortedCanteens = useMemo(() => {
        let result = [...canteens]

        // Calculate distances if user location is available
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

            // Sort: canteens with distance first (nearest first), then without
            result.sort((a, b) => {
                if (a.distance !== undefined && b.distance !== undefined) {
                    return a.distance - b.distance
                }
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

            {/* Location Status Banner */}
            {locationStatus === 'requesting' && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Getting your location to find nearby canteens...</span>
                </div>
            )}

            {locationStatus === 'denied' && (
                <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
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
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <Navigation className="h-3.5 w-3.5" />
                    <span>Showing canteens sorted by distance</span>
                </div>
            )}

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
                                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                                            <span className="flex items-center gap-1 text-xs text-neutral-400">
                                                <MapPin className="h-3 w-3" />
                                                {canteen.area}
                                            </span>

                                            {canteen.distance !== undefined && (
                                                <Badge variant="secondary" className="text-[10px] px-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                    <Navigation className="h-2.5 w-2.5 mr-0.5" />
                                                    {formatDistance(canteen.distance)}
                                                </Badge>
                                            )}

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
