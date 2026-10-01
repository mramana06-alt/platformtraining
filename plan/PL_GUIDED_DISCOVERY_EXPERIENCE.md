# PL onboarding and guided discovery: proposed product experience

**Design proposal — 11 September 2026.** This document describes the desired PL experience, not functionality already deployed. No application changes were made. The separate Enterprise Assistant on port 8811 currently provides knowledge access; its onboarding must not advertise PL execution before that integration and authority are enabled.

## 1. Product decision

Replace the blank chat with a useful invitation, then let the workspace progressively become the user's project. Onboarding should happen while accomplishing a real task. It should not be a mandatory tour, a long requirements questionnaire, or a second workflow engine separate from PL.

Use one underlying discovery system with two presentation modes: **Guide me** and **Direct**. New users receive explanations, examples and recommended next steps. Experienced users get concise interpretation, relevant project state, deltas and direct actions. Users can change guidance at any time; experience with PL must never imply technical expertise or broader permissions.

A person may be an experienced business analyst but new to PL, or an experienced PL user entering an unfamiliar domain. Adapt to the current task and explicit preference. Do not force a role/persona questionnaire before the first useful response.

## 2. First screen: exact proposed copy

**Heading:** Turn an idea or business problem into an application.

**Explanation:** Describe what you want to improve. I’ll help you understand the problem, map the workflow, and develop a practical application plan. We can then work through design, build, testing and release as your workspace allows.

**Primary prompt:** What would you like to improve or build?

**Three starting choices:**

- Build or improve an application — Start with an idea, an existing app or a process that needs better support.
- Improve a business process — Find where work slows down and explore what should be automated.
- Explore an example — Try a clearly labeled sample before starting your own project.

**Example prompts:**

- Our employees submit service requests by email. Help me organize the process.
- We have an order-management application. Help us add an approval workflow.
- I want a customer onboarding portal, but I’m not sure what it needs.

**Composer placeholder:** Describe the idea in your own words. A few sentences are enough.

**Secondary link:** See the development journey.

The journey expands to five short stages: Understand → Shape → Design → Build and test → Release and improve. Initially show only the active stage prominently. Link each stage to a plain-language explanation and the artifact it produces. Do not show a technical module catalog or a complete checklist of every later question.

Only show actions admitted by the current user's workspace capabilities and permissions. For a discovery-only workspace, say “develop an application plan” and explain the delivery handoff when relevant. Do not offer working deployment buttons backed by unavailable capabilities.

## 3. Interaction model: propose, show, ask

Every meaningful discovery turn should generally contain:

1. A concise interpretation of the user's latest input or correction.
2. Useful proposed work: a short draft, process sketch, comparison, example or recommendation.
3. An updated understanding state, preferably reflected in the canvas rather than repeated in full chat.
4. One decision or question that most improves the next step.

Use one primary question by default. Two closely related questions can be grouped when easier to answer together; longer checklists belong in optional review views. These are proposed UX defaults, not rigid runtime limits. If no answer is necessary, continue the authorized drafting work.

Prefer “I suggest starting with employees submitting requests and a manager assigning them. Who should handle incoming requests?” to “Provide functional requirements, actors, RBAC, workflow, entities and NFRs.”

Offer concise answer choices plus free text, “Not sure—recommend an option,” and “Decide later” where deferral is legitimate. Explain why a question matters. An unanswered question is not consent, and a recommendation is not a confirmed fact.

## 4. New-user journey, step by step

### Step A — Enter naturally

The user can type a problem, select a starter, open a sample, or attach an existing brief using the product's approved upload flow. Do not require a project name, application stack or integration setup first.

Example user: “We receive employee requests through email and spreadsheets. Things get lost.”

Proposed assistant: “A shared request workspace could help employees see progress and managers assign work. I suggest a first version with request submission, a shared queue and status tracking. I’m assuming this is for internal employees; that is still a draft assumption. Who handles incoming requests today: one team or several?”

The first canvas contains a problem statement and a provisional process: Submit request → Review → Assign → Resolve. This is labeled **Proposed process**, not “Your current process.” The user can correct it before PL has any internal evidence.

### Step B — Ground the business problem

