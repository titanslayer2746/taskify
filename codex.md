# Taskify Frontend Context (Codex Memory)

This file captures how the current frontend is built so future changes can follow existing patterns.

## Scope

- Source analyzed: `frontend/`
- Stack: Vite + React 18 + TypeScript + Tailwind + shadcn/ui + Framer Motion
- State/data: React state/hooks, context (`AuthContext`, `ChatbotContext`), custom API hooks, React Query provider (currently minimal direct usage)

## High-Level Architecture

- Entry: `frontend/src/main.tsx` renders `App`.
- App composition (`frontend/src/App.tsx`):
  - `QueryClientProvider`
  - `AuthProvider`
  - `ChatbotProvider`
  - `TooltipProvider`
  - `BrowserRouter` with public/protected routes
  - Global toasters (`Toaster`, `Sonner`)
- Route gating:
  - `ProtectedRoute` wraps feature pages
  - `PublicRoute` wraps auth/landing pages
- Chatbot visibility:
  - `ChatbotBubble` only renders on protected routes for authenticated users.

## Routing Map

- Public:
  - `/` landing
  - `/signin`, `/signup`
  - `/verify-otp`
  - `/forgot-password`
  - `/reset-password`
- Protected:
  - `/habits`
  - `/todo`
  - `/pomodoro`
  - `/finance-tracker`
  - `/journal`, `/journal/:id`
  - `/health`, `/health/workout/:id`, `/health/diet/:id`
  - `/sleep`
  - `/projects`
- Fallback: `*` -> `NotFound`

## Auth + Session Model

- Core state lives in `frontend/src/contexts/AuthContext.tsx`.
- Storage keys (localStorage): token, refresh token, user, token metadata in `frontend/src/services/storage.ts`.
- Login flow:
  - Pages call `apiService.login`/`apiService.register`
  - On success, call `AuthContext.login(authData)` which persists tokens/user and starts token refresh service.
- Logout flow:
  - `AuthContext.logout` optionally calls backend logout, clears auth + caches + session data, then redirects to `/signin`.
- Token lifecycle:
  - `token-refresh.ts` schedules refresh before expiry and retries with backoff.
  - Refresh endpoint configured as `/users/refresh-token`.
- Route enforcement:
  - `ProtectedRoute` blocks unauthenticated access and redirects to sign-in.

## API Layer Pattern

- API facade: `frontend/src/services/api.ts` (`apiService` class instance).
- HTTP transport: `frontend/src/services/http-client.ts`.
  - Uses `fetch`, auto auth headers, request/response/error interceptors.
  - Base URL: `VITE_API_URL` (fallback `http://localhost:3001/api`).
- Interceptors: `frontend/src/services/interceptors.ts` (logging/auth/rate-limit/error categories).
- Common hook abstraction:
  - `useApi` (`frontend/src/hooks/useApi.ts`) gives `execute`, `loading`, `error`, `data`.

## Feature Implementation Patterns

- Most feature pages follow this pattern:
  - local state arrays (`useState`)
  - fetch on mount/user availability (`useEffect`)
  - optimistic CRUD updates for responsiveness
  - inline loading/empty/error states
  - modal/dialog components for create/edit/delete confirmation

### Habits (`frontend/src/pages/Habits.tsx`)

- CRUD via `apiService.getHabits/createHabit/toggleHabitCompletion/deleteHabit`.
- Uses optimistic inserts, toggles, deletions with rollback on failures.
- UI core: `CreateHabitModal`, `HabitHeatmap`, `Navbar`.

### Todo (`frontend/src/pages/Todo.tsx`)

- CRUD via todos endpoints.
- Optimistic create/toggle/edit/delete + rollback.
- Uses `TodoList` + shared `ConfirmationDialog`.

### Pomodoro (`frontend/src/pages/Pomodoro.tsx`)

- Client-side timer/settings workflow.
- No backend persistence in page layer.
- Components: `PomodoroTimer`, `PomodoroSettings`.

### Finance (`frontend/src/pages/Finance.tsx`)

- Uses `useApi` wrappers for list/create/delete.
- Server-driven filtering/sorting/pagination params.
- Separate full dataset fetch for analytics modal (`FinanceDashboard`).
- Components: `FinanceStats`, `FinanceCard`, `FinanceModal`, `ConfirmationDialog`.

### Journal (`frontend/src/pages/Journal.tsx`)

- List + editor view on same route space (`/journal/:id` opens editor mode).
- Search on title/content/tags.
- Optimistic create/save/delete.
- Components: `JournalCard`, `JournalEditor`.

### Health (`frontend/src/pages/Health.tsx`)

- Two tabs: workout plans + diet plans.
- CRUD via workout/diet plan endpoints.
- Supports detail routes (`/health/workout/:id`, `/health/diet/:id`).
- Can create tagged journal notes ("workout"/"diet") from health page.

### Sleep (`frontend/src/pages/Sleep.tsx`)

- Uses sleep CRUD endpoints with `SleepTracker`.
- Also can create journal entries from sleep feature.

### Projects (`frontend/src/pages/Projects.tsx`)

- Renders `ProjectBoard`.
- Important: projects are local-only (localStorage) via `projectService.ts`, not backend-backed.
- Includes kanban columns + drag/drop status updates + filter/search.

### Chatbot (protected routes only)

- Context/hook: `ChatbotContext` + `useChatbot`.
- Service: `aiService.ts` uses separate `VITE_CHATBOT_URL` (default `http://localhost:4000`).
- Supports:
  - send message
  - follow-up question answering
  - action plan execution with streamed progress (SSE-style fetch stream parsing)

## Styling + UI System

- Tailwind + CSS variables in `frontend/src/index.css`.
- Heavy use of gradient-dark visual style across protected pages.
- Shared component base in `frontend/src/components/ui/*` (shadcn/Radix pattern).
- Motion: Framer Motion used broadly in landing/auth/journal/health animations.

## Data Model Coverage

- Central types in `frontend/src/services/types.ts`.
- Covers auth, habits, todos, journal, finance, sleep, workout, diet/meal, pomodoro props, pagination, analytics, errors.
- Projects use separate domain model in `frontend/src/types/project.ts`.

## Environment + Config

- `frontend/env.example`:
  - `VITE_API_URL`
  - app metadata flags
- Chatbot additionally needs:
  - `VITE_CHATBOT_URL` (used in `aiService.ts`)

## Current Conventions To Follow

- Add/extend endpoints in `apiService` first, then call from pages/hooks.
- Prefer optimistic UI on CRUD-heavy pages.
- Keep explicit loading/error/empty states in each feature page.
- Reuse shared modal/dialog and `Navbar`.
- Keep auth-sensitive features behind `ProtectedRoute`.

## Known Implementation Notes

- Feature route labels and visual colors are tightly coupled in `Navbar.tsx`.
- `ProjectService` storage key is legacy-named (`habittty_projects`), but should remain stable unless migration is added.
- Several files contain legacy encoding artifacts in text/icons; avoid broad rewrites unless doing focused cleanup.
- Landing page includes links (`/contact`, `/terms`, `/privacy`) that currently do not have matching routes in `App.tsx`.
