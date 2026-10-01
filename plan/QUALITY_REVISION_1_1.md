# Training quality revision and new-user acceptance

13 September 2026. Revised after the user correctly identified that the first UI resembled a help webpage and did not teach enough about PL.

## What changed

- Replaced the boxed welcome panel, duplicate lesson navigation and visible mode-switch buttons with a conversation-oriented learning surface.
- Learners choose a direction; the guide shows the selected question, a substantive answer, a concrete example and a next step. Secondary preferences are tucked away.
- Added four business-oriented capability explanations, before/after workflow context, a sample request application view, role responsibilities, stage-by-stage deliverables, concrete decisions and useful prompt examples.
- Kept integrations conditional on configured, verified capability; no promise that an installed design capability alone delivers SAP or Microsoft integration.
- Published content version 1.1.1. Older packages remain available; older attempts retain their version. New example visuals belong to the versioned step rather than borrowing another package's content.
- The composer and unrelated project setup panels are hidden while learning is open; returning to chat restores them without sending a message.
- Fixed empty-project startup so a new user's empty primary chat can reopen after reload.
- Starting a practice attempt no longer silently changes the user's persistent guidance preference.

## Actual browser checks

A dedicated account was created through PL's normal signup flow. Credentials are stored privately and omitted here.

- First login displayed beginner guidance before any project or typed prompt.
- Installed capabilities were retrieved from PL, with execution-readiness limits explained.
- The ten-step original example completed through the UI; required choices, recommendation, pause, reload and completion worked.
- Explicit project-and-draft action created one project and populated its composer. The session remained Ready, with no model request/build automatically started.
- Existing-draft replacement requested a choice; cancellation retained the original draft.
- Direct preference and completed training persisted across reload.
- Temporarily stopping only Platform Training left PL's API ready and composer enabled. Restart plus Retry restored training and preference.
- Revised capability, journey and role views were inspected through PL after publication.
- Composer was not visible over the revised guide. A real draft was prepared and returned to the normal composer without submission.
- The old completed attempt still displayed edition 1.0.0 after publication.
- A new attempt loaded edition 1.1.1, retained a sample visibility decision, displayed the example app at the screen stage, resumed at step five after reload and completed all ten steps.
- At a 390px viewport the page did not overflow horizontally; the guide measured 335px wide. The viewport override was reset.

## Automated checks

Seven service tests pass, including backward package compatibility, request signing, stage/capability filtering, progress rules and PostgreSQL learner isolation/idempotency. Four PL adapter tests and four existing sidebar tests pass. API/UI builds pass. The existing UI bundle-size warning remains.

## Limits

These checks establish implementation behavior, not proof that a novice has learned the platform. The deeper content and revised interaction need user feedback. This remains prepared, versioned learning content with dynamic capability/context selection; it is not an autonomous tutor or automatic training author. No real app build, deployment, EAL business operation or live integration was performed by this campaign.
