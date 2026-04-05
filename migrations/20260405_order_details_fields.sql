-- ============================================================
-- Order Details Enhancement: Store user context on orders
-- Date: 2026-04-05
-- Purpose: Enable admin to see customer name, enable invoices
-- ============================================================

-- 1. Add user_name and user_email to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_email TEXT;

-- 2. Backfill existing orders with user info from auth.users (optional)
-- This updates old orders that don't have user_name/user_email yet
-- UPDATE public.orders o
-- SET user_name = COALESCE(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
--     user_email = u.email
-- FROM auth.users u
-- WHERE o.user_id = u.id AND o.user_name IS NULL;

-- 3. Update create_order function to accept user_name and user_email
CREATE OR REPLACE FUNCTION public.create_order(
    p_id          TEXT DEFAULT NULL,
    p_admin_id    UUID DEFAULT NULL,
    p_items       JSONB DEFAULT '[]'::jsonb,
    p_total       NUMERIC DEFAULT 0,
    p_estimated_time INT DEFAULT 15,
    p_status      TEXT DEFAULT 'pending',
    p_payment_method TEXT DEFAULT 'online',
    p_user_name   TEXT DEFAULT NULL,
    p_user_email  TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_order_id   UUID;
    v_next_token INT;
    v_token_text TEXT;
    v_result     JSONB;
BEGIN
    -- Generate daily sequential token number
    SELECT COALESCE(MAX(CAST(NULLIF(regexp_replace(token_number, '[^0-9]', '', 'g'), '') AS INT)), 0) + 1
    INTO v_next_token
    FROM public.orders
    WHERE admin_id = p_admin_id
      AND DATE(created_at) = CURRENT_DATE;

    v_token_text := '#' || LPAD(v_next_token::TEXT, 4, '0');

    INSERT INTO public.orders (user_id, admin_id, items, total, token_number, status, estimated_time, payment_method, user_name, user_email)
    VALUES (
        (SELECT auth.uid()),
        p_admin_id,
        p_items,
        p_total,
        v_token_text,
        'pending',
        p_estimated_time,
        p_payment_method,
        p_user_name,
        p_user_email
    )
    RETURNING id INTO v_order_id;

    SELECT jsonb_build_object(
        'id', o.id,
        'token_number', o.token_number,
        'items', o.items,
        'total', o.total,
        'status', o.status,
        'created_at', o.created_at,
        'estimated_time', o.estimated_time,
        'payment_method', o.payment_method,
        'admin_id', o.admin_id,
        'user_name', o.user_name,
        'user_email', o.user_email
    ) INTO v_result
    FROM public.orders o
    WHERE o.id = v_order_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = '';
