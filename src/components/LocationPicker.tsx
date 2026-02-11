'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default icon issue in React-Leaflet with Next.js
// We use a CDN for reliable marker icons
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png'
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
})

interface LocationPickerProps {
    lat: number | null
    lng: number | null
    onLocationSelect: (lat: number, lng: number) => void
}

function DraggableMarker({ position, onDragEnd }: { position: [number, number], onDragEnd: (lat: number, lng: number) => void }) {
    const markerRef = useRef<L.Marker>(null)
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current
                if (marker != null) {
                    const { lat, lng } = marker.getLatLng()
                    onDragEnd(lat, lng)
                }
            },
        }),
        [onDragEnd],
    )

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    )
}

// Ensure map updates when props change (e.g. "Detect Location" button pressed)
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, zoom)
    }, [center, zoom, map])
    return null
}

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

export default function LocationPicker({ lat, lng, onLocationSelect }: LocationPickerProps) {
    // Default center (India) if no location selected yet
    const defaultCenter: [number, number] = [20.5937, 78.9629]

    // Use provided location or default
    const center: [number, number] = lat && lng ? [lat, lng] : defaultCenter
    const zoom = lat && lng ? 15 : 5

    return (
        <div className="h-[300px] w-full overflow-hidden rounded-lg border border-slate-600 shadow-inner z-0">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {lat && lng && (
                    <DraggableMarker position={[lat, lng]} onDragEnd={onLocationSelect} />
                )}

                <ClickHandler onLocationSelect={onLocationSelect} />
                <MapUpdater center={center} zoom={zoom} />
            </MapContainer>
        </div>
    )
}
