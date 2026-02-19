import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { getAuthenticatedUser, getServiceSupabase } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        // Authenticate the user
        const auth = await getAuthenticatedUser(request)
        if (auth.error) return auth.error

        const supabase = getServiceSupabase()

        const body = await request.json()

        const { orderId, canteenId } = body

        if (!orderId || !canteenId) {

            return NextResponse.json(
                { error: 'Missing orderId or canteenId' },
                { status: 400 }
            )
        }

        // 1. Fetch vendor credentials AND order details in PARALLEL (saves ~500ms)
        const [adminResult, orderResult] = await Promise.all([
            supabase
                .from('admin_profiles')
                .select('razorpay_key_id, razorpay_key_secret, canteen_name')
                .eq('id', canteenId)
                .eq('status', 'approved')
                .single(),
            supabase
                .from('orders')
                .select('id, items, total, status, admin_id, user_id')
                .eq('id', orderId)
                .single()
        ])

        const { data: admin, error: adminError } = adminResult
        const { data: order, error: orderError } = orderResult

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

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            )
        }

        // Verify order belongs to this canteen
        if (order.admin_id !== canteenId) {
            return NextResponse.json(
                { error: 'Order does not belong to this canteen' },
                { status: 403 }
            )
        }

        // SECURITY: Verify order belongs to the authenticated user
        if (order.user_id && order.user_id !== auth.userId) {
            return NextResponse.json(
                { error: 'Order does not belong to you' },
                { status: 403 }
            )
        }

        // Verify order is pending payment
        if (order.status !== 'pending') {
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



        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: order.id,
            notes: {
                canteen_name: admin.canteen_name,
                order_id: order.id,
            },
        })



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
