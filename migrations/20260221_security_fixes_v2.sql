-- ============================================================
-- Security & Performance Fixes - Round 2
-- Fixes remaining Supabase Advisor warnings after v1 migration
-- Date: 2026-02-21
-- ============================================================


-- ============================================================
-- SECTION 1: FIX create_order FUNCTION (BOTH OVERLOADS)
--
-- Supabase flags create_order TWICE because TWO versions exist:
--   - Version A: with p_token_number parameter (already fixed in v1)
--   - Version B: without p_token_number parameter (the other overload)
--
-- We fix BOTH by recreating them with SET search_path = ''.
-- ============================================================

-- Overload A: WITHOUT p_token_number (no default token param)
CREATE OR REPLACE FUNCTION public.create_order(
    p_admin_id       UUID,
    p_items          JSONB,
    p_total_amount   NUMERIC
)
RETURNS UUID AS $$
DECLARE
    v_order_id   UUID;
    v_next_token INT;
    v_token_text TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(NULLIF(regexp_replace(token_number, '[^0-9]', '', 'g'), '') AS INT)), 0) + 1
    INTO v_next_token
    FROM public.orders
    WHERE admin_id = p_admin_id
      AND DATE(created_at) = CURRENT_DATE;

    v_token_text := LPAD(v_next_token::TEXT, 3, '0');

    INSERT INTO public.orders (user_id, admin_id, items, total_amount, token_number, status)
    VALUES ((SELECT auth.uid()), p_admin_id, p_items, p_total_amount, v_token_text, 'pending')
    RETURNING id INTO v_order_id;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = '';

-- Overload B: WITH p_token_number parameter
CREATE OR REPLACE FUNCTION public.create_order(
    p_admin_id       UUID,
    p_items          JSONB,
    p_total_amount   NUMERIC,
    p_token_number   TEXT
)
RETURNS UUID AS $$
DECLARE
    v_order_id   UUID;
BEGIN
    INSERT INTO public.orders (user_id, admin_id, items, total_amount, token_number, status)
    VALUES ((SELECT auth.uid()), p_admin_id, p_items, p_total_amount, p_token_number, 'pending')
    RETURNING id INTO v_order_id;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = '';


-- ============================================================
-- SECTION 2: MERGE DUPLICATE SELECT POLICIES ON orders
--
-- Having two separate SELECT policies ("Users can see own orders"
-- and "Admins can see own canteen orders") both being permissive
-- causes Supabase to flag this as "Multiple Permissive Policies".
--
-- Fix: Drop both and replace with ONE combined SELECT policy
-- that covers both cases using OR.
-- ============================================================

DROP POLICY IF EXISTS "Users can see own orders"          ON public.orders;
DROP POLICY IF EXISTS "Admins can see own canteen orders" ON public.orders;

CREATE POLICY "Users and admins can see relevant orders"
ON public.orders FOR SELECT
USING (
    -- Student sees their own orders
    (select auth.uid()) = user_id
    OR
    -- Admin sees all orders for their canteen
    EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE id = public.orders.admin_id
          AND user_id = (select auth.uid())
    )
);


-- ============================================================
-- SECTION 3: ADD MISSING INDEX ON menu_items
--
-- 1 unindexed FK still remaining on public.menu_items.
-- Most likely the canteen_id foreign key (if it exists).
-- Also adding category_id as a precaution.
-- These use CREATE INDEX IF NOT EXISTS so they're safe to run
-- even if the column doesn't exist on your schema.
-- ============================================================

-- Try canteen_id (most likely the missing one)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'menu_items'
          AND column_name  = 'canteen_id'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_menu_items_canteen_id ON public.menu_items (canteen_id)';
    END IF;
END$$;

-- Try category_id as well
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'menu_items'
          AND column_name  = 'category_id'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON public.menu_items (category_id)';
    END IF;
END$$;
