# ecom-dash

Real-time e-commerce analytics dashboard built with Next.js 15, Supabase, and Chart.js.

## Features

- **Dashboard** — KPI cards (revenue, orders, avg order value, delivery rate), revenue line chart, orders bar chart, category donut chart, top products table, recent orders
- **Date Range Filters** — Today, 7 days, 30 days, 90 days with all widgets updating dynamically
- **Orders Management** — Searchable/filterable orders list with pagination, detailed order view with items and customer info
- **Products** — Product list with revenue and stock data, individual product detail pages with sales charts
- **Authentication** — Email/password signup and login with Supabase Auth
- **Dark Mode** — Toggle between light and dark themes, persisted in localStorage
- **Row Level Security** — Each user sees only their own store data
- **Responsive** — Mobile, tablet, and desktop layouts with collapsible sidebar

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 |
| Charts | Chart.js + react-chartjs-2 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/your-username/ecom-dash.git
cd ecom-dash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set up the database

1. Go to your Supabase project's **SQL Editor**
2. Run the contents of `supabase/migrations/001_initial_schema.sql`
3. This creates all tables, RLS policies, and the auto-profile trigger

### 4. Seed demo data

1. Sign up in the app (run `npm run dev` first)
2. Go to **Supabase Dashboard > Authentication > Users** and copy your user ID
3. Open `supabase/seed.sql` and replace `YOUR_USER_ID_HERE` with your user ID
4. Run the seed SQL in the Supabase SQL Editor

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, signup pages
│   ├── auth/callback/    # Supabase auth callback
│   ├── dashboard/        # Protected dashboard pages
│   │   ├── orders/       # Orders list + [id] detail
│   │   ├── products/     # Products list + [id] detail
│   │   └── settings/     # Profile + theme settings
│   ├── layout.tsx        # Root layout with dark mode script
│   └── page.tsx          # Public landing page
├── components/
│   ├── charts/           # RevenueChart, OrdersChart, CategoryChart
│   ├── dashboard/        # KpiCard
│   ├── layout/           # Sidebar, MobileSidebar
│   └── ui/               # Card, Badge, DateRangePicker
├── hooks/                # useTheme, useDashboardData
├── lib/
│   ├── supabase/         # Client, server, middleware helpers
│   └── utils.ts          # Formatting, date ranges, classNames
├── types/                # TypeScript type definitions
└── middleware.ts          # Auth route protection
```

## Database Schema

- **profiles** — User profiles (auto-created on signup)
- **products** — Store products with price, category, stock
- **customers** — Customer records with name, email, address
- **orders** — Orders with status, total, linked to customers
- **order_items** — Line items linking orders to products

All tables enforce Row Level Security — users can only access their own data.

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

MIT
