'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
                <h1 className="text-lg font-semibold">Terms & Conditions</h1>
            </div>

            <div className="space-y-6 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>1. Acceptance of Terms</h2>
                    <p>By accessing and using Campus Grab, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the app.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>2. Service Description</h2>
                    <p>Campus Grab is a food ordering platform that connects students with campus canteens. We facilitate the ordering process but do not prepare, handle, or deliver food directly.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>3. User Accounts</h2>
                    <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>4. Orders & Payments</h2>
                    <p>All orders placed through Campus Grab are subject to availability and acceptance by the respective canteen. Payments are processed securely through Razorpay. Prices displayed are inclusive of applicable taxes unless stated otherwise.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>5. User Conduct</h2>
                    <p>You agree not to misuse the platform, including but not limited to: placing fraudulent orders, abusing the payment system, or harassing canteen staff or other users.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>6. Limitation of Liability</h2>
                    <p>Campus Grab shall not be liable for any indirect, incidental, or consequential damages arising from the use of this platform. Our total liability shall not exceed the amount paid for the specific order in question.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>7. Changes to Terms</h2>
                    <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms.</p>
                </section>

                <p className="text-xs pt-4" style={{ color: 'var(--muted-foreground)' }}>Last updated: March 2026</p>
            </div>
        </div>
    )
}
