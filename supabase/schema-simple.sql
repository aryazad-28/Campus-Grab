-- ============================================
-- CAMPUS GRAB - Quick Start SQL (No RLS Errors)
-- ============================================
-- If you get RLS policy errors, run this simpler version first
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES (Simplified - No RLS)
-- ============================================

-- Canteens table
CREATE TABLE IF NOT EXISTS canteens (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    is_open BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    eta_minutes INTEGER NOT NULL CHECK (eta_minutes > 0),
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily order counter sequence
CREATE SEQUENCE IF NOT EXISTS order_counter_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    CACHE 1;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_number TEXT NOT NULL,
    items JSONB NOT NULL,
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    estimated_time INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed')),
    payment_method TEXT DEFAULT 'online',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_date DATE DEFAULT CURRENT_DATE,
    completed_at TIMESTAMPTZ
);

-- Function to generate daily token number
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

-- ============================================
-- INDEXES for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(created_date);

-- UNIQUE index to prevent duplicate tokens on same day
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_token_date_unique ON orders(token_number, created_date);

CREATE INDEX IF NOT EXISTS idx_menu_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO canteens (name, location, is_open)
VALUES ('Main Canteen', 'Building A, Ground Floor', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- NOTES
-- ============================================
-- This is a simplified version without RLS policies
-- Use schema.sql for the full version with authentication
