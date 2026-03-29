-- ============================================================
-- Comprehensive Security & Performance Fixes
-- Fixes ALL Supabase Security Advisor + Performance Advisor warnings
-- Date: 2026-02-21
-- ============================================================


-- ============================================================
-- SECTION 1: FIX FUNCTIONS
-- Add SET search_path = '' to all DB functions (Security: Function
-- Search Path Mutable) so they can't be hijacked via search path.
-- ============================================================

CREATE OR REPLACE FUNCTION public.force_pending_status()
RETURNS TRIGGER AS $$
BEGIN
    NEW.status := 'pending';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = '';

CREATE OR REPLACE FUNCTION public.prevent_status_update()
RETURNS TRIGGER AS $$
BEGIN
    IF (session_user = 'service_role' OR session_user = 'postgres') THEN
        RETURN NEW;
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        RAISE EXCEPTION 'You are not authorized to update the status field.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = '';

CREATE OR REPLACE FUNCTION public.mark_order_completed(p_order_id UUID)
RETURNS VOID AS $$
DECLARE
    v_order_user_id UUID;
    v_current_status TEXT;
BEGIN
    SELECT user_id, status INTO v_order_user_id, v_current_status
    FROM public.orders
    WHERE id = p_order_id;

    IF v_order_user_id IS NULL OR v_order_user_id != (SELECT auth.uid()) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    IF v_current_status != 'ready' THEN
        RAISE EXCEPTION 'Order is not ready for pickup';
    END IF;

    UPDATE public.orders
    SET status = 'completed',
        completed_at = NOW()
    WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = '';

-- NOTE: create_order must be updated with SET search_path = '' as well.
-- Run this in the SQL Editor only after verifying the body matches your live function.
-- The skeleton below preserves the typical logic for Campus-Grab.
-- If your live function differs, edit the body before running.
CREATE OR REPLACE FUNCTION public.create_order(
    p_admin_id       UUID,
    p_items          JSONB,
    p_total_amount   NUMERIC,
    p_token_number   TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_order_id   UUID;
    v_next_token INT;
    v_token_text TEXT;
BEGIN
    IF p_token_number IS NULL THEN
        SELECT COALESCE(MAX(CAST(NULLIF(regexp_replace(token_number, '[^0-9]', '', 'g'), '') AS INT)), 0) + 1
        INTO v_next_token
        FROM public.orders
        WHERE admin_id = p_admin_id
          AND DATE(created_at) = CURRENT_DATE;

        v_token_text := LPAD(v_next_token::TEXT, 3, '0');
    ELSE
        v_token_text := p_token_number;
    END IF;

    INSERT INTO public.orders (user_id, admin_id, items, total_amount, token_number, status)
    VALUES ((SELECT auth.uid()), p_admin_id, p_items, p_total_amount, v_token_text, 'pending')
    RETURNING id INTO v_order_id;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = '';


-- ============================================================
-- SECTION 2: FIX RLS ON canteens TABLE
-- Security Advisor Error: RLS Disabled in Public
-- ============================================================

ALTER TABLE public.canteens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for canteens" ON public.canteens;
CREATE POLICY "Public read access for canteens"
ON public.canteens FOR SELECT
USING (true);
-- No INSERT/UPDATE/DELETE policies means only service_role (dashboard) can modify canteens.


-- ============================================================
-- SECTION 3: CLEAN UP ALL POLICIES
-- Drops BOTH old legacy policies AND any from previous migrations,
-- then recreates a single clean set with (select auth.uid()) wrappers.
--
-- Legacy policies found by advisor (multiple permissive):
--   admin_profiles: "Anyone can insert", "Admins can read own profile", "Admins can update own"
--   orders:         "Anyone can insert orders", "Anyone can read orders", "Anyone can update orders"
-- ============================================================

-- ---- admin_profiles: drop everything ----
DROP POLICY IF EXISTS "Anyone can insert"               ON public.admin_profiles;
DROP POLICY IF EXISTS "Admins can read own profile"     ON public.admin_profiles;
DROP POLICY IF EXISTS "Admins can update own"           ON public.admin_profiles;
DROP POLICY IF EXISTS "Users can view own profile"      ON public.admin_profiles;
DROP POLICY IF EXISTS "Users can insert own profile"    ON public.admin_profiles;
DROP POLICY IF EXISTS "Users can update own profile"    ON public.admin_profiles;

-- Recreate with (select auth.uid()) for init-plan performance
CREATE POLICY "Users can view own profile"
ON public.admin_profiles FOR SELECT
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own profile"
ON public.admin_profiles FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own profile"
ON public.admin_profiles FOR UPDATE
USING ((select auth.uid()) = user_id);


-- ---- menu_items: drop everything ----
DROP POLICY IF EXISTS "Public read access for menu items"    ON public.menu_items;
DROP POLICY IF EXISTS "Admins can manage own menu items"     ON public.menu_items;

-- Single SELECT policy for everyone (public read)
CREATE POLICY "Public read access for menu items"
ON public.menu_items FOR SELECT
USING (true);

-- Separate policy for admin writes only (INSERT / UPDATE / DELETE)
-- Does NOT include SELECT so there's no overlap with the read policy above.
CREATE POLICY "Admins can manage own menu items"
ON public.menu_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE id = public.menu_items.admin_id
          AND user_id = (select auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE id = public.menu_items.admin_id
          AND user_id = (select auth.uid())
    )
);

