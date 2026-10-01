# Platform Training v2 — guided conversation training for new PL users

13 September 2026. Authorized replacement of the v1 pilot in `D:\ai\platformtraining` (database `platformtraining` from `.env`, `TRAINING_DATABASE_URL`) and of the v1 player in `D:\ai\platformloops-r3\apps\chat-ui`.

## 1. Why v1 is being replaced

| v1 defect | Consequence for a new user |
|---|---|
| Six prose lessons plus one linear ten-step example; the only visual is a row of chips | Reads like documentation, not like the platform; nothing shows how PL, its work products and EAL fit together |
| Flat navigation: lesson buttons and "Continue example" | No way to go from a high-level answer to the detail behind it and back; no sense of where you are or what is left |
| Prompts are seven generic strings ranked by stage | They are not connected to what the user just read, so they do not teach a use case |
| Copy is abstract ("connected delivery work") | It does not name the real things the user will meet: Discovery Blueprint, Local defaults, Requirements, Start build, Business Review, EAL |
| One-line, minified source in the service and a 50-line React component | Cannot be reviewed, tested or extended by anyone else |
| Example rendering is hard-coded in TSX | Content cannot change the visual without a PL rebuild, contradicting the content-service premise |

## 2. What v2 delivers

A **guided conversation**: every click is a question a new user would ask, every answer is a rich typed message with a diagram, and every answer ends with three or four recommended follow-up questions. Topics are organised progressively in four levels and four tracks, with a map that shows the whole guide and where the user is. Each answer also offers "Try this in PL" prompts that pre-fill the composer and are never sent automatically.

| Level | Meaning | Examples |
|---|---|---|
| 0 · Overview | One screen that explains PL | What is PL LOOP? |
| 1 · Big picture | The platform family, what you can build, the journey, your role | How does an idea become a running app? What can I build? |
| 2 · How it works | Each capability and each journey stage, with diagrams | What happens when I say Start build? What is a Discovery Blueprint? |
| 3 · Procedures and details | Exact commands, rules, messages, troubleshooting | Which commands move a project forward? What if Start build is refused? |

Tracks: **About PL**, **Capabilities**, **Process**, **Procedures**. A worked example (Service Request Hub) runs through the Process track as a chain of topics.

## 3. Architecture (unchanged boundaries, cleaner code)

```
PL browser ── same-origin ──▶ PL API (authenticated) ── signed envelope ──▶ Platform Training (8840) ──▶ platformtraining DB
   player v2 (React)          /api/training/*  (adapter)                   /health /v1/experience /v1/topics/:id /v1/progress
```

- Training owns immutable published **content packages** (schemaVersion 2, playerVersion 2) and per-user **progress** (visited topics, last topic, guidance mode) with the existing RLS tables. Publishing stays a local CLI; versions stay immutable; a channel points at the current package.
- PL keeps authentication, capability registration, chat state and all execution. The adapter signs tenant, user, installed capabilities and session stage; it never forwards cookies or client-supplied claims.
- Content is typed data only. Diagrams are typed descriptions (`flow`, `swimlane`, `layers`, `map`, `wireframe`, `timeline`) rendered by the player; content cannot contain HTML, scripts, selectors or commands.
- The prototype HTML is generated from the same content package, so the prototype and the product never drift.

## 4. Content model v2

```
package
  entry        title, body, starters[topicId], composer hint
  tracks[]     id, title, summary
  levels[]     id (0–3), title
  topics[]     id, track, level, title, prompt, summary,
               blocks[] (paragraph | heading | bullets | numbered | key_value | table | callout | diagram | steps | example),
               followUps[topicId], plPrompts[{label, prompt, requires[], stages[]}], keywords[]
```

Validation rules: unique ids; every followUp resolves; every starter resolves; each topic has at least one block and one followUp (except terminal topics); `requires` names capability ids only; text fields bounded; no strings containing `<` or `>`.

## 5. Player v2 (PL chat UI)

