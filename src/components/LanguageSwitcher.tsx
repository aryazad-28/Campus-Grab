'use client'

import { useRouter } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
    const router = useRouter()
    const [locale, setLocale] = useState('en')

    // Initialize state from cookie on mount
    useEffect(() => {
        const match = document.cookie.match(new RegExp('(^| )NEXT_LOCALE=([^;]+)'))
        if (match) {
            setLocale(match[2])
        }
    }, [])

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const newLocale = e.target.value
        setLocale(newLocale)

        // Set cookie manually since we aren't using next-intl middleware for routing
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`

        // Refresh to reload server components with new locale
        router.refresh()
    }

    return (
        <div
            className="flex items-center gap-2 rounded-lg border px-3 py-2"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
            <Globe className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
            <select
                value={locale}
                onChange={handleChange}
                className="bg-transparent text-sm font-medium outline-none"
                style={{ color: 'var(--foreground)' }}
            >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
            </select>
        </div>
    )
}
