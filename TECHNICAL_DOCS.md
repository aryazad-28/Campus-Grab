# Campus Grab — Complete Technical Documentation

> **Last Updated:** February 17, 2026
> A comprehensive guide for any software engineer to understand, maintain, and extend this project.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Architecture Overview](#4-architecture-overview)
5. [Database Schema (Supabase)](#5-database-schema-supabase)
6. [Authentication System](#6-authentication-system)
7. [React Context Providers (State Management)](#7-react-context-providers-state-management)
8. [Student Portal (Frontend)](#8-student-portal-frontend)
9. [Admin Portal (Frontend)](#9-admin-portal-frontend)
10. [API Routes (Backend)](#10-api-routes-backend)
11. [AI / Analytics Module](#11-ai--analytics-module)
12. [Internationalization (i18n)](#12-internationalization-i18n)
13. [Styling System](#13-styling-system)
14. [Payment Integration (Razorpay)](#14-payment-integration-razorpay)
15. [Real-Time Features](#15-real-time-features)
16. [Environment Variables](#16-environment-variables)
17. [Development Setup](#17-development-setup)
18. [Deployment](#18-deployment)
19. [Known Gotchas & Pitfalls](#19-known-gotchas--pitfalls)

---

## 1. Project Overview

**Campus Grab** is a mobile-first food ordering PWA (Progressive Web App) for college campuses. It has two portals:

| Portal | Users | Purpose |
|--------|-------|---------|
| **Student Portal** | Students | Browse canteens, view menus, add to cart, place orders, track status |
| **Admin Portal** | Canteen owners | Manage menu items, view/process orders, toggle open/close, analytics |

Students can discover canteens, browse menus with categories, add items to cart, pay via Razorpay or COD, and track order status in real-time. Admins manage their canteen independently — each admin owns one canteen.

---

## 2. Tech Stack

### Core Framework
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.1.1 | React framework with App Router, SSR, API routes |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first CSS (via `@tailwindcss/postcss`) |

### Backend / Database
| Technology | Purpose |
|-----------|---------|
| **Supabase** | PostgreSQL database, Authentication (email + Google OAuth), Realtime subscriptions |
| **Supabase Auth** | User management, JWT tokens, OAuth providers |
| **Supabase Realtime** | WebSocket-based live updates for orders and menu changes |

### Payments
| Technology | Purpose |
|-----------|---------|
| **Razorpay** | Payment gateway for online payments (India-focused) |

### UI Libraries
| Library | Purpose |
|---------|---------|
| **Lucide React** | Icon library (replacing Heroicons/FontAwesome) |
| **Radix UI** | Headless UI primitives (`react-dialog`, `react-slot`) |
| **class-variance-authority (CVA)** | Variant-based component styling |
| **clsx** + **tailwind-merge** | Conditional class merging |

### Maps & Location
| Library | Purpose |
|---------|---------|
| **Leaflet** + **React-Leaflet** | Interactive maps for canteen location picker (admin onboarding) |

### Internationalization
| Library | Purpose |
|---------|---------|
| **next-intl** | Multi-language support (English, Hindi, Marathi) |

---

## 3. Project Structure

```
Campus-Grab/
├── .env.local                    # Environment variables (Supabase, Razorpay keys)
├── package.json                  # Dependencies and scripts
├── next.config.js                # Next.js configuration
├── postcss.config.mjs            # PostCSS config (Tailwind)
├── tsconfig.json                 # TypeScript configuration
├── messages/                     # i18n translation files
│   ├── en.json                   #   English
│   ├── hi.json                   #   Hindi
│   └── mr.json                   #   Marathi
├── migrations/                   # Database migration SQL files
├── public/                       # Static assets (icons, manifest.json)
└── src/
    ├── app/                      # Next.js App Router pages
    │   ├── layout.tsx            # ROOT layout (wraps everything with providers)
    │   ├── page.tsx              # Landing "/" → redirects to /canteens
    │   ├── globals.css           # Global styles, CSS variables, animations
    │   ├── login/page.tsx        # Unified login page (student + admin)
    │   ├── forgot-password/      # Password reset page
    │   ├── (student)/            # Student route group
    │   │   ├── layout.tsx        #   Student layout (Header + BottomNav)
    │   │   ├── canteens/         #   /canteens — Browse canteens
    │   │   ├── menu/             #   /menu?canteen=<id> — View menu
    │   │   ├── cart/             #   /cart — Cart + checkout + payment
    │   │   ├── orders/           #   /orders — Active orders
    │   │   ├── profile/          #   /profile — User profile + order history
    │   │   └── settings/         #   /settings — App settings
    │   ├── admin/                # Admin route group
    │   │   ├── layout.tsx        #   Admin layout (AdminProvider + scoped Menu/Orders)
    │   │   ├── page.tsx          #   /admin — Dashboard (stats + open/close toggle)
    │   │   ├── login/            #   /admin/login — Admin login/signup
    │   │   ├── onboarding/       #   /admin/onboarding — New admin setup
    │   │   ├── menu/             #   /admin/menu — Manage menu items
    │   │   ├── orders/           #   /admin/orders — View/manage incoming orders
    │   │   ├── analytics/        #   /admin/analytics — Order analytics
    │   │   ├── profile/          #   /admin/profile — Admin profile + Razorpay keys
    │   │   └── forgot-password/  #   /admin/forgot-password
    │   └── api/                  # Next.js API routes (server-side)
    │       ├── orders/
    │       │   ├── history/      #   GET /api/orders/history — Order history
    │       │   └── vendor/       #   GET /api/orders/vendor — Vendor's orders
    │       ├── razorpay/
    │       │   ├── create-order/ #   POST — Create Razorpay payment order
    │       │   ├── verify-payment/ #  POST — Verify payment signature
    │       │   └── webhook/      #   POST — Razorpay webhook handler
    │       ├── seed-menu/        #   POST — Seed demo menu items
    │       └── load-test/        #   POST — Load testing endpoint
    ├── components/               # React components
    │   ├── AuthProvider.tsx      #   Student authentication context
    │   ├── AdminProvider.tsx     #   Admin authentication context
    │   ├── CartProvider.tsx      #   Shopping cart state
    │   ├── MenuProvider.tsx      #   Menu items (with real-time sync)
    │   ├── OrdersProvider.tsx    #   Orders management (with real-time sync)
    │   ├── AIProvider.tsx        #   AI insights context
    │   ├── ThemeProvider.tsx     #   Dark/light mode
    │   ├── Header.tsx            #   Student top navigation bar
    │   ├── BottomNav.tsx         #   Student bottom tab navigation
    │   ├── MobileNav.tsx         #   Mobile slide-out navigation
    │   ├── MenuCard.tsx          #   Menu item card (image + price + add button)
    │   ├── SkeletonCard.tsx      #   Loading skeleton placeholders
    │   ├── CurrentOrderBanner.tsx #  Floating banner for active order
    │   ├── LanguageSwitcher.tsx  #   Language selector component
    │   ├── LocationPicker.tsx    #   Leaflet map for admin location
    │   └── ui/                   #   Base UI primitives
    │       ├── button.tsx        #     CVA-based button variants
    │       ├── card.tsx          #     Card container
    │       ├── badge.tsx         #     Status badges
    │       └── input.tsx         #     Text input
    ├── lib/                      # Utility modules
    │   ├── supabase.ts           #   Supabase client + TypeScript interfaces
    │   ├── utils.ts              #   formatPrice(), formatTime(), cn()
    │   ├── ai-learning.ts        #   AI analytics engine (localStorage-based)
    │   ├── geolocation.ts        #   Browser geolocation utilities
    │   └── notification-sound.ts #   Web Audio API notification sounds
    └── i18n/
        └── request.ts            #   next-intl configuration
```

---

## 4. Architecture Overview

### Provider Hierarchy (Component Tree)

```
RootLayout (src/app/layout.tsx)
└── NextIntlClientProvider       ← i18n translations
    └── AuthProvider             ← Student auth (wraps EVERYTHING, including admin)
        └── AIProvider           ← AI insights
            └── MenuProvider     ← Menu items (global, no adminId filter)
                └── CartProvider ← Shopping cart
                    └── OrdersProvider ← Orders (global, no adminId filter)
                        └── {children}
                            ├── StudentLayout (/student routes)
                            │   ├── ThemeProvider (dark/light mode)
                            │   ├── Header
                            │   ├── {page content}
                            │   └── BottomNav
                            └── AdminLayout (/admin routes)
                                └── AdminProvider    ← Admin auth
                                    └── MenuProvider (adminId scoped)
                                        └── OrdersProvider (adminId scoped)
                                            └── {admin page content}
```

> **Key Insight:** `AuthProvider` wraps the entire app — including admin routes. It checks `window.location.pathname` to avoid interfering with admin sessions on `/admin/*` routes.

### Data Flow

```
Student adds item → CartProvider (localStorage)
     ↓
Student places order → OrdersProvider → Supabase `orders` table
     ↓
Supabase Realtime → Admin's OrdersProvider picks up new order
     ↓
Admin updates status → Supabase `orders` table
     ↓
Supabase Realtime → Student's OrdersProvider shows status change
```

---

## 5. Database Schema (Supabase)

### Tables

#### `admin_profiles`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated profile ID |
| `user_id` | UUID (FK → auth.users) | Supabase auth user reference |
| `name` | text | Admin's display name |
| `email` | text | Admin's email |
| `canteen_name` | text | Name of their canteen |
| `college_name` | text | College/university name |
| `area` | text | Campus area/wing |
| `phone` | text (nullable) | Contact number |
| `latitude` | float (nullable) | Canteen GPS latitude |
| `longitude` | float (nullable) | Canteen GPS longitude |
| `status` | text | `'pending'` / `'approved'` / `'rejected'` |
| `is_open` | boolean | Whether canteen is accepting orders |
| `razorpay_key_id` | text (nullable) | Razorpay API Key ID |
| `razorpay_key_secret` | text (nullable) | Razorpay API Key Secret |

#### `menu_items`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Menu item ID |
| `admin_id` | UUID (FK → admin_profiles) | Which admin/canteen owns this item |
| `name` | text | Item name |
| `category` | text | Category (e.g., "Burgers", "Beverages") |
| `price` | integer | Price in paise (₹1 = 100 paise) |
| `image_url` | text (nullable) | Item image URL |
| `eta_minutes` | integer | Estimated preparation time in minutes |
| `available` | boolean | Whether item is currently available |
| `created_at` | timestamptz | Creation timestamp |

#### `orders`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Order ID |
| `token_number` | text | Daily sequential token (e.g., "001", "002") |
| `user_id` | UUID (FK → auth.users) | Student who placed the order |
| `admin_id` | UUID (FK → admin_profiles) | Canteen processing the order |
| `items` | JSONB | Array of `{name, quantity, price}` |
| `total` | integer | Total amount in paise |
| `status` | text | `'pending'` → `'preparing'` → `'ready'` → `'completed'` |
| `payment_method` | text | `'cod'` or `'razorpay'` |
| `estimated_time` | integer | ETA in minutes |
| `created_at` | timestamptz | Order placement time |
| `completed_at` | timestamptz (nullable) | Order completion time |

### Database Functions

#### `create_order`
A PostgreSQL function that atomically:
1. Generates a daily sequential token number (resets every day)
2. Inserts the order record
3. Returns the created order with token

### Realtime Subscriptions

| Table | Events | Usage |
|-------|--------|-------|
| `orders` | INSERT, UPDATE | Live order status updates (student + admin) |
| `menu_items` | INSERT, UPDATE, DELETE | Live menu sync when admin adds/edits items |

---

## 6. Authentication System

### Dual-Portal Auth

The app has **two completely separate auth contexts** that share the same Supabase Auth backend:

| Context | Provider | Used By | Storage Key |
|---------|----------|---------|-------------|
| Student | `AuthProvider` | Student pages | `campus-grab-user` |
| Admin | `AdminProvider` | Admin pages | `campus-grab-admin` |

### User Metadata

Every Supabase Auth user has `user_metadata.account_type`:
- `'student'` — Created via student signup or auto-tagged Google OAuth
- `'admin'` — Created via admin signup (explicitly tagged)
- `undefined` — Google OAuth users before auto-tagging

### Auth Flow: Student

1. **Email Signup** → `supabase.auth.signUp()` with `account_type: 'student'`
2. **Email Login** → `supabase.auth.signInWithPassword()`
3. **Google OAuth** → `supabase.auth.signInWithOAuth()` → auto-tagged as `'student'` on first `onAuthStateChange`

### Auth Flow: Admin

1. **Email Signup** → `supabase.auth.signUp()` with `account_type: 'admin'`
2. **Email Login** → `supabase.auth.signInWithPassword()` → verifies `account_type === 'admin'`
3. **Onboarding** → After signup, admin fills in canteen details → creates `admin_profiles` row
4. **Approval** → Admin profile `status` must be `'approved'` to access dashboard

### Session Isolation

`AuthProvider` wraps the entire app (including `/admin` routes). To prevent it from killing admin sessions:
- It checks `window.location.pathname.startsWith('/admin')`
- On admin routes → silently ignores admin users
- On student routes → signs out admin users and shows alert

---

## 7. React Context Providers (State Management)

The app uses **React Context + Hooks** for all state management (no Redux/Zustand).

### `AuthProvider` (`src/components/AuthProvider.tsx`)
**Purpose:** Student authentication state

| Export | Type | Description |
|--------|------|-------------|
| `user` | `User \| null` | Current student user object |
| `isLoading` | boolean | Auth state loading |
| `isAuthenticated` | boolean | Whether student is logged in |
| `signUp()` | function | Email + password student signup |
| `login()` | function | Email + password student login |
| `signInWithGoogle()` | function | Google OAuth |
| `logout()` | function | Sign out |

### `AdminProvider` (`src/components/AdminProvider.tsx`)
**Purpose:** Admin authentication + profile state

| Export | Type | Description |
|--------|------|-------------|
| `admin` | `AdminProfile \| null` | Admin profile with canteen info |
| `isAuthenticated` | boolean | Approved admin logged in |
| `isPending` | boolean | Admin still awaiting approval |
| `needsOnboarding` | boolean | Admin needs to fill canteen details |
| `toggleOpen()` | function | Toggle canteen open/closed |
| `login()` | function | Admin email login |
| `signUp()` | function | Admin email signup |
| `submitOnboarding()` | function | Submit canteen onboarding form |

### `CartProvider` (`src/components/CartProvider.tsx`)
**Purpose:** Shopping cart (persisted in localStorage)

| Export | Type | Description |
|--------|------|-------------|
| `items` | `CartItem[]` | Cart items with quantities |
| `addToCart()` | function | Add item (increments if exists) |
| `removeFromCart()` | function | Remove item |
| `updateQuantity()` | function | Change item quantity |
| `clearCart()` | function | Empty entire cart |
| `cartTotal` | number | Sum of all item prices × quantities |
| `cartCount` | number | Total item count |
| `maxEta` | number | Longest ETA among cart items |

### `MenuProvider` (`src/components/MenuProvider.tsx`)
**Purpose:** Menu items with Supabase realtime sync

| Export | Type | Description |
|--------|------|-------------|
| `items` | `MenuItem[]` | All menu items |
| `isLoading` | boolean | Menu loading state |
| `addItem()` | function | Add new item (admin) |
| `deleteItem()` | function | Delete item (admin) |
| `toggleAvailability()` | function | Toggle available/unavailable |
| `updateItem()` | function | Update item fields |

> **Scoping:** When used in admin layout, receives `adminId` prop to filter items by canteen. In student layout, shows all items.

### `OrdersProvider` (`src/components/OrdersProvider.tsx`)
**Purpose:** Order management with real-time updates

| Export | Type | Description |
|--------|------|-------------|
| `orders` | `Order[]` | Active orders |
| `currentOrder` | `Order \| null` | Most recent non-completed order |
| `addOrder()` | function | Place a new order |
| `updateOrderStatus()` | function | Change order status (admin) |

> **Features:** Plays notification sound on new orders (admin side), real-time Supabase subscription.

### `AIProvider` (`src/components/AIProvider.tsx`)
**Purpose:** AI-powered item/canteen performance insights

| Export | Type | Description |
|--------|------|-------------|
| `fastestItems` | `ItemPerformance[]` | Top items by preparation speed |
| `bestCanteen` | `CanteenPerformance` | Best performing canteen |
| `dataConfidence` | `'low' \| 'medium' \| 'high'` | How much data we have |
| `trackNewOrder()` | function | Record new order for analytics |
| `markOrderComplete()` | function | Record completion time |

---

## 8. Student Portal (Frontend)

### Pages

#### `/canteens` — Canteen Discovery
- Lists all approved admin profiles as canteen cards
- Shows real **Open/Closed** status from `is_open` field
- **Geolocation sorting:** If user grants location, canteens sort by distance
- Search functionality filters by name/college
- Clicking a canteen → navigates to `/menu?canteen=<id>`

#### `/menu?canteen=<id>` — Menu Browser
- Hero banner with canteen name, rating, avg prep time
- **Fastest Items** horizontal scroll section
- Category filter pills (All, Burgers, Beverages, etc.)
- Search bar to filter items
- Items displayed as `MenuCard` grid (image + name + price + add button)
- **Closed canteen handling:** Shows "🔒 Canteen is Closed" banner, all items greyed out with lock icons, add-to-cart disabled

#### `/cart` — Cart & Checkout
- 3-step flow: Cart → Payment → Confirmation
- Cart: Item list with quantity controls (+/-), subtotal
- Payment: Razorpay (online) or COD (Cash on Delivery)
- Confirmation: Token number, estimated time, order summary

#### `/orders` — Active Orders
- Shows current/active orders with real-time status updates
- Status badges: Pending (amber) → Preparing (blue) → Ready (green) → Completed
- Token number prominently displayed

#### `/profile` — Student Profile
- User info (name, email)
- Order history (fetched from API)
- Logout button

### Student Navigation

| Component | Location | Content |
|-----------|----------|---------|
| `Header` | Top | Logo, canteen name, dark mode toggle, mobile hamburger |
| `BottomNav` | Bottom (mobile) | 4 tabs: Menu, Cart, Orders, Profile |
| `MobileNav` | Slide-out | Full navigation drawer on mobile |

---

## 9. Admin Portal (Frontend)

### Pages

#### `/admin` — Dashboard
- Welcome message
- **Open/Close Toggle Card:** Animated status indicator with glowing dot, power button to switch between open (green) and closed (red)
- Stats cards: Pending orders, Preparing, Ready
- Quick action cards: Orders, Menu, Analytics

#### `/admin/login` — Login / Signup
- Email + password login
- Email + password signup (creates `account_type: 'admin'` user)
- Google OAuth (redirects to admin portal)
- Forgot password link

#### `/admin/onboarding` — First-Time Setup
- Form: Name, canteen name, college name, area, phone
- Leaflet map for GPS coordinates
- Creates `admin_profiles` row with `status: 'pending'`

#### `/admin/menu` — Menu Management
- Add new items: Name, category, price, image URL, ETA
- Toggle item availability on/off
- Delete items
- Real-time sync — changes appear on student side instantly

#### `/admin/orders` — Order Management
- Real-time order feed with notification sounds
- Order cards show: token, items, total, time
- Status actions: Accept (Pending → Preparing) → Ready → Complete

#### `/admin/analytics` — Analytics Dashboard
- AI-powered insights from order data
- Item performance metrics
- Canteen performance metrics

#### `/admin/profile` — Admin Profile
- View/edit profile info
- Configure Razorpay API keys (Key ID + Secret)

---

## 10. API Routes (Backend)

All API routes are in `src/app/api/` and run server-side with the **Supabase Service Role Key** (full database access).

### `POST /api/razorpay/create-order`
Creates a Razorpay payment order.
- **Input:** `{ amount, currency, receipt }`
- **Output:** Razorpay order object with `id`
- Uses admin's `razorpay_key_id` and `razorpay_key_secret`

### `POST /api/razorpay/verify-payment`
Verifies Razorpay payment signature.
- **Input:** `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
- **Output:** `{ verified: true/false }`
- Uses HMAC-SHA256 to verify signature

### `POST /api/razorpay/webhook`
Handles Razorpay webhook events (payment.captured, payment.failed).
- Verifies webhook signature using `RAZORPAY_WEBHOOK_SECRET`
- Updates order status in database

### `GET /api/orders/history`
Fetches order history for the current authenticated user.
- Uses Supabase auth header to identify user
- Returns orders sorted by creation date (newest first)

### `GET /api/orders/vendor`
Fetches orders for a specific admin/canteen.
- Filtered by `admin_id`
- Used by admin dashboard

### `POST /api/seed-menu`
Seeds demo menu items for testing.
- Creates sample items across categories
- Development/testing utility

### `POST /api/load-test`
Load testing endpoint for performance testing.

---

## 11. AI / Analytics Module

Located in `src/lib/ai-learning.ts`. This is a **client-side analytics engine** that stores data in `localStorage`.

### How It Works

1. When a student places an order, `trackOrder()` records the order with timestamp, items, estimated times
2. When an order is completed, `completeOrder()` calculates actual preparation time
3. `calculateItemPerformance()` aggregates data to find fastest items
4. `calculateCanteenPerformance()` ranks canteens by speed and reliability

### Key Metrics

| Metric | Description |
|--------|-------------|
| `speedRating` | 0-100 score, higher = faster actual prep vs estimated |
| `reliabilityScore` | 0-100, how close actual time matches estimated time |
| `dataConfidence` | `low` (<5 orders), `medium` (5-20), `high` (20+) |

### Storage
- Key: `campus-grab-ai-data`
- Data stored as JSON array of `OrderAnalytics` objects
- Keeps up to 500 most recent records

---

## 12. Internationalization (i18n)

Using `next-intl` with three languages:

| File | Language | Code |
|------|----------|------|
| `messages/en.json` | English | `en` |
| `messages/hi.json` | Hindi | `hi` |
| `messages/mr.json` | Marathi | `mr` |

### Usage in Components
```tsx
import { useTranslations } from 'next-intl'

function MyComponent() {
    const t = useTranslations('PageName')
    return <h1>{t('title')}</h1>
}
```

### Translation Namespaces
| Namespace | Pages |
|-----------|-------|
| `Common` | Shared strings (loading, signOut, etc.) |
| `Menu` | Menu page |
| `Cart` | Cart + checkout |
| `Orders` | Order tracking |
| `Profile` | Student profile |
| `Admin` | Admin dashboard |
| `Auth` | Login/signup |

---

## 13. Styling System

### CSS Architecture

The app uses **Tailwind CSS v4** with a custom design token system defined in `globals.css`.

### CSS Variables (Design Tokens)

| Variable | Light Mode | Dark Mode | Usage |
|----------|-----------|-----------|-------|
| `--background` | `#fafafa` | `#121212` | Page background |
| `--foreground` | `#0f172a` | `#f5f5f5` | Primary text |
| `--card` | `#ffffff` | `#1E1E1E` | Card backgrounds |
| `--card-foreground` | `#0f172a` | `#f5f5f5` | Card text |
| `--card-elevated` | `#f8f8f8` | `#252525` | Elevated surfaces |
| `--border` | `#e5e5e5` | `#2a2a2a` | Borders |
| `--muted` | `#f5f5f5` | `#1a1a1a` | Muted backgrounds |
| `--muted-foreground` | `#525252` | `#a3a3a3` | Secondary text |
| `--primary` | `#DC2626` | `#EF4444` | Brand red |
| `--primary-foreground` | `#ffffff` | `#ffffff` | Text on primary |
| `--success` | `#22C55E` | `#22C55E` | Success green |
| `--warning` | `#F59E0B` | `#FBBF24` | Warning amber |

### Dark Mode

- Managed by `ThemeProvider` (student layout only)
- Admin portal is **always dark** (hardcoded `bg-slate-900`)
- Dark mode via class `.dark` on `<html>` element
- Global overrides in `globals.css` ensure consistency

### Animations

Pre-built animation classes in `globals.css`:
- `animate-fade-in-up` — Elements slide up and fade in
- `animate-fade-in` — Simple fade
- `animate-slide-in-bottom` — Slide from bottom
- `animate-scale-in` — Scale up
- `animate-bounce-in` — Bouncy entrance
- `animate-pulse-glow` — Pulsing glow
- `delay-1` through `delay-8` — Staggered animation delays

### Mobile-First

- All pages are designed mobile-first
- `min-height: 44px` enforced for all touch targets on mobile
- iOS safe area support (`safe-area-inset-bottom`)
- PWA standalone mode overrides (`display-mode: standalone`)

---

## 14. Payment Integration (Razorpay)

### Flow

```
1. Student clicks "Pay Online" in cart
2. Frontend calls POST /api/razorpay/create-order with amount
3. API creates Razorpay order using admin's API keys
4. Frontend opens Razorpay checkout modal
5. Student completes payment
6. Razorpay returns payment details to frontend
7. Frontend calls POST /api/razorpay/verify-payment
8. API verifies HMAC signature
9. If valid → order is marked as paid
```

### Admin-Specific Keys

Each admin stores their own `razorpay_key_id` and `razorpay_key_secret` in their profile. This allows each canteen to receive payments directly to their Razorpay account.

### COD (Cash on Delivery)

Students can alternately choose COD — no payment processing, order goes directly to "pending" status.

---

## 15. Real-Time Features

### Supabase Realtime Channels

| Channel | Table | Events | Where it's subscribed |
|---------|-------|--------|----------------------|
| `orders-realtime` | `orders` | INSERT, UPDATE | `OrdersProvider` |
| `menu-realtime` | `menu_items` | INSERT, UPDATE, DELETE | `MenuProvider` |

### How It Works

1. Supabase Realtime uses WebSockets under the hood
2. When an admin updates an order status, the `orders` table changes
3. Supabase pushes the change to all clients subscribed to the channel
4. Student's `OrdersProvider` receives the event and updates state
5. UI re-renders immediately (no polling needed)

### Notification Sounds

When admin receives a new order (`INSERT` event on `orders`), the `notification-sound.ts` module plays an alert sound using the **Web Audio API** (no audio files needed — generates a notification tone programmatically).

---

## 16. Environment Variables

Create `.env.local` in the project root with:

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role (for API routes)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay (for payment webhooks)
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

> **Note:** `NEXT_PUBLIC_` prefixed variables are exposed to the browser. Non-prefixed ones are server-only.

---

## 17. Development Setup

### Prerequisites
- **Node.js** 18+ (recommend 20+)
- **npm** 9+
- **Supabase project** (free tier works)

### Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/aryazad-28/Campus-Grab.git
cd Campus-Grab

# 2. Install dependencies
npm install

# 3. Create .env.local (see section 16)

# 4. Start development server
npm run dev
# → Opens at http://localhost:3000

# 5. Build for production
npm run build

# 6. Start production server
npm start
```

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run migration SQL files from `migrations/` folder in Supabase SQL editor
3. Enable Realtime on `orders` and `menu_items` tables
4. Enable Google OAuth in Supabase Auth → Providers → Google
5. Add `is_open` column to `admin_profiles`:
   ```sql
   ALTER TABLE admin_profiles ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true;
   ```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 18. Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy — Vercel auto-detects Next.js

### Important Vercel Settings
- Framework Preset: **Next.js**
- Root Directory: `.` (project root)
- Build Command: `npm run build`
- Output Directory: `.next`

---

## 19. Known Gotchas & Pitfalls

### 1. AuthProvider Wraps Admin Routes
`AuthProvider` sits in the root layout and wraps everything, including `/admin`. It has path-aware checks to avoid interfering with admin sessions. **Do NOT remove these checks** or admin login/signup will break.

### 2. Shared Supabase Session
Both student and admin portals use the same Supabase Auth. There's only ONE session per browser. If a student and admin try to be logged in simultaneously in the same browser, the last one to authenticate wins.

### 3. Price Format
All prices are stored as **integers in paise** (₹1 = 100 paise). The `formatPrice()` utility divides by 100 and formats as `₹XX.XX`.

### 4. Admin-Scoped Providers
In the admin layout, `MenuProvider` and `OrdersProvider` receive `adminId` as a prop. This scopes their data to only that admin's canteen. In the student layout, they have no `adminId` and show ALL data globally.

### 5. Token Number Generation
Token numbers are generated by a PostgreSQL function (`create_order`) that resets daily. This prevents race conditions when multiple orders come in simultaneously.

### 6. CSS Variable `--muted-foreground`
Changed from `#737373` to `#525252` in light mode for better contrast. If adding new secondary text, use `text-[var(--muted-foreground)]` for consistency.

### 7. Dark Mode Overrides
`globals.css` has `!important` overrides that force dark mode colors on elements using `text-neutral-500`, `bg-neutral-100`, etc. If you use these Tailwind classes, be aware they get overridden in dark mode.

### 8. Google OAuth
Google OAuth users are auto-tagged as `'student'` on first login. There is currently no way for admins to use Google OAuth — they must use email/password signup.

### 9. `.bak` Files
There are backup files like `admin.bak/` and `LocationPicker.tsx.bak`. These are legacy/backup copies and can be cleaned up.

---

*This document covers the complete Campus Grab codebase. For questions about specific implementations, refer to the source files — the code is well-commented.*
