# Product Requirements Document (PRD): Avolice

**Status**: Canonical product spec (single source of truth for “what we are building”)  
**Last updated**: 2026-01-18  
**How to build**: see `specs/tech.md` and `specs/roadmap.md`

---

## 1) Executive summary

**Avolice** is an AI-first personal orchestration agent that manages the *fidelity* of daily processes.

Unlike habit trackers that treat tasks as binary (done/not done), Avolice treats a routine as a **nested workflow** with rules, invariants, and multiple valid variants (full/compressed/minimum). It reconciles those workflows with a user’s real-world calendar, preserving momentum when the day changes.

---

## 2) Vision and principles

### 2.1 Vision

Help high-agency people stay “on track” even when reality changes—without turning life into a brittle checklist.

### 2.2 Product principles (non-negotiable)

- **Next action first**: always optimize for the user’s immediate “what do I do now?”
- **Constraints over vibes**: “never violate” rules must be enforced deterministically.
- **Explainability is a feature**: show plan diffs and why a change happened.
- **Minimal cognitive load**: Focus View shows only the current step + timer + minimal actions.
- **User agency**: AI proposes; user confirms meaningful changes (especially calendar writeback).

---

## 3) Problem statement

Existing routine apps fail in two critical ways:

- **Depth**: cannot express conditional logic and nested protocols inside a “routine block”.
- **Rigidity**: ignore calendar realities; when the day shifts, the routine collapses instead of adapting.

---

## 4) Target users and Jobs-To-Be-Done

### 4.1 Primary personas

- **The Optimizer**: treats the day like a system; wants leverage.
- **The Burst Worker**: works in sprints; needs protected recovery windows.
- **The Detail-Oriented**: runs protocols (skincare, fitness, meds) with ordering and constraints.

### 4.2 JTBD (jobs)

- “When my day gets disrupted, help me adapt my routine quickly and safely.”
- “Let me encode real protocols with exceptions and day-based logic.”
- “Keep me in motion by telling me the next step, not showing me the entire plan.”
- “Use my calendar as reality, not as an optional add-on.”

---

## 5) Scope and milestones (what ships when)

This section is product scope only (implementation details live in `tech.md` / `roadmap.md`).

### 5.1 v0 (MVP) — “Routine execution + calendar-aware planning”

**Goal**: a user can sign in, define routines (UI + natural language draft), generate today’s plan against calendar busy time, and execute via Focus View.

Includes:
- **OAuth-only auth** (Google + Microsoft).
- **Routine builder UI** for nested steps + durations + rules.
- **Text-based chat** interface for assistance (voice later).
- **Plan generation** that respects calendar busy intervals (read-only sync).
- **Focus View** execution loop (complete/skip/delay + timers).
- **Hard-constraint templates** (apply templates first; users can edit after applying).
- **Expo push notifications** for reminders and plan-change nudges.
- **RAG-powered retrieval** (templates/packs + internal docs) to assist routine drafting and suggestions.

Excludes:
- Apple Sign-In (v0.5).
- Calendar writeback (v0.5+).

### 5.2 v0.5 — “Trust + integration upgrades”

Includes:
- **Apple Sign-In** (iOS-first trust and acceptance).
- **Optional calendar writeback**:
  - writes **only Avolice blocks**
  - never modifies existing events
  - user can disable writeback entirely
- Stronger conflict resolution UX (clear A/B/C options + diffs).

### 5.3 v1 — “Quality bars + autonomy”

Includes:
- Retrieval quality program (evaluation, reranking, thresholds).
- Recovery mode automation (minimum viable routine on overloaded days).
- What-if simulation (“If I accept this meeting, what breaks?”).
- Deeper rules and constraint editing UX (safer hard-constraint editing, restore defaults).

---

## 6) Core product concepts and definitions

### 6.1 Routine

A **Routine** is a named workflow with nested steps. It can have variants:
- **Full**: ideal sequence
- **Compressed**: a shorter, acceptable version
- **Minimum viable**: hard constraints + highest-priority items only

### 6.2 Step

A **Step** is a single actionable unit (or a container) with optional timing and dependencies.

Examples:
- “Apply Alpha Arbutin”
- “5-minute meditation”
- “Wait 10 minutes”
- “Skincare (sub-process)”

