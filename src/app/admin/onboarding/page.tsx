'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Building2, MapPin, Phone, User, Loader2, CheckCircle, LocateFixed } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { requestUserLocation, reverseGeocode } from '@/lib/geolocation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function AdminOnboardingPage() {
    const router = useRouter()
    const { submitOnboarding, needsOnboarding, isPending, logout } = useAdmin()
    const [formData, setFormData] = useState({
        name: '',
        canteen_name: '',
        college_name: '',
        area: '',
        phone: '',
        latitude: null as number | null,
        longitude: null as number | null,
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isLocating, setIsLocating] = useState(false)
    const [locationError, setLocationError] = useState('')
    const [locationDetected, setLocationDetected] = useState(false)
    const [error, setError] = useState('')
    const [submitted, setSubmitted] = useState(false)

    // Already submitted and pending
    if (isPending || submitted) {
        const handleSignOut = () => {
            logout()
            setTimeout(() => router.push('/login'), 100)
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
                <Card className="w-full max-w-sm bg-slate-800 border-slate-700 text-center">
                    <CardContent className="pt-8 pb-6">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
                            <CheckCircle className="h-7 w-7 text-amber-400" />
                        </div>
                        <h2 className="mb-2 text-xl font-semibold text-white">Application Submitted</h2>
                        <p className="mb-6 text-sm text-slate-400">
                            Your canteen admin application is under review. You&apos;ll be able to access the dashboard once approved.
                        </p>
                        <Button variant="outline" onClick={handleSignOut} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                            Sign out
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Redirect if no onboarding needed
    if (!needsOnboarding) {
        router.push('/admin')
        return null
    }

    const handleDetectLocation = async () => {
        setIsLocating(true)
        setLocationError('')

        try {
            const location = await requestUserLocation()
            const geocoded = await reverseGeocode(location.latitude, location.longitude)

            setFormData(prev => ({
                ...prev,
                area: geocoded.area,
                latitude: location.latitude,
                longitude: location.longitude,
            }))
            setLocationDetected(true)
        } catch (err) {
            setLocationError(typeof err === 'string' ? err : 'Failed to detect location')
        }

        setIsLocating(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const { success, error } = await submitOnboarding(formData)

        if (success) {
            setSubmitted(true)
        } else {
            setError(error || 'Failed to submit application')
        }

        setIsLoading(false)
    }

    const fields = [
        { key: 'name', label: 'Your Name', placeholder: 'John Doe', icon: User, type: 'text' },
        { key: 'canteen_name', label: 'Canteen Name', placeholder: 'Main Canteen', icon: Store, type: 'text' },
        { key: 'college_name', label: 'College/Campus Name', placeholder: 'AISSMS College of Engineering', icon: Building2, type: 'text' },
        { key: 'area', label: 'Area / City', placeholder: 'Pune, Maharashtra', icon: MapPin, type: 'text' },
        { key: 'phone', label: 'Phone (optional)', placeholder: '+91 9876543210', icon: Phone, type: 'tel' },
    ]

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8">
            <Card className="w-full max-w-md bg-slate-800 border-slate-700">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                        <Store className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white">Set Up Your Canteen</CardTitle>
                    <CardDescription className="text-slate-400">
                        Tell us about your canteen to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {fields.map(({ key, label, placeholder, icon: Icon, type }) => (
                            <div key={key} className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-300" htmlFor={key}>{label}</label>
                                <div className="relative">
                                    <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                    <Input
                                        id={key}
                                        type={type}
                                        placeholder={placeholder}
                                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                        value={formData[key as keyof typeof formData]?.toString() || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                                        required={key !== 'phone'}
                                    />
                                </div>

                                {/* Detect Location button after Area field */}
                                {key === 'area' && (
                                    <div className="space-y-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 gap-2"
                                            onClick={handleDetectLocation}
                                            disabled={isLocating}
                                        >
                                            {isLocating ? (
                                                <>
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    Detecting location...
                                                </>
                                            ) : locationDetected ? (
                                                <>
                                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                                                    Location detected — tap to refresh
                                                </>
                                            ) : (
                                                <>
                                                    <LocateFixed className="h-3.5 w-3.5" />
                                                    Detect My Location
                                                </>
                                            )}
                                        </Button>

                                        {locationDetected && formData.latitude && formData.longitude && (
                                            <p className="text-[11px] text-emerald-400/70 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                GPS: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                                            </p>
                                        )}

                                        {locationError && (
                                            <p className="text-[11px] text-red-400">{locationError}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {error && (
                            <p className="text-sm text-red-400">{error}</p>
                        )}

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
                            ) : (
                                'Submit Application'
                            )}
                        </Button>
                    </form>

                    <div className="mt-4 text-center">
                        <button onClick={() => { logout(); setTimeout(() => router.push('/login'), 100) }} className="text-xs text-slate-500 hover:text-slate-300">
                            Sign out
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
