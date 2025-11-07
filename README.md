# Omniforce Client Reporting Dashboard

Multi-tenant SaaS reporting dashboard for AI automation agencies to provide clients with real-time visibility into automation performance.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL (Supabase) with Prisma ORM
- **Authentication:** NextAuth.js v4
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **TypeScript:** Full type safety

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your database credentials:
```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.bjrvvlhmfdfqfepoxpbj.supabase.co:5432/postgres"
SUPABASE_URL="https://bjrvvlhmfdfqfepoxpbj.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

3. Generate Prisma client:
```bash
npm run db:generate
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes (server-side proxy)
│   │   ├── dashboard/     # Dashboard page
│   │   └── layout.tsx     # Root layout
│   ├── components/        # React components
│   ├── lib/
│   │   ├── db/           # Prisma client & queries
│   │   ├── auth/         # NextAuth configuration
│   │   └── utils/        # Utility functions
│   ├── middleware.ts     # Tenant resolution
│   └── types/            # TypeScript types
├── prisma/
│   └── schema.prisma     # Database schema
└── docs/                 # Documentation
```

## Key Features

- ✅ Multi-tenant architecture with subdomain routing
- ✅ Server-side API proxy for secure external API calls
- ✅ Type-safe database access with Prisma
- ✅ Authentication with NextAuth.js
- ✅ Real-time dashboard with charts and metrics

## Database

The database schema includes:
- `tenants` - Multi-tenant organizations
- `users` - User accounts with role-based access
- `dashboards` - Dashboard configurations
- `automations` - Automation definitions
- `metrics` - Time-series performance data

## API Routes

All external API calls follow the server-side proxy pattern to keep API keys secure:

- `/api/metrics` - Fetch metrics for current tenant
- `/api/automations` - Fetch automations for current tenant
- `/api/external/example` - Example external API proxy
- `/api/auth/[...nextauth]` - NextAuth.js authentication

## Development

```bash
# Start dev server
npm run dev

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

## Security

- All external API calls are server-side only
- API keys stored in environment variables
- Tenant isolation enforced at middleware level
- Row-level security ready for database policies

See `docs/PDRs/01` for complete documentation.
