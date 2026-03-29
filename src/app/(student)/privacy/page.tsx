'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
    return (
        <div className="container mx-auto max-w-2xl px-4 py-6 pb-32">
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/profile"
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-lg font-semibold">Privacy Policy</h1>
            </div>

            <div className="space-y-6 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>1. Information We Collect</h2>
                    <p>We collect information you provide directly: name, email address, and order history. We also collect usage data such as app interactions and device information to improve our services.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>2. How We Use Your Information</h2>
                    <p>Your information is used to: process orders, communicate order status, improve our services, and provide customer support. We do not sell your personal data to third parties.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>3. Data Security</h2>
                    <p>We implement industry-standard security measures to protect your data. All payment information is processed through Razorpay&apos;s secure infrastructure — we never store card details on our servers.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>4. Data Sharing</h2>
                    <p>We share necessary information with canteen vendors to fulfill your orders (e.g., order details, token numbers). We do not share your personal contact information with vendors.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>5. Your Rights</h2>
                    <p>You have the right to access, update, or delete your personal information at any time by contacting our support team. You may also request a copy of all data we hold about you.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>6. Cookies & Local Storage</h2>
                    <p>We use local storage to maintain your session and preferences. No third-party tracking cookies are used.</p>
                </section>

                <p className="text-xs pt-4" style={{ color: 'var(--muted-foreground)' }}>Last updated: March 2026</p>
            </div>
        </div>
    )
}
