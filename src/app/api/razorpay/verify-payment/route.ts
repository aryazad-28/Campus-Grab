import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
    try {
        // Initialize Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        const body = await request.json()
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId,
        } = body

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return NextResponse.json(
                { error: 'Missing required payment parameters' },
                { status: 400 }
            )
        }

        // 1. Fetch order details
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, admin_id, status, total')
            .eq('id', orderId)
            .single()

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            )
        }

        // 1b. Verify order is in pending status (prevent re-verification)
        if (order.status !== 'pending') {
            return NextResponse.json(
                { error: 'Order has already been processed' },
                { status: 400 }
            )
        }

        // 2. Fetch vendor's Razorpay credentials
        const { data: admin, error: adminError } = await supabase
            .from('admin_profiles')
            .select('razorpay_key_id, razorpay_key_secret')
            .eq('id', order.admin_id)
            .single()

        if (adminError || !admin || !admin.razorpay_key_secret) {
            return NextResponse.json(
                { error: 'Vendor credentials not found' },
                { status: 404 }
            )
        }

        // 3. Verify signature
        const generatedSignature = crypto
            .createHmac('sha256', admin.razorpay_key_secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')

        if (generatedSignature !== razorpay_signature) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            )
        }

        // 4. Cross-verify payment amount with Razorpay API
        if (admin.razorpay_key_id) {
            try {
                const razorpay = new Razorpay({
                    key_id: admin.razorpay_key_id,
                    key_secret: admin.razorpay_key_secret,
                })
                const payment = await razorpay.payments.fetch(razorpay_payment_id)
                const expectedAmountPaise = Math.round(order.total * 100)

                if (payment.amount !== expectedAmountPaise) {
                    console.error('Payment amount mismatch:', {
                        paid: payment.amount,
                        expected: expectedAmountPaise,
                        orderId,
                    })
                    return NextResponse.json(
                        { error: 'Payment amount does not match order total' },
                        { status: 400 }
                    )
                }
            } catch (fetchError) {
                console.error('Failed to fetch payment from Razorpay for verification:', fetchError)
                // Continue with signature-based verification only if Razorpay API is unreachable
                // Signature is already verified, so this is acceptable as a fallback
            }
        }

        // 5. Update order status to confirmed (preparing)
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'preparing',
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                payment_verified: true,
                paid_at: new Date().toISOString(),
            })
            .eq('id', orderId)
            .eq('status', 'pending') // Double-check: only update if still pending (race condition guard)

        if (updateError) {
            console.error('Error updating order:', updateError)
            return NextResponse.json(
                { error: 'Failed to update order status' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
        })
    } catch (error) {
        console.error('Error verifying payment:', error)
        return NextResponse.json(
            { error: 'Failed to verify payment' },
            { status: 500 }
        )
    }
}
