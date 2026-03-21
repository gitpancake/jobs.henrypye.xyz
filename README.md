# jobs.henrypye.xyz

A full-stack job search tracker with AI-powered analysis and direct outreach tracking. Built with Next.js, TypeScript, and Claude AI.

## Features

### Job Applications
- Track job applications with status management (Applied, Interviewing, Accepted, Rejected)
- Click any job to see full details, edit, duplicate, or delete
- Filter by status, date, and search by company/title
- Batch AI analysis — analyze all unanalyzed jobs in one go
- Archive rejected applications to keep the dashboard clean

### AI Analysis
- **Job Fit Analyzer** — paste a job description, get a suitability score, key matches, skill gaps, salary range extraction, and cover letter suggestions
- **Per-job analysis** — analyze individual jobs for requirements, responsibilities, benefits, and suggested next steps
- **CV-aware scoring** — upload your CV once, and all analysis is personalized against your experience

### Outreach Tracking
- Track direct outreach to decision-makers (CEOs, CTOs, etc.)
- Support for multiple channels: LinkedIn, Phone, Text, WhatsApp, Telegram, In Person, Email
- Track response status with one-click "Mark Responded" toggle
- Filter by method and response status

### Analytics Dashboard
- Key metrics: total applications, interviews, offers, outreach sent, response rates
- Monthly trends bar charts for both applications and outreach
- Pie charts for job status distribution and outreach method breakdown
- Performance metrics: response rate, success rate, average response time
- Top companies and locations

### Teams
- Create teams and invite members via shareable links
- Role-based access: Owner (full control), Collaborator (read/write), Viewer (read-only)
- Team switcher in the sidebar for users in multiple teams
- In-app invite banner for pending invitations

### Other
- Dark/light theme toggle
- Data obfuscation mode for screenshots
- Mobile-responsive layout with sidebar navigation
- Custom confirmation dialogs (no native browser dialogs)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui |
| Components | Radix UI, Lucide icons, Motion |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Database | PostgreSQL (Supabase) via Prisma ORM |
| Auth | Firebase Auth + cookie sessions |
| AI | Anthropic Claude SDK |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Firebase project (for authentication)
- Anthropic API key (for AI features)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/gitpancake/jobs.henrypye.xyz.git
   cd jobs.henrypye.xyz
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the required environment variables:
   ```
   POSTGRES_PRISMA_URL=your_supabase_pooled_url
   POSTGRES_URL_NON_POOLING=your_supabase_direct_url
   ANTHROPIC_API_KEY=your_claude_api_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_SERVICE_ACCOUNT_KEY=your_service_account_json
   ```

4. Push the database schema:
   ```bash
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Commands

```bash
npm run dev        # Start dev server
npm run build      # Build for production (includes prisma generate)
npm start          # Start production server
npm run lint       # Run ESLint
```

## Project Structure

```
app/
  (dashboard)/          # Authenticated pages
    page.tsx            # Dashboard — job list with filters
    analytics/          # Analytics with charts
    analyzer/           # Job Fit Analyzer
    cv/                 # CV management
    outreach/           # Outreach tracking
    jobs/[id]/          # Job detail page
  api/                  # REST API routes
    jobs/               # Job CRUD, analysis, stats
    outreach/           # Outreach CRUD, stats
    teams/              # Team management
    auth/               # Authentication
components/             # React components
lib/                    # Services, queries, types, validation
prisma/                 # Database schema
```

## Deployment

Deployed on Vercel with function timeout overrides for AI operations:

- Batch analysis: 300s
- Single job analysis: 60s
- Standard API routes: 30s

## License

Private project.