Establish the current pain, affected people, the desired change and an observable success measure. Infer a draft objective but do not invent a baseline or promised savings.

Example: “The first goal is to prevent requests from being lost. Later we can compare unassigned requests and resolution time with your current process. We don’t have a baseline yet.”

Ask about the current bottleneck before collecting every field. If the user's input already contains an answer, retain it rather than asking again.

### Step C — Map users and the main journey

Propose the smallest useful set of actors and a happy-path process. Ask about the distinction that changes access or routing. Example: “Should employees see only their own requests, or the whole queue?”

Show roles as “Person / What they need to do / What they can see.” Technical role identifiers and permission scopes are optional detail. Introduce exceptions after the main path: rejection, reassignment, cancellation, overdue requests and missing information.

### Step D — Shape the first useful release

Present a small recommended scope with three lists: Included now, Later, and Needs a decision. Explain trade-offs without converting suggestions into commitments.

Example included scope: create request, view progress, manager queue, assign and resolve. Example later scope: SMS reminders, complex SLAs and external customer access. Billing or other unrelated scope should not appear merely because a generic template includes it.

Use “Does this first version address the main problem?” as a meaningful checkpoint. A scope change updates only affected sections. Do not restart the complete interview.

### Step E — Make the experience visible

Generate low-fidelity screen sketches from the agreed journey. For the request example: Submit request, My requests, Team queue, Request details. Highlight how each screen supports a business action.

Ask a concrete question while the user can see the consequence: “Managers will use this queue to assign requests. Should assignment be manual initially?” Avoid cosmetic questions before workflow and access are understood.

Screens are labeled **Draft**. Generated UI images or wireframes are not working application evidence. Provide an accessible textual equivalent.

### Step F — Discover data and system connections

Propose business entities and data needs from the process: Request, Requester, Assignment, Status history. Separate the logical model from physical tables and API payloads.

Determine whether data already exists in another system and which system owns it. Use authorized platform knowledge first; show the source and any freshness gaps. Ask the user only where information is unavailable or where a business choice is needed.

Introduce APIs in plain language: “The app needs operations to submit a request, list permitted requests and update an assignment.” Show exact methods, paths and schemas only when a verified contract exists or when clearly proposing a new design.

An integration diagram distinguishes Existing, Proposed and Unverified connections using labels and line styles. Connecting a live system is a separate authorized action; discussing one is not permission to connect.

### Step G — Resolve architecture and security at the right time

Offer a recommended architecture based on known requirements and the customer's supported environment. Show alternatives only where they change a meaningful outcome: cost, compliance, operational burden, scale or integration complexity.

Surface sensitive data, external users, irreversible actions and regulated processes early when they materially change the design. Security is progressively detailed, not postponed until the end. Ask infrastructure administrators for facts ordinary business users cannot provide; let discovery continue on unrelated dimensions.

The architecture diagram should distinguish logical design from verified deployed topology. “Use the existing customer identity service” is a proposal until its availability and binding are verified.

### Step H — Review an actionable discovery blueprint

Produce one coherent blueprint: business goal, users, process, first-release scope, screen map, capabilities, logical data, APIs/integrations, architecture, security requirements, acceptance criteria and deployment assumptions.

Present only remaining blockers at the top. Avoid asking the user to reconfirm every previously accepted detail. Suggested transition: “The first-release scope and main workflow are clear enough to start design. Two deployment details can be resolved before release.”

Readiness is stage-specific. Discovery can be sufficient for design while deployment credentials remain unresolved. A green “Ready to build” label requires the actual PL build prerequisites and authority, not merely the model's confidence.

### Step I — Continue into delivery without a second onboarding

The same workspace progresses to design, build planning, implementation, qualification and release. Show the relevant work product, current status, pending decision and next action.

Automatic drafting and other authorized routine work can continue under the user's delegation. At a material boundary, show the concrete proposed action, affected environment, cost/risk where known and any required authority. “Start development build” and “Release to production” must never be represented as the same consent.

Testing shows requirements covered, tests actually executed, failures and unresolved coverage. Release shows the exact version/environment and outcome evidence. A working-looking preview is not a successful deployment.

## 5. Worked first-time conversation

