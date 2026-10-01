export const answersB = [
{id:20,group:'People, control and quality',title:'How does the platform ensure that generated applications meet requirements and are technically correct?',related:[21,22,32],answer:`The platform should combine traceable requirements, constrained implementation and independent checks. It cannot guarantee correctness simply because an AI generated plausible code or a browser preview looks convincing.

### Start with testable requirements
Convert broad goals into observable behavior. For a request app: an employee can submit valid data; invalid input is rejected without persistence; employees cannot access another user's private records; the manager can perform only the permitted transitions.

### Connect the plan to implementation
The build plan should name expected artifacts, dependencies, access boundaries and verification steps. Generated files and changes should be attributable to that plan and isolated to the permitted workspace.

### Examine actual results
Use the applicable combination of schema validation, type checking, build checks, unit tests, integration tests, browser tests and business review. Record what ran, against which version/environment, and what was not covered.

### Treat failures as information
A failed test can trigger bounded correction and another verification attempt, or require a developer/business decision. Do not relabel an unexecuted check as passed to complete the workflow.

**Readiness means evidence satisfies the applicable criteria.** It does not mean the agent is confident, every test in the world passed, or future defects are impossible.`},
{id:21,group:'People, control and quality',title:'How are testing, validation, code review, security review, and quality checks handled?',related:[20,22,23],answer:`Different checks answer different questions. PL should identify which are applicable, execute them through qualified capabilities or integrations, and preserve their actual outcomes.

| Check | What it establishes | What it does not establish alone |
|---|---|---|
| Schema/type/build validation | Artifacts conform to expected structures and compile/build | Correct business behavior |
| Unit tests | Selected logic behaves as specified | Complete integration correctness |
| Integration tests | Particular contracts and dependencies work together | All environments or failure conditions |
| Browser tests | Selected UI journeys and accessibility behaviors | Full application security or performance |
| Code review | Implementation risks and maintainability concerns are examined | Runtime success without execution evidence |
| Security review | Threats, access rules and relevant controls are assessed | A universal security guarantee |
| Business review | Users' intended outcomes are met for the reviewed scope | Technical correctness outside that scope |

### Plan coverage explicitly
Include negative cases, role boundaries, retries, duplicate submissions and migration behavior where relevant. A simple app and a multi-system enterprise app need different coverage.

The platform contains verification and policy mechanisms, but not every external scanner, penetration test or review service is necessarily installed. Unsupported checks must be identified and assigned to an appropriate process, not silently omitted.`},
{id:22,group:'People, control and quality',title:'How does the platform know when an application is ready to move from development to testing and then to production?',related:[7,13,21],answer:`Readiness should be evaluated against the gate for the next environment and the exact candidate version. It is not one universal completion percentage.

### Development to testing
Typical prerequisites include a reproducible candidate, compatible configuration and dependencies, a prepared test environment, defined acceptance criteria and appropriate test identities/data. A successful local build may be necessary but is not enough.

### Testing to staging or production
Review the applicable functional, integration, access, security, performance and recovery evidence. Confirm the release artifact, migration plan, operational requirements, deployment target and release authority. Staging should represent the production-relevant conditions it is intended to test.

### Version and scope matter
Tests for version 1.0.1 do not automatically qualify 1.0.3. A browser-read check does not establish create/update behavior, and a synthetic Development test does not prove current production health.

### How PL should present the decision
Show **satisfied checks**, **missing evidence**, **blocking decisions** and the next admitted action. Report a blocked or partial state when appropriate.

The current project's available targets and promotion adapters must be checked. This explains the required lifecycle behavior; it does not certify that every customer's production pipeline is already integrated.`},
{id:23,group:'People, control and quality',title:'How are errors, failed builds, failed tests, or deployment problems handled?',related:[17,20,35],answer:`An error should produce a recoverable, attributable state—not erase the goal or encourage blind retries.

### First identify the kind of failure
- **Understanding or requirements:** resolve a contradiction or missing decision before continuing.
- **Configuration or authority:** correct the missing binding, credential or permission through the appropriate owner.
- **Build or test:** inspect the failed command/check and determine whether a bounded implementation correction is permitted.
- **Deployment/runtime:** inspect the actual target state; distinguish failed deployment from an unhealthy application after deployment.

### Recover carefully
PL's bounded execution, timeout, retry, cancellation, checkpoint and idempotency mechanisms support recovery. The particular tool and downstream system still determine whether retrying is safe. If an operation may have succeeded before the response was lost, reconcile its outcome instead of performing it again automatically.

### Preserve evidence
Keep the version, attempted action, error, relevant logs and any resulting artifacts. A retry should be a new attributable attempt against known state. If correction limits are exhausted, explain what remains blocked and what decision or repair is needed.

Rollback is not always just restoring an old binary. Database migrations and external side effects may require compensation or a forward fix. The recovery plan must match those effects.`},
{id:24,group:'Application complexity',title:'If I ask the platform to build a very simple application, approximately how much effort and time should I expect?',related:[27,28,21],answer:`There is no verified platform-wide delivery-time benchmark in this prototype. A useful estimate separates the time to generate a preview from the time to produce a reviewed, tested and deployable application.

### Illustrative planning range—not a promise
For a small, supported app with one main entity, a few screens, synthetic data, no external integration and an already configured environment, a first preview may be achievable in **minutes to hours**. Producing a reviewed Development candidate can take **hours to a few working days**, depending on clarification, corrections and verification. Production readiness needs a separate estimate.

### What makes the biggest difference
How clearly the business rules are stated; whether the delivery profile already fits; whether identity/database/runtime bindings are ready; the required access rules; the quality of acceptance criteria; and whether builds or tests uncover unexpected issues.

### A sensible pilot
Choose a one-entity example such as a visitor log or equipment register. Agree on a short acceptance checklist, then measure discovery time, generation time, human review time, correction attempts and deployment verification separately.

The first project usually includes setup work that later projects can reuse. Do not estimate future customer work from a scripted training demo, cached artifact or one unusually fast run.`},
{id:25,group:'Application complexity',title:'How would the development approach change for a moderately complex enterprise application?',related:[26,27,29],answer:`A moderately complex app needs more explicit coordination between requirements, access, data, integrations and verification. The work should be split into useful increments rather than sent as one large “build everything” request.

### Example: an internal purchase-request application
It might have employees, managers and finance reviewers; approval thresholds; attachments; status history; notifications; and one configured external integration.

### How the approach changes
1. Map the main process and exceptions, including rejection and resubmission.
2. Define role and record visibility carefully.
3. Agree on ownership of supplier, employee and request data.
4. Verify external API contracts, identity and environment bindings before integrating.
5. Deliver an initial vertical slice, such as request submission through manager approval.
6. Add further rules/integrations in separate qualified increments.
7. Expand integration, regression, recovery and business acceptance coverage.

### Human involvement
Business rules and architectural trade-offs need more review. Developers may need to implement unsupported behavior or adapters. AI can reduce drafting and implementation effort, but it does not eliminate coordination or qualification work.

The process still uses discovery, requirements, design, build and release artifacts; those artifacts become more detailed and their dependencies more consequential.`},
{id:26,group:'Application complexity',title:'How would the platform handle a highly complex application involving multiple systems, integrations, APIs, databases, security requirements, and business processes?',related:[9,17,27],answer:`Treat this as a coordinated delivery program with bounded application and integration increments. A single generated app is not a substitute for enterprise architecture, data ownership and operational governance.

### Establish the system boundaries
Identify business capabilities, systems of record, APIs, data classifications, identity domains, environments and owners. Verify the current landscape and contracts from authorized evidence. Where information is incomplete, keep it explicitly unverified.

### Design for coordination and failure
Specify cross-system authorization, version compatibility, asynchronous work, retries, duplicate handling and compensation. Decide where each transaction is authoritative; do not imply that a shared agent or Brain makes multiple databases one atomic transaction.

### Deliver in vertical slices
For a supplier-onboarding workflow involving ERP, CRM and document services, start with one complete low-risk path. Qualify each connector and environment, then introduce additional rules and systems with regression checks.

### Expand assurance
Include threat analysis, contract tests, load and recovery testing, data migration rehearsals, operational ownership and release coordination. Independent review becomes more important.

PL can coordinate supported work and retain its evidence. Unsupported stacks, connectors or operating requirements need additional engineering. This architecture is a candidate approach, not proof that arbitrary multi-vendor enterprise delivery is already automatic.`},
{id:27,group:'Application complexity',title:'What factors determine whether an application is considered simple, medium, complex, or enterprise-scale?',related:[24,25,26],answer:`Complexity is driven by interactions, risk and operational requirements—not just the number of screens or lines of code.

| Factor | Lower complexity | Higher complexity |
|---|---|---|
| Process | One straightforward workflow | Many exceptions, approvals and long-running states |
| Users/access | Few roles and simple scope | Multiple organizations, delegated roles and sensitive data |
| Data | One clear owner and a small model | Multiple systems of record, migration and reconciliation |
| Integrations | None or a familiar verified API | Many external systems and changing contracts |
| Availability/performance | Small Development pilot | Strict throughput, resilience and recovery objectives |
| Delivery | One team and one target | Coordinated teams, environments and releases |
| Compliance | Basic internal requirements | Regulated processes and independent assurance |

### Practical classification
**Simple:** a narrow problem with a supported profile and few uncertain dependencies. **Moderate:** several roles/rules or a verified integration. **Complex:** significant cross-system coordination, security or migration risk. **Enterprise-scale:** operational scale, organizational boundaries and governance add requirements beyond functional complexity.

An app can be functionally small but high-risk—for example, one screen that changes financial approvals. Reassess classification when new dependencies or constraints are discovered rather than assigning an immutable label from the first prompt.`},
{id:28,group:'Application complexity',title:'Can you give me an example of a simple application, a moderately complex application, and a highly complex application that could be built using this platform?',related:[24,27,29],answer:`These are illustrative candidates. Whether each can be delivered in your workspace depends on the supported stack, available integrations and required assurance.

| Example | Proposed scope | Why it has that complexity |
|---|---|---|
| **Simple: visitor sign-in log** | Capture a visitor, list entries and record departure | Small data model and a short internal workflow |
| **Moderate: equipment loan service** | Employees request assets; coordinators allocate them; managers review exceptions; track returns | Multiple roles, availability rules, status transitions and possibly notifications |
| **Highly complex: supplier onboarding and purchasing workflow** | Coordinate ERP supplier records, CRM contacts, document review, approvals and downstream purchasing | Cross-system ownership, sensitive data, multiple contracts and compensation/reconciliation |

### What not to infer
The third example is not a claim that the customer's SAP, Microsoft or other systems are already connected. It requires discovery of actual interfaces, identity policy, test environments and qualified adapters.

### A useful selection rule
Choose the smallest example that teaches or proves the next capability you need. A simple training app is appropriate for learning PL. An enterprise integration pilot should test a real contract and failure path, not merely resemble an enterprise application visually.`},
{id:29,group:'Application complexity',title:'For each of those examples, explain how the development process would differ.',related:[28,21,30],answer:`The lifecycle remains recognizable, but the depth of discovery, number of increments and verification burden change.

| Activity | Visitor log | Equipment loan service | Multi-system supplier workflow |
|---|---|---|---|
| Discovery | Clarify fields and a short user journey | Resolve allocation, returns, exceptions and roles | Map organizations, systems of record and full process boundaries |
| Design | Few screens and one small data model | Multiple views, state rules and concurrency | Explicit API/event contracts, ownership and failure/compensation design |
| Delivery | One small vertical slice may be enough | Several qualified increments | Coordinated application and integration slices |
| Testing | Validation, access and main browser path | Role matrix, competing allocations and regression | Contract, security, migration, performance and recovery campaigns |
| Release | Verify one admitted target | Plan data/configuration changes | Coordinate compatible releases across owners and environments |

### The difference is not “more prompts”
Complexity should lead to more precise boundaries and evidence, not an endless interview. PL should retrieve what is available, propose concrete alternatives and ask humans about material business decisions.

### Carry learning forward
A successful earlier slice can contribute patterns and evidence to later work. It should not become blanket approval for another app, version or environment. Each increment still needs its own applicable checks.`},
{id:30,group:'Complete lifecycle',title:'Walk me through the complete end-to-end application delivery process using this platform.',related:[31,32,37],diagram:'lifecycle',answer:`Consider a Service Request Hub replacing email-based requests. The end-to-end process connects what the business wants to the evidence that a particular application version works in its intended environment.

### Define and design
Start with the lost-request problem. Discover employees, managers, team queues and exceptions. Agree on a first release: submission, own-request tracking, manager assignment and resolution. Produce requirements and acceptance criteria, then review screens, permissions, data ownership and component/API design.

### Plan and implement
Create the applicable build plan with explicit inputs, permitted changes, dependencies, verification and rollback guidance. Confirm environment and integration prerequisites. Authorized tools build the supported increment and preserve its artifacts and results.

### Verify and release
Run the relevant technical and business checks. Investigate failures or missing coverage. Review the candidate against the goal, then make the applicable release decision for the exact version and target. Deployment success requires a real outcome and target verification.

### Operate and improve
Users operate the app through its UI or a qualified EAL experience. Configured operations services provide health and business observations. Those observations, issues and user feedback can inform a new PL change request.

The loop returns to discovery when the next improvement is needed. Production monitoring and continuous improvement require explicit integrations and ownership; they do not appear automatically because the build completed.`},
{id:31,group:'Complete lifecycle',title:'Start with a business idea and explain how it moves through discovery, requirements, solution design, planning, development, testing, release, deployment, operations, and continuous improvement.',related:[30,32,35],answer:`Start with this business idea: “Employees should know who is handling their request and when it is resolved.”

| Stage | How the idea becomes more concrete |
|---|---|
| Discovery | Establish the current email problem, employee/manager roles and main process |
| Requirements | Define submission, visibility, assignment, status rules, validation and acceptance criteria |
| Solution design | Connect employee screens, manager queue, authorized operations and application-owned data |
| Planning | Select the first increment, exact dependencies, permitted effects and verification steps |
| Development | Produce or change the admitted application artifacts |
| Testing | Execute checks for expected behavior, access boundaries and relevant failure paths |
| Release | Identify the candidate version and evaluate applicable release gates |
| Deployment | Place the authorized release in the configured target and verify the outcome |
| Operations | Observe runtime behavior and support actual users through configured services |
| Continuous improvement | Turn measured problems or useful feedback into another scoped delivery increment |

### The thread connecting the stages
The original goal, decisions and evidence remain linked. If operational evidence later shows assignment delays, the next increment might add routing suggestions. That change should be justified by observed need and qualified again; it is not an invitation for an agent to modify production without authority.`},
{id:32,group:'Complete lifecycle',title:'During the end-to-end process, what artifacts does the platform create at each stage?',related:[5,20,34],answer:`The exact artifact set depends on the installed delivery profile and applicable stages. These are typical artifacts to expect or require—not a claim that every profile automatically produces all of them.

| Stage | Typical artifacts | Why they matter |
|---|---|---|
| Discovery | Blueprint, user/process map, assumptions, open issues | Preserve the intended problem and scope |
| Requirements | Versioned requirements, business rules, acceptance criteria | Define observable success |
| Design | Screen map, architecture, data and API/integration design | Explain how the application should work |
| Build planning | Dependency-pinned build plan, verification and recovery guidance | Bound the implementation contract |
| Development | Source/artifact sets, dependency/runtime configuration, migration files where applicable | Capture the produced implementation |
| Verification | Build logs, test outcomes, browser/review evidence and gaps | Establish what actually ran and passed |
| Review/release | Business review, release identity and approval/decision records | Connect acceptance to an exact candidate |
| Deployment | Target binding, deployment receipt and runtime observation | Establish which version was deployed where |
| Operations/improvement | Incidents, feedback, measured outcomes and change requests | Inform the next increment |

Artifacts should identify their version, dependencies, provenance and status. A draft and an approved work product should not be visually or semantically interchangeable.`},
{id:33,group:'Complete lifecycle',title:'What decisions and approvals would typically occur throughout the delivery lifecycle?',related:[18,19,22],answer:`Decisions establish business or technical direction. Approvals authorize a specific work product or action under the applicable policy. They should be explicit but not repetitive.

### Typical decisions
- The business outcome and first-release scope.
- Which users can see or change records.
- Which system owns data and which integrations are necessary.
- Architecture trade-offs with meaningful cost, security or operational impact.
- Acceptance criteria and the intended release environment.

### Typical authorization boundaries
The selected delivery profile can require review of requirements/design/build inputs, explicit start-build authority, business review and a release/deployment decision. A production action needs the appropriate target-specific authority; tutorial clicks or exploratory questions do not supply it.

### What a good approval surface shows
The exact proposed work, version, environment, relevant evidence, unresolved risks and the effect of approving. If the request is only to approve a design, the UI should not imply that files will immediately be written or production changed.

### Preserve useful delegation
Routine authorized drafting and checks can continue without asking the same person repeatedly. Record who decided what, which scope it applied to and what later change would invalidate it. Silence or model confidence is not approval.`},
{id:34,group:'Complete lifecycle',title:'How does the platform maintain context and knowledge about the application throughout the entire lifecycle?',related:[17,36,39],answer:`Context should come from durable project state and attributable evidence, not only from the last messages visible in chat.

### The knowledge layers
- **Conversation history:** what users and the assistant discussed.
- **Canonical project/delivery state:** current scope, work products, stage and operation state.
- **Decisions and structured memory:** facts, choices, corrections and superseded assumptions with provenance.
- **Artifacts and evidence:** designs, builds, tests, releases and their dependencies.
- **Enterprise knowledge:** authorized application/landscape information supplied through connected services such as Brain and EKG.

### Supplying context to an agent
Select information relevant to the current task, within access and size limits. Preserve exact contracts where required and use traceable summaries where appropriate. Report omitted or unavailable information rather than claiming perfect memory.

### Freshness is not history deletion
An old answer can remain a historical record while current factual claims require fresh evidence. Source-access revocation must be checked separately. In the SDK demo, we corrected a bug that incorrectly coupled a short validity window to history visibility and replacement; that illustrates why these concerns must stay separate.

Long-term usefulness depends on retention, backups, projection health and connected sources. Do not promise unlimited recall of content that was never captured or is no longer accessible.`},
{id:35,group:'Complete lifecycle',title:'Once an application is running in production, how does the platform continue to monitor, maintain, enhance, and improve it?',related:[23,36,39],answer:`Production improvement requires a connected operations loop. Delivery completion alone does not establish that monitoring, maintenance or automatic remediation is configured.

### A qualified operating model
Runtime and monitoring services collect health, failures, performance and relevant business observations. Application/support owners assess incidents and feedback. Authorized knowledge flows can make those observations available to Brain and PL. EAL may coordinate operational business tasks when its bindings and permissions are qualified.

### Turn observations into bounded work
For example, repeated request-assignment delays could justify an improvement proposal. PL should link the observed problem to a change request, assess impact, revise the relevant artifacts, build a candidate and verify it before promotion.

### Maintenance still has owners
Backups, dependency patches, credential rotation, schema changes, incident response and availability objectives need explicit responsibilities. Some tasks can be automated under policy; others need a human decision or a customer-specific tool integration.

### What PL should be able to answer
“Which version is deployed?” “What recent health evidence exists?” “What incidents or feedback affect this application?” “What change is proposed and why?”

When those sources are absent, the honest result is a gap—not a reassuring statement that production is healthy.`},
{id:36,group:'Complete lifecycle',title:'If I return six months later and ask about an application that was previously built, what information should the platform know about that application?',related:[34,35,15],answer:`It should be able to reconstruct the application's recorded history and current known state from retained, authorized sources. Six-month recall is a product/retention requirement, not something a model guarantees by itself.

### Useful retained knowledge
| Area | Information to retain |
|---|---|
| Purpose | Original problem, users, outcome and scope |
| Decisions | Choices, assumptions, rationale and later corrections |
| Design | Components, screens, data ownership, APIs and integrations |
| Implementation | Source/artifact and dependency references for each relevant version |
| Quality | Actual checks, review outcomes and uncovered areas |
| Release | Which candidate was approved and deployed to each known environment |
| Operations | Available incidents, observations, feedback and maintenance changes |

### What must be rechecked
The current deployment, runtime health, external API compatibility and user permissions may have changed. PL should distinguish “recorded six months ago” from “verified now.”

### A good returning-user response
It summarizes the last known release, important decisions and subsequent recorded changes, cites the evidence, and identifies what needs revalidation before new work. If retention expired or a source was withdrawn, it should explain what is unavailable instead of inventing a continuous history.`},
{id:37,group:'Complete lifecycle',title:'Show me the complete lifecycle of an application built using this platform as a process flow.',related:[7,22,32],diagram:'lifecycle',answer:`The flow below shows the intended delivery lifecycle and its feedback path. It is a process model: actual transitions are admitted by the installed delivery profile, available evidence and authority.

### Read the flow in three parts
**Discover and design:** a business idea becomes a scoped problem, requirements, solution design and a bounded build plan. Open questions and assumptions remain visible.

**Build and qualify:** implementation produces artifacts; tests and review evaluate the exact candidate. Failures or changed requirements lead to corrective work rather than being skipped.

**Release and improve:** authorized deployment is verified in the selected environment. Connected operational observations and feedback inform the next change request.

### Important branches
- Missing requirements return to discovery or clarification.
- A failed build/test returns to bounded correction or escalation.
- Missing release evidence blocks promotion.
- Operational incidents may require containment or recovery before another improvement increment.

The arrows do not mean each step automatically runs without human involvement. Nor do they establish that every production target or monitoring integration is installed. The platform should show the current stage, next admitted action and the evidence needed to move forward.`},
{id:38,group:'Platform components',title:'Show me the major platform components involved in application delivery as an architecture diagram.',related:[8,9,39],diagram:'architecture',answer:`The diagram groups components by responsibility. It is a conceptual architecture for the Intelligent Platform, not a discovered topology of your current installation.

### Delivery control
PL holds the delivery case, lifecycle state, approved work products and relevant decisions. An agent runtime interprets requests and calls bounded capabilities; it does not replace the authority of the owning platform services.

### Knowledge and governance
Brain supplies authorized application/enterprise knowledge. EKG supplies landscape facts and relationships where connected. Identity, policy and audit controls apply across the relevant service boundaries. Training explains the experience without granting execution permission.

### Execution and operation
Qualified delivery tools and integration adapters work against admitted customer execution environments and systems. Applications retain their own runtime and business-data ownership. EAL can provide an operational interface or workflow layer over registered, qualified application capabilities.

### Quality and feedback
Verification/Eval and operational evidence inform PL's acceptance and future change decisions. Those evidence flows do not require every business transaction to pass through Brain.

In a real deployment, this diagram should be supplemented with actual service instances, contracts, credentials boundaries, network paths and version bindings. Any absent connection must be marked unverified.`},
{id:39,group:'Complete lifecycle',title:"Finally, explain how the entire platform works together—from a user's initial idea to a running production application and its continuous improvement.",related:[30,34,35],diagram:'overview',answer:`The platform's long-term value is connecting intelligent assistance with authoritative business context, controlled execution and evidence of outcomes.

### Start with intent
A user describes a problem. PL understands the request, consults available knowledge and proposes a useful direction. It does not assume every message is permission to build. Training and suggested prompts help a new user participate without knowing the platform's technical structure.

### Create a delivery contract
Discovery establishes users, process and scope. Requirements make success observable. Design connects screens, operations, data and integrations. The build plan bounds the implementation and the checks needed. Human decisions and delegated authority determine which transitions are permitted.

### Produce and verify the application
The agent and qualified execution capabilities perform admitted work. Identity and gateways enforce boundaries. Actual artifacts, tests and reviews establish what was produced and what remains uncertain. PL connects that evidence to the candidate release.

### Release and operate
A configured deployment path places the approved version in the intended environment and verifies the outcome. The application serves its users; EAL can support its operational workflows where integrated. Business records remain in the responsible application or source system.

### Learn from outcomes
Authorized runtime observations, incidents, evaluations and user feedback can flow into platform knowledge and future delivery decisions. PL then handles another bounded increment rather than allowing unreviewed self-modification of production.

**The desired result:** better business processes with less repeated discovery, clearer ownership and faster qualified change. Actual cost, productivity, revenue and agility gains must be measured against a baseline; they are not established by a successful demo or by the presence of an AI agent.`}
];
