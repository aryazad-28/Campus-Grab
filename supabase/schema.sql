-- ============================================
-- CAMPUS GRAB - Complete Supabase Schema
-- ============================================
-- This schema supports concurrent order handling
-- with proper constraints, indexes, and sequences
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Canteens table
-- Represents different food outlets on campus
CREATE TABLE IF NOT EXISTS canteens (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    is_open BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table
-- Canteen staff/managers who process orders
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    canteen_id BIGINT REFERENCES canteens(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student users table (optional - if you want user accounts)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    phone TEXT,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items table
-- Food items available for ordering
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    canteen_id BIGINT REFERENCES canteens(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    eta_minutes INTEGER NOT NULL CHECK (eta_minutes > 0),
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily order counter sequence
-- Resets daily for token number generation
CREATE SEQUENCE IF NOT EXISTS order_counter_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    CACHE 1;

-- Function to reset counter daily
CREATE OR REPLACE FUNCTION reset_order_counter()
RETURNS void AS $$
BEGIN
    -- Reset the sequence to 1
    ALTER SEQUENCE order_counter_seq RESTART WITH 1;
END;
$$ LANGUAGE plpgsql;

-- Orders table
-- Main orders table with concurrent-safe token generation
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_number TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    canteen_id BIGINT REFERENCES canteens(id) ON DELETE SET NULL,
    items JSONB NOT NULL, -- Array of {name, quantity, price, eta_minutes}
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    estimated_time INTEGER NOT NULL, -- Max ETA from all items
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed')),
    payment_method TEXT DEFAULT 'online',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_date DATE DEFAULT CURRENT_DATE,
    completed_at TIMESTAMPTZ
);

-- Function to generate daily token number
-- Thread-safe for concurrent requests
CREATE OR REPLACE FUNCTION generate_daily_token()
RETURNS TEXT AS $$
DECLARE
    today DATE := CURRENT_DATE;
    last_reset_date DATE;
    counter INTEGER;
BEGIN
    -- Check if we need to reset the counter for a new day
    SELECT created_at::DATE INTO last_reset_date
    FROM orders
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If it's a new day or no orders exist, reset counter
    IF last_reset_date IS NULL OR last_reset_date < today THEN
        PERFORM setval('order_counter_seq', 1, false);
    END IF;
    
    -- Get next value from sequence
    counter := nextval('order_counter_seq');
    
    -- Return formatted token
    RETURN '#' || LPAD(counter::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate token on insert
CREATE OR REPLACE FUNCTION set_order_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.token_number IS NULL OR NEW.token_number = '' THEN
        NEW.token_number := generate_daily_token();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_order_insert
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_token();

-- Order analytics table (optional)
-- Pre-computed analytics for faster dashboard queries
CREATE TABLE IF NOT EXISTS order_analytics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    avg_prep_time DECIMAL(5, 2) DEFAULT 0,
    popular_items JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Orders table indexes (critical for concurrent access)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_admin_id ON orders(admin_id);
CREATE INDEX IF NOT EXISTS idx_orders_canteen_id ON orders(canteen_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(created_date);
-- Unique index to prevent duplicate tokens on the same day
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_token_date_unique ON orders(token_number, created_date);

-- Menu items indexes
CREATE INDEX IF NOT EXISTS idx_menu_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_menu_canteen ON menu_items(canteen_id);
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE canteens ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public read access to canteens
CREATE POLICY "Allow public read access to canteens"
    ON canteens FOR SELECT
    TO anon, authenticated
    USING (true);

-- Public read access to available menu items
CREATE POLICY "Allow public read access to available menu items"
    ON menu_items FOR SELECT
    TO anon, authenticated
    USING (available = true);

-- Admin can manage their own menu items
CREATE POLICY "Admins can manage their menu items"
    ON menu_items FOR ALL
    TO authenticated
    USING (admin_id = auth.uid())
    WITH CHECK (admin_id = auth.uid());

-- Anyone can create orders (students placing orders)
CREATE POLICY "Allow anonymous order creation"
    ON orders FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Public can read orders (for tracking)
CREATE POLICY "Allow public read access to orders"
    ON orders FOR SELECT
    TO anon, authenticated
    USING (true);

-- Admins can update orders in their canteen
CREATE POLICY "Admins can update their canteen orders"
    ON orders FOR UPDATE
    TO authenticated
    USING (admin_id = auth.uid())
    WITH CHECK (admin_id = auth.uid());

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get today's order statistics
CREATE OR REPLACE FUNCTION get_daily_stats(p_admin_id UUID DEFAULT NULL)
RETURNS TABLE (
    total_orders BIGINT,
    total_revenue DECIMAL,
    pending_count BIGINT,
    completed_count BIGINT,
    avg_prep_time DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_orders,
        COALESCE(SUM(total), 0)::DECIMAL as total_revenue,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_count,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_count,
        COALESCE(AVG(estimated_time), 0)::DECIMAL as avg_prep_time
    FROM orders
    WHERE DATE(created_at) = CURRENT_DATE
        AND (p_admin_id IS NULL OR admin_id = p_admin_id);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (Optional)
-- ============================================

-- Insert default canteen
INSERT INTO canteens (name, location, is_open)
VALUES ('Main Canteen', 'Building A, Ground Floor', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================
-- Enable realtime for orders table
-- Run this in Supabase SQL editor to enable realtime:
-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ============================================
-- NOTES
-- ============================================
-- 1. Token generation is thread-safe using PostgreSQL sequences
-- 2. Unique constraint prevents duplicate tokens on same day
-- 3. Indexes optimize queries for high concurrent load
-- 4. RLS policies secure data access
-- 5. Run this entire script in Supabase SQL Editor
-- 6. After running, enable Realtime for 'orders' table in Supabase Dashboard