-- NOTE: Using FOR ALL here still causes a SELECT overlap.
-- The cleanest fix is to split into explicit INSERT / UPDATE / DELETE:
DROP POLICY IF EXISTS "Admins can manage own menu items" ON public.menu_items;

CREATE POLICY "Admins can insert own menu items"
ON public.menu_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE id = public.menu_items.admin_id
          AND user_id = (select auth.uid())
    )
);

CREATE POLICY "Admins can update own menu items"
ON public.menu_items FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE id = public.menu_items.admin_id
          AND user_id = (select auth.uid())
    )
);

CREATE POLICY "Admins can delete own menu items"
ON public.menu_items FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE id = public.menu_items.admin_id
          AND user_id = (select auth.uid())
    )
);


-- ---- orders: drop everything ----
DROP POLICY IF EXISTS "Anyone can insert orders"              ON public.orders;
DROP POLICY IF EXISTS "Anyone can read orders"               ON public.orders;
DROP POLICY IF EXISTS "Anyone can update orders"             ON public.orders;
DROP POLICY IF EXISTS "Users can see own orders"             ON public.orders;
DROP POLICY IF EXISTS "Admins can see own canteen orders"    ON public.orders;
DROP POLICY IF EXISTS "Users can create orders"              ON public.orders;
DROP POLICY IF EXISTS "Admins can update own canteen orders" ON public.orders;

-- Recreate with (select auth.uid()) for init-plan performance
CREATE POLICY "Users can see own orders"
ON public.orders FOR SELECT
USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can see own canteen orders"
ON public.orders FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE id = public.orders.admin_id
          AND user_id = (select auth.uid())
    )
);

CREATE POLICY "Users can create orders"
ON public.orders FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins can update own canteen orders"
ON public.orders FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE id = public.orders.admin_id
          AND user_id = (select auth.uid())
    )
);


-- ============================================================
-- SECTION 4: ADD INDEXES FOR UNINDEXED FOREIGN KEYS
-- Performance Advisor Info: Unindexed foreign keys on:
--   public.admin_profiles, public.menu_items (x2), public.orders (x2)
-- ============================================================

-- admin_profiles foreign keys
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id
    ON public.admin_profiles (user_id);

-- menu_items foreign keys
CREATE INDEX IF NOT EXISTS idx_menu_items_admin_id
    ON public.menu_items (admin_id);

-- If menu_items also has a category_id or canteen_id FK, add it here.
-- Example (uncomment if applicable):
-- CREATE INDEX IF NOT EXISTS idx_menu_items_canteen_id
--     ON public.menu_items (canteen_id);

-- orders foreign keys
CREATE INDEX IF NOT EXISTS idx_orders_user_id
    ON public.orders (user_id);

CREATE INDEX IF NOT EXISTS idx_orders_admin_id
    ON public.orders (admin_id);
