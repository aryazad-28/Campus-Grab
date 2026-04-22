'use client'

import Link from 'next/link'
import { ArrowLeft, AlertTriangle, XCircle, CheckCircle, Mail } from 'lucide-react'

export default function RefundPage() {
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
                <h1 className="text-lg font-semibold">Refund &amp; Cancellation Policy</h1>
            </div>

            {/* Important Notice Banner */}
            <div
                className="flex items-start gap-3 rounded-xl p-4 mb-6 animate-fade-in-up"
                style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">All orders are final once placed</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        Once your order is successfully placed and payment is confirmed, it cannot be cancelled or refunded except in specific cases outlined below.
                    </p>
                </div>
            </div>

            <div className="space-y-6 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {/* No Refund */}
                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>1. General Policy</h2>
                    <p>
                        No refunds are issued once an order is successfully placed and received by the canteen. This includes but is not limited to:
                    </p>
                    <div className="mt-3 space-y-2">
                        <div className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                            <span>Change of mind after placing the order</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                            <span>Wrong items selected by the user</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                            <span>Delays in preparation or waiting time</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                            <span>Dissatisfaction with food quality or taste</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                            <span>Failure to pick up a completed order</span>
                        </div>
                    </div>
                </section>

                {/* Refund Eligible */}
                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>2. Refund Eligibility</h2>
                    <p className="mb-3">Refunds are granted only in the following exceptional cases:</p>
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>Payment was successful but the order was <strong>not received</strong> by the canteen (system error)</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span><strong>Duplicate payment</strong> was charged for the same order</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>Order was <strong>cancelled by the vendor</strong> (canteen)</span>
                        </div>
                    </div>
                </section>

                {/* Process */}
                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>3. Refund Process</h2>
                    <p>
                        If you believe you qualify for a refund under the eligible cases above, please contact our support team with:
                    </p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>Your order token number</li>
                        <li>Payment ID / transaction screenshot</li>
                        <li>Description of the issue</li>
                    </ul>
                    <p className="mt-2">
                        Approved refunds will be processed within <strong>5–7 business days</strong> to the original payment method (UPI/bank account).
                    </p>
                </section>

                {/* Platform Disclaimer */}
                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>4. Platform Disclaimer</h2>
                    <p>
                        Campus Grab is a platform that connects students with campus canteens. We are <strong>not responsible</strong> for food quality, preparation, hygiene, or any food-related issues. All such concerns must be resolved directly with the vendor (canteen).
                    </p>
                </section>

                {/* Convenience Fee */}
                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>5. Convenience Fee</h2>
                    <p>
                        A non-refundable convenience fee of <strong>₹3 per order</strong> is charged to support platform operations. This fee is included in the total amount at checkout and is clearly displayed before payment.
                    </p>
                </section>

                {/* Contact */}
                <section
                    className="rounded-xl p-4"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Need Help?</h2>
                    </div>
                    <p>
                        For refund requests or payment disputes, reach out via{' '}
                        <Link href="/support" className="text-blue-500 underline">Help & Support</Link> in your profile, or email us at{' '}
                        <a href="mailto:aryarajanzad@gmail.com" className="text-blue-500 underline">aryarajanzad@gmail.com</a>.
                    </p>
                </section>

                <p className="text-xs pt-4" style={{ color: 'var(--muted-foreground)' }}>Last updated: April 2026</p>
            </div>
        </div>
    )
}
