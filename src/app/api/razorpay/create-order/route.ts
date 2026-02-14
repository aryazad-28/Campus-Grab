import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        // Validate environment variables first
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Missing required environment variables')
            return NextResponse.json(
                { error: 'Server configuration error: Missing Supabase credentials' },
                { status: 500 }
            )
        }

        const body = await request.json()
        console.log('Received request body:', { orderId: body.orderId, canteenId: body.canteenId })

        const { orderId, canteenId } = body

        if (!orderId || !canteenId) {
            console.error('Missing orderId or canteenId in request')
            return NextResponse.json(
                { error: 'Missing orderId or canteenId' },
                { status: 400 }
            )
        }

        // 1. Fetch vendor's Razorpay credentials from database
        const { data: admin, error: adminError } = await supabase
            .from('admin_profiles')
            .select('razorpay_key_id, razorpay_key_secret, canteen_name')
            .eq('id', canteenId)
            .eq('status', 'approved')
            .single()

        if (adminError || !admin) {
            return NextResponse.json(
                { error: 'Vendor not found or not approved' },
                { status: 404 }
            )
        }

        if (!admin.razorpay_key_id || !admin.razorpay_key_secret) {
            return NextResponse.json(
                { error: 'Vendor has not configured Razorpay credentials' },
                { status: 400 }
            )
        }

        // 2. Fetch order details and calculate amount from database
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, items, total, status, admin_id')
            .eq('id', orderId)
            .single()

        if (orderError || !order) {
            console.error('Order fetch error:', orderError)
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            )
        }

        // Verify order belongs to this canteen
        if (order.admin_id !== canteenId) {
            console.error('Order admin_id mismatch:', { orderAdminId: order.admin_id, requestedCanteenId: canteenId })
            return NextResponse.json(
                { error: 'Order does not belong to this canteen' },
                { status: 403 }
            )
        }

        // Verify order is pending payment
        if (order.status !== 'pending') {
            console.error('Order not in pending status:', order.status)
            return NextResponse.json(
                { error: 'Order is not in pending status' },
                { status: 400 }
            )
        }

        // 3. Initialize Razorpay with vendor's credentials
        const razorpay = new Razorpay({
            key_id: admin.razorpay_key_id,
            key_secret: admin.razorpay_key_secret,
        })

        // 4. Create Razorpay order
        // Amount should be in smallest currency unit (paise for INR)
        const amountInPaise = Math.round(order.total * 100)

        console.log('Creating Razorpay order:', { amountInPaise, orderId: order.id, total: order.total })

        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: order.id,
            notes: {
                canteen_name: admin.canteen_name,
                order_id: order.id,
            },
        })

        console.log('Razorpay order created successfully:', razorpayOrder.id)

        // 5. Return order details to frontend
        return NextResponse.json({
            razorpay_order_id: razorpayOrder.id,
            key_id: admin.razorpay_key_id,
            amount: amountInPaise,
            currency: 'INR',
            canteen_name: admin.canteen_name,
        })
    } catch (error) {
        console.error('Error creating Razorpay order:', error)
        return NextResponse.json(
            { error: 'Failed to create payment order' },
            { status: 500 }
        )
    }
}
