-- Enable RLS on all tables
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 1. Admin Profiles Security
-- Trigger to FORCE status = 'pending' on insert
CREATE OR REPLACE FUNCTION force_pending_status()
RETURNS TRIGGER AS $$
BEGIN
    NEW.status := 'pending';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS force_pending_status_trigger ON admin_profiles;
CREATE TRIGGER force_pending_status_trigger
BEFORE INSERT ON admin_profiles
FOR EACH ROW
EXECUTE FUNCTION force_pending_status();

-- Policies for admin_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON admin_profiles;
CREATE POLICY "Users can view own profile"
ON admin_profiles FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON admin_profiles;
CREATE POLICY "Users can insert own profile"
ON admin_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON admin_profiles;
CREATE POLICY "Users can update own profile"
ON admin_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- 2. Menu Items Security
DROP POLICY IF EXISTS "Public read access for menu items" ON menu_items;
CREATE POLICY "Public read access for menu items"
ON menu_items FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage own menu items" ON menu_items;
CREATE POLICY "Admins can manage own menu items"
ON menu_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_profiles
        WHERE id = menu_items.admin_id
        AND user_id = auth.uid()
    )
);

-- PROTECT UPDATE: Prevent users from approving themselves
CREATE OR REPLACE FUNCTION prevent_status_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow Service Role (Backend API) or Postgres (Dashboard) to bypass this check
    IF (session_user = 'service_role' OR session_user = 'postgres') THEN
        RETURN NEW;
    END IF;

    -- For normal "authenticated" users, DENY status changes
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        RAISE EXCEPTION 'You are not authorized to update the status field.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_status_change ON admin_profiles;
CREATE TRIGGER prevent_status_change
BEFORE UPDATE ON admin_profiles
FOR EACH ROW
EXECUTE FUNCTION prevent_status_update();


-- 3. Orders Security
-- RPC for students to mark order as completed (Safe transition)
CREATE OR REPLACE FUNCTION mark_order_completed(p_order_id UUID)
RETURNS VOID AS $$
DECLARE
    v_order_user_id UUID;
    v_current_status TEXT;
BEGIN
    -- Get order details
    SELECT user_id, status INTO v_order_user_id, v_current_status
    FROM orders
    WHERE id = p_order_id;

    -- Verify ownership
    IF v_order_user_id IS NULL OR v_order_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Verify status transition
    IF v_current_status != 'ready' THEN
        RAISE EXCEPTION 'Order is not ready for pickup';
    END IF;

    -- Update status
    UPDATE orders
    SET status = 'completed',
        completed_at = NOW()
    WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for orders
DROP POLICY IF EXISTS "Users can see own orders" ON orders;
CREATE POLICY "Users can see own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can see own canteen orders" ON orders;
CREATE POLICY "Admins can see own canteen orders"
ON orders FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admin_profiles
        WHERE id = orders.admin_id
        AND user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update own canteen orders" ON orders;
CREATE POLICY "Admins can update own canteen orders"
ON orders FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM admin_profiles
        WHERE id = orders.admin_id
        AND user_id = auth.uid()
    )
);

-- Users CANNOT update orders directly (DENY by omission)
-- If we need to allow them to cancel, we would add a specific policy for that.
-- For now, strictly secure: NO user updates on orders table directly.
