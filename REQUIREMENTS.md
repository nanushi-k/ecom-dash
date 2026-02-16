# ecom-dash — E-commerce Analytics Dashboard

## Project Overview

A real-time analytics dashboard for e-commerce businesses. Aggregates sales data, tracks key metrics (revenue, orders, conversion rates, top products), and provides visual reporting with interactive charts, date range filters, and order/product management.

**Live URL:** TBD (Vercel)
**Repository:** TBD (GitHub)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 |
| Charts | Chart.js + react-chartjs-2 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Realtime | Supabase Realtime subscriptions |
| Hosting | Vercel |
| Source Control | GitHub |

---

## Functional Requirements

### FR-1: Authentication

| ID | Requirement | Priority |
|----|------------|----------|
| FR-1.1 | Users can sign up with email and password | Must |
| FR-1.2 | Users can sign in with email and password | Must |
| FR-1.3 | Users can sign out | Must |
| FR-1.4 | All dashboard routes are protected (redirect to /login if unauthenticated) | Must |
| FR-1.5 | A user profile is automatically created on sign-up | Must |

### FR-2: Dashboard (Main Page)

| ID | Requirement | Priority |
|----|------------|----------|
| FR-2.1 | Display KPI cards: Total Revenue, Total Orders, Avg Order Value, Conversion Rate | Must |
| FR-2.2 | Revenue over time line chart (daily/weekly/monthly toggle) | Must |
| FR-2.3 | Orders over time bar chart | Must |
| FR-2.4 | Top 5 products table (by revenue) | Must |
| FR-2.5 | Recent orders table (latest 10) with status badges | Must |
| FR-2.6 | Sales by category donut chart | Must |
| FR-2.7 | All widgets update based on selected date range | Must |

### FR-3: Date Range Filter

| ID | Requirement | Priority |
|----|------------|----------|
| FR-3.1 | Quick presets: Today, Last 7 days, Last 30 days, Last 90 days | Must |
| FR-3.2 | Custom date range picker (start + end date) | Should |
| FR-3.3 | Selected range persists during session | Must |

### FR-4: Orders Management

| ID | Requirement | Priority |
|----|------------|----------|
| FR-4.1 | Orders list page with columns: order #, customer, total, status, date | Must |
| FR-4.2 | Search orders by order number or customer name | Must |
| FR-4.3 | Filter orders by status (pending, processing, shipped, delivered, cancelled) | Must |
| FR-4.4 | Pagination (20 orders per page) | Must |
| FR-4.5 | Order detail page showing: items, customer info, status, totals | Must |

### FR-5: Products

| ID | Requirement | Priority |
|----|------------|----------|
| FR-5.1 | Products list page with columns: name, category, price, stock, revenue | Must |
| FR-5.2 | Search products by name | Must |
| FR-5.3 | Product detail page with sales chart over time | Must |

### FR-6: Settings

| ID | Requirement | Priority |
|----|------------|----------|
| FR-6.1 | Edit profile (full name) | Must |
| FR-6.2 | Dark mode / light mode toggle | Must |
| FR-6.3 | Theme preference persisted in localStorage | Must |

### FR-7: Landing Page

| ID | Requirement | Priority |
|----|------------|----------|
| FR-7.1 | Public landing page with product overview | Must |
| FR-7.2 | CTA buttons to sign up / sign in | Must |

---

## Non-Functional Requirements

| ID | Requirement | Category |
|----|------------|----------|
| NFR-1 | Dashboard page loads in < 2 seconds | Performance |
| NFR-2 | Charts render smoothly with up to 10,000 data points | Performance |
| NFR-3 | Fully responsive: mobile, tablet, desktop | Usability |
| NFR-4 | Supabase Row Level Security on all tables (users see only their data) | Security |
| NFR-5 | TypeScript strict mode with no `any` types | Code Quality |
| NFR-6 | ESLint configured and passing | Code Quality |
| NFR-7 | Clean component architecture (components/, lib/, hooks/ separation) | Code Quality |
| NFR-8 | Seed script to populate realistic demo data (500+ orders, 50+ products) | Developer Experience |
| NFR-9 | Auto-deploy on push to main branch via Vercel | Deployment |
| NFR-10 | Environment variables documented in .env.example | Developer Experience |

