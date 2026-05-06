# SolarPro — Solar Business Management SaaS

Professional solar quotation, pricing, and business management system.

---

## Quick Start (Do this step by step)

### Step 1 — Prerequisites
Make sure you have installed:
- Node.js 20+ (nodejs.org)
- Git

### Step 2 — Clone & Install

```bash
# Go to the project folder
cd solarpro

# Install dependencies
npm install
```

### Step 3 — Supabase Setup

1. Go to **supabase.com** → Create new project
2. Wait for it to start (~2 minutes)
3. Go to **Settings → API**
4. Copy:
   - Project URL
   - anon public key
   - service_role key (keep this SECRET)

### Step 4 — Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit with your actual values
nano .env.local   # or open in VS Code
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key
- `SUPABASE_SERVICE_ROLE_KEY` — service role key
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `ADMIN_EMAIL` — your email (will become superadmin)

### Step 5 — Database Setup

1. Go to Supabase → **SQL Editor**
2. Open file: `supabase/migrations/001_initial_schema.sql`
3. Copy ALL the SQL
4. Paste in SQL Editor → Click **Run**

### Step 6 — Create Superadmin

After registering your account, run in Supabase SQL Editor:

```sql
SELECT create_superadmin('your@email.com');
```

### Step 7 — Run

```bash
npm run dev
```

Open: http://localhost:3000

---

## Project Structure

```
src/
├── app/
│   ├── api/               # All API routes (backend)
│   │   ├── auth/          # Login, register, logout
│   │   ├── products/      # Product CRUD
│   │   ├── quotations/    # Quotation management
│   │   ├── chatbot/       # AI price parser
│   │   ├── payments/      # JazzCash/EasyPaisa
│   │   └── admin/         # Superadmin routes
│   ├── auth/              # Login/register pages
│   ├── dashboard/         # Main app pages
│   └── admin/             # Admin panel pages
├── lib/
│   ├── supabase/          # DB client (server + browser)
│   ├── utils/
│   │   ├── errors.ts      # Centralized error handling
│   │   ├── calculator.ts  # Pure calculator logic
│   │   └── api.ts         # API route wrapper
│   └── validations/       # Zod schemas for all inputs
└── types/
    └── index.ts           # All TypeScript types
```

---

## Key Design Decisions

### Single Device Lock
- Every login generates a new `session_token`
- Token stored in `companies.active_session_token`
- Previous token immediately invalidated
- Other devices get 401 on next request

### Error Handling
- Every error goes through `toApiError()` in `errors.ts`
- All errors have codes (grep-able: AUTH_001, VAL_001, etc.)
- No scattered try/catch — use `apiHandler()` wrapper

### Price History
- Every price change logged in `price_history` table
- Source: 'manual' | 'ai_chatbot' | 'admin'
- Never lose track of who changed what and when

### Soft Deletes
- Products are never hard-deleted
- `is_active = false` instead
- Quotations that reference old products stay valid

---

## Adding JazzCash/EasyPaisa

1. Apply for merchant account at jazzcash.com.pk
2. Get: Merchant ID, Password, Integrity Salt
3. Add to .env.local
4. Test in sandbox mode first

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Settings → Environment Variables
```
