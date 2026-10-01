# Implementation status

## v2 (13 September 2026)

Replaced the v1 pilot with the guided conversation training described in `plan/V2_IMPLEMENTATION_PLAN.md`, then extended it on request with the 40 new-user prompts, cross-functional swimlane and process diagrams with clickable step details, application-lifecycle, runtime and local-development architecture topics, and an executive answer layout.

### Delivered

- Service rewritten into readable modules (config, auth, schema, experience, repository, server); security posture unchanged: signed envelopes, RLS-scoped transactions, restricted runtime role, immutable packages.
- Content package 2.1.0: 61 topics in 7 tracks and 4 levels, every topic with at least one diagram; 40 of the topics answer the prompts supplied by the product owner verbatim.
- Diagrams: flow, swimlane, layers, map, wireframe, timeline; flow and swimlane steps with details open a popup.
- Executive answer layout in both the prototype and the PL player: title band, status badge, Bottom line, takeaways, at-a-glance strip, numbered figures, Explore next, Try this in PL.
- Prototype `prototypes/pl-guide-v2.html` generated from the same package; direct typing matches the closest prepared question.
- PL adapter (`training-routes.ts`) with the topics route and contract version 2; PL player (`TrainingGuide.tsx`, `TrainingDiagram.tsx`); v1 components removed.

### Verified

| Check | Result |
|---|---|
| `npm test` (schema, reachability, experience, auth) | 9 passed |
| `npm run test:db` (RLS isolation, idempotent events, restricted role) | 1 passed |
| `npm run verify:wire` against the running service | passed, package 2.1.0, 61 topics |
| PL adapter tests (`apps/api/src/training-routes.test.ts`) | 5 passed |
| PL chat-ui typecheck, PL API build | clean |
| Prototype in browser | entry, topics, follow-ups, direct typing, search, step popups, no console errors |
| Live PL as the training QA user (port 3002 API, 5174 UI) | guide loads from the service, topics open with diagrams, progress persists (POST 200), a prepared prompt was sent to PL and answered by the general-answer capability in 23 s |

### Known limitations

- The service must be restarted after schema changes; a stale process rejects packages that use new fields (observed once during this work and fixed by restarting).
- The PL API on 3002 is shared with other agents and was restarted twice during validation; deployed application runtimes are children of that process.
- Later environments (QA, UAT, Production) and legacy-application migration are described honestly as planned in the content.

## Prompt campaign and first-time-user validation (14 September 2026)

Method: a brand-new PL account was created through the platform's own signup route (`npm run qa:create-account`); every guide question (47 direct questions, including the product owner's 40 verbatim) and every distinct recommended prompt (45) was sent to the live PL API on port 3002 as that account (`npm run qa:campaign`, three workers, a new project per eight prompts); PL's results were recorded and scored (`qa:campaign:rescore`, `qa:campaign:report`). Evidence: `evaluations/prompt-campaign-2026-09-14/` (results.jsonl, raw/, topics-live.json, report.md, report.html).

| Result | Count |
|---|---|
| Cases sent to PL | 92 (47 direct, 45 recommended) |
| Pass (substantive answer) | 76 |
| Partial (PL answered generically, saying platform specifics were not supplied) | 6 |
| Asked a clarifying question instead (expected for discovery-style prompts; one routing disambiguation on the very first question) | 5 |
| Correct boundary (prompt about "this application" in an empty project) | 2 |
| Misrouted by PL to the application-overview capability | 3 |
| Fail (error, timeout, no answer) | 0 |
| Median / p90 seconds per prompt | 27 / 41 |
| Your 47 direct questions | 45 pass, 1 asked, 1 partial |

Guide path as the new account: 61 of 61 topics through the live adapter (67 diagrams, 46 clickable steps, 45 recommended prompts all available); all 61 rendered in the live PL player with band, figures and popups and no player errors; for a never-used account the guide opens automatically with the intro, four starters and seven tracks.

Findings and actions:

1. PL's general answers about the platform are generic for six prompts (roles, environments, authorization boundary, sizing, estimation, swimlane): the model says the platform's specific roles and terminology "were not supplied". The guide answers those questions with specifics. Recommendation for PL: admit the published guide package into the general-answer context (or route "about the platform" questions to the guide) so direct typing gets the same specifics.
2. The very first question, "What is this platform, and what problem is it designed to solve?", made PL ask "Which of these should PL do next? Answer a question / Describe an application". The recommended variant ("... Do not build anything.") answers directly. Suggest a routing default of "Answer a question" for pure questions.
3. Three general questions were routed to the application-overview capability and refused with `no_delivered_application` (correctness checks, moderately complex approach, examples by size). This is a PL routing over-match on the word "application"; the direct-typed versions of the same questions answered correctly.
4. Player fix: progress writes are now serialised, so opening topics quickly never drops a visit (previously 33 of 61 recorded during a fast run; now every open is recorded).
5. Operations: the training service is started detached (`node src/server.mjs` via a hidden process with logs in `.runtime/server-<stamp>.*.log`); a service started from a tool shell died once during this run.

Synthetic accounts created for this validation (credentials in `.local/`, never printed): `new-user-qa-2` (campaign), `new-user-qa-3` (blank-account check).

## Home page and calm presentation (14 September 2026)

- The guide is now the home page: it opens whenever no chat is selected (new or existing users), in a fresh guided chat, or when opened explicitly. With a chat active it collapses to one line: "New to the Platform or want to explore more? Start here." with the button "Explore Platform with guide"; the close action reads "Close guide" on the home page and "Back to my chat" inside a chat.
- Presentation simplified in both the PL player and the prototype: white surfaces, hairline dividers, one green accent, serif titles, neutral level and status badges, a single meta line instead of tiles, no gradient bands or colored callouts.
- Verified live with a blank account (home page open, four starters, seven tracks, composer hidden) and with an account that has chats (collapsed line, reopen works). Prototype rebuilt from the same content (package 2.1.0).
