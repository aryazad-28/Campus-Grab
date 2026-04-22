'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
                <h1 className="text-lg font-semibold">Terms &amp; Conditions</h1>
            </div>

            <div className="space-y-6 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>1. Acceptance of Terms</h2>
                    <p>By accessing and using Campus Grab, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the app.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>2. Platform Role &amp; Service Description</h2>
                    <p>
                        Campus Grab is a <strong>technology platform</strong> that connects students with campus canteens to facilitate food ordering. We act solely as an intermediary — we do not prepare, cook, handle, or deliver food directly.
                    </p>
                    <p className="mt-2">
                        All food items listed on the platform are provided, prepared, and sold by independent canteen vendors. Campus Grab has no control over the operations, food handling practices, or service quality of these vendors.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>3. Food Quality &amp; Liability Disclaimer</h2>
                    <div
                        className="rounded-xl p-4 mb-3"
                        style={{ backgroundColor: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}
                    >
                        <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                            Campus Grab is NOT responsible for:
                        </p>
                        <ul className="list-disc ml-5 space-y-1">
                            <li>Food quality, taste, or portion size</li>
                            <li>Food preparation methods or ingredients</li>
                            <li>Hygiene and sanitation practices of canteen vendors</li>
                            <li>Allergic reactions or health issues arising from food consumption</li>
                            <li>Delays caused by the canteen in preparing your order</li>
                        </ul>
                    </div>
                    <p>
                        All food-related complaints, quality issues, or health concerns must be resolved <strong>directly with the canteen vendor</strong>. Campus Grab will assist in connecting you with the vendor but bears no liability for the food itself.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>4. User Accounts</h2>
                    <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>5. Orders &amp; Payments</h2>
                    <p>
                        All orders placed through Campus Grab are subject to availability and acceptance by the respective canteen. Payments are processed securely through Razorpay.
                    </p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>A <strong>convenience fee of ₹3 per order</strong> is charged to support platform operations</li>
                        <li>All orders are <strong>final once placed</strong> — no cancellations after payment</li>
                        <li>Refunds are only available in specific cases outlined in our <Link href="/refund" className="text-blue-500 underline">Refund Policy</Link></li>
                        <li>Prices displayed include applicable taxes unless stated otherwise</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>6. Reward Points</h2>
                    <p>Campus Grab offers a points-based reward system:</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>Points are earned on completed orders (5 pts per order)</li>
                        <li>Bonus points may be awarded for first orders and order streaks</li>
                        <li>100 points = ₹5 in redemption value</li>
                        <li>Minimum 200 points required to redeem</li>
                        <li>Maximum redemption: 20% of order value per order</li>
                        <li>Points expire 30 days after earning</li>
                        <li>Campus Grab reserves the right to modify or discontinue the reward program at any time</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>7. Vendor Responsibilities</h2>
                    <p>
                        Canteen vendors on Campus Grab are independent operators. By listing their food on our platform, vendors agree to:
                    </p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>Maintain food quality and hygiene standards</li>
                        <li>Accurately describe menu items and prices</li>
                        <li>Prepare orders in a timely manner</li>
                        <li>Handle all food-related complaints directly with customers</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>8. User Conduct</h2>
                    <p>You agree not to misuse the platform, including but not limited to: placing fraudulent orders, abusing the payment system, manipulating the reward system, or harassing canteen staff or other users.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>9. Limitation of Liability</h2>
                    <p>Campus Grab shall not be liable for any indirect, incidental, or consequential damages arising from the use of this platform. Our total liability shall not exceed the amount paid for the specific order in question, excluding any platform convenience fees.</p>
                </section>

                <section>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>10. Changes to Terms</h2>
                    <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms.</p>
                </section>

                <p className="text-xs pt-4" style={{ color: 'var(--muted-foreground)' }}>Last updated: April 2026</p>
            </div>
        </div>
    )
}
