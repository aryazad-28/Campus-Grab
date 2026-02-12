// Geolocation utilities for Campus Grab

export interface UserLocation {
    latitude: number
    longitude: number
    accuracy: number // meters
}

export interface ReverseGeocodeResult {
    area: string
    city: string
    fullAddress: string
}

/**
 * Request user's current location via browser Geolocation API.
 * Returns a Promise that resolves with coordinates or rejects with an error message.
 */
export function requestUserLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('Geolocation is not supported by your browser')
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                })
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject('Location access denied. Please enable it in your browser settings.')
                        break
                    case error.POSITION_UNAVAILABLE:
                        reject('Location information is unavailable.')
                        break
                    case error.TIMEOUT:
                        reject('Location request timed out. Please try again.')
                        break
                    default:
                        reject('An unknown error occurred while getting your location.')
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000 // cache for 1 minute
            }
        )
    })
}

/**
 * Calculate distance between two coordinates using the Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371 // Earth's radius in km
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180)
}

/**
 * Format distance for display.
 * Under 1 km: shows meters (e.g., "800 m")
 * Over 1 km: shows km with 1 decimal (e.g., "2.3 km")
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`
    }
    return `${km.toFixed(1)} km`
}

/**
 * Reverse geocode coordinates to a human-readable address.
 * Uses OpenStreetMap Nominatim API (free, no API key needed).
 */
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
            {
                headers: {
                    'Accept-Language': 'en',
                    'User-Agent': 'CampusGrab/1.0'
                }
            }
        )

        if (!response.ok) throw new Error('Geocoding failed')

        const data = await response.json()
        const addr = data.address || {}

        // Build area string from address components
        const area = addr.suburb || addr.neighbourhood || addr.village || addr.town || ''
        const city = addr.city || addr.state_district || addr.county || ''
        const state = addr.state || ''

        const parts = [area, city, state].filter(Boolean)
        const fullAddress = data.display_name || parts.join(', ')

        return {
            area: parts.slice(0, 2).join(', ') || fullAddress.split(',').slice(0, 2).join(',').trim(),
            city: city || state,
            fullAddress
        }
    } catch {
        return {
            area: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            city: '',
            fullAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        }
    }
}
