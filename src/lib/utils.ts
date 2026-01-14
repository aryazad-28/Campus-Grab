import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
    return `₹${price.toFixed(0)}`
}

export function formatTime(minutes: number): string {
    return `${minutes} min`
}
