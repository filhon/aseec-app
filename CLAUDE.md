# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at localhost:3000
npm run build      # Production build
npm run lint       # ESLint checks
npm start          # Start production server
```

No test framework is configured. Environment requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and Finance API credentials.

## Architecture Overview

ASEEC is a Next.js 16 / React 19 dashboard for managing missionary projects with financial tracking, interactive maps, and an AI assistant. The app is **Portuguese-first** (pt-BR strings throughout).

**Tech stack:** Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui (New York style), Supabase (auth + database + storage), Leaflet maps, Zustand, Zod + React Hook Form, Recharts.

### Route Structure (`/app`)

| Route                       | Purpose                                            |
| --------------------------- | -------------------------------------------------- |
| `/`                         | Public landing page                                |
| `/login`, `/auth/*`         | Auth flows (invite-code-gated signup)              |
| `/dashboard`                | Main dashboard with project feed and entity KPIs   |
| `/dashboard/entidades/[id]` | Entity profile with banking info and cost centers  |
| `/dashboard/paises/[id]`    | Country-level aggregation                          |
| `/projetos`                 | Project listing                                    |
| `/projetos/[id]`            | Project details with timeline mural                |
| `/projetos/feed`            | Global project post feed                           |
| `/projetos/novo`            | New project creation form                          |
| `/financeiro`               | Financial dashboard (transactions, charts, budget) |
| `/busca`                    | Global search with filters                         |
| `/favoritos`                | User favorites                                     |
| `/configuracoes`            | User settings                                      |
| `/aseec-ia`                 | AI chat assistant                                  |

### Authentication & Authorization

- **Supabase Auth** with middleware-level session management (`proxy.ts` → `lib/supabase/middleware.ts`)
- `AuthProvider` (`components/providers/auth-provider.tsx`) provides auth state and profile via React Context
- **Four role tiers:** `admin` > `editor` > `director` > `user`
- Permissions are checked at two layers:
  1. Route level via `PROTECTED_ROUTES` config in middleware
  2. Component level via `usePermissions()` hook (`hooks/use-permissions.ts`)
- Signup requires a valid invite code (validated against `invite_codes` table)

### Database Schema (Supabase)

Core tables: `profiles`, `entities`, `categories`, `projects`, `project_categories`, `project_posts`, `attachments`, `reactions`, `favorites`, `ai_messages`, `invite_codes`.

Types are in `lib/types/database.types.ts`. Key enums: `ProjectStatus` (pendente/em_andamento/concluido/cancelado), `PostType`, `UserRole`, `ReactionType`.

Storage buckets: `project-images`, `documents`, `entity-icons`.

### Financial Module

**Currently mocked.** `lib/services/financial-service.ts` generates mock data with simulated latency. The real integration targets an external Finance API with HMAC-signed requests.

- `lib/api/finance/client.ts` uses native Node.js `https` (not `fetch`) to bypass Next.js caching that would invalidate HMAC timestamps
- `lib/api/finance/types.ts` defines response shapes
- `lib/actions/finance/sync-actions.ts` are Server Actions for data sync
- Transaction lifecycle: draft → pending_approval → approved → authorized → paid

### Key Patterns

**Supabase clients — two variants, use correctly:**

- `lib/supabase/client.ts` — browser client (auto cookie refresh)
- `lib/supabase/server.ts` — server client (manual cookie handling, use in Server Components and Server Actions)

**State management:**

- Zustand for lightweight UI state: `useSearchStore`, `useBreadcrumbStore`
- React Context (AuthProvider) for auth + profile only
- No Redux

**Forms:** React Hook Form + Zod + shadcn/ui `<Form>` wrapper.

**Maps:** Leaflet + react-leaflet + react-leaflet-cluster. Geolocation uses 50km radius via `lib/geo-utils.ts`.

**Service layer:** Async service functions (`lib/services/project-service.ts`, `lib/services/financial-service.ts`) abstract data access.

### What's Still In Progress

Per `steps.md`:

- Financial DB tables (accounts payable/receivable, cost centers) not yet created in Supabase
- AI chat backend (LLM connection) not implemented — UI is complete
- File upload flows need verification end-to-end
- Financial module needs real Supabase queries to replace mocks
