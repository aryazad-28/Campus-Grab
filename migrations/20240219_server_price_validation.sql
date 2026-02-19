-- Server-side price recalculation for create_order RPC
-- This replaces the client-trusted p_total with a server-calculated total
-- based on actual menu_items prices in the database.

-- First, check if create_order function exists and update it
-- to recalculate total from menu_items prices

CREATE OR REPLACE FUNCTION create_order(
    p_user_id UUID,
    p_admin_id UUID,
    p_items JSONB,
    p_total NUMERIC,         -- Still accepted but verified server-side
    p_payment_method TEXT DEFAULT 'razorpay',
    p_estimated_time INTEGER DEFAULT 15
)
RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_token_number INTEGER;
    v_calculated_total NUMERIC := 0;
    v_item JSONB;
    v_item_price NUMERIC;
    v_item_quantity INTEGER;
    v_tolerance NUMERIC := 1.0; -- Allow ₹1 rounding tolerance
BEGIN
    -- Recalculate total from actual menu_items prices
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Look up the actual price from the database
        SELECT price INTO v_item_price
        FROM menu_items
        WHERE id = (v_item->>'id')::UUID
          AND admin_id = p_admin_id
          AND available = true;

        IF v_item_price IS NULL THEN
            RAISE EXCEPTION 'Menu item % not found or unavailable', v_item->>'id';
        END IF;

        v_item_quantity := COALESCE((v_item->>'quantity')::INTEGER, 1);

        IF v_item_quantity <= 0 OR v_item_quantity > 50 THEN
            RAISE EXCEPTION 'Invalid quantity for item %', v_item->>'id';
        END IF;

        v_calculated_total := v_calculated_total + (v_item_price * v_item_quantity);
    END LOOP;

    -- Verify the client-provided total matches the server-calculated total
    -- Allow small rounding differences
    IF ABS(v_calculated_total - p_total) > v_tolerance THEN
        RAISE EXCEPTION 'Price mismatch: expected %, got %', v_calculated_total, p_total;
    END IF;

    -- Generate token number (daily sequential)
    SELECT COALESCE(MAX(token_number), 0) + 1 INTO v_token_number
    FROM orders
    WHERE admin_id = p_admin_id
      AND created_at::date = CURRENT_DATE;

    -- Generate order ID
    v_order_id := gen_random_uuid();

    -- Insert the order with the SERVER-calculated total
    INSERT INTO orders (
        id, user_id, admin_id, items, total, status,
        payment_method, token_number, estimated_time,
        created_at
    ) VALUES (
        v_order_id, p_user_id, p_admin_id, p_items, v_calculated_total, 'pending',
        p_payment_method, v_token_number, p_estimated_time,
        NOW()
    );

    RETURN jsonb_build_object(
        'order_id', v_order_id,
        'token_number', v_token_number,
        'total', v_calculated_total
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
