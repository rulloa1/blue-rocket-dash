# Blue Rocket Dash

A full-featured AI-powered lead generation CRM built for modern agencies. Manage your entire sales pipeline — from first contact to closed deal — with intelligent automation, email outreach sequences, and real-time analytics.

## Features

- **Dashboard** — Live stats: total leads, qualified leads, proposals sent, active clients. Pipeline overview with stage-by-stage progress bars and clickable drill-down.
- **Leads** — Full lead management with search, filters (status, source, industry, date range), bulk actions, and a slide-out detail drawer. Add leads via modal.
- **Pipeline** — Kanban board view of your deal pipeline. Drag deals across stages, filter by stage, and open deal details inline.
- **Outreach** — Create and manage automated email sequences and reusable templates. View sequence detail and track enrolled leads.
- **Proposals** — Multi-step proposal wizard with client info, services, pricing, and terms. View, edit, and track proposal status in a table.
- **Settings** — Profile, integrations, email configuration, notifications, and team management — all in one place.
- **Public Website** — Each client gets a unique public-facing site at `/site/:publicId`.
- **Auth** — Magic link authentication via Supabase (no passwords needed).
- **AI Voice Agent** — Deepgram-powered voice agent for hands-free interaction.

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) — styling & components
- [Supabase](https://supabase.com/) — database, auth, and edge functions
- [TanStack Query](https://tanstack.com/query) — data fetching & caching
- [React Router](https://reactrouter.com/) — routing
- [Deepgram](https://deepgram.com/) — voice AI
- [Vitest](https://vitest.dev/) — testing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com/) project

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/rulloa1/blue-rocket-dash.git
cd blue-rocket-dash

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your Supabase credentials in .env

# 4. Start the development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_URL=https://your_project_id.supabase.co
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com/). The `vercel.json` config handles SPA routing automatically.

1. Push to GitHub
2. Import the repo in Vercel
3. Add your environment variables in Vercel's project settings
4. Deploy

## Project Structure

```
src/
├── components/
│   ├── dashboard/     # StatCard, ActivityFeed, QuickActions
│   ├── layout/        # DashboardLayout, AppSidebar, TopBar
│   ├── leads/         # LeadsTable, LeadDrawer, AddLeadModal, filters
│   ├── outreach/      # SequencesList, SequenceDetail, TemplatesList
│   ├── pipeline/      # KanbanBoard, AddDealModal, DealDetailModal
│   ├── proposals/     # CreateProposalWizard, ProposalsTable, ProposalDetailModal
│   ├── settings/      # ProfileTab, IntegrationsTab, EmailTab, etc.
│   └── ui/            # shadcn/ui primitives
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useLeads.ts
│   ├── useDeals.ts
│   ├── useProposals.ts
│   ├── useSequences.ts
│   ├── useSettings.ts
│   ├── useDashboardStats.ts
│   └── ...
├── integrations/
│   └── supabase/      # Supabase client & generated types
├── pages/
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── Leads.tsx
│   ├── Outreach.tsx
│   ├── Pipeline.tsx
│   ├── Proposals.tsx
│   ├── Settings.tsx
│   └── ...
└── App.tsx
```

## License

MIT
