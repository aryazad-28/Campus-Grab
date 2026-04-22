import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'

const CONVENIENCE_FEE = 3

export async function POST(request: NextRequest) {
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing Supabase credentials' }, { status: 500 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        const body = await request.json()
        const { orderId, canteenId, voucherId } = body

        if (!orderId || !canteenId) {
            return NextResponse.json({ error: 'Missing orderId or canteenId' }, { status: 400 })
        }

        const [adminResult, orderResult] = await Promise.all([
            supabase.from('admin_profiles').select('razorpay_key_id, razorpay_key_secret, canteen_name').eq('id', canteenId).eq('status', 'approved').single(),
            supabase.from('orders').select('id, items, total, status, admin_id, user_id').eq('id', orderId).single()
        ])

        const { data: admin, error: adminError } = adminResult
        const { data: order, error: orderError } = orderResult

        if (adminError || !admin || !admin.razorpay_key_id || !admin.razorpay_key_secret) {
            return NextResponse.json({ error: 'Vendor not found or missing credentials' }, { status: 400 })
        }
        if (orderError || !order || order.admin_id !== canteenId || order.status !== 'pending') {
            return NextResponse.json({ error: 'Invalid order state' }, { status: 400 })
        }

        // Handle Voucher Logic
        let voucherDiscount = 0
        let appliedVoucherId = null

        if (voucherId) {
            const { data: voucher } = await supabase
                .from('user_vouchers')
                .select('*')
                .eq('id', voucherId)
                .eq('user_id', order.user_id)
                .eq('is_used', false)
                .gt('expires_at', new Date().toISOString())
                .single()
            
            if (voucher) {
                // Voucher discount cannot exceed order total
                voucherDiscount = Math.min(voucher.discount_amount, order.total)
                appliedVoucherId = voucher.id
            }
        }

        const finalTotal = order.total + CONVENIENCE_FEE - voucherDiscount

        // Store convenience fee and voucher info
        await supabase
            .from('orders')
            .update({
                convenience_fee: CONVENIENCE_FEE,
                voucher_id: appliedVoucherId,
                voucher_discount: voucherDiscount,
            })
            .eq('id', orderId)

        const razorpay = new Razorpay({ key_id: admin.razorpay_key_id, key_secret: admin.razorpay_key_secret })
        const amountInPaise = Math.round(finalTotal * 100)

        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: order.id,
            notes: {
                canteen_name: admin.canteen_name,
                order_id: order.id,
                convenience_fee: String(CONVENIENCE_FEE),
                voucher_discount: String(voucherDiscount),
            },
        })

        return NextResponse.json({
            razorpay_order_id: razorpayOrder.id,
            key_id: admin.razorpay_key_id,
            amount: amountInPaise,
            currency: 'INR',
            canteen_name: admin.canteen_name,
            convenience_fee: CONVENIENCE_FEE,
            voucher_discount: voucherDiscount,
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
    }
}
