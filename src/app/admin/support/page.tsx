'use client'

import Link from 'next/link'
import { ArrowLeft, Mail, MessageCircle, Bug, Phone } from 'lucide-react'

export default function SupportPage() {
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
                <h1 className="text-lg font-semibold">Help & Support</h1>
            </div>

            <div className="space-y-4">
                {/* FAQ-style help items */}
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="p-4 space-y-4">
                        <h2 className="text-base font-semibold">Frequently Asked Questions</h2>

                        <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer text-sm font-medium py-2" style={{ color: 'var(--foreground)' }}>
                                How do I place an order?
                                <span className="text-xs transition-transform group-open:rotate-180" style={{ color: 'var(--muted-foreground)' }}>▾</span>
                            </summary>
                            <p className="text-sm pb-2" style={{ color: 'var(--muted-foreground)' }}>
                                Browse canteens on the home page, select items from the menu, add them to your cart, and proceed to checkout with Razorpay payment.
                            </p>
                        </details>

                        <div style={{ borderTop: '1px solid var(--border)' }} />

                        <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer text-sm font-medium py-2" style={{ color: 'var(--foreground)' }}>
                                How do I track my order?
                                <span className="text-xs transition-transform group-open:rotate-180" style={{ color: 'var(--muted-foreground)' }}>▾</span>
                            </summary>
                            <p className="text-sm pb-2" style={{ color: 'var(--muted-foreground)' }}>
                                Go to the Orders tab in the bottom navigation. You&apos;ll see real-time status updates: Pending → Preparing → Ready → Completed.
                            </p>
                        </details>

                        <div style={{ borderTop: '1px solid var(--border)' }} />

                        <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer text-sm font-medium py-2" style={{ color: 'var(--foreground)' }}>
                                What if I face a payment issue?
                                <span className="text-xs transition-transform group-open:rotate-180" style={{ color: 'var(--muted-foreground)' }}>▾</span>
                            </summary>
                            <p className="text-sm pb-2" style={{ color: 'var(--muted-foreground)' }}>
                                If your payment was deducted but the order wasn&apos;t placed, please contact us using the options below. We&apos;ll initiate a refund within 5–7 business days.
                            </p>
                        </details>
                    </div>
                </div>

                {/* Contact Options */}
                <h2 className="text-sm font-semibold pt-2" style={{ color: 'var(--muted-foreground)' }}>CONTACT US</h2>

                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    <a
                        href="mailto:aryarajanzad@gmail.com"
                        className="flex items-center gap-4 p-4 transition-colors"
                        style={{ borderBottom: '1px solid var(--border)' }}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--card-elevated)' }}>
                            <Mail className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Email Support (Arya)</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>aryarajanzad@gmail.com</p>
                        </div>
                    </a>

                    <a
                        href="mailto:sageved18@gmail.com"
                        className="flex items-center gap-4 p-4 transition-colors"
                        style={{ borderBottom: '1px solid var(--border)' }}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--card-elevated)' }}>
                            <Mail className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Email Support (Vedant)</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>sageved18@gmail.com</p>
                        </div>
                    </a>

                    <a
                        href="tel:+919561175667"
                        className="flex items-center gap-4 p-4 transition-colors"
                        style={{ borderBottom: '1px solid var(--border)' }}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--card-elevated)' }}>
                            <Phone className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Call Support (Arya)</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>+91 9561175667</p>
                        </div>
                    </a>

                    <a
                        href="tel:+919699533441"
                        className="flex items-center gap-4 p-4 transition-colors"
                        style={{ borderBottom: '1px solid var(--border)' }}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--card-elevated)' }}>
                            <Phone className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Call Support (Vedant)</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>+91 9699533441</p>
                        </div>
                    </a>

                    <a
                        href="mailto:aryarajanzad@gmail.com?subject=Bug Report"
                        className="flex items-center gap-4 p-4"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--card-elevated)' }}>
                            <Bug className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Report a Bug</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Help us improve the app</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    )
}
