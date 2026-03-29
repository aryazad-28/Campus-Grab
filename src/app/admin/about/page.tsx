'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="container mx-auto max-w-2xl px-4 py-6 pb-32">
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/admin/profile"
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-lg font-semibold">About CampusGrab</h1>
            </div>

            <div className="space-y-6 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                <p>
                    Campus-Grab is a mobile-first platform designed to make food ordering on campus fast, simple, and hassle-free. We aim to eliminate long queues and bring structure to the canteen experience by allowing students to browse menus, place orders, and make payments seamlessly from their phones.
                </p>
                <p>
                    At the same time, we help canteen vendors manage orders more efficiently through a streamlined digital system. Our goal is to create a smoother, smarter, and more organized campus dining experience for everyone.
                </p>

                <div className="mt-8 pt-6 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="font-medium text-center" style={{ color: 'var(--foreground)' }}>
                        An initiative by Arya Zad and Vedant Bhave — built with care and made for you.
                    </p>
                    <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                        © 2026 Campus-Grab. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}
