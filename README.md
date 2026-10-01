# Platform Training (v2)

Guided conversation training for new Platform Loops (PL) users. Every click in the guide is a question a new user would ask; every answer is an executive-style briefing with a diagram, key takeaways, a status badge (available, partly available, planned), and the next recommended questions. Prompts can be pre-filled into the PL composer on an explicit action; nothing is ever sent automatically.

The service owns immutable content packages and per-user progress in the `platformtraining` PostgreSQL database. PL keeps authentication, capability registration, chat state and all execution. PL signs server-to-server requests; browser claims are never trusted.

## Layout

| Path | Purpose |
|---|---|
| `src/config.mjs` | `.env` loading and validation (no secrets logged) |
| `src/auth.mjs` | Signed-envelope verification and signing helper |
| `src/schema.mjs` | Content package schema v2 (topics, typed blocks, diagrams with clickable step details) |
| `src/experience.mjs` | Pure view composition: entry, topic index, topic view, suggestions, progress reducer |
| `src/repository.mjs` | PostgreSQL access with RLS-scoped transactions, idempotent progress events |
| `src/server.mjs` | Loopback HTTP: `/health`, `/v1/experience`, `/v1/topics/:id`, `/v1/progress` |
| `content/v2/` | Authored content: `package.json` plus one `topics.*.json` per track |
| `content/pl-guide-v2.json` | Assembled, validated package (generated; do not edit) |
| `prototypes/pl-guide-v2.html` | Self-contained clickable prototype generated from the package |
| `scripts/` | `assemble-content`, `build-prototype`, `publish`, `setup`, `verify-wire`, `configure-pl` |
| `plan/V2_IMPLEMENTATION_PLAN.md` | The v2 plan and acceptance criteria |

## Local operation

```powershell
npm install
npm run setup            # creates the database if missing, applies migrations, configures the restricted runtime role
npm run publish          # assembles content/v2 and publishes it to the pl-stable channel
node scripts/configure-pl.mjs   # once: writes TRAINING_SERVICE_URL and the signing secret into PL's .env
npm start                # loopback port 8840
```

PL loads the guide through `/api/training/experience`, `/api/training/topics/:id` and `/api/training/progress` (adapter `apps/api/src/training-routes.ts`; player `apps/chat-ui/src/TrainingGuide.tsx`). PL must be rebuilt and restarted once to load the adapter; content changes need only `npm run publish`.

Restart the service after changing its source, including `src/schema.mjs`: a running process validates every package with the schema it loaded at start, so a package that uses new fields is rejected until the service restarts.

## Authoring content

Edit `content/v2/package.json` (entry, tracks, levels, capability descriptions) and the `content/v2/topics.<track>.json` files. Each topic has an id, track, level (0 overview to 3 procedures), the question it answers, a summary (shown as Bottom line), optional takeaways and status, typed blocks including at least one diagram, follow-up topic ids, and optional PL prompt recommendations with the capabilities they need.

Diagram kinds: `flow`, `swimlane`, `layers`, `map`, `wireframe`, `timeline`. Flow steps and swimlane boxes with a `detail` open a popup when clicked. Content is data only: no markup, scripts or selectors are accepted.

Increment `version` before publishing; published versions are immutable.

```powershell
npm test                 # assembles and validates the package; checks reachability of every topic within four clicks
npm run build:prototype  # regenerates prototypes/pl-guide-v2.html
npm run test:db          # owned-database isolation and idempotency test
npm run verify:wire      # end-to-end check against the running service
```

## Not included

Model-generated answers inside the guide, live EAL practice bindings, authoring UI, analytics dashboards. The guide teaches; PL executes.

See `IMPLEMENTATION_STATUS.md` for what was verified.