---

## Database Schema

### profiles
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | FK auth.users, unique, not null |
| full_name | text | |
| avatar_url | text | |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### products
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | FK auth.users, not null |
| name | text | not null |
| description | text | |
| price | numeric(10,2) | not null |
| category | text | not null |
| stock | integer | default 0 |
| image_url | text | |
| created_at | timestamptz | default now() |

### customers
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | FK auth.users, not null |
| name | text | not null |
| email | text | not null |
| address | text | |
| created_at | timestamptz | default now() |

### orders
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | FK auth.users, not null |
| customer_id | uuid | FK customers.id, not null |
| order_number | text | unique, not null |
| status | text | not null, check in (pending, processing, shipped, delivered, cancelled) |
| total | numeric(10,2) | not null |
| created_at | timestamptz | default now() |

### order_items
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| order_id | uuid | FK orders.id (cascade delete), not null |
| product_id | uuid | FK products.id, not null |
| quantity | integer | not null |
| unit_price | numeric(10,2) | not null |

---

## Row Level Security (RLS) Policies

All tables enforce RLS with the same pattern:
- **SELECT:** `auth.uid() = user_id`
- **INSERT:** `auth.uid() = user_id`
- **UPDATE:** `auth.uid() = user_id`
- **DELETE:** `auth.uid() = user_id`

`order_items` uses a join to verify the parent order's `user_id`.

---

## Pages & Routes

| Route | Auth | Description |
|-------|------|------------|
| `/` | Public | Landing page |
| `/login` | Public | Sign in |
| `/signup` | Public | Sign up |
| `/dashboard` | Protected | Main analytics dashboard |
| `/dashboard/orders` | Protected | Orders list |
| `/dashboard/orders/[id]` | Protected | Order detail |
| `/dashboard/products` | Protected | Products list |
| `/dashboard/products/[id]` | Protected | Product detail + sales chart |
| `/dashboard/settings` | Protected | User settings + dark mode |

---

## Project Structure

```
ecom-dash/
├── src/
│   ├── app/
│   │   ├── (public)/          # Landing, login, signup
│   │   │   ├── page.tsx       # Landing
│   │   │   ├── login/
│   │   │   └── signup/
│   │   └── dashboard/         # Protected routes
│   │       ├── layout.tsx     # Sidebar + header layout
│   │       ├── page.tsx       # Main dashboard
│   │       ├── orders/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       ├── products/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       └── settings/
│   ├── components/
│   │   ├── charts/            # Chart components
│   │   ├── dashboard/         # Dashboard widgets
│   │   ├── layout/            # Sidebar, Header, ThemeToggle
│   │   └── ui/                # Reusable UI (buttons, badges, cards)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   ├── supabase/          # Client, server, middleware helpers
│   │   └── utils.ts           # Utility functions
│   └── types/                 # TypeScript type definitions
├── supabase/
│   ├── migrations/            # SQL migration files
│   └── seed.ts                # Seed script
├── public/
├── .env.example
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Seed Data Specification

The seed script generates:
- **10 product categories:** Electronics, Clothing, Home & Garden, Sports, Books, Beauty, Food & Drink, Toys, Automotive, Pet Supplies
- **50 products** across categories with realistic names and prices ($5–$500)
- **100 customers** with generated names and emails
- **500 orders** spread across the last 12 months with realistic status distribution:
  - 10% pending, 15% processing, 20% shipped, 50% delivered, 5% cancelled
- **1,500 order items** (avg 3 items per order)
- Order totals computed from item quantities × unit prices

---

## Dark Mode Implementation

- Tailwind `darkMode: 'class'` strategy
- Theme state stored in localStorage key `ecom-dash-theme`
- Toggle component in settings page and sidebar
- `<html>` element class toggled between `dark` and default
- All components use Tailwind dark: variants

---

## Milestones

1. **M1: Foundation** — Project scaffold, Supabase setup, auth flow
2. **M2: Dashboard** — Main dashboard with all charts and KPIs
3. **M3: Orders** — Orders list and detail pages
4. **M4: Products** — Products list and detail pages
5. **M5: Polish** — Settings, dark mode, responsive refinements, seed data
6. **M6: Deploy** — Vercel deployment, GitHub repo, README
