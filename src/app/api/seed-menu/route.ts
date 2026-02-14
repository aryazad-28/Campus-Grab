import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This is a one-time seed endpoint. Hit GET /api/seed-menu to populate.
// It finds the "Bunk Spot" admin or uses the first approved admin.

const MENU_ITEMS = [
    // ═══════════ BURGERS ═══════════
    { name: 'Veg Burger', category: 'Burgers', price: 60, eta_minutes: 8, image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80' },
    { name: 'Cheese Butter Burger', category: 'Burgers', price: 70, eta_minutes: 10, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
    { name: 'Cheese Spicy Burger', category: 'Burgers', price: 80, eta_minutes: 10, image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&q=80' },
    { name: 'Chilli Garlic Burger', category: 'Burgers', price: 90, eta_minutes: 10, image_url: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=80' },
    { name: 'Cheese Special Burger', category: 'Burgers', price: 100, eta_minutes: 12, image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80' },
    { name: 'Potato Crunch Burger', category: 'Burgers', price: 100, eta_minutes: 10, image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80' },
    { name: 'Cheese Classic Burger', category: 'Burgers', price: 100, eta_minutes: 10, image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80' },
    { name: 'Double Tikki Burger', category: 'Burgers', price: 110, eta_minutes: 12, image_url: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80' },
    { name: 'Paneer Tikki Burger', category: 'Burgers', price: 110, eta_minutes: 12, image_url: 'https://images.unsplash.com/photo-1585238341710-4d3ff484184d?w=400&q=80' },
    { name: 'Cheese Paneer Tikki Burger', category: 'Burgers', price: 130, eta_minutes: 12, image_url: 'https://images.unsplash.com/photo-1608767221gy204-97b131a0cdb7?w=400&q=80' },
    { name: 'Cheese Special Double Tikki', category: 'Burgers', price: 150, eta_minutes: 15, image_url: 'https://images.unsplash.com/photo-1596956470007-2bf6095e7e16?w=400&q=80' },

    // ═══════════ CLASSIC PIZZAS ═══════════
    { name: 'Sweet Corn Pizza', category: 'Classic Pizzas', price: 80, eta_minutes: 15, image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80' },
    { name: 'Onion Capsicum Pizza', category: 'Classic Pizzas', price: 90, eta_minutes: 15, image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80' },
    { name: 'Mix Veg Pizza', category: 'Classic Pizzas', price: 100, eta_minutes: 15, image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80' },
    { name: 'Spicy Delight Pizza', category: 'Classic Pizzas', price: 110, eta_minutes: 15, image_url: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=400&q=80' },
    { name: 'Babycorn Pizza', category: 'Classic Pizzas', price: 110, eta_minutes: 15, image_url: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&q=80' },
    { name: 'Margherita Pizza', category: 'Classic Pizzas', price: 120, eta_minutes: 12, image_url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&q=80' },
    { name: 'Paneer Pizza', category: 'Classic Pizzas', price: 130, eta_minutes: 15, image_url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&q=80' },
    { name: 'Chocolate Pizza', category: 'Classic Pizzas', price: 130, eta_minutes: 15, image_url: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=400&q=80' },

    // ═══════════ BS SPECIAL PIZZAS ═══════════
    { name: 'Ultimate Special Pizza', category: 'Special Pizzas', price: 140, eta_minutes: 18, image_url: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&q=80' },
    { name: 'Classic Special Pizza', category: 'Special Pizzas', price: 150, eta_minutes: 18, image_url: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=400&q=80' },
    { name: 'Cheese Chilli Garlic Pizza', category: 'Special Pizzas', price: 160, eta_minutes: 18, image_url: 'https://images.unsplash.com/photo-1600628421055-4d30de868b8f?w=400&q=80' },
    { name: 'Spicy Delight Paneer Pizza', category: 'Special Pizzas', price: 160, eta_minutes: 18, image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&q=80' },
    { name: 'Cheese Indo Western Pizza', category: 'Special Pizzas', price: 160, eta_minutes: 18, image_url: 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=400&q=80' },
    { name: 'Italian Fragrance Pizza', category: 'Special Pizzas', price: 170, eta_minutes: 20, image_url: 'https://images.unsplash.com/photo-1580919784708-4c0a0a0b0b0a?w=400&q=80' },
    { name: "Cheese Lover's Pizza", category: 'Special Pizzas', price: 180, eta_minutes: 20, image_url: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80' },

    // ═══════════ MOMOS ═══════════
    { name: 'Veg Steam Momo', category: 'Momos', price: 60, eta_minutes: 10, image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80' },
    { name: 'Veg Fried Momo', category: 'Momos', price: 70, eta_minutes: 12, image_url: 'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?w=400&q=80' },
    { name: 'Steam Paneer Momo', category: 'Momos', price: 80, eta_minutes: 12, image_url: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400&q=80' },
    { name: 'Fried Paneer Momo', category: 'Momos', price: 90, eta_minutes: 12, image_url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400&q=80' },
    { name: 'Steam Peri Peri Momo', category: 'Momos', price: 90, eta_minutes: 12, image_url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&q=80' },
    { name: 'Fried Peri Peri Momo', category: 'Momos', price: 100, eta_minutes: 12, image_url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&q=80' },

    // ═══════════ APPETIZERS ═══════════
    { name: 'French Fries', category: 'Appetizers', price: 80, eta_minutes: 8, image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80' },
    { name: 'Peri Peri Fries', category: 'Appetizers', price: 100, eta_minutes: 8, image_url: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&q=80' },
    { name: 'Liquid Cheese Fries', category: 'Appetizers', price: 100, eta_minutes: 10, image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400&q=80' },
    { name: 'Liquid Cheese Peri Peri Fries', category: 'Appetizers', price: 120, eta_minutes: 10, image_url: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80' },
    { name: 'Wonder Fries', category: 'Appetizers', price: 120, eta_minutes: 10, image_url: 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=400&q=80' },

    // ═══════════ PASTAS ═══════════
    { name: 'White Sauce Cheese Pasta', category: 'Pastas', price: 90, eta_minutes: 12, image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80' },
    { name: 'Peri Peri Pasta', category: 'Pastas', price: 100, eta_minutes: 12, image_url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=80' },
    { name: 'Red Sauce Pasta', category: 'Pastas', price: 100, eta_minutes: 12, image_url: 'https://images.unsplash.com/photo-1598866594042-8c11f76cacb4?w=400&q=80' },

    // ═══════════ BROWNIES ═══════════
    { name: 'Chocolate Brownie', category: 'Brownies', price: 150, eta_minutes: 5, image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80' },
    { name: 'Sizzling Brownie', category: 'Brownies', price: 200, eta_minutes: 8, image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80' },
]

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        // Find "Bunk Spot" admin or first approved admin
        const { data: admins, error: adminError } = await supabase
            .from('admin_profiles')
            .select('id, canteen_name')
            .eq('status', 'approved')

        if (adminError || !admins?.length) {
            return NextResponse.json({
                error: 'No approved admin found. Please create and approve a Bunk Spot admin first.',
                details: adminError?.message
            }, { status: 404 })
        }

        // Try to find "Bunk Spot" specifically, else use first admin
        const bunkSpot = admins.find(a =>
            a.canteen_name.toLowerCase().includes('bunk')
        ) || admins[0]

        const adminId = bunkSpot.id

        // Check if items already exist for this admin
        const { data: existing } = await supabase
            .from('menu_items')
            .select('id')
            .eq('admin_id', adminId)
            .limit(1)

        if (existing && existing.length > 0) {
            return NextResponse.json({
                message: `Menu items already exist for ${bunkSpot.canteen_name} (${adminId}). Delete them first if you want to re-seed.`,
                adminId,
                canteen: bunkSpot.canteen_name
            })
        }

        // Insert all items
        const itemsToInsert = MENU_ITEMS.map(item => ({
            ...item,
            admin_id: adminId,
            available: true,
        }))

        const { data: inserted, error: insertError } = await supabase
            .from('menu_items')
            .insert(itemsToInsert)
            .select()

        if (insertError) {
            return NextResponse.json({
                error: 'Failed to insert menu items',
                details: insertError.message
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: `Seeded ${inserted?.length || 0} menu items for ${bunkSpot.canteen_name}`,
            adminId,
            canteen: bunkSpot.canteen_name,
            itemCount: inserted?.length || 0,
            categories: [...new Set(MENU_ITEMS.map(i => i.category))]
        })

    } catch (err: any) {
        return NextResponse.json({
            error: 'Seed failed',
            details: err.message
        }, { status: 500 })
    }
}
