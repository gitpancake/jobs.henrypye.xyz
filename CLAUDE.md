# CLAUDE.md

## Project Overview

Job Tracker is a full-stack Next.js application for tracking job applications with AI-powered analysis. Users can add, edit, filter, and manage job applications, and leverage Claude AI to analyze job descriptions for suitability scoring, salary extraction, and personalized next steps.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **UI:** React 19, Tailwind CSS 4, Headless UI, Heroicons
- **Forms:** React Hook Form + Zod validation
- **Database:** PostgreSQL (Supabase) via Prisma ORM
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
app/                  # Next.js App Router
  api/                # REST API routes
    auth/             # Login/logout endpoints
    jobs/             # Job CRUD, analysis, bulk import, stats
    cv/               # User CV management
    analyze-job-description/  # Job Fit Analyzer
  page.tsx            # Main dashboard (client component)
  layout.tsx          # Root layout
  login/              # Login page
  globals.css         # Global styles + Tailwind theme
components/           # React components (JobCard, JobForm, JobList, etc.)
lib/                  # Services and utilities
  ai-service.ts       # Anthropic API integration
  auth.ts             # Cookie-based auth + withAuth middleware
  jobs.ts             # Database queries
  prisma.ts           # Prisma client singleton
  validations.ts      # Zod schemas
  types.ts            # TypeScript types
  obfuscation.ts      # Data obfuscation for screenshots
  job-list-parser.ts  # Smart text parser for bulk import
prisma/
  schema.prisma       # Database schema (Job, UserCV models)
```

## Environment Variables

Required in `.env` (see `.env.example`):

```
DATABASE_URL              # Supabase direct connection URL
POSTGRES_POOLER_URL       # Supabase pooled connection URL
ANTHROPIC_API_KEY         # Claude API key for job analysis
AUTH_USERNAME              # Login username
AUTH_PASSWORD              # Login password
```

Prisma expects `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` (set by Supabase/Vercel integration).

## Database

- PostgreSQL via Supabase, accessed through Prisma ORM
- Two tables: `jobs` and `user_cv` (see `prisma/schema.prisma`)
- Job statuses: `APPLIED`, `INTERVIEWING`, `ACCEPTED`, `REJECTED`
- AI analysis fields on jobs: salary range, suitability score (0-100), requirements, responsibilities, benefits, work arrangement, suggested next steps

## Code Conventions

- **Client components** use `'use client'` directive
- **Modals** are loaded with `dynamic()` imports to reduce bundle size
- **JobCard** is wrapped in `memo()` for render optimization
- **API routes** use `withAuth` middleware for authentication
- **API responses** return appropriate HTTP status codes (400, 401, 404, 500, 503)
- **Validation** uses Zod schemas at API boundaries (`lib/validations.ts`)
- **Path alias:** `@/*` maps to the project root
- **Styling:** Tailwind utility classes only, no custom CSS classes
- **State management:** React hooks (useState, useCallback, useMemo), no external state library
- **Date handling:** `date-fns` library
- **Error handling:** try-catch in API routes with user-friendly error messages

## Key Architectural Patterns

- RESTful API design under `app/api/`
- Cookie-based auth with HttpOnly, Secure (production), SameSite cookies (7-day expiry)
- AI analysis runs with controlled concurrency (3 at a time for batch operations)
- AbortSignal timeouts on AI API calls
- Parent-child communication via callback props
- Prisma client uses a singleton pattern (`lib/prisma.ts`)

## Vercel Deployment

Function timeout overrides in `vercel.json`:
- Batch analysis: 300s
- Single job analysis: 60s
- Other API routes: 30s
