# Avolice — Step-by-step Roadmap (v0 → v1)

**Purpose**: A pragmatic execution plan for building Avolice (mobile-first) while keeping the codebase modular, auditable, and scalable.  
**Source of truth**: `specs/tech.md` (architecture + invariants).  
**Principle**: install dependencies only when the roadmap reaches the feature that needs them.

---

## 0) Pre-flight (1–2 days)

- **Lock product decisions** (already in `specs/tech.md`):
  - OAuth-only for v0 (Google + Microsoft).
  - Hard constraints ship as templates; user can edit after applying; confirm-to-edit UX = yes.
  - Calendar writeback writes only Avolice blocks; never modifies external events; writeback can be disabled.
  - Expo push path for notifications.
  - Apple Sign-In = v0.5.
- **Define environments**:
  - Local dev, staging, production.
  - **Package manager**: locked to **pnpm**.
  - Decide whether runtime is Bun or Node (either works; be consistent).

Deliverable:
- `specs/tech.md` reflects the above (done).

---

## 1) Restructure repo into a Turborepo monorepo (Phase “Repo v0”)

### 1.1 Create the monorepo skeleton

Goal: convert the current single Next.js app at repo root into:
- `apps/web` (existing Next.js app moved here)
- `apps/mobile` (new Expo app)
- `packages/*` (shared code: types, engine, db, tailwind-config, unrag)

Steps:
- **Add Turborepo scaffolding**
  - Add `turbo.json`
  - Add root pnpm workspace config (`pnpm-workspace.yaml`) and root scripts
- **Move the existing Next.js app**
  - Move current `app/`, `public/`, `next.config.ts`, etc. into `apps/web/`
  - Ensure imports resolve and Next still boots from `apps/web`
- **Create shared packages**
  - `packages/shared` (types + Zod schemas)
  - `packages/engine` (planner + rule engine + diff generator)
  - `packages/db` (Drizzle schema + migrations, Neon client)
  - `packages/tailwind-config` (tokens/config shared by web + uniwind)
  - `packages/unrag` (server-only; Unrag vendored code will live here later)

Dependencies (install only now):
- `turbo`
- `pnpm` (workspace package manager)

Acceptance:
- `apps/web` builds and runs locally.
- Turbo tasks run for `lint`, `typecheck`, `build` (even if minimal initially).

### 1.2 Minimal CI and local conventions

- Add consistent formatting/linting across the workspace (keep Biome if you like it).
- Establish env variable strategy:
  - `.env.example` in `apps/web` and `apps/mobile`
  - document required env vars in `specs/tech.md` or `README.md`

Acceptance:
- A clean “bootstrap” experience for a new developer.

---

## 2) Build the v0 foundation (Backend + Mobile shell)

### 2.1 Create the Expo mobile app (`apps/mobile`)

Goal: a running mobile shell that can talk to the backend.

Steps:
- Initialize Expo app (TypeScript).
- Add Uniwind + React Native Reusables.
- Add shared tokens from `packages/tailwind-config`.
- Implement basic navigation and placeholder screens:
  - Onboarding/Auth
  - Today Plan
  - Focus View
  - Routine Builder
  - Chat
  - Settings

Dependencies (install when you reach them):
- `expo`, `react-native`, navigation libs
- `uniwind`
- RN Reusables dependencies

Acceptance:
- App runs on iOS simulator + Android emulator.
- Dark mode baseline and “Focus View minimal UI” direction is visible.

### 2.2 Define shared contracts early (`packages/shared`)

Goal: enforce a shared language between mobile and backend.

Steps:
- Add Zod schemas + TS types for:
  - Routine, Step, Rule/Constraint (Hard/Soft/Elastic)
  - PlanRevision, PlanItem, PlanDiff
  - ExecutionEvent
  - Calendar mirror event shape
  - API request/response DTOs

Dependencies:
- `zod`

Acceptance:
- API handlers and mobile client both import shared DTOs.

---

## 3) v0 Milestone A — OAuth-only Auth + Sessions

Goal: a user can sign in on mobile and access protected APIs; multi-device sessions exist.

Steps:
- Integrate **better-auth** into `apps/web` (server-owned auth boundary).
- Implement OAuth providers:
  - Google OAuth (required)
  - Microsoft OAuth (required)
- Implement device sessions:
  - refresh token rotation
  - revoke single device / revoke all
- Mobile auth flow:
  - deep linking / redirect back to app
  - access token in memory, refresh in secure storage

Dependencies (install now):
- `better-auth`
- Mobile secure storage (e.g., Expo secure storage)

Acceptance:
- User can sign in/out from mobile.
- Session survives app restart.
- Revocation works.

---

## 4) v0 Milestone B — Routine engine (CRUD + rule evaluation)

Goal: routines are nested, rule-driven, deterministic, and persist correctly.

Steps:
- Add Postgres (Neon) connectivity from `apps/web`.
- Add Drizzle schemas/migrations in `packages/db`.
- Implement routine CRUD endpoints in `apps/web`.
- Implement deterministic rule evaluation in `packages/engine`.
- Implement routine builder UI in `apps/mobile`:
  - tree editing
  - step durations
  - apply “hard constraint templates” + confirm-to-edit

