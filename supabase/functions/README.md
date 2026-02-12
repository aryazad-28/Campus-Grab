# Supabase Edge Functions Setup

This directory contains Supabase Edge Functions for server-side order processing.

## Functions

### `create-order`
Handles atomic order creation with automatic token number generation.

**Endpoint**: `https://YOUR_PROJECT.supabase.co/functions/v1/create-order`

**Request Body**:
```json
{
  "items": [{"name": "Pizza", "quantity": 1, "price": 120}],
  "total": 120,
  "estimated_time": 15,
  "status": "pending",
  "payment_method": "online",
  "admin_id": "optional-uuid",
  "canteen_id": 1
}
```

**Response**:
```json
{
  "order": {
    "id": "uuid",
    "token_number": "#0001",
    "items": [...],
    "total": 120,
    "status": "pending",
    "created_at": "2026-02-12T..."
  }
}
```

## Deployment

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

4. Deploy the function:
```bash
supabase functions deploy create-order
```

## Local Testing

```bash
supabase functions serve create-order --env-file supabase/.env.local
```

## Environment Variables

The function uses these automatically provided by Supabase:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

No additional configuration needed!
