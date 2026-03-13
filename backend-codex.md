# Taskify Backend Context Map

## Scope
- This context maps `backend/` architecture, API flow, data/auth handling, and structural repetition points for faster future prompt execution.

## High-Level Backend Overview
- Stack: Node.js + Express + TypeScript + Mongoose + JWT + bcrypt + SendGrid.
- Entry point: `backend/src/index.ts`.
- Boot sequence:
  - load env (`dotenv`)
  - connect MongoDB (`connectDB`)
  - register CORS + JSON middleware
  - mount API router at `/api`
  - expose root and health routes
- API root router: `backend/src/routes/index.ts`.

## Folder Structure
- `src/index.ts`: server bootstrap and middleware wiring.
- `src/routes/`: route modules per domain.
- `src/controllers/`: request validation + business logic + response shaping.
- `src/models/`: Mongoose schemas/interfaces/indexes.
- `src/middleware/auth.ts`: JWT auth guard and request user injection.
- `src/db/connection.ts`: Mongo connection.
- `src/services/`: OTP generation/rate-limit utils + SendGrid email sender.
- `dist/`: compiled output.

## API Surface (Mounted under `/api`)
- System:
  - `GET /health`
  - `GET /`
- Users (`/users`):
  - `POST /register`
  - `POST /login`
  - `POST /logout`
  - `POST /refresh`
  - `GET /profile` (auth)
  - `POST /verify-otp`
  - `POST /resend-otp`
  - `POST /forgot-password`
  - `POST /reset-password`
- Habits (`/habits`, auth required globally in route): CRUD + `PATCH /:habitId/toggle`
- Todos (`/todos`, auth): CRUD + `PATCH /:todoId/toggle`
- Journal (`/journal`, auth): CRUD + `GET /search`
- Finance (`/finance`, auth): CRUD + `GET /stats`
- Workout (`/workout`, auth):
  - plan CRUD + `PATCH /:planId/schedule`
  - entry CRUD at `/entries`
- Meal (`/meal`, auth): diet plan CRUD
- Sleep (`/sleep`, auth): CRUD + `GET /stats`

## Auth and Security Flow
- Middleware: `authenticateToken` in `src/middleware/auth.ts`:
  - reads bearer token
  - verifies JWT
  - checks user exists + active
  - sets `req.user = { userId, email }`
- JWT strategy:
  - access token: 7d
  - refresh token: 30d (`type: "refresh"` claim)
  - refresh endpoint verifies token + user, then rotates both tokens
- Email verification:
  - register creates unverified user + OTP + expiry, sends OTP email
  - verify endpoint enforces format/expiry/attempt limits then marks verified
- Password reset:
  - forgot password always returns generic success (anti-enumeration)
  - reset token stored in DB with expiry; reset hashes new password

## Data Layer Summary
- DB: Mongo via Mongoose.
- Ownership model: every domain record includes `userId`, and controllers query by `_id + userId` for access control.
- Models:
  - `User`: auth + OTP + reset + security/audit fields (`loginHistory`, lock fields)
  - `Habit`: completions map (`Map<string, boolean>`), frequency/target, active flag
  - `Todo`: priority/dueDate/category/completed
  - `Journal`: title/content/tags + text indexes
  - `Finance`: income/expense with strict category enums, tags, date
  - `SleepEntry`: check-in/out, duration, quality, active session support
  - `WorkoutPlan` + `WorkoutEntry`: separate schemas for plans vs logged sessions
  - `DietPlan`: meals + foods nested docs

## Controller Behavior Patterns
- Highly repeated structure across controllers:
  - check `req.user`
  - validate body/query manually
  - query/verify user ownership
  - map DB doc to response DTO
  - `success/message/data` response wrapper
  - `try/catch` with `500 Internal server error`
- Sorting/filtering via query params in several modules:
  - finance: type/category/tag/sort
  - workout plans: sort
  - workout entries: category/type/date range/sort
  - sleep: sort + limit
  - journal: text/tag search
- Stats endpoints are aggregate-in-memory style (fetch user docs then compute totals/averages).

## Repeated Structural Things (Important)
- Manual validation duplicated heavily in controllers (same style repeated for strings, enums, date format, max lengths).
- Manual response DTO mapping duplicated in each controller (id/title/etc transformation).
- Repeated ownership check pattern (`findOne({ _id, userId })`) across update/get/delete routes.
- Repeated auth-required guard in route modules via `router.use(authenticateToken)`.

## Integration Hotspots / Contract Mismatches
- Frontend token refresh expects `POST /users/refresh-token`, backend implements `POST /users/refresh`.
- Frontend calls `POST /users/logout-all-devices`, backend has no such route.
- Frontend service defines meal entry endpoints (`/meal/entries`), backend only exposes diet plan CRUD under `/meal`.
- CORS config duplication:
  - `src/index.ts` uses env `CORS_ORIGINS`
  - `src/config/cors.ts` has richer logic but is not wired in.
- `Joi` is in dependencies but not used in runtime validation (all validations are custom/manual).

## Practical Guidance for Future Changes
- Keep route-controller-model separation; add new endpoints through the same layers.
- If touching frontend/backend contracts, verify both:
  - route path names
  - response shapes (`data.entry`, `data.entries`, etc.)
- High-leverage refactor opportunities:
  - centralized validation middleware/schema
  - shared response helper
  - shared ownership/404 helper
  - unify CORS source of truth
- If adding analytics endpoints, prefer DB aggregation pipelines for scale over in-memory reduce.

## Quick File Anchors
- Server bootstrap: `backend/src/index.ts`
- API router root: `backend/src/routes/index.ts`
- User routes/controller: `backend/src/routes/user.ts`, `backend/src/controllers/user.ts`
- Auth middleware: `backend/src/middleware/auth.ts`
- DB connection: `backend/src/db/connection.ts`
- Models: `backend/src/models/*.ts`
- Workout controller: `backend/src/controllers/workout.ts`
- Diet controller: `backend/src/controllers/meal.ts`
- Email/OTP services: `backend/src/services/emailService.ts`, `backend/src/services/otpService.ts`
- Unused alt CORS config (currently not wired): `backend/src/config/cors.ts`
