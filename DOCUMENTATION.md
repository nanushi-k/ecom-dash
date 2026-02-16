# ecom-dash — E-commerce Analytics Dashboard

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Requirements](#2-requirements)
3. [Tech Stack & Why Each Tool Was Chosen](#3-tech-stack--why-each-tool-was-chosen)
4. [Project Structure](#4-project-structure)
5. [Database Design](#5-database-design)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Application Architecture](#7-application-architecture)
8. [Component Breakdown](#8-component-breakdown)
9. [Data Flow & State Management](#9-data-flow--state-management)
10. [Chart.js Integration](#10-chartjs-integration)
11. [Dark Mode Implementation](#11-dark-mode-implementation)
12. [Styling with Tailwind CSS 4](#12-styling-with-tailwind-css-4)
13. [Supabase Configuration](#13-supabase-configuration)
14. [Deployment to Vercel](#14-deployment-to-vercel)
15. [Seeding Demo Data](#15-seeding-demo-data)
16. [Key Engineering Decisions](#16-key-engineering-decisions)

---

## 1. Project Overview

ecom-dash is a full-stack e-commerce analytics dashboard that gives store owners real-time visibility into their sales, orders, products, and customer data. It features interactive charts, date-range filtering, order management, product analytics, and a dark/light theme — all secured behind user authentication with row-level data isolation.

**Live URL:** https://ecom-dash-gamma.vercel.app
**Source Code:** https://github.com/nanushi-k/ecom-dash

### What It Demonstrates

- Building a production-grade full-stack application with Next.js App Router
- Implementing authentication and per-user data isolation using Supabase and Row Level Security (RLS)
- Rendering interactive data visualizations with Chart.js
- Writing type-safe code with TypeScript in strict mode (zero `any` types)
- Deploying to Vercel with GitHub-based continuous deployment
- Managing database migrations and seed data with Supabase CLI
- Implementing dark mode with Tailwind CSS 4's class-based strategy

---

## 2. Requirements

### Functional Requirements

| ID   | Feature                | Description                                                                                       |
|------|------------------------|---------------------------------------------------------------------------------------------------|
| FR-1 | Authentication         | Email/password signup and login. Auto-create user profile on signup. Session-based auth via cookies. |
| FR-2 | Dashboard Overview     | 4 KPI cards (Revenue, Orders, Avg Order Value, Delivery Rate), 3 interactive charts, top products table, recent orders table. |
| FR-3 | Date Range Filtering   | Filter all dashboard data by Today, 7 days, 30 days, or 90 days.                                  |
| FR-4 | Order Management       | List all orders with search (by order number), filter by status, paginate (20/page), view order detail with line items. |
| FR-5 | Product Analytics      | List all products with search, view individual product detail with sales-over-time chart.           |
| FR-6 | Settings               | Edit profile name, toggle dark/light theme.                                                        |
| FR-7 | Landing Page           | Public marketing page with feature highlights, tech stack, and call-to-action buttons.             |
| FR-8 | Route Protection       | Unauthenticated users cannot access `/dashboard/*`. Authenticated users are redirected away from `/login` and `/signup`. |

### Non-Functional Requirements

| ID    | Category      | Requirement                                                                 |
|-------|---------------|-----------------------------------------------------------------------------|
| NFR-1 | Performance   | Pages load in under 2 seconds. Dashboard handles 10,000+ data points.       |
| NFR-2 | Responsive    | Fully usable on mobile, tablet, and desktop. Sidebar collapses to hamburger. |
| NFR-3 | Security      | Row Level Security on every table. No user can see another user's data.      |
| NFR-4 | Type Safety   | TypeScript strict mode. No `any` types. All database entities have interfaces.|
| NFR-5 | Accessibility | Semantic HTML, keyboard navigation, sufficient color contrast.               |
| NFR-6 | Data Realism  | Seed script generates 60 products, 100 customers, 500 orders with realistic distributions. |

---

## 3. Tech Stack & Why Each Tool Was Chosen

### Next.js 15 (App Router) — Framework

Next.js provides the full-stack React framework. The App Router (introduced in Next.js 13, matured in 15) enables:

- **File-based routing:** Each folder under `src/app/` automatically becomes a route. No manual route configuration needed.
- **Layouts:** Shared UI (like the dashboard sidebar) is defined once in `layout.tsx` and wraps all child routes without re-rendering.
- **Server Components by default:** Pages and layouts are Server Components unless marked `"use client"`. This means data can be fetched on the server before sending HTML to the browser.
- **Middleware:** The `middleware.ts` file intercepts every matched request, enabling auth checks before the page even starts rendering.
- **API Routes:** The `route.ts` files handle server-side logic (like the OAuth callback at `/auth/callback`).

**Why not plain React?** A plain React SPA would require separate routing (React Router), manual code splitting, no SSR, and a separate backend server. Next.js combines all of this into one framework.

### React 19 — UI Library

React renders the component tree. This project uses React 19 which includes:

- **Server Components:** Components that run on the server and send HTML (not JavaScript) to the client. Used for layouts and static content.
- **Client Components:** Components marked with `"use client"` that run in the browser. Used for interactive elements like charts, forms, and state-driven UI.
- **Hooks:** `useState`, `useEffect`, `useCallback` for state and side effects. Custom hooks (`useTheme`, `useDashboardData`) encapsulate reusable logic.

### TypeScript 5 (Strict Mode) — Language

TypeScript adds static type checking to JavaScript. Every database entity, API response, and component prop has an explicit type definition in `src/types/database.ts`. Strict mode (`"strict": true` in `tsconfig.json`) enforces:

- No implicit `any` — every variable must have a known type
- Strict null checks — you must handle `null` and `undefined` explicitly
- Strict function types — callback signatures must match exactly

This catches bugs at compile time rather than at runtime. For example, the Chart.js integration required typed options objects (`ChartOptions<"line">`, `ChartOptions<"bar">`, `ChartOptions<"doughnut">`) to ensure tooltip callbacks and axis configurations were valid.

### Supabase — Backend (Database + Auth)

Supabase is an open-source Firebase alternative built on PostgreSQL. It provides:

- **PostgreSQL Database:** A full relational database with SQL, joins, indexes, and constraints. The schema has 5 tables with foreign keys, check constraints, and indexes.
- **Authentication:** Email/password auth with session management. Users sign up, Supabase creates a record in `auth.users`, and a database trigger automatically creates a profile row.
- **Row Level Security (RLS):** PostgreSQL policies that run on every query. Each table has policies like `auth.uid() = user_id` ensuring users can only see and modify their own data. This security runs at the database level — even if the application code had a bug, the database would still block unauthorized access.
- **Supabase SSR (`@supabase/ssr`):** A library for using Supabase in server-rendered applications. It manages auth tokens in HTTP-only cookies (not localStorage), which is more secure and works with Server Components.

**Why not Firebase?** Supabase uses standard PostgreSQL, which means real SQL queries, joins, foreign keys, and a relational schema. Firebase's Firestore is a NoSQL document database that would require denormalized data and doesn't support joins or relational integrity.

### Chart.js + react-chartjs-2 — Data Visualization

Chart.js is a canvas-based charting library. `react-chartjs-2` is a React wrapper that renders Chart.js charts as React components.

This project uses three chart types:
- **Line chart** (Revenue Over Time) — shows trends with a gradient fill
- **Bar chart** (Orders Over Time) — shows daily order counts
- **Doughnut chart** (Sales by Category) — shows category distribution as a ring

Chart.js was chosen over alternatives like Recharts or D3 because:
- Lightweight (~60KB gzipped for used modules)
- Tree-shakeable — only register the chart types and elements you use
- Canvas-based rendering handles large datasets efficiently
- Highly customizable tooltips, colors, and scales

### Tailwind CSS 4 — Styling

Tailwind CSS is a utility-first CSS framework. Instead of writing custom CSS classes, you compose styles directly in the HTML using utility classes like `bg-gray-900`, `text-sm`, `rounded-lg`, `p-4`.

Tailwind CSS 4 (the version used here) has significant differences from v3:
- **No `tailwind.config.ts`** — configuration is done in CSS using `@theme inline { }` blocks
- **New `@custom-variant` directive** — used here for class-based dark mode: `@custom-variant dark (&:where(.dark, .dark *))`
- **CSS-native imports** — `@import "tailwindcss"` replaces the old `@tailwind` directives

**Why not CSS Modules or styled-components?** Tailwind eliminates context-switching between CSS and JSX files. Every style is visible directly in the component markup, making it faster to build and easier to maintain.

### Vercel — Hosting & Deployment

Vercel is the company behind Next.js and provides optimized hosting for Next.js applications:
- **Zero-config deployment:** Connect a GitHub repo and Vercel auto-detects Next.js, runs `next build`, and deploys.
- **Continuous deployment:** Every push to `main` triggers an automatic build and deploy.
- **Edge network:** Static assets and pages are served from CDN nodes closest to the user.
- **Serverless functions:** API routes and Server Components run as serverless functions that scale automatically.

---

## 4. Project Structure

```
ecom-dash/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (fonts, dark mode script, global styles)
│   │   ├── page.tsx                  # Public landing page
│   │   ├── globals.css               # Tailwind CSS 4 config + custom theme
│   │   ├── (auth)/                   # Auth route group (no layout nesting)
│   │   │   ├── login/page.tsx        # Login form
│   │   │   └── signup/page.tsx       # Signup form
│   │   ├── auth/
│   │   │   └── callback/route.ts     # Supabase OAuth callback handler
│   │   └── dashboard/                # Protected dashboard routes
│   │       ├── layout.tsx            # Dashboard layout (sidebar + content area)
│   │       ├── page.tsx              # Main dashboard (KPIs, charts, tables)
│   │       ├── orders/
│   │       │   ├── page.tsx          # Orders list with search, filter, pagination
│   │       │   └── [id]/page.tsx     # Order detail with line items
│   │       ├── products/
│   │       │   ├── page.tsx          # Products list with search
│   │       │   └── [id]/page.tsx     # Product detail with sales chart
│   │       └── settings/page.tsx     # Profile editor + theme toggle
│   │
│   ├── components/
│   │   ├── charts/
│   │   │   ├── RevenueChart.tsx      # Line chart — revenue over time
│   │   │   ├── OrdersChart.tsx       # Bar chart — orders over time
│   │   │   └── CategoryChart.tsx     # Doughnut chart — sales by category
│   │   ├── dashboard/
│   │   │   └── KpiCard.tsx           # Stat card with icon, value, optional trend
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Desktop sidebar (navigation, theme toggle, sign out)
│   │   │   └── MobileSidebar.tsx     # Mobile hamburger menu with slide-out overlay
│   │   └── ui/
│   │       ├── Card.tsx              # Card, CardHeader, CardContent components
│   │       ├── Badge.tsx             # StatusBadge with color-coded status dots
│   │       └── DateRangePicker.tsx   # Today / 7d / 30d / 90d selector
│   │
│   ├── hooks/
│   │   ├── use-theme.ts             # Dark mode state with localStorage persistence
│   │   └── use-dashboard-data.ts    # Dashboard data fetching and aggregation
│   │
│   ├── lib/
│   │   ├── utils.ts                 # Formatting, date ranges, classNames, status colors
│   │   └── supabase/
│   │       ├── client.ts            # Browser Supabase client
│   │       ├── server.ts            # Server Supabase client (cookie-based)
│   │       └── middleware.ts        # Auth middleware (session refresh + route protection)
│   │
│   ├── types/
│   │   └── database.ts             # All TypeScript interfaces for database entities
│   │
│   └── middleware.ts               # Next.js middleware entry point (route matcher)
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Tables, RLS policies, indexes, triggers
│   └── seed.sql                    # Reusable seed function for demo data
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── .env.example
```

### Why This Structure?

- **`src/app/`** uses Next.js App Router conventions. Each folder = a route segment. `page.tsx` = the page component. `layout.tsx` = shared wrapper. `route.ts` = API endpoint.
- **`(auth)`** is a route group (parentheses). It groups login/signup pages without adding `/auth/` to the URL. So `/login` works, not `/auth/login`.
- **`[id]`** is a dynamic route segment. `/dashboard/orders/abc123` renders `orders/[id]/page.tsx` with `params.id = "abc123"`.
- **`components/`** is organized by domain (charts, dashboard, layout, ui) rather than by type, making it easy to find related components.
- **`hooks/`** contains custom React hooks that encapsulate reusable stateful logic.
- **`lib/`** contains pure utility functions and Supabase client setup — no React dependencies.
- **`types/`** centralizes all TypeScript interfaces so they can be imported from a single location.

---

## 5. Database Design

### Entity Relationship

```
auth.users (Supabase-managed)
    │
    ├── 1:1 ──── profiles (auto-created via trigger)
    │
    ├── 1:many ── products
    │                 │
    ├── 1:many ── customers
    │                 │
    └── 1:many ── orders ──── many:1 ── customers
                      │
                      └── 1:many ── order_items ── many:1 ── products
```

### Tables

#### `profiles`
Created automatically when a user signs up, via a PostgreSQL trigger on `auth.users`.

```sql
create table public.profiles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null unique,
  full_name  text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```

The trigger function:

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

**Why a trigger?** The profile must exist immediately after signup. If we relied on application code to create it, a race condition or error could leave the user without a profile. The trigger runs inside the same database transaction as the user creation, guaranteeing atomicity.

#### `products`
```sql
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  description text,
  price       numeric(10,2) not null,
  category    text not null,
  stock       integer default 0 not null,
  image_url   text,
  created_at  timestamptz default now() not null
);
```

#### `customers`
```sql
create table public.customers (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  email      text not null,
  address    text,
  created_at timestamptz default now() not null
);
```

#### `orders`
```sql
create table public.orders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  customer_id  uuid references public.customers(id) not null,
  order_number text unique not null,
  status       text not null check (status in ('pending','processing','shipped','delivered','cancelled')),
  total        numeric(10,2) not null,
  created_at   timestamptz default now() not null
);
```

The `check` constraint on `status` ensures only valid values can be stored — the database enforces this, not just the application.

#### `order_items`
```sql
create table public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity   integer not null,
  unit_price numeric(10,2) not null
);
```

`on delete cascade` on `order_id` means deleting an order automatically deletes its line items. This prevents orphaned records.

### Row Level Security (RLS)

Every table has RLS enabled and policies that restrict access to the authenticated user's own data:

```sql
alter table public.products enable row level security;

create policy "Users can view own products"
  on public.products for select
  using (auth.uid() = user_id);

create policy "Users can insert own products"
  on public.products for insert
  with check (auth.uid() = user_id);
```

`auth.uid()` is a Supabase function that returns the UUID of the currently authenticated user from the JWT token. This means:
- User A queries `select * from products` — PostgreSQL automatically appends `WHERE user_id = '<User A's UUID>'`
- User A tries to read User B's product — the policy blocks it, returning zero rows
- Even raw SQL access through the Supabase API respects these policies

The `order_items` table uses a slightly different pattern since it doesn't have a direct `user_id` column. Instead, it checks ownership through the parent order:

```sql
create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );
```

### Indexes

```sql
create index idx_products_user_id   on public.products(user_id);
create index idx_products_category  on public.products(category);
create index idx_orders_user_id     on public.orders(user_id);
create index idx_orders_status      on public.orders(status);
create index idx_orders_created_at  on public.orders(created_at);
create index idx_orders_customer_id on public.orders(customer_id);
create index idx_order_items_order_id   on public.order_items(order_id);
create index idx_order_items_product_id on public.order_items(product_id);
```

Indexes speed up queries that filter or join on these columns. Without `idx_orders_created_at`, the date-range filter on the dashboard would require a full table scan.

---

## 6. Authentication & Authorization

### How Auth Works

Supabase Auth manages user accounts, password hashing, session tokens, and cookie management. The application never handles raw passwords.

#### Signup Flow

1. User fills out the signup form at `/signup` (name, email, password)
2. Client calls `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`
3. Supabase creates a row in `auth.users` with a hashed password
4. The `on_auth_user_created` trigger fires, creating a row in `profiles` with the user's name
5. Supabase returns a session token, which `@supabase/ssr` stores as an HTTP-only cookie
6. The app redirects to `/dashboard`

#### Login Flow

1. User fills out the login form at `/login` (email, password)
2. Client calls `supabase.auth.signInWithPassword({ email, password })`
3. Supabase verifies credentials, returns a session token stored as a cookie
4. The app redirects to `/dashboard`

#### Session Management (Middleware)

Every request to a matched route passes through `src/middleware.ts`, which calls `updateSession()`:

```typescript
// src/lib/supabase/middleware.ts
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

This does three things:
1. **Refreshes the session** — Supabase tokens expire. `getUser()` automatically refreshes expired tokens and sets new cookies.
2. **Protects dashboard routes** — If no user is authenticated, redirect to `/login`.
3. **Redirects authenticated users** — If already logged in, going to `/login` or `/signup` redirects to `/dashboard`.

The route matcher in `src/middleware.ts` ensures this logic only runs for relevant routes:

```typescript
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
```

#### Two Supabase Clients

The project uses two different Supabase client constructors:

| Client | File | Used In | Session From |
|--------|------|---------|--------------|
| `createBrowserClient` | `client.ts` | Client Components (`"use client"`) | Cookies (browser) |
| `createServerClient` | `server.ts` | Server Components, API routes, middleware | Cookies (request headers) |

Both clients use the same Supabase project URL and anon key. The difference is how they access the session cookie. Browser clients read cookies from `document.cookie`. Server clients read cookies from the incoming request's `Cookie` header.

---

## 7. Application Architecture

### Rendering Strategy

| Route | Rendering | Why |
|-------|-----------|-----|
| `/` (landing) | Client Component | Minimal interactivity, but uses same pattern for consistency |
| `/login`, `/signup` | Client Component | Form state, error handling, Supabase auth calls |
| `/dashboard` | Client Component | Real-time date range filtering, chart rendering, data fetching |
| `/dashboard/orders` | Client Component | Search input, status filter, pagination state |
| `/dashboard/orders/[id]` | Server Component | Static data fetch, no client interactivity needed |
| `/dashboard/products` | Client Component | Search input, dynamic filtering |
| `/dashboard/products/[id]` | Client Component | Chart rendering requires client-side JavaScript |
| `/dashboard/settings` | Client Component | Form state, theme toggle |

### Layout Nesting

```
Root Layout (layout.tsx)
├── Landing Page (page.tsx)                     — no sidebar
├── Auth Group Layout ((auth)/)
│   ├── Login Page (login/page.tsx)             — no sidebar
│   └── Signup Page (signup/page.tsx)            — no sidebar
└── Dashboard Layout (dashboard/layout.tsx)      — has sidebar
    ├── Dashboard Page (dashboard/page.tsx)
    ├── Orders (dashboard/orders/page.tsx)
    ├── Order Detail (dashboard/orders/[id]/page.tsx)
    ├── Products (dashboard/products/page.tsx)
    ├── Product Detail (dashboard/products/[id]/page.tsx)
    └── Settings (dashboard/settings/page.tsx)
```

The **Root Layout** provides fonts, the dark mode initialization script, and global CSS. The **Dashboard Layout** adds the sidebar and main content area. Pages outside `/dashboard` don't get the sidebar.

---

## 8. Component Breakdown

### Page Components

#### Dashboard Page (`src/app/dashboard/page.tsx`)

The main analytics view. It:

1. Holds a `dateRange` state (`"30d"` by default)
2. Passes it to `useDashboardData(dateRange)` which fetches and aggregates all data
3. Renders a loading skeleton (pulsing gray cards) while data loads
4. Renders 4 KPI cards, 2 chart cards (Revenue + Orders), a category donut chart, a top products table, and a recent orders table

The date range picker at the top right triggers a re-fetch when changed.

#### Orders Page (`src/app/dashboard/orders/page.tsx`)

Features:
- **Search:** Filters orders by order number using Supabase `.ilike('order_number', '%query%')`
- **Status filter:** Buttons for All, Pending, Processing, Shipped, Delivered, Cancelled. Uses `.eq('status', filter)` on the query
- **Pagination:** 20 orders per page. Uses `.range(from, to)` for offset-based pagination
- **Table:** Each row links to the order detail page

#### Order Detail Page (`src/app/dashboard/orders/[id]/page.tsx`)

A Server Component that:
1. Fetches the order with its items and related product/customer data using Supabase joins: `.select('*, customer:customers(*), order_items(*, product:products(*))')`
2. Renders order header with status badge
3. Renders line items table (product, price, quantity, subtotal)
4. Renders sidebar cards for customer info and order summary

#### Product Detail Page (`src/app/dashboard/products/[id]/page.tsx`)

Fetches the product and its order history, then:
1. Shows 4 stat cards (Price, Stock, Total Revenue, Units Sold)
2. Aggregates sales by day from `order_items` joined with `orders`
3. Renders a line chart showing sales over time

### Reusable Components

#### `KpiCard` (`src/components/dashboard/KpiCard.tsx`)

Renders a stat card with:
- An icon (passed as React node)
- A title (e.g., "Total Revenue")
- A value (e.g., "$45,230.00")
- An optional trend indicator (not currently used but supported)

#### `Card`, `CardHeader`, `CardContent` (`src/components/ui/Card.tsx`)

Composable card components. Used throughout the dashboard:

```tsx
<Card>
  <CardHeader>
    <h2>Revenue Over Time</h2>
  </CardHeader>
  <CardContent>
    <RevenueChart data={revenueData} />
  </CardContent>
</Card>
```

#### `StatusBadge` (`src/components/ui/Badge.tsx`)

A pill-shaped badge with a colored dot. Maps order status to colors:
- Pending → Yellow
- Processing → Blue
- Shipped → Purple
- Delivered → Green
- Cancelled → Red

Colors are defined in `getStatusColor()` in `utils.ts` and include dark mode variants.

#### `DateRangePicker` (`src/components/ui/DateRangePicker.tsx`)

A segmented control with 4 preset buttons (Today, 7 days, 30 days, 90 days). The selected preset is highlighted with the brand orange color.

#### `Sidebar` (`src/components/layout/Sidebar.tsx`)

The desktop sidebar (hidden below `lg` breakpoint). Contains:
- Logo and app name
- Navigation links (Dashboard, Orders, Products, Settings) with active state highlighting
- Theme toggle button (switches icon between sun and moon)
- Sign out button

Active state detection:
```typescript
const isActive = (href: string) => {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
};
```

This ensures `/dashboard/orders/abc123` highlights the "Orders" nav item.

#### `MobileSidebar` (`src/components/layout/MobileSidebar.tsx`)

On screens below `lg` breakpoint, the desktop sidebar is hidden and replaced with:
- A hamburger button in the top-left corner
- A slide-out overlay that shows the same navigation, theme toggle, and sign out button
- A backdrop that closes the menu when tapped

---

## 9. Data Flow & State Management

### No External State Library

This project does not use Redux, Zustand, or any state management library. All state is managed with React's built-in `useState` and custom hooks. This is sufficient because:
- Each page fetches its own data independently
- There is no shared global state that multiple pages need to read/write simultaneously
- The `useTheme` hook manages theme state with localStorage as the source of truth

### Dashboard Data Flow

```
DateRangePicker (state: dateRange)
        │
        ▼
useDashboardData(dateRange) ─── fetches from Supabase ───┐
        │                                                  │
        │  ┌──────── orders table ◄───────────────────────┘
        │  │         order_items table (joined)
        │  │
        │  ├── Aggregates KPIs (revenue, count, avg, delivery rate)
        │  ├── Groups revenue by day → RevenueChart
        │  ├── Groups orders by day → OrdersChart
        │  ├── Groups items by category → CategoryChart
        │  ├── Ranks products by revenue → Top Products table
        │  └── Fetches last 10 orders → Recent Orders table
        │
        ▼
Dashboard Page renders all components with this data
```

The `useDashboardData` hook performs 3 Supabase queries:
1. **Orders in date range** — filtered by `created_at` between `from` and `to`
2. **Order items for non-cancelled orders** — joined with products to get categories
3. **Recent 10 orders** — unfiltered, sorted by newest first

All aggregation (grouping by day, summing revenue, ranking products) happens in JavaScript on the client. For a production system with millions of orders, these aggregations would be SQL views or materialized views on the database. For this project's scale (hundreds of orders), client-side aggregation is fast and keeps the code simpler.

### TypeScript Interfaces

All data shapes are defined in `src/types/database.ts`:

```typescript
export interface DashboardKPIs {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  conversion_rate: number;
}

export interface RevenueDataPoint {
  date: string;    // "2024-01-15"
  revenue: number; // 1234.56
}

export interface OrdersDataPoint {
  date: string;
  count: number;
}

export interface CategorySales {
  category: string; // "Electronics"
  revenue: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  revenue: number;
  quantity_sold: number;
}
```

These interfaces are used by the hooks, components, and chart configurations. If the database schema changes, the TypeScript compiler immediately flags every place that needs updating.

---

## 10. Chart.js Integration

### Setup

Chart.js is modular — you only import and register the components you use. This keeps the bundle small.

```typescript
import {
  Chart as ChartJS,
  CategoryScale,     // x-axis with category labels
  LinearScale,       // y-axis with numeric values
  PointElement,      // data points on line chart
  LineElement,       // the line itself
  Tooltip,           // hover tooltips
  Filler,            // gradient fill below line
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);
```

Each chart component registers only what it needs:
- **RevenueChart:** CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler
- **OrdersChart:** CategoryScale, LinearScale, BarElement, Tooltip
- **CategoryChart:** ArcElement, Tooltip, Legend

### Revenue Chart (Line)

```typescript
const chartData = {
  labels: data.map((d) => formatDateShort(d.date)),  // ["Jan 15", "Jan 16", ...]
  datasets: [{
    label: "Revenue",
    data: data.map((d) => d.revenue),                // [1234.56, 2345.67, ...]
    borderColor: "#f97316",                           // brand orange line
    backgroundColor: "rgba(249, 115, 22, 0.1)",      // transparent orange fill
    borderWidth: 2,
    fill: true,                                       // fill area under line
    tension: 0.4,                                     // curved line (0 = straight)
    pointRadius: 0,                                   // hide data points
    pointHoverRadius: 5,                              // show on hover
  }],
};
```

The options object uses `ChartOptions<"line">` for type safety:

```typescript
const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      callbacks: {
        label: (ctx) => `$${(ctx.parsed.y ?? 0).toLocaleString("en-US", {
          minimumFractionDigits: 2
        })}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxTicksLimit: 8 },
    },
    y: {
      ticks: {
        callback: (value) => `$${Number(value).toLocaleString()}`,
      },
    },
  },
};
```

### Theme-Aware Charts

All chart components read the current theme via `useTheme()` and adjust:
- **Tooltip background:** Dark gray in dark mode, white in light mode
- **Tooltip text color:** Light gray in dark mode, dark gray in light mode
- **Grid line color:** Very dark gray in dark mode, very light gray in light mode
- **Tick label color:** Medium gray in both modes (different shades)

This ensures charts are readable in both themes.

### Doughnut Chart (Categories)

The category chart uses a ring style (65% cutout) with 10 preset colors:

```typescript
backgroundColor: [
  "#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ef4444",
  "#eab308", "#06b6d4", "#ec4899", "#84cc16", "#6366f1",
],
```

The legend is positioned on the right side with dot-style indicators.

---

## 11. Dark Mode Implementation

### The Challenge

Dark mode in a server-rendered application has a specific problem: **flash of incorrect theme**. On page load:
1. The server renders HTML with the default (light) theme
2. The browser displays light-themed HTML
3. JavaScript loads, reads localStorage, and switches to dark theme
4. The user sees a brief flash of light mode before dark mode activates

### The Solution

An inline `<script>` in the `<head>` of the root layout runs before any rendering:

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        try {
          var theme = localStorage.getItem('ecom-dash-theme');
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          }
        } catch(e) {}
      })();
    `,
  }}
/>
```

This runs synchronously before the browser paints, so the `.dark` class is already on `<html>` when CSS is evaluated. No flash.

`suppressHydrationWarning` on `<html>` prevents React from warning about the mismatch between server HTML (no `.dark` class) and client HTML (`.dark` class added by the script).

### Tailwind CSS 4 Dark Mode

Tailwind CSS 4 defaults to the `prefers-color-scheme` media query for dark mode. To use class-based toggling (where `.dark` on `<html>` controls the theme), you need:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

This tells Tailwind that `dark:` variant classes (like `dark:bg-gray-900`) should activate when the element or any ancestor has the `.dark` class, rather than checking the OS preference.

### The `useTheme` Hook

```typescript
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial = stored || "light";
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    setMounted(true);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const current = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    setTheme(current === "dark" ? "light" : "dark");
  }, [setTheme]);

  return { theme, setTheme, toggleTheme, mounted };
}
```

Key details:
- **`mounted` flag:** Components that render differently based on theme (like the sun/moon icon in the sidebar) use `mounted` to avoid hydration mismatches. They render nothing until `mounted` is `true`.
- **`toggleTheme` reads from DOM, not state:** `toggleTheme` checks `document.documentElement.classList.contains("dark")` instead of the React `theme` state. This avoids a stale closure bug where the callback captures an outdated `theme` value.
- **`setTheme` syncs three things:** React state, localStorage, and the DOM class. All three must stay in sync.

---

## 12. Styling with Tailwind CSS 4

### Configuration via CSS (Not JavaScript)

Tailwind CSS 4 moved configuration from `tailwind.config.ts` into CSS. The entire theme is defined in `src/app/globals.css`:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
    --color-brand-50: #fff7ed;
    --color-brand-100: #ffedd5;
    /* ... full orange palette ... */
    --color-brand-500: #f97316;   /* primary brand color */
    --color-brand-900: #7c2d12;

    --color-navy-500: #1a365d;    /* secondary color for headings */

    --color-sidebar: #111827;     /* sidebar background */
    --color-sidebar-hover: #1f2937;
    --color-sidebar-active: #f97316;
}
```

This generates utility classes like `bg-brand-500`, `text-navy-500`, `bg-sidebar` that can be used anywhere in the markup.

### Dark Mode Pattern in Components

Every component that needs different styles in dark mode uses the `dark:` variant:

```tsx
<div className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
  <h2 className="text-gray-900 dark:text-white">Title</h2>
  <p className="text-gray-500 dark:text-gray-400">Subtitle</p>
</div>
```

The StatusBadge component shows a more complex example with dynamic dark mode colors:

```typescript
case "delivered":
  return {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500"
  };
```

### Responsive Design

The dashboard uses Tailwind's responsive breakpoints:

```tsx
{/* 1 column on mobile, 2 on small, 4 on large */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

{/* Sidebar: hidden on mobile, 64px wide on large screens */}
<aside className="hidden lg:flex fixed inset-y-0 left-0 w-64">

{/* Content area: full width on mobile, offset by sidebar on large */}
<main className="lg:pl-64 p-4 sm:p-6 lg:p-8">
```

---

## 13. Supabase Configuration

### Project Setup

The Supabase project was created via `npx supabase projects create`. Key configuration changes made to the remote project:

#### Authentication Settings

```toml
# supabase/config.toml (relevant sections)

[auth]
site_url = "https://ecom-dash-gamma.vercel.app"
additional_redirect_urls = [
  "http://localhost:3000/**",
  "https://ecom-dash-gamma.vercel.app/**"
]
enable_confirmations = false
```

- **`site_url`** — Set to the Vercel production URL. This is the base URL used in auth emails (password reset, magic links). Initially this was `http://localhost:3000`, which caused confirmation emails to link to localhost instead of the deployed site.
- **`additional_redirect_urls`** — Allows both localhost (development) and the Vercel URL (production) as valid OAuth redirect targets.
- **`enable_confirmations = false`** — Disables email confirmation on signup. For a demo project, requiring email confirmation adds friction without benefit. In a production app, you would enable this.

These changes were applied to the remote Supabase project using:

```bash
npx supabase link --project-ref <project-id>
npx supabase config push
```

### Environment Variables

The application needs two environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

- **`NEXT_PUBLIC_` prefix** — Next.js exposes these to the browser. This is safe because the anon key only grants access that RLS policies allow.
- **No service role key** — The service role key bypasses RLS and should never be exposed to the client. This project doesn't need it because all data access goes through RLS policies.

These are set in:
- **Local development:** `.env.local` file (gitignored)
- **Vercel production:** Project settings > Environment Variables

---

## 14. Deployment to Vercel

### Setup

1. **GitHub repo created:** `nanushi-k/ecom-dash`
2. **Vercel project created:** Connected to the GitHub repo with framework preset set to `nextjs`
3. **Environment variables added:** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel project settings

### How Deployment Works

1. Push code to `main` branch on GitHub
2. Vercel detects the push via webhook
3. Vercel clones the repo and runs `next build`
4. The build output (HTML, JS, CSS, serverless functions) is deployed to Vercel's edge network
5. The production URL (`https://ecom-dash-gamma.vercel.app`) is updated

Every push to `main` triggers this automatically. No manual deployment steps needed.

### Framework Preset

Vercel must know the project uses Next.js to correctly:
- Run `next build` (not a generic `npm run build`)
- Understand the output directory structure (`.next/`)
- Create serverless functions for API routes and Server Components
- Set up the correct routing (App Router file-based routes)

### Build Output

```
Route (app)                    Size
┌ ○ /                          5.2 kB
├ ○ /login                     3.8 kB
├ ○ /signup                    3.9 kB
├ ○ /dashboard                 12.1 kB
├ ○ /dashboard/orders          8.4 kB
├ ○ /dashboard/orders/[id]     6.2 kB
├ ○ /dashboard/products        7.1 kB
├ ○ /dashboard/products/[id]   9.3 kB
└ ○ /dashboard/settings        4.6 kB
```

---

## 15. Seeding Demo Data

### The Seed Function

The seed script (`supabase/seed.sql`) defines a reusable PostgreSQL function that generates realistic demo data:

```sql
CREATE OR REPLACE FUNCTION seed_demo_data(uid uuid)
RETURNS void AS $$
...
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**`SECURITY DEFINER`** — The function runs with the permissions of the user who created it (the database owner), bypassing RLS. This is necessary because the seed function inserts data for a specific user, but the RLS policies would otherwise block inserts if the inserting user's `auth.uid()` doesn't match.

### What It Generates

| Entity      | Count | Details                                                                                |
|-------------|-------|----------------------------------------------------------------------------------------|
| Products    | 60    | 6 per category across 10 categories (Electronics, Clothing, Home & Garden, etc.)       |
| Customers   | 100   | Randomized first/last names, addresses in 8 US cities                                  |
| Orders      | 500   | Spread across 12 months with realistic status distribution (50% delivered, 20% shipped) |
| Order Items | ~1500 | 1-5 random items per order, random quantities, prices from products                    |

### Unique Data Per User

To support multiple users, the function generates unique identifiers per user:
- **Order numbers:** `ORD-{first 4 chars of user UUID}-00001` through `ORD-xxxx-00500`
- **Customer emails:** `customer1_{first 8 chars of user UUID}@example.com`

### Idempotent (Safe to Re-run)

The function deletes all existing data for the user before inserting:

```sql
DELETE FROM public.order_items
  WHERE order_id IN (SELECT id FROM public.orders WHERE user_id = uid);
DELETE FROM public.orders WHERE user_id = uid;
DELETE FROM public.customers WHERE user_id = uid;
DELETE FROM public.products WHERE user_id = uid;
```

Order matters: `order_items` must be deleted before `orders` and `products` because of foreign key constraints.

### How to Run It

1. Go to Supabase Dashboard > SQL Editor
2. Paste the entire `seed.sql` file content
3. Replace the UUID at the bottom with your user's UUID (found in Authentication > Users)
4. Click Run

```sql
SELECT seed_demo_data('your-user-uuid-here');
```

To seed for additional users, just call the function again with a different UUID.

---

## 16. Key Engineering Decisions

### Why Client-Side Data Aggregation?

The dashboard aggregates data (grouping by day, summing revenue, ranking products) in JavaScript rather than SQL. For 500 orders, this takes milliseconds. The tradeoff:

| Approach | Pros | Cons |
|----------|------|------|
| Client-side (current) | Simpler code, fewer SQL queries, easier to change | Slower with 100K+ rows |
| SQL aggregation | Fast at any scale, less data over the wire | More complex queries, harder to iterate |
| Database views | Best of both worlds | Requires migration for every change |

For a portfolio project demonstrating full-stack skills, client-side aggregation keeps the code readable while still being performant at the demo scale.

### Why RLS Instead of Application-Level Auth Checks?

RLS policies run at the PostgreSQL level, meaning:
- Even if the application code has a bug that forgets a `WHERE user_id = ?` clause, the database still blocks unauthorized access
- Raw API calls through the Supabase client are automatically filtered
- Security is enforced in one place (the database) rather than scattered across every query

### Why No State Management Library?

Each page is self-contained:
- Dashboard data lives in `useDashboardData` — only used by the dashboard page
- Theme state lives in `useTheme` — reads from localStorage, a global source of truth
- Form state lives in local `useState` — only needed by the form component

There's no cross-page state that would benefit from Redux or Zustand. Adding a state library would increase complexity without solving a real problem.

### Why Inline `<script>` for Dark Mode?

The alternative approaches and their problems:
- **CSS `prefers-color-scheme`:** Respects OS setting but doesn't allow manual toggling
- **`useEffect` in a component:** Runs after paint, causing a visible flash
- **Cookie-based theme:** Requires server-side reading of the cookie, adding complexity
- **Inline `<script>` in `<head>`:** Runs synchronously before paint, zero flash, minimal code

### Why `@supabase/ssr` Instead of `@supabase/auth-helpers-nextjs`?

`@supabase/auth-helpers-nextjs` is the older library. `@supabase/ssr` is the recommended replacement that:
- Works with any SSR framework (not just Next.js)
- Uses a simpler cookie-based approach
- Is actively maintained and updated for the latest Supabase features
- Has better TypeScript support