### 6.3 Rules and constraints

- **Rules** select steps/variants based on context (day/time).
- **Hard constraints** must never be violated (user can edit after applying a template).
- **Soft constraints** are preferences (optimize when possible).
- **Elastic blocks** can be compressed or deferred.

### 6.4 Plan

A **Plan** is a dated schedule produced from routines + rules + calendar constraints.

### 6.5 Plan diff

Any change to the plan must be representable as a **before/after diff** with rationale.

---

## 7) Functional requirements (must-haves)

### 7.1 Routine creation (two paths)

- **Natural language draft**:
  - user can type: “Create a night routine with skincare; Tue/Fri use Alpha Arbutin instead of Niacinamide.”
  - system produces a draft routine the user can inspect and edit in the builder.
- **Dedicated routine builder UI**:
  - create nested routines/steps
  - reorder steps
  - assign durations and optionality
  - apply hard-constraint templates
  - edit constraints after applying templates (explicit/confirm-to-edit UX)

### 7.2 Conditional logic inside routines

Support day-of-week logic at minimum:

- Example (skincare):
  - If day is Mon/Wed/Thu/Sat/Sun → Niacinamide
  - If day is Tue/Fri → Alpha Arbutin (skip Niacinamide)

### 7.3 Planning and conflict handling

- Generate a daily plan that **respects calendar busy time**.
- Detect conflicts and propose alternatives:
  - **Option A**: compress a block (HIIT mode)
  - **Option B**: move a block to another free window
- Show options with a plan diff and tradeoffs.

### 7.4 Focus View (execution)

When a routine is active:
- Show only the **current step**, timer (if applicable), and minimal actions:
  - complete
  - skip
  - delay
- Execution state must persist (app restarts don’t lose the day).

### 7.5 Notifications (Expo push)

- Remind for “next action” at appropriate times.
- Provide actionable nudges (e.g., delay/skip).
- Notify when plan changes are proposed or applied.

### 7.6 Calendar integration

- v0: read-only sync for Google and Outlook calendars.
- v0.5+: optional writeback of **Avolice blocks only**; never modify existing events; user can turn writeback off.

### 7.7 Conversational interaction (text-first)

- User can request adjustments:
  - “I’m running 20 minutes late.”
  - “Compress the morning stack.”
  - “Move gym later today.”
- System responds with:
  - proposed options
  - plan diff
  - explanation (why)

### 7.8 Retrieval / knowledge assistance (RAG)

- Support semantic retrieval for:
  - routine template packs
  - internal docs/protocols
  - user preferences “memories”
- Retrieval must respect privacy boundaries and user scoping.

---

## 8) UX requirements (high-level)

- **Design**: dark-mode default, minimalist, high contrast.
- **Primary surfaces**:
  - Today plan (timeline)
  - Focus View (single step)
  - Routine builder
  - Chat
  - Settings (calendar connections, notification settings)
- **Core UX primitive**: plan diff cards and option pickers (A/B/C).

---

## 9) Success metrics (v0 → v1)

### 9.1 Product success

- **Adherence rate**: % steps completed (weighted by priority/hard constraints).
- **Reschedule success rate**: % conflicts resolved without manual rebuild.
- **Time-to-next-action**: time from “I’m late” → user sees a viable next step.
- **User-reported flow state**: qualitative, periodic prompt (optional).

### 9.2 Reliability

- Plan generation succeeds reliably for typical calendars and routines.
- No cross-user retrieval leakage.
- Notifications deliver at expected rates (measured on device).

---

## 10) Non-goals / out of scope (for now)

- Full voice interaction in v0 (voice is v1+ after text proves value).
- Modifying existing external calendar events (never; only write Avolice blocks).
- Full “social network” marketplace (can come after templates stabilize).

---

## 11) Risks and mitigations

- **Over-automation**: users may lose trust if changes feel arbitrary.
  - Mitigation: diffs + rationale + confirmations; writeback is opt-in and disableable.
- **Hard constraints editing**: accidental edits could create unsafe behavior.
  - Mitigation: templates + confirm-to-edit + “restore defaults”.
- **Calendar sync edge cases**: duplicates, timezone, cancellations.
  - Mitigation: mirror-first model + idempotency; visible sync status.

