# 8-Ball Africa

A full-stack e-commerce platform for premium pool and billiards equipment, built with Next.js 16, TypeScript, Prisma, and PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![Vitest](https://img.shields.io/badge/Vitest-81_tests-6E9F18?logo=vitest)
![Playwright](https://img.shields.io/badge/Playwright-4_E2E-2EAD33?logo=playwright)

## Demo Credentials

Use these seeded accounts to test the app quickly:

- Admin: `admin@8ballafrica.com` / `admin123`
- Admin: `admin@gmail.com` / `admin`
- Customer: `customer@example.com` / `customer123`

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js App Router                     │
├─────────────┬─────────────┬─────────────┬───────────────────────┤
│  (shop)     │  (auth)     │  (admin)    │  /api (REST)          │
│  Storefront │  Login/Reg  │  Dashboard  │  Products, Orders,    │
│  Products   │  OAuth      │  CRUD Mgmt  │  Cart, Users, Stripe  │
│  Checkout   │             │             │  Webhooks, SSE        │
├─────────────┴─────────────┴─────────────┴───────────────────────┤
│                    Shared Components & Layouts                 │
│             Framer Motion · Zustand · Recharts · Zod           │
├─────────────────────────────────────────────────────────────────┤
│                    NextAuth v5 (JWT + RBAC)                    │
├─────────────────────────────────────────────────────────────────┤
│             Prisma ORM -> PostgreSQL (Docker / Neon)           │
├─────────────────────────────────────────────────────────────────┤
│      Stripe Checkout · Resend Email · @react-pdf/renderer      │
└─────────────────────────────────────────────────────────────────┘
```

## Features

- Product catalog with category/brand/price filters and URL-synced search params
- Offset-based pagination (`?page=X&limit=Y`) for products and admin categories
- Storefront homepage with hero, brand marquee, gallery, categories, and location section
- Shopping cart via Zustand with persistence and session-aware user sync
- Stripe checkout flow with webhook-driven order status updates
- Automated purchase email with PDF invoice attachment (Resend + React Email + React PDF)
- Admin dashboard with analytics charts powered by Recharts
- Admin management pages for categories, products, orders, and users
- Credentials auth and Google OAuth with role-based route protection
- SEO + PWA essentials (`sitemap`, `robots`, Open Graph metadata, manifest, icons)
- 81 unit tests (Vitest) and 4 E2E smoke tests (Playwright)

## Tech Stack

| Layer      | Technology                                 |
| ---------- | ------------------------------------------ |
| Framework  | Next.js 16 (App Router)                    |
| Language   | TypeScript 5                               |
| Database   | PostgreSQL (Docker local, Neon production) |
| ORM        | Prisma 5                                   |
| Auth       | NextAuth v5 (credentials + Google)         |
| Payments   | Stripe Checkout + Webhooks                 |
| Email      | Resend + React Email                       |
| PDF        | @react-pdf/renderer                        |
| State      | Zustand (cart), URL params (filters)       |
| Styling    | Tailwind CSS                               |
| Animations | Framer Motion                              |
| Charts     | Recharts                                   |
| Validation | Zod v4                                     |
| Testing    | Vitest + Playwright                        |
| CI/CD      | GitHub Actions                             |

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop (for local PostgreSQL)
- Stripe CLI (optional, for local webhook testing)

### Setup

```bash
# Clone and install
git clone https://github.com/IgorJvnvc/8-ball-Africa.git
cd 8-ball-africa
npm install

# Environment variables
cp .env.example .env
# Fill in your keys (see .env.example)

# Optional local override file
cp .env .env.local

# Start PostgreSQL
docker compose up -d

# Initialize database
npx prisma generate
npx prisma db push
npx prisma db seed

# Start dev server
npm run dev
```

When both files exist, Next.js loads `.env.local` first, so shared defaults can stay in `.env` and machine-specific secrets can stay in `.env.local`.

### Running Quality Checks

```bash
npm run lint
npm run typecheck
npm test          # 81 unit tests
npm run test:e2e  # 4 Playwright smoke tests
```

### Stripe Webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

`POST /api/webhooks/stripe` marks paid orders, updates stock, and sends the invoice email.

## API Endpoints

| Method | Endpoint                 | Auth       | Description                              |
| ------ | ------------------------ | ---------- | ---------------------------------------- |
| POST   | `/api/auth/register`     | Public     | Register new user                        |
| GET    | `/api/products`          | Public     | List products (filterable + paginated)   |
| POST   | `/api/products`          | Admin      | Create product                           |
| GET    | `/api/products/:id`      | Public     | Get product details                      |
| PUT    | `/api/products/:id`      | Admin      | Update product                           |
| DELETE | `/api/products/:id`      | Admin      | Delete product                           |
| GET    | `/api/categories`        | Public     | List categories (search + pagination)    |
| POST   | `/api/categories`        | Admin      | Create category                          |
| PUT    | `/api/categories/:id`    | Admin      | Update category                          |
| DELETE | `/api/categories/:id`    | Admin      | Delete category                          |
| GET    | `/api/cart`              | User       | Get cart items                           |
| POST   | `/api/cart/items`        | User       | Add to cart                              |
| PUT    | `/api/cart/items/:id`    | User       | Update quantity                          |
| DELETE | `/api/cart/items/:id`    | User       | Remove item                              |
| GET    | `/api/orders`            | User/Admin | List orders                              |
| POST   | `/api/orders`            | User       | Create order and Stripe checkout session |
| PUT    | `/api/orders/:id/status` | Admin      | Update order status                      |
| GET    | `/api/orders/:id/stream` | User       | Order status stream                      |
| GET    | `/api/users`             | Admin      | List users                               |
| PUT    | `/api/users/:id`         | Admin      | Update user role                         |
| DELETE | `/api/users/:id`         | Admin      | Delete user                              |
| GET    | `/api/admin/analytics`   | Admin      | Dashboard analytics data                 |
| POST   | `/api/webhooks/stripe`   | Stripe     | Payment webhook handler                  |

## Project Structure

```
src/
├── app/
│   ├── (shop)/          # Storefront pages
│   ├── (auth)/          # Login, register
│   ├── (admin)/         # Admin dashboard
│   └── api/             # REST API routes
├── components/
│   ├── animations/      # Framer Motion wrappers
│   ├── layout/          # Header, Footer, CartDrawer
│   └── ui/              # Reusable UI components
├── lib/
│   ├── auth.ts          # NextAuth config
│   ├── prisma.ts        # Prisma client singleton
│   ├── email/           # Resend + React Email templates
│   └── invoice/         # PDF generation
├── stores/              # Zustand stores
└── tests/               # Vitest suites
```

## Design Decisions

- Route Groups (`(shop)`, `(auth)`, `(admin)`) separate storefront, auth, and admin concerns
- `template.tsx` remount strategy triggers Framer Motion enter animations on navigation
- Server Components by default, Client Components only where interactivity is required
- URL-synced filters keep product pages shareable/bookmarkable
- Tests mock Prisma and auth modules for fast local feedback without a database

## Author

Igor Jovanovic - https://github.com/IgorJvnvc

## License

MIT
