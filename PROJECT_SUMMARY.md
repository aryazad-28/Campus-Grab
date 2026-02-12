# Campus Grab - Project Summary

## 📱 What is Campus Grab?

A **Progressive Web App (PWA)** for students to order food from campus canteens quickly and easily. Students can install it on their phones like a native app.

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js | 16.1.1 |
| **Language** | TypeScript | 5.x |
| **UI Library** | React | 19.2.3 |
| **Styling** | Tailwind CSS | 4.x |
| **Database & Auth** | Supabase | 2.89.0 |
| **UI Components** | Radix UI | 1.x |
| **Icons** | Lucide React | 0.562.0 |
| **Utilities** | clsx, tailwind-merge | - |

---

## ✨ Features

### Student App
- 🍔 **Menu Browsing** - View available items with images, prices, and prep time
- 🛒 **Cart System** - Add/remove items, quantity adjustment
- 💳 **Checkout** - Order placement with online payment
- 📋 **Order Tracking** - Real-time order status (Pending → Preparing → Ready)
- 🎫 **Daily Token Numbers** - Simple order IDs (#0001, #0002) that reset daily
- 🤖 **AI Recommendations** - Fastest items based on historical data
- 🌙 **Dark/Light Mode** - Theme toggle for user preference
- 📱 **Mobile-First PWA** - Installable on phone home screen

### Admin Dashboard
- 📊 **Analytics** - Total orders, revenue, avg prep time, popular items
- 📝 **Order Management** - Accept, prepare, and complete orders
- 🍕 **Menu Management** - Add/edit/remove menu items
- 🔄 **Real-time Sync** - Changes reflect instantly for students

---

## 📂 Project Structure

```
src/
├── app/
│   ├── (student)/          # Student-facing pages
│   │   ├── menu/           # Food menu
│   │   ├── cart/           # Cart & checkout
│   │   ├── orders/         # Order history
│   │   └── profile/        # User profile
│   ├── admin/              # Admin dashboard
│   │   ├── orders/         # Order management
│   │   ├── menu/           # Menu management
│   │   └── analytics/      # Business analytics
│   └── login/              # Authentication
├── components/             # Reusable components
│   ├── ui/                 # UI primitives (Button, Card, etc.)
│   ├── Header.tsx          # Top navigation
│   ├── MobileNav.tsx       # Bottom mobile navigation
│   ├── MenuCard.tsx        # Food item cards
│   └── *Provider.tsx       # Context providers
└── lib/                    # Utilities & Supabase client
```

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 📲 PWA Installation

1. Open the app in Chrome/Safari on your phone
2. Tap browser menu → "Add to Home Screen"
3. App icon appears on home screen
4. Opens in full-screen mode like a native app!

---

## 🔜 Coming Soon

- [ ] UPI Payment Integration (PhonePe Gateway)
- [ ] Push Notifications for order updates
- [ ] Multiple canteen support
- [ ] Favorites & reorder functionality