| Turn | User or platform behavior | Canvas update |
|---|---|---|
| 1 | User describes requests being lost in email | Problem and proposed request journey |
| 2 | PL suggests a simple request workspace and asks who handles intake | Draft scope; intake owner unknown |
| 3 | User says Facilities and IT use separate queues | Two queue lanes; owners confirmed by user |
| 4 | PL updates routing and asks whether employees see only their own requests | Roles and visibility decision |
| 5 | User confirms own-request access; managers see their team queue | Permission matrix updated |
| 6 | PL proposes submission, own-request list and team queue screens | Click-through wireframe or screen map |
| 7 | User says assignment should be manual for the first release | Manual assignment decided; automation deferred |
| 8 | PL proposes Request and Status history entities, then checks existing identity/data evidence | Logical data and integration map |
| 9 | User says no existing request system; corporate login is required | New application boundary; identity binding unverified |
| 10 | PL presents a blueprint, design recommendation and only material remaining blockers | Ready-for-design review |

This is an illustration, not a ten-turn script every project must follow. A detailed brief may compress it to two or three interactions; a high-risk project may need more. First value should come before the full blueprint.

## 6. Returning and experienced users

### A. Returning to active work

Replace the welcome lesson with a project-resume summary:

“Service Request Hub — Discovery. Last saved: team-specific queues, employee own-request visibility and manual assignment. Next: review the proposed screens. One unresolved item: the corporate-login integration.”

Primary action: **Continue with screens**. Secondary actions: **Review decisions**, **Change scope**, **Start something else**. Show where the resume information came from and mark older observations as historical where appropriate. Do not describe a saved status as a live deployment check.

### B. Experienced user starting a new project

Accept a dense instruction: “Extend the supplier portal with two-stage invoice approval, reuse corporate login and the existing supplier API, and deploy to Development.”

Extract a draft change set, consult authorized existing context, show impacted artifacts and ask only blocking questions. Do not repeat “What is an API?” or force the user through all discovery topics. Offer optional technical views for contracts, dependencies and environment bindings.

### C. Experienced user changing an existing application

Start with baseline versus proposed change. Identify current application/version/environment and obtain available evidence. Show affected users, screens, contracts, data migrations, tests and rollback needs.

Example: “Adding regional approval affects the approval flow, manager permissions and audit history. I found the current supplier API contract. The threshold for escalation is not specified—what amount should trigger regional approval?”

Do not silently accept the user's description as verified deployed behavior. If repository or runtime evidence is missing, mark the baseline as user-described.

### D. Expert with an exact instruction

Allow direct navigation to the relevant capability: “Review the API design,” “Compare these two architectures,” “Run the approved test suite,” or “Resume the failed Development build.” Interpret scope and authority, then act through PL. Skip educational copy, not mandatory policy or evidence gates.

### E. Existing user in an unfamiliar area

Offer contextual help when the user asks “What does this mean?” or repeatedly defers a decision. Expand the relevant explanation and example; do not reset them to first-time onboarding. “Guide me through deployment” should enable guidance only for that part of the journey.

### F. Returning after a long gap

Show what was last agreed, what has changed since, and which assumptions need revalidation. Preserve history. Reauthorize protected sources separately; stale evidence should not delete chats or force users to repeat their original goal.

## 7. Information architecture and progressive canvas

| Surface | New user | Experienced user |
|---|---|---|
| Header | Project goal and current stage | Project/version/environment and current task |
| Left navigation | Recent projects and conversations | Active work, history and direct project navigation |
| Conversation | Short explanations, examples and one next question | Concise findings, deltas and actions |
| Main canvas | Start invitation, then a growing project map | Current artifact or change-impact view |
| Understanding panel | Compact state with expandable detail | Searchable/editable decision and evidence ledger |
| Composer | Natural-language example placeholder | Direct instruction and optional attach/context actions |

On narrow screens use tabs for Conversation, Project view and Decisions rather than compressing three columns. Keep questions and their related visual near each other. Opening a diagram should preserve the conversation's scroll position and draft text.

Do not display every artifact at once. Show the one that supports the current decision; retain previous versions in the project record. Examples are clearly marked sample data and never mixed with the customer's canonical project.

## 8. Understanding and decision states

