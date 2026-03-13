# Taskify Frontend Context Map

## Scope
- This context focuses on `frontend/` architecture, API-calling flow, and structural patterns to speed up future prompt execution.

## High-Level Frontend Overview
- Stack: Vite + React 18 + TypeScript + Tailwind + shadcn/ui + Framer Motion.
- App bootstrap: `src/main.tsx` renders `App`.
- Global providers in `src/App.tsx`: `QueryClientProvider` -> `AuthProvider` -> `ChatbotProvider` -> `TooltipProvider` -> Router.
- Routing is centralized in `src/App.tsx` with:
  - Public routes: `/`, `/signin`, `/signup`, `/verify-otp`, `/forgot-password`, `/reset-password`
  - Protected routes: `/habits`, `/todo`, `/pomodoro`, `/finance-tracker`, `/journal`, `/health`, `/sleep`, `/projects`
- `ChatbotBubble` is shown only for authenticated users on protected routes.

## Important Structure
- Primary folders under `frontend/src`:
  - `pages/`: feature pages and route-level orchestration.
  - `components/`: UI and feature components (including `chatbot/`, `projects/`, `ui/`).
  - `services/`: API client, auth token storage, interceptors, token refresh, and domain API methods.
  - `contexts/`: `AuthContext` and `ChatbotContext`.
  - `hooks/`: reusable hooks (`useApi`, `useTokenRefresh`, `useChatbot`, etc.).
  - `types/`: project module types.

## Auth and Session Flow
- Core source of truth: `src/contexts/AuthContext.tsx`.
- Stores and validates auth using localStorage + refresh token utilities:
  - `services/storage.ts`
  - `services/token-refresh.ts`
- Login path:
  - Page calls `apiService.login`.
  - On success, `AuthContext.login()` persists token/refresh/user and initializes token refresh service.
- Logout path:
  - `AuthContext.logout()` optionally calls backend logout, clears storage/caches/session, stops refresh service, redirects.
- Route guarding:
  - `components/ProtectedRoute.tsx` handles auth loading/error/redirect.

## API Calling Architecture
- Main data API layer:
  - `services/api.ts` exposes domain methods (auth, habits, todos, journal, finance, sleep, workout, meal, health).
- Transport layer:
  - `services/http-client.ts` wraps `fetch` with request/response/error interceptor pipelines.
  - Uses `VITE_API_URL` fallback `http://localhost:3001/api`.
  - Sends `credentials: include` for cookie-aware requests.
- Interceptors:
  - `services/interceptors.ts` adds auth headers, logs request/response/errors, and basic status handling.
- Storage/auth headers:
  - `services/storage.ts` provides token/user/refresh storage and `getAuthHeaders()`.

## Chatbot API Path (Separate from `apiService`)
- `services/aiService.ts` targets `VITE_CHATBOT_URL` fallback `http://localhost:4000`.
- Uses `axios` for standard chatbot endpoints and raw `fetch` stream handling for `/api/execute` (SSE-like chunk parsing).
- Chatbot state orchestration is in `hooks/useChatbot.ts`, exposed via `contexts/ChatbotContext.tsx`.

## Feature Data Source Map
- Backend API driven:
  - Habits, Todo, Finance, Journal, Health plans, Sleep, Auth, OTP/password flows.
- LocalStorage driven (no backend integration):
  - Projects module (`services/projectService.ts`, `components/projects/*`, `pages/Projects.tsx`).

## Repeated Patterns (Important)
- Repeated CRUD UI flow across pages (`Habits`, `Todo`, `Finance`, `Sleep`, `Health`):
  - local page state
  - load on mount
  - call `apiService`/`useApi`
  - show loading/error/empty states
  - optimistic update and rollback in some pages
- Repeated page shell/layout:
  - gradient dark background + `Navbar` + centered container.
- Repeated error handling style:
  - `try/catch`, parse `error.response?.data?.message || error.message`, user-facing fallback message.
- Repeated confirmation-dialog delete flow in multiple pages.

## Structural Notes / Hotspots
- Auth logic duplicated in two places:
  - `contexts/AuthContext.tsx` (actively used)
  - `hooks/useAuth.ts` (parallel auth implementation, potential drift risk).
- Token refresh is feature-rich, but some interceptor refresh logic remains stub/commented.
- Mixed API styles:
  - `apiService` + `httpClient` for app data
  - direct `axios/fetch` in chatbot service.
- Response shape handling varies by page (`response.data.entries` vs direct arrays), increasing normalization overhead.
- Projects module is currently isolated from backend and may diverge from the rest of app patterns.

## Practical Guidance for Future Changes
- Prefer adding/using methods in `services/api.ts` and consuming through `useApi` for consistency.
- Keep `AuthContext` as canonical auth state owner; avoid expanding parallel auth logic in `hooks/useAuth.ts` unless consolidating.
- If adding a new feature page, follow existing route + protected wrapper pattern in `App.tsx`.
- If refactoring, highest leverage areas:
  - unify repeated CRUD page logic into reusable hooks/components,
  - unify error normalization,
  - consolidate auth implementation paths.

## Quick File Anchors
- App + routing: `frontend/src/App.tsx`
- Auth context: `frontend/src/contexts/AuthContext.tsx`
- HTTP client: `frontend/src/services/http-client.ts`
- API service: `frontend/src/services/api.ts`
- Interceptors: `frontend/src/services/interceptors.ts`
- Token storage: `frontend/src/services/storage.ts`
- Token refresh: `frontend/src/services/token-refresh.ts`
- Chatbot service: `frontend/src/services/aiService.ts`
- Reusable API hook: `frontend/src/hooks/useApi.ts`
- Projects local service: `frontend/src/services/projectService.ts`
