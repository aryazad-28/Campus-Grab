'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function RefundPage() {
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
                <h1 className="text-lg font-semibold">Refund & Cancellation Policy</h1>
            </div>

            <div className="space-y-6 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>1. Order Cancellation</h2>
                    <p>Orders can only be cancelled before the canteen starts preparing your food. Once the order status changes to &quot;Preparing,&quot; cancellations are no longer possible.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>2. Refund Eligibility</h2>
                    <p>Refunds are applicable in the following cases:</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>Payment was charged but the order was not placed</li>
                        <li>Order was cancelled before preparation began</li>
                        <li>Duplicate payment was made for the same order</li>
                        <li>Food quality or quantity did not match the order</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>3. Refund Process</h2>
                    <p>To request a refund, contact our support team with your order ID and reason. Approved refunds will be processed within 5–7 business days to the original payment method.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>4. Non-Refundable Cases</h2>
                    <p>Refunds will not be issued for:</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>Change of mind after order preparation has started</li>
                        <li>Failure to pick up a completed order</li>
                        <li>Incorrect order details provided by the user</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>5. Contact</h2>
                    <p>For refund requests or disputes, please reach out via the Help & Support section in your profile or email us at aryarajanzad@gmail.com.</p>
                </section>

                <p className="text-xs pt-4" style={{ color: 'var(--muted-foreground)' }}>Last updated: March 2026</p>
            </div>
        </div>
    )
}