Continuously maintain separate categories:

- **Understood:** the platform's current interpretation of the request.
- **Confirmed:** facts supplied/confirmed by the user or supported by an identified authoritative source; show which.
- **Decided:** an explicit business/design choice and its rationale/owner.
- **Assumed:** a provisional premise with impact and validation need.
- **Open:** a missing fact or decision, including when it becomes blocking.
- **Deferred:** consciously outside the current increment or scheduled for later.

Never promote an assumption to a decision because the user moved on. When a correction arrives, supersede the old item and preserve its history. Explain downstream impact: “Changing external users to employees affects sign-in and permissions; I updated those drafts. The submission fields are unchanged.”

The panel should normally show three to five relevant items with a “View all” expansion. Avoid repeating the full ledger after every message. Show newly changed items prominently without alarming users about unchanged facts.

## 9. Question-selection policy

Before asking, PL should check the latest request, accepted decisions, existing project artifacts and permitted enterprise evidence. It should ask when the answer is materially necessary, cannot be reliably obtained elsewhere and changes the next useful action.

| Situation | Recommended behavior |
|---|---|
| Safe, reversible design choice with a reasonable default | Propose a labeled default and continue drafting |
| Missing business rule affecting workflow | Ask one contextual question with examples |
| Fact available from an authorized connected system | Retrieve it and show provenance |
| Connection unavailable | Explain the limitation; use a labeled placeholder or ask for an approved source |
| High-impact or irreversible action outside delegation | Present the specific proposed action and obtain required authority |
| User does not know | Explain options, recommend one and allow deferral if safe |
| Conflicting answers | Show the exact conflict and ask only what resolves it |
| Topic already answered | Reuse the current accepted answer |
| Nice-to-have detail not needed for this stage | Defer visibly |

Prioritize questions by impact on the next decision, risk of a wrong assumption and effort for the user. Do not expose a model confidence number as proof of certainty. If repeated questioning stops making progress, synthesize what is known, identify the unresolved dependency and offer a useful next step or handoff.

## 10. Visual-selection policy

| Discovery need | Visual | Required qualification |
|---|---|---|
| Overall delivery journey | Small stage map | Active stage and next checkpoint; no fabricated completion percentage |
| Current versus future process | Swimlane or process flow | Distinguish observed current process from proposed future process |
| People and actions | Role/permission matrix | Explicit scope and unresolved rights |
| User experience | Wireframe, screen map or interaction flow | Draft versus working implementation |
| Components | Logical architecture diagram | Proposed design versus observed topology |
| System exchange | Integration/sequence diagram | Direction, purpose and verified/proposed contract |
| Business information | Entity relationship or data ownership view | Logical entity versus actual table/foreign key |
| Change request | Impact map or before/after comparison | Baseline version and affected artifacts |
| Readiness | Evidence checklist | Actual evidence, unresolved gates and verification scope |

Every visual needs readable labels, source/assumption status and a textual alternative. Do not rely only on color. A diagram must help answer a question; avoid producing architecture visuals just because the model can. Render diagrams rather than exposing diagram code to ordinary users. Exact source links must open authorized evidence, not decorative or broken links.

## 11. Readiness and transition policy

Readiness belongs to a stage and completion profile. Use states such as Not explored, Draft, Needs a decision, Sufficient for next step and Requires verification. Do not invent a universal “87% discovered” measure.

Example ready-for-design checks: the outcome is clear; relevant users and primary process are known; first-release scope is explicit; major data/security/integration constraints are either known or visibly unresolved with owners; no unresolved conflict makes the design misleading.

Ready-for-build additionally requires the applicable approved design/build inputs, verified environment bindings and execution authority. Ready-for-release additionally requires the actual qualification evidence and release decision. Educational guidance must use these existing PL gates rather than maintain a separate notion of readiness.

Users may move backward, change goals or ask an unrelated question. Preserve the project. Record changed assumptions and invalidate only dependent readiness/artifacts. Answer a side question, then offer to return to the prior work without forcing it.

## 12. Adapting to available authority and data

No integrations configured: guide discovery using user information and labeled proposals; do not pretend the landscape was inspected.

