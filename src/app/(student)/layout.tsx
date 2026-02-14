<<<<<<< HEAD
'use client'

import { Header } from "@/components/Header"
import { CurrentOrderBanner } from "@/components/CurrentOrderBanner"
import { ThemeProvider } from "@/components/ThemeProvider"
import { BottomNav } from "@/components/BottomNav"

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ThemeProvider>
            <Header />
            <main className="min-h-[calc(100vh-4rem)] pb-20 sm:pb-8">
                {children}
            </main>
            <CurrentOrderBanner />
            <BottomNav />
        </ThemeProvider>
    )
}
=======
'use client'

import { Header } from "@/components/Header"
import { CurrentOrderBanner } from "@/components/CurrentOrderBanner"
import { ThemeProvider } from "@/components/ThemeProvider"
import { MobileNav } from "@/components/MobileNav"

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ThemeProvider>
            <Header />
            <main className="min-h-[calc(100vh-4rem)] pb-24 sm:pb-8">
                {children}
            </main>
            <CurrentOrderBanner />
            <MobileNav />
        </ThemeProvider>
    )
}
>>>>>>> 56cf3e7b7610b0663b6dd3363c72ac9389319892
