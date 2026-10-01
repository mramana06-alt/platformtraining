# Platform Training implementation plan

13 September 2026. User-authorized implementation in `D:\ai\platformtraining`, database `platformtraining` from `.env` (`TRAINING_DATABASE_URL`).

## Controlling MVP scope

Implement three welcome choices, six introductory prompt lessons, a click-through Service Request Hub learning example, and up to three context-aware suggestions in PL. Supply useful explanations before requesting input. Prompts are previewed and copied into the PL composer only on the user's action; never automatically submitted. Explicitly distinguish learning/simulation from real PL execution.

Training owns immutable published content packages and learner progress in its own database. PL retains authentication, actual capability registration, chat/project state and all execution authority. The new service does not use the model key to generate content in this release. No existing prototypes are executed or served by this implementation.

## Architecture

PL browser → existing authenticated PL API → authenticated Platform Training service → owned PostgreSQL database.

The PL adapter signs a short-lived request envelope with the authenticated tenant/user, current installed capabilities, and a minimal session-stage summary. It does not forward cookies, email, business documents or arbitrary URLs. The training service validates signature, audience, request digest and expiry. Browser-supplied identity/capability claims are never trusted.

All training records are versioned. New learners use the current published package; a running example remains pinned to its package revision. Publishing is a local administrative CLI with schema validation and immutable version checks. Compatible content updates need no PL rebuild. Unknown content kinds and unsupported player versions fail closed. Runtime database credentials cannot publish or migrate content.

## Work packages

1. Inspect DB identity/existing objects without printing credentials. Create only the named database if absent. Back up `.env` privately. Add a checksummed owned migration and least-privilege runtime role; preserve the original migration credential privately.
2. Implement service config, request authentication, content schema, repository and content publisher. Include clear errors, response limits and request timeouts.
3. Seed welcome copy, six explanatory lessons, suggestions by discovery stage, and one fully labeled illustrative journey. Content has no raw HTML, scripts, arbitrary target selectors or deployment commands.
4. Persist guided/direct preference and per-user example progress using RLS, optimistic versions and idempotent event IDs. Allow restart without deleting the previous attempt record.
5. Add PL server adapter and a focused React training player. Show three choices in an empty chat and a Learning guide entry point for returning users. Render explanations, process diagrams, proposed/confirmed/open distinctions, prompt previews and staged example actions. Preserve existing user drafts until an explicit replacement confirmation.
6. Validate service and PL integration: content/version schema, signature tampering/expiry, cross-user/tenant isolation, duplicate and conflicting progress, publication compatibility, unavailable service, installed-capability filtering, browser prompt prefills, no automatic send, guided progress/resume and direct-mode preference.

## Scope boundaries

No autonomous training-maintenance agent, LMS administration UI, live EAL sandbox, production deployment, SAP connectivity, real deployment lab, or full enterprise-scale infrastructure is claimed here. Those require separately qualified capabilities. The sample explains deployment and EAL using simulated learning steps. A future verified practice-app binding can add the real handoff without allowing lesson content to select arbitrary endpoints.

## Acceptance

- A new PL user learns what PL does through three clear starting choices without typing.
- Explanatory lessons are available from the service, not hard-coded in PL.
- Relevant prompt previews can be copied into the composer; creating/sending/building remains explicit.
- Active users can reopen the guide and use contextual suggestions without losing chat history.
- Example progress and guidance preference survive reload and remain isolated by user/tenant.
- Existing learner attempts retain their content version after publication.
- Training outage does not disable the normal PL chat.
- Final status records actual tests and any remaining limitations. No claim of real business execution from lesson completion.