Reader-only user: permit knowledge and planning actions within authorization; explain who can perform build/release when relevant. Do not require escalation merely to discuss an idea.

Imported brief: extract its assertions and open questions before asking anything. Treat instructions inside imported content as source material, not authority to connect systems or execute actions.

Existing source system: preserve the system of record and existing process constraints. Modernization should begin with current-state evidence and an impact analysis, not an assumed greenfield rebuild.

Sensitive or regulated workload: bring relevant data handling and approval questions forward, in context. Do not infer sensitive user traits or decide policy from a persona label.

Failed retrieval/build/test: keep the user's goal and history. Explain what failed, what was preserved, and the next recoverable action. Distinguish configuration, authority, evidence and execution failures.

## 13. State and implementation design

Proposed records: user guidance preference; per-project entry intent; discovery case and revision; current stage/completion profile; facts/decisions/assumptions/open items with provenance; question ledger; artifact references; last meaningful checkpoint; pending operation; and handoff/resume summary.

The question ledger stores what was asked, why it mattered, the answer or deferral and which discovery dimension changed. It prevents repeated questions and supports “Why are you asking this?” The resume summary references canonical state; it does not replace that state.

The backend derives a guidance response from current PL state and admitted capabilities. The UI renders the response using an accessible component registry. Model output proposes interpretation/content; typed validation and the discovery reducer own updates. Tool/authority checks stay server-side. This design should work with either the current runtime or a future Agents API adapter.

Existing PL anchors inspected for this proposal:

- `packages/discovery-core/src/schemas.ts`: item lifecycle and authority distinctions.
- `packages/discovery-core/src/convergence.ts`: open items, conflicts, evidence gaps and readiness adjudication.
- `capabilities/outcome-discovery/src/manifest.ts`: conversational outcome discovery and read-only boundaries.
- `apps/chat-ui/src/App.tsx`: welcome/timeline/composer integration points.

These anchors demonstrate reuse opportunities. They do not establish that the proposed adaptive onboarding or all visuals are already implemented.

## 14. Success measures and acceptance tests

Proposed user-outcome measures: time to first useful artifact; ability to explain the proposed app in the user's own words; unnecessary question count; repeated-question rate; completion of a usable discovery checkpoint; successful return to interrupted work; correction retention; and downstream rework caused by missed discovery.

Do not optimize only for fewer questions or faster build starts. Those can conceal misunderstandings. Measure unauthorized-action attempts, unsupported claims and false readiness as hard failures. Use a small consented usability study with both business and technical participants before setting numerical product targets.

Required scenarios:

1. New user with a vague business problem gets useful direction before a questionnaire.
2. New user who chooses an example can distinguish sample from real project data.
3. User who says “I don’t know” receives a recommendation and continues where safe.
4. Experienced user supplies a full brief and is not asked already answered questions.
5. Existing-app request produces a baseline/change view rather than a greenfield assumption.
6. Mid-discovery correction updates relevant artifacts while preserving decisions/history.
7. Return after expiry/restart restores progress and revalidates protected evidence independently.
8. Reader-only user does not see falsely executable build/release actions.
9. Missing API/schema evidence stays explicit; diagrams do not invent interfaces or tables.
10. Keyboard, screen-reader, mobile and slow-network users can complete the same core journey.
11. Offline integration does not cause the platform to claim it inspected the enterprise.
12. Stage transition follows actual PL policy; guidance never manufactures approval.

## 15. Recommended delivery sequence

**MVP:** capability-aware first screen, three entry choices, guided/direct preference, a propose-show-ask response, persistent understanding panel, basic process and screen-map visuals, stage-specific readiness and a returning-user resume summary. Start with one qualified request-management example and label it as a sample.

**Next:** imported-brief extraction, existing-app impact discovery, role-aware help, deeper architecture/integration/data visuals, explicit scope deltas and usability analytics.

**Later:** richer interactive prototypes, industry-specific guidance packages, cross-project suggestions and advanced evidence-assisted discovery. Add these based on user results, not by putting the entire platform catalog on the welcome screen.

The initial product should help a novice produce a coherent first application blueprint and let an experienced user resume or change work without repeating onboarding. Both journeys share the same authoritative project state and delivery controls.
