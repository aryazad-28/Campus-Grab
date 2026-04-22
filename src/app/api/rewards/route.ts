import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const userId = request.nextUrl.searchParams.get('userId')
        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
        }

        const { data, error } = await supabase.rpc('get_user_rewards', {
            p_user_id: userId,
        })

        if (error) {
            console.error('Error fetching rewards:', error)
            return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 })
        }

        return NextResponse.json(data || {
            balance: 0,
            lifetime_earned: 0,
            total_orders: 0,
            first_order_claimed: false,
            streak_3_day: 0,
            streak_7_day: 0,
            next_expiry: null,
            expiring_points: 0,
            transactions: [],
            conversion_rate: '100 pts = ₹5',
            min_redeem: 200,
            max_redeem_pct: 20,
        })
    } catch (error) {
        console.error('Rewards GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const body = await request.json()
        const { userId, orderId, orderTotal } = body

        if (!userId || !orderId || !orderTotal) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const { data, error } = await supabase.rpc('redeem_reward_points', {
            p_user_id: userId,
            p_order_id: orderId,
            p_order_total: orderTotal,
        })

        if (error) {
            console.error('Error redeeming points:', error)
            return NextResponse.json({ error: 'Failed to redeem points' }, { status: 500 })
        }

        if (data && data.success === false) {
            return NextResponse.json({ error: data.error }, { status: 400 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Rewards POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
