import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
    try {
        // Initialize Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        const body = await request.text()
        const signature = request.headers.get('x-razorpay-signature')

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing signature header' },
                { status: 400 }
            )
        }

        // Note: Webhook secret can be configured per vendor in their Razorpay dashboard
        // For additional validation, you can store webhook secret in env
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

        if (webhookSecret) {
            // Verify webhook signature
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(body)
                .digest('hex')

            if (expectedSignature !== signature) {
                return NextResponse.json(
                    { error: 'Invalid webhook signature' },
                    { status: 400 }
                )
            }
        }

        const event = JSON.parse(body)

        // Handle payment.captured event
        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity
            const orderId = payment.notes?.order_id

            if (!orderId) {
                console.error('No order_id in payment notes')
                return NextResponse.json({ received: true })
            }

            // Update order status
            const { data: existingOrder } = await supabase
                .from('orders')
                .select('status, payment_verified')
                .eq('id', orderId)
                .single()

            // Only update if not already verified (prevent duplicate processing)
            if (!existingOrder?.payment_verified) {
                await supabase
                    .from('orders')
                    .update({
                        status: 'preparing',
                        razorpay_payment_id: payment.id,
                        payment_verified: true,
                        paid_at: new Date(payment.created_at * 1000).toISOString(),
                    })
                    .eq('id', orderId)
            }
        }

        // Handle payment.failed event (optional)
        if (event.event === 'payment.failed') {
            const payment = event.payload.payment.entity
            const orderId = payment.notes?.order_id

            if (orderId) {
                await supabase
                    .from('orders')
                    .update({
                        status: 'payment_failed',
                        razorpay_payment_id: payment.id,
                    })
                    .eq('id', orderId)
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}
