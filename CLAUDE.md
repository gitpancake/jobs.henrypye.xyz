# CLAUDE.md

## Project Overview

Job Tracker is a full-stack Next.js application for tracking job applications and direct outreach to decision-makers, with AI-powered analysis. Users can manage job applications, track outreach across multiple channels (LinkedIn, phone, email, WhatsApp, etc.), and leverage Claude AI for suitability scoring, salary extraction, and personalized next steps.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **UI:** React 19, Tailwind CSS 4, shadcn/ui, Radix UI, Lucide icons
- **Animations:** Motion (framer-motion), tw-animate-css
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Database:** PostgreSQL (Supabase) via Prisma ORM
- **Auth:** Firebase Auth + cookie-based sessions
- **AI:** Anthropic Claude SDK
- **Deployment:** Vercel

## Commands

```bash
npm run dev        # Start dev server (port 3000)
npm run build      # prisma generate && next build
npm start          # Start production server
npm run lint       # Run ESLint
```

## Project Structure

```
app/
  (dashboard)/            # Authenticated pages (wrapped in Shell layout)
    page.tsx              # Main dashboard — job list with filters
    analytics/            # Analytics dashboard with charts
    analyzer/             # Job Fit Analyzer (paste description, get AI analysis)
    cv/                   # CV management (edit/view based on role)
    outreach/             # Outreach list, detail, and create pages
    jobs/
      new/                # Create new job
      [id]/               # Job detail (view/edit) + edit subpage
    insights/             # Rejection insights
    bulk-import/          # Bulk job import
  api/
    auth/                 # Firebase auth — login/logout/session
    jobs/                 # Job CRUD, analysis, batch-analyze, stats, analytics
    outreach/             # Outreach CRUD + stats
    cv/                   # User CV management
    teams/                # Team CRUD, switch, members, invites
    invites/              # Pending invites, accept invite
    analyze-job-description/  # Standalone Job Fit Analyzer endpoint
  invite/                 # Public invite acceptance page
  login/                  # Login page
  layout.tsx              # Root layout
  globals.css             # Global styles + Tailwind theme

components/
  Shell.tsx               # App shell — sidebar nav, header, team switcher
  auth-gate.tsx           # Auth wrapper — login form + AuthProvider + ConfirmProvider
  confirm-dialog.tsx      # ConfirmProvider with useConfirm hook (replaces native confirm/alert)
  pending-invite-banner.tsx  # In-app banner for pending team invites
  profile-dialog.tsx      # Profile + Team management dialog (tabs)
  job-card.tsx            # Job summary card (click to navigate)
  job-form.tsx            # Job create/edit form (React Hook Form + Zod)
  job-list.tsx            # Job list with unified filter toolbar + batch actions
  outreach-card.tsx       # Outreach summary card (click to navigate)
  outreach-form.tsx       # Outreach create/edit form
  outreach-list.tsx       # Outreach list with method/response filters
  status-combobox.tsx     # Job status selector (colored dropdown)
  status-filter-combobox.tsx  # Status filter for job list toolbar
  date-combobox.tsx       # Date picker combobox
  date-filter-combobox.tsx    # Date filter presets (today, last 7 days, etc.)
  date-range-picker.tsx   # Custom date range picker
  loading-spinner.tsx     # Loading spinner component
  error-message.tsx       # Dismissible error banner
  ui/                     # shadcn/ui primitives (button, card, dialog, etc.)
  animate-ui/             # Animation wrappers (fade, slide, theme toggler)

lib/
  ai-service.ts           # Anthropic Claude API integration
  auth.ts                 # Cookie-based auth, withAuth middleware, assertCanWrite
  firebase.ts             # Firebase client SDK init
  firebase-admin.ts       # Firebase Admin SDK init
  jobs.ts                 # Job database queries (getAllJobs, createJob, etc.)
  outreach.ts             # Outreach database queries (getAllOutreach, createOutreach, etc.)
  prisma.ts               # Prisma client singleton
  validations.ts          # Zod schemas (CreateJobSchema, CreateOutreachSchema, etc.)
  types.ts                # TypeScript interfaces (Job, Outreach, etc.)
  obfuscation.ts          # Data obfuscation for screenshots
  job-list-parser.ts      # Smart text parser for bulk import
  dashboard-context.ts    # React context for dashboard state (refreshStats, isObfuscated)
  utils.ts                # cn() utility for class merging

contexts/
  AuthContext.tsx          # Auth context with user, logout, refreshUser

prisma/
  schema.prisma           # Database schema (Job, Outreach, UserCV, SharedTeam, etc.)
```