Dependencies:
- `drizzle-orm`, `drizzle-kit`
- Postgres driver (per chosen runtime)

Acceptance:
- Create/update/delete routines + steps.
- Conditional example from PRD works (Tuesday/Friday skincare swap).
- Hard constraint templates can be applied and then edited (with explicit confirmation UX).

---

## 5) v0 Milestone C — Planner + Focus execution loop (no calendar writeback yet)

Goal: generate a daily plan and execute it with Focus View.

Steps:
- Implement planner heuristics in `packages/engine`:
  - hard constraints first, buffers, elastic compression
  - always produce `PlanRevision` + `PlanDiff`
- Create plan persistence:
  - `plan_revisions`, `plan_items`, `execution_events`
- Mobile:
  - Today Plan UI (timeline)
  - Focus View (single step + timer)
  - actions: complete / skip / delay
  - offline queue for execution events + idempotency

Dependencies:
- none beyond what’s already needed for DB + mobile UI

Acceptance:
- “Today plan” exists and updates when user delays/skips steps.
- Focus View is minimal and reliable.

---

## 6) v0 Milestone D — Calendar read-only sync (Google + Outlook)

Goal: mirror calendar events and use them to detect conflicts.

Steps:
- Add provider integrations:
  - OAuth consent for calendar scopes (separate from login)
  - store tokens in `calendar_integrations`
- Implement mirror tables + reconciliation:
  - `calendar_mirror_events` upsert + idempotency
- Show conflicts in mobile timeline.
- Trigger a replanning option set when conflicts appear.

Dependencies:
- Google Calendar SDK + Microsoft Graph SDK (server-only)

Acceptance:
- Calendar events appear in-app reliably.
- Planner respects busy intervals.
- Conflicts produce A/B/C options (even if simple in v0).

---

## 7) v0 Milestone E — RAG via Unrag (templates + retrieval)

Goal: bootstrap routine creation and recommendations via retrieval, without making LLM the source of truth.

Steps:
- Vendor Unrag into `packages/unrag` using Unrag CLI (`init`).
- Create `createUnragEngine()` wrapper and Avolice-scoped helpers:
  - scope conventions: `user:${userId}:...`, `packs:public:...`, `app:docs:...`
- Ingest at least one “template pack” and internal docs.
- Expose server endpoints:
  - `POST /api/rag/ingest` (admin/internal)
  - `POST /api/rag/retrieve` (scoped per user)

Dependencies (install now):
- Unrag via `bunx unrag@latest init ...` (vendored code + its deps)
- `pgvector` extension in Neon (migration)

Acceptance:
- Retrieval returns relevant chunks and never leaks cross-user content.

---

## 8) v0 Milestone F — AI chat + tool-driven generative UI (text-first)

Goal: user can say “I’m running late” and get structured plan adjustment options + a Plan Diff card.

Steps:
- Add Vercel AI Gateway + AI SDK orchestration in `apps/web`.
- Define tools:
  - `proposePlanAdjustments`
  - `draftRoutineFromText`
  - `retrieveRagContext` (Unrag wrapper)
  - `explainPlanDiff`
- Mobile chat UI renders tool-parts:
  - PlanDiff card
  - Option picker
  - Routine preview + confirm/edit

Dependencies:
- `ai` / Vercel AI SDK packages

Acceptance:
- Chat produces a safe, explainable plan diff.
- No direct DB mutations from the model; only tool calls validated by deterministic engine.

---

## 9) v0 Milestone G — Notifications (Expo Push) + Trigger.dev jobs

Goal: proactive nudges and “sleep-in” handling.

Steps:
- Implement Expo push token registration in mobile + backend storage.
- Implement push sending from backend.
- Add Trigger.dev jobs (v0 set from `specs/tech.md`):
  - DailyPlanBuild
  - SleepInHeuristic (8am local)
  - Nudge/Notification
  - CalendarReconcile (if not already)

Dependencies:
- `trigger.dev` SDK
- Expo push dependencies
- Upstash Redis (for rate limiting/locks/idempotency)

Acceptance:
- At least one end-to-end “next action” push works.
- Sleep-in heuristic triggers a plan option notification.

---

## 10) v0 Release Gate

You can call it “v0” when:
- OAuth-only sign-in works on mobile.
- Routine builder works (nested + conditional).
- Planner produces a daily plan that respects calendar busy time.
- Focus View execution loop works (complete/skip/delay).
- Unrag retrieval works for at least one pack.
- At least one Trigger.dev job is running and at least one Expo push is delivered.

---

## 11) v0.5 (targeted upgrades)

- **Apple Sign-In** (as decided).
- Calendar writeback for Avolice blocks only:
  - optional per user; can be disabled
  - never modifies external events
- More robust conflict resolution UX and plan diffs.

---

## 12) v1 (robustness + quality bars)

- Unrag reranking + evaluation battery + CI thresholds.
- Recovery mode (minimum viable routine) automation on overloaded days.
- What-if simulator.
- More advanced constraint/rule UI and safer hard-constraint editing (restore defaults).
- Voice input (optional, after text is solid).

