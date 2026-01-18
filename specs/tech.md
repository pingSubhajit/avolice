# Avolice — Technical Implementation Document (v0 → v1)

**Status**: Canonical reference (follow this before writing code)  
**Last updated**: 2026-01-18  
**Primary goals**: Mobile-first RoutineOS/Avolice with deterministic routine/rule execution, calendar harmonization, and AI-first interaction (text first, voice later).

---

## 1) Product invariants (do not violate)

- **Routines are programs**: nested steps + branching + “never violate” constraints (hard constraints).
- **The plan is a versioned artifact**: any reschedule creates a new plan revision; we keep diffs + rationale.
- **LLM is never the source of truth**: it proposes *structured* actions; deterministic engines validate and apply.
- **Calendar is the external source of time-truth**: we mirror and reconcile; we never “assume” availability.
- **Focus View is sacred**: during execution, show only “Next Action” + timer + minimal controls.

---

## 2) Stack (locked)

- **Backend + minimal web UI**: Next.js (App Router + Route Handlers)
- **Primary client**: React Native + Expo
- **Styling**: Uniwind + React Native Reusables
- **Monorepo**: shared TypeScript, shared Tailwind config/tokens
- **AI Orchestration**: Vercel AI SDK + Vercel AI Gateway
- **DB**: Neon Postgres + `pgvector`, via Drizzle ORM
- **Cache / rate limits / locks**: Upstash Redis
- **Background jobs**: Trigger.dev
- **Calendars**: Google Calendar + Microsoft Outlook (Graph)
- **RAG ingestion + retrieval**: **Unrag**
  - Unrag is a **vendored, auditable TypeScript RAG installer** with core primitives `ingest()` / `retrieve()` / `rerank()` / `delete()`.  
  - Reference: [`context7.com/betterstacks/unrag/llms.txt`](https://context7.com/betterstacks/unrag/llms.txt?tokens=10000)
- **Generative UI (where applicable)**: tool-driven “parts” rendered as native components.
  - Reference: [`ai-sdk.dev` generative UI docs](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces)

---

## 3) Monorepo layout (required)

Use a workspace monorepo with **pnpm** as the package manager (locked decision).

```
specs/
  PRD.md
  tech.md

apps/
  web/            # Next.js backend + minimal web UI
  mobile/         # Expo React Native

packages/
  shared/         # types, zod schemas, DTOs, constants, utilities
  engine/         # deterministic rule engine + planner + diff generator
  db/             # Drizzle schema/migrations + DB client
  unrag/          # vendored Unrag code + config wrapper (server-only)
  tailwind-config/# shared design tokens for web + uniwind
  ui/             # (optional) shared primitives; keep lean to avoid RN/Web coupling
```

**Server-only boundary**:
- `packages/unrag`, `packages/db`, and any calendar provider SDK usage are **server-only** (never imported by mobile bundle).

---

## 4) Core domain model (v0)

### 4.1 Entities (conceptual)

- **User**: timezone, working style (sprint/recover), preferences.
- **Routine**: versioned definition; can be templated/shared later.
- **Step**: recursive tree nodes; typed (action, timer, wait, conditional, subroutine).
- **Rule**: conditional selection (IF/THEN/ELSE) and constraints.
- **Constraint**:
  - **Hard**: must never be violated (e.g., “never skip sunscreen”, medication windows)
  - **Soft**: preference (e.g., “gym before dinner”)
  - **Elastic**: compressible blocks (reading, stretching)
- **PlanRevision**: immutable, versioned schedule for a date.
- **PlanItem**: scheduled block or step instance with times + status + linkage to routine/step.
- **ExecutionEvent**: append-only events (started/completed/skipped/delayed).
- **CalendarMirrorEvent**: mirrored external events (Google/Outlook).
- **Memory / Retrieval Artifacts**: embeddings + metadata (via Unrag).

### 4.2 Database tables (minimum)

Use Postgres + Drizzle. Names are recommended; exact columns can evolve but these concepts must exist.

- `users`
- `user_settings`
- `sessions` / `devices` (multi-device sessions for mobile/web)
- `routines`
- `routine_versions` (optional v0, strongly recommended v1)
- `routine_steps` (adjacency list with `parent_step_id`, `order_index`)
- `routine_rules`
- `plan_revisions`
- `plan_items`
- `execution_events` (append-only, immutable)
- `calendar_integrations` (provider + tokens + scope + sync cursor)
- `calendar_mirror_events`
- `audit_log` (plan changes + auth/security relevant events)

**Vector/RAG tables**:
- Prefer letting **Unrag vendored store** define/own its schema in `packages/unrag` and treating it as “internal RAG storage”.
- We may still add Avolice-level metadata tables for “documents we ingest” if needed for product UX (uploads, packs, etc.).

---

## 5) Routine DSL + Rule Engine (deterministic)

### 5.1 Requirements

- Fully serializable (JSON) and validated (Zod) at boundaries.
- Deterministic evaluation given a context snapshot.
- Supports:
  - Day-of-week logic (e.g., skincare active ingredient swap)
  - Time windows (must happen within)
  - Dependencies/prerequisites
  - Variants: **full / compressed / minimum viable**
  - “Never violate” constraints that override everything.

### 5.4 Hard constraint templates (locked product behavior)

- Hard constraints are provided via **templated packs** (e.g., “Skincare safety”, “Medication windows”, “Do not schedule after 11pm”).
- After applying a template, users **can edit** hard constraints.
- UX requirement: edits to hard constraints should be explicit and intentional (recommended: confirm-to-edit and/or “restore template defaults”).

### 5.2 Sane default DSL choice

- **v0**: define a minimal typed AST (don’t adopt a heavyweight rules language yet).
  - `and/or/not`, `equals`, `in`, `dayOfWeek`, `timeInRange`, `tagPresent`, `contextFlag`
- **v1**: if needed, expand AST or swap to a known expression language, but keep compatibility via versioning.

### 5.3 Context snapshot (input to rule engine)

Minimum fields:
- `now`, `date`, `timezone`
- `dayOfWeek`
- `calendarBusyIntervals` (from mirror)
- `energyMode` (user declared or inferred)
- `userFlags` (sleepInSuspected, lowEnergy, travelDay, etc.)
- `history` (recent adherence aggregates, not raw event firehose)

---

## 6) Planner / Scheduler (deterministic)

### 6.1 Output

Planner produces:
- `PlanRevision` + `PlanItems`
- `Options[]` for conflicts (Option A/B/C)
- `PlanDiff` (before/after) + **rationale** + constraint hits

### 6.2 v0 planning strategy (heuristics)

1. Lock “busy” time from calendar mirror.
2. Place hard-constraint steps (with windows) first.
3. Place high-priority blocks.
4. Fill elastic blocks into slack.
5. Maintain explicit buffers (default: 10% of the day’s planned time).

### 6.3 v1 upgrade path

- Add a real constraint/optimization layer (soft constraints as weights).
- Keep the planner interface stable so we can swap implementation without changing clients.

---

## 7) AI Orchestration (Vercel AI SDK + Gateway)

### 7.1 Principle: tool-based actions only

The model must not “write plans” as free-form text. It must call tools that return structured payloads.

Required tool categories:
- **Intent → structured command** (e.g., “I’m late” → `AdjustPlanCommand`)
- **Draft routine from NL** (creates a *draft* routine definition)
- **Explain** (renders rationale and tradeoffs)
- **RAG retrieval** (server-side Unrag `retrieve()` wrapper)

### 7.2 Generative UI (tool parts)

Use “tool parts” to render native UI components:
- Plan diff card
- Option picker (A/B/C)
- Routine preview tree + confirm/edit
- Constraint warning banner

Guidance: [`ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces`](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces)

---

## 8) RAG (Unrag) — required implementation details

### 8.1 What Unrag is for in Avolice

- Routine template packs (semantic search)
- User preference “memories” (retrieval only; does not override constraints)
- Help/manual/protocol docs (skincare/fitness protocols, etc.)
- Explainability support (retrieve past decisions/rationales)

### 8.2 Installation conventions (monorepo)

Unrag is vendored into the repo so we can audit and modify it:
- Use Unrag CLI `init` to install vendored primitives.  
  Reference: [`context7.com/betterstacks/unrag/llms.txt`](https://context7.com/betterstacks/unrag/llms.txt?tokens=10000)

Recommended convention:
- Vendored code lives in `packages/unrag/lib/unrag/**`
- Expose a small wrapper in `packages/unrag/index.ts` that:
  - exports `createUnragEngine()`
  - exports “Avolice scoped helpers” (see below)

### 8.3 Configuration defaults (locked)

From the Unrag config example:
- Embedding default: OpenAI `text-embedding-3-small`, `dimensions: 1536`
- Chunking default: `chunkSize: 512`, `chunkOverlap: 50`
- Retrieval default: `topK: 8`

Reference: [`context7.com/betterstacks/unrag/llms.txt`](https://context7.com/betterstacks/unrag/llms.txt?tokens=10000)

### 8.4 Required wrappers (server-side)

All usage goes through our wrappers:

- `rag.ingestUserDocument(userId, sourceId, content, metadata)`
- `rag.ingestTemplatePack(packId, sourceId, content, metadata)`
- `rag.retrieveForUser(userId, query, { topK, scope })`
- `rag.retrieveForPlanner(userId, query, { scopePrefix })`

**Scope conventions (mandatory)**:
- `user:${userId}:...` for user-private content
- `packs:public:...` for public templates
- `app:docs:...` for internal product docs

This prevents cross-user leakage and makes retrieval auditable.

### 8.5 Reranking + evaluation (v1 requirement)

Unrag supports adding batteries (e.g., `reranker`, `eval`, `debug`) and running retrieval evaluations (recall@K, MRR).  
Reference: [`context7.com/betterstacks/unrag/llms.txt`](https://context7.com/betterstacks/unrag/llms.txt?tokens=10000)

**v1 requirement**:
- Maintain an eval dataset in repo (e.g., `.unrag/eval/datasets/avolice.json`)
- CI gate: fail build if recall@K drops below agreed threshold.

---

## 9) Authentication (better-auth) — requirements + sane defaults

We will use **better-auth**. This section specifies required behavior (independent of exact library API).

### 9.1 Supported login methods (v0)

- **OAuth-only (locked for v0)**:
  - OAuth: Google (required)
  - OAuth: Microsoft (required for Outlook calendar)
- Account linking (one user can connect multiple providers)

### 9.2 Session model (required)

- **Access token**: short-lived (default 15 minutes)
- **Refresh token**: long-lived (default 30 days), **rotation required**
- **Revocation**: “log out all devices” invalidates refresh tokens
- **Device sessions**: each device has its own refresh token + metadata (lastSeen, deviceName)

### 9.3 Web vs mobile token transport

- **Web**: httpOnly secure cookies for session material; CSRF protection enabled.
- **Mobile**: store refresh token in secure storage (Keychain/Keystore); access token in memory; refresh via backend.

### 9.4 OAuth for calendars (separate from login)

Even if user logs in with Google, calendar access must be treated as a separate consent boundary:
- Store calendar provider tokens separately in `calendar_integrations`
- Track scopes and last sync cursor
- Support disconnect + token revocation

---

## 10) Calendar integrations (Google + Outlook)

### 10.1 Mirror-first architecture (required)

- Never plan directly off live provider calls.
- Maintain `calendar_mirror_events` as a normalized mirror (idempotent upserts).
- Replanning triggers off mirror changes.

### 10.2 Sync mechanisms

- **Google**: push notifications / channel renewal (job) + reconciliation polling fallback.
- **Microsoft**: Graph subscriptions renewal (job) + delta sync.

### 10.3 Writeback strategy (v1)

When writing Avolice blocks into calendars:
- Mark them with recognizable metadata (so we can reconcile “ours” vs “theirs”).
- Ensure idempotency keys on writes to avoid duplicates.
- **Writeback scope (locked)**:
  - We **only write Avolice blocks** (time blocks created/owned by Avolice).
  - We **do not modify existing external events** (no moving/editing user-created meetings).
  - Calendar writeback is **optional**: user can disable writeback entirely and rely solely on the Avolice app UI.

---

## 11) Background jobs (Trigger.dev) — required jobs

All jobs must be idempotent and safe to retry.

### v0 jobs

- **DailyPlanBuild** (per user): builds today/tomorrow plan early morning.
- **CalendarReconcile** (per integration): delta sync + mirror updates.
- **SleepInHeuristic**: at 8:00 AM local time, if no acknowledgement/activity → propose adjustments.
- **Nudge/Notification**: reminders for next action, missed step follow-up.
- **RagIngestPacks** (admin/ops): ingest template packs & internal docs.

### v1 jobs

- **RagEvalCI**: run retrieval eval battery; publish report.
- **AutoRecoveryMode**: detect high-density days and activate minimum viable routine variant.
- **PlanRepairOnCalendarChange**: whenever mirror changes affect planned items, generate options and notify.

---

## 12) API surface (Next.js Route Handlers)

All requests/inputs validated with shared Zod schemas (`packages/shared`).

### 12.1 Auth

- `POST /api/auth/*` (better-auth routes)
- `POST /api/session/refresh`
- `POST /api/session/revoke`

### 12.2 Routines

- `GET /api/routines`
- `POST /api/routines`
- `GET /api/routines/:id`
- `PUT /api/routines/:id`
- `DELETE /api/routines/:id`

### 12.3 Planning

- `GET /api/plan/today` (returns latest `PlanRevision`)
- `POST /api/plan/generate` (force regenerate; mostly internal)
- `POST /api/plan/adjust` (structured command)
- `POST /api/plan/options/:optionId/apply`

### 12.4 Execution

- `POST /api/execute/step/start`
- `POST /api/execute/step/complete`
- `POST /api/execute/step/skip`
- `POST /api/execute/step/delay`

### 12.5 Calendar

- `POST /api/integrations/google/connect`
- `POST /api/integrations/microsoft/connect`
- `POST /api/integrations/:provider/disconnect`
- `POST /api/webhooks/:provider` (calendar push callbacks)

### 12.6 RAG (server-only operations)

- `POST /api/rag/ingest` (admin + internal jobs only)
- `POST /api/rag/retrieve` (scoped by user)
- `POST /api/rag/rerank` (v1)

---

## 13) Mobile app architecture (Expo RN)

### v0 required screens

- **Onboarding/Auth**
- **Chat** (text only)
- **Today Plan** (timeline + conflicts)
- **Focus View** (single step + timer)
- **Routine Builder** (tree editor + step details)
- **Settings** (timezone, calendar connect, policies)

### State + offline defaults

- Cache “today plan” locally so Focus View never blocks.
- Queue execution events offline and replay when network returns (idempotency keys).

### Push notifications (locked path)

- Use **Expo Push Notifications** as the push path (v0+).
- Notifications must be actionable where supported (e.g., “Delay 10m”, “Skip Step”) and always safe/idempotent server-side.

---

## 14) “Cool additions” (baked into v1 requirements)

- **Plan Diff as primary UX**: every AI change is shown as a before/after diff.
- **Constraint tiers UI**: Hard vs Soft vs Elastic, user-editable.
- **Routine variants**: full / compressed / minimum viable.
- **What-if simulator**: “If I accept this meeting, what breaks?”
- **Template packs + sharing**: later marketplace; use RAG to recommend packs.
- **Explainability**: every plan revision stores constraint hits and rationale.

---

## 15) Observability, auditability, safety

### Required logs/events

- Auth events (login, token refresh, revoke)
- Calendar sync events (delta cursor, mirror updates)
- Plan generation & adjustment (inputs + outputs, hashed where sensitive)
- RAG ingest/retrieve metrics (latency, topK, scope used)
- Background job runs + retries

### Audit trail (must-have)

Every plan change must store:
- who/what triggered it (user vs system vs job)
- before/after diff
- constraints that influenced it
- model/tool version identifiers (for AI-involved actions)

---

## 16) Testing + acceptance criteria

### v0 acceptance criteria

- **Routine correctness**: day-of-week conditional steps evaluate correctly.
- **Planner correctness**: produces a plan that respects calendar busy intervals.
- **Focus view**: can complete/skip/delay; events are persisted and reflected.
- **Auth**: mobile + web can sign in; session survives app relaunch; revoke works.
- **Unrag**: can ingest at least one pack + retrieve relevant chunks with scope isolation.
- **Notifications**: Expo push notification can be delivered and handled end-to-end for at least one “next action” reminder.

### v1 acceptance criteria

- **Calendar writeback**: can create/move Avolice blocks without duplication.
- **RAG quality**: eval battery in CI with thresholds.
- **Conflict resolution**: A/B/C options generated and explainable.
- **Recovery mode**: automatically switches to minimum viable routine on overloaded days.
- **Generative UI**: tool-driven UI parts render reliably on mobile.

---

## 17) Open questions (decide + lock early)

- (Resolved/locked) OAuth-only v0.
- (Resolved/locked) Hard constraints are shipped as **templates**; after applying a template, users may edit hard constraints.
- (Resolved/locked) Calendar writeback writes **only Avolice blocks** and never modifies existing events; writeback can be disabled entirely.
- (Resolved/locked) Push notifications use **Expo Push**.

### Remaining open questions

- Should we support **Apple Sign-In** in v0 (recommended for iOS acceptance), or add in v0.5? : Do it in v0.5
- Do we want “hard constraints” to have a **confirm-to-edit** UX (to prevent accidental edits)? : Yes