## Environment Variables

Required in `.env`:

```
POSTGRES_PRISMA_URL       # Supabase pooled connection URL (for Prisma)
POSTGRES_URL_NON_POOLING  # Supabase direct connection URL (for migrations)
ANTHROPIC_API_KEY         # Claude API key for job analysis
NEXT_PUBLIC_FIREBASE_*    # Firebase client config (apiKey, authDomain, projectId, etc.)
FIREBASE_SERVICE_ACCOUNT_KEY  # Firebase Admin service account JSON
```

## Database

- PostgreSQL via Supabase, accessed through Prisma ORM
- Key tables: `jobs`, `outreach`, `user_cv`, `shared_teams`, `shared_team_members`, `shared_team_invites`, `shared_users`
- Job statuses: `APPLIED`, `INTERVIEWING`, `ACCEPTED`, `REJECTED`
- Outreach methods: `LINKEDIN`, `PHONE`, `TEXT`, `WHATSAPP`, `TELEGRAM`, `IN_PERSON`, `EMAIL`, `OTHER`
- All data is team-scoped via `teamId` — queries always filter by `session.activeTeamId`
- Schema changes: use `npx prisma db push` (not `migrate dev` — existing remote migrations aren't tracked locally)

## Authentication & Authorization

- **Firebase Auth** for user identity (email/password)
- **Cookie-based sessions** — Firebase ID token exchanged for HttpOnly cookie (7-day expiry)
- **Team-based access** — users belong to teams with roles: `owner`, `collaborator`, `viewer`
- **`withAuth` middleware** — wraps all API routes, provides `session` with `sharedUserId`, `activeTeamId`, `teamRole`
- **`assertCanWrite`** — returns 403 for viewer role on mutation endpoints
- **UI role checks** — `user.teamRole === "viewer"` hides create/edit/delete buttons

## Code Conventions

- **Client components** use `'use client'` directive
- **Cards** are wrapped in `memo()` for render optimization (JobCard, OutreachCard)
- **API routes** use `withAuth` middleware, return appropriate HTTP status codes
- **Validation** uses Zod schemas at API boundaries (`lib/validations.ts`)
- **Confirmation dialogs** use `useConfirm()` hook from `ConfirmProvider` — never use native `confirm()` or `alert()`
- **Toast notifications** use sonner (`toast.success()`, `toast.error()`)
- **Path alias:** `@/*` maps to the project root
- **Styling:** Tailwind utility classes only, no custom CSS classes
- **State management:** React hooks (useState, useCallback, useMemo), no external state library
- **Date handling:** `date-fns` library
- **Error handling:** try-catch in API routes with user-friendly error messages
- **Page layout:** All dashboard pages use `space-y-8` with `h1` heading + subtitle, full width (no `max-w` constraints)
- **Navigation:** Sidebar nav defined in `Shell.tsx` `navItems` array — no back buttons on main pages

## Key Architectural Patterns

- RESTful API design under `app/api/`
- Firebase Auth + cookie session (not NextAuth)
- Team switching via `active-team` cookie
- AI analysis with controlled concurrency (3 at a time for batch operations)
- AbortSignal timeouts on AI API calls (120s single, 300s batch)
- `ConfirmProvider` wraps the app for async confirm/alert dialogs
- `DashboardContext` provides `refreshStats` and `isObfuscated` to child components
- Prisma client uses a singleton pattern (`lib/prisma.ts`)

## Vercel Deployment

Function timeout overrides in `vercel.json`:
- Batch analysis: 300s
- Single job analysis: 60s
- Other API routes: 30s