- **Entry**: welcome, three starting questions, track cards with progress, a topic map (hub diagram) that is itself navigable, and the journey strip. Opens automatically in a fresh chat for guided-mode learners; collapses to a one-line entry plus suggestion chips otherwise.
- **Conversation**: user bubble with the question, guide message with blocks and diagram, then follow-up chips grouped as "Go deeper", "Related", "Back up". Breadcrumb shows track and level; "explored 12 of 31" progress.
- **Try this in PL**: prompt cards filtered by installed capabilities and ranked by session stage; "Use in my chat" pre-fills the composer (creating a project first when none is active) and shows the same confirmation as v1 when a draft exists. Nothing is sent automatically.
- **Diagrams**: SVG rendered from typed data in a small `TrainingDiagram` component; identical vocabulary in the prototype's vanilla renderer.
- **Accessibility**: buttons for every action, `aria-live` on new answers, keyboard navigation, no colour-only meaning.

## 6. Work packages

| WP | Scope | Output |
|---|---|---|
| 1 | Service restructure: `config`, `auth`, `schema` (v2), `repository`, `experience`, `server` modules; readable code with comments; unchanged security posture (signed envelopes, RLS, restricted role, immutable packages) | `src/*.mjs` |
| 2 | Progress model v2: learner payload `{mode, visited, lastTopic}`; actions `visit`, `mode`, `reset`; idempotent events and optimistic versions retained; v1 attempts left untouched in the database | `src/repository.mjs` |
| 3 | Content package `content/pl-guide-v2.json`: 61 topics across four tracks and four levels, each with a diagram and follow-ups; installed-capability descriptions; PL prompt recommendations per topic | `content/pl-guide-v2.json` |
| 4 | Publisher and setup: `publish.mjs` validates v2 and updates the channel; `setup.mjs` generalised to a migration list (no new SQL needed); `verify-wire.mjs` for v2 routes | `scripts/*.mjs` |
| 5 | Prototype generator: `scripts/build-prototype.mjs` inlines the package into `prototypes/pl-guide-v2.template.html` → `prototypes/pl-guide-v2.html` (self-contained, offline) | `prototypes/pl-guide-v2.html` |
| 6 | PL adapter: readable `training-routes.ts` with `/api/training/experience`, `/api/training/topics/:id`, `/api/training/progress`; schemaVersion 2; tests updated | `apps/api/src/training-routes.ts` |
| 7 | PL player: `TrainingGuide.tsx`, `TrainingDiagram.tsx`, `training-types.ts`, `training-guide.css`; v1 components removed; `App.tsx` import updated | `apps/chat-ui/src/*` |
| 8 | Tests: schema and content validation, auth binding, progress reducer, repository isolation (owned DB), wire test against the running service, PL adapter tests | `tests/*.mjs`, `training-routes.test.ts` |
| 9 | Live validation in PL: rebuild and restart the PL API, run the chat UI, sign in as the training QA user, walk the guide, pre-fill and send two recommended prompts, confirm PL answers and that progress persists | `IMPLEMENTATION_STATUS.md` |

## 7. Acceptance

1. A new user who types nothing can go from "What is PL LOOP?" to any procedure in at most four clicks, always seeing a diagram and the next recommended questions.
2. Every topic renders at least one diagram; no topic is prose-only.
3. Installed-capability-dependent content shows only what the workspace has; unavailable capabilities are described as "needs to be installed", never as executable.
4. "Try this in PL" pre-fills the composer and never sends; existing drafts are protected by a confirmation.
5. Progress (visited topics, last topic, guided or direct mode) survives reload and is isolated per tenant and user (RLS).
6. Publishing a new package never changes a published version; the channel switch needs no PL rebuild.
7. Training outage degrades to a one-line entry with a retry; the chat keeps working.
8. Unit and wire tests pass; PL adapter tests pass; the live walk-through in PL is recorded with evidence.

## 8. Out of scope

Autonomous content generation, model-generated answers inside the guide, live EAL practice bindings, learner certification, authoring UI, analytics dashboards. The guide teaches; PL executes.
