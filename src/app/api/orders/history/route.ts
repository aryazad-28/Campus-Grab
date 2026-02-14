import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('user_id')
        const month = searchParams.get('month') // 1-12
        const year = searchParams.get('year') // YYYY

        if (!userId) {
            return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
        }

        // Build query — fetch completed orders for this user
        let query = supabase
            .from('orders')
            .select('id, token_number, items, total, status, created_at, admin_id, payment_method, estimated_time')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        // Apply month/year filter using PostgreSQL date functions
        if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString()
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59).toISOString()
            query = query.gte('created_at', startDate).lte('created_at', endDate)
        } else if (year) {
            const startDate = new Date(parseInt(year), 0, 1).toISOString()
            const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59).toISOString()
            query = query.gte('created_at', startDate).lte('created_at', endDate)
        }

        // Limit to 100 orders max
        query = query.limit(100)

        const { data: orders, error } = await query

        if (error) {
            console.error('Error fetching order history:', error)
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
        }

        // Group orders by date on server
        const grouped: Record<string, typeof orders> = {}
        for (const order of orders || []) {
            const dateKey = new Date(order.created_at).toISOString().split('T')[0] // YYYY-MM-DD
            if (!grouped[dateKey]) {
                grouped[dateKey] = []
            }
            grouped[dateKey].push(order)
        }

        // Convert to sorted array of { date, orders }
        const result = Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a)) // newest date first
            .map(([date, dayOrders]) => ({
                date,
                orders: dayOrders,
                orderCount: dayOrders.length,
                totalRevenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
            }))

        return NextResponse.json({ days: result })
    } catch (error) {
        console.error('Order history error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
