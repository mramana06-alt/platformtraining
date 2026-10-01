export const answersA = [
{id:0,group:'Understand PL',title:'What is this platform, and what problem is it designed to solve?',related:[1,3,30],diagram:'overview',answer:`PL—Platform Loops—is an application-delivery workspace that connects a business conversation to the decisions, designs, implementation work and evidence needed to deliver an application. Its purpose is to reduce the gaps between “we need a better way to work” and “we have a useful application that has been checked and can be operated.”

### The problem it addresses
A business team often explains its need in email or meetings. Requirements, screen designs, code, tests and deployment instructions then live in separate places. People repeatedly reconstruct the context, and a change in one place may not reach the others. PL aims to keep that work connected through a project, versioned work products and a controlled delivery process.

### A concrete example
Suppose employees email Facilities requests and nobody has a reliable view of ownership. You can describe that problem in ordinary language. PL can help identify employees and managers, propose a request process, shape a first release, and develop its screens, data and access rules. A supported delivery profile can then carry approved work into implementation and verification.

### What makes it more than a chat answer
The important output is not just an explanation. It is a connected set of decisions, requirements, designs, artifacts and results. An idea, an approved plan, a generated application and a verified running release are different states.

**Current boundary:** the repository contains delivery capabilities and control mechanisms, but the availability of a particular integration or production target must be verified in the customer workspace. This prototype explains the platform; it does not execute its services.`},
{id:1,group:'Understand PL',title:'What is this platform primarily used for?',related:[2,4,28],answer:`The primary use of PL is to guide and coordinate application delivery: understand a need, decide what should be built, design it, perform supported implementation work, verify the result and prepare or execute the applicable release steps.

### Three useful ways to start
- **Explore a business problem:** turn “our approvals are slow” into a proposed workflow, users, rules and a measurable outcome.
- **Deliver a new application:** move a sufficiently defined idea through the installed discovery, requirements, design, build and verification capabilities.
- **Understand or improve existing work:** inspect the available application knowledge, explain a design, review a plan or assess a proposed change before implementing it.

### It does not have to start with building
You may ask a question, request a comparison or investigate whether an application is needed at all. Sometimes a process adjustment or configuration of an existing system is a better first step than new software.

### Where it fits
PL owns the application-delivery journey. Operational application use and long-running business workflows can involve EAL and other platform services when connected. Brain supplies authorized knowledge; it is not the transactional application database. These components cooperate, but one does not automatically replace the others.

**Useful first request:** “We manage equipment loans in a spreadsheet. Help me understand the problem and propose a small first version. Do not build yet.”`},
{id:2,group:'Understand PL',title:'What can I do with this platform as a user or developer?',related:[3,8,19],answer:`As a business user, you can explain a problem, explore possible applications, review proposed workflows and screens, correct assumptions and assess whether the result solves the right problem. As a developer, you can work with the technical design, supported implementation plans, generated artifacts, verification results and change impact.

| Role or interest | Useful work in PL | What you contribute |
|---|---|---|
| Business user | Describe pain points; review sample journeys and screens | How the work actually happens |
| Product owner | Shape the first release and acceptance criteria | Priorities, scope and business decisions |
| Architect/developer | Inspect components, contracts, data ownership and build plans | Technical constraints and review judgment |
| Tester | Trace requirements to checks and review actual results | Coverage expectations and independent verification |

### Examples of questions
“Show the main user journey.” “What is still assumed?” “Explain this architecture.” “Which records should a manager see?” “What would this change affect?” “What evidence supports release readiness?”

### Execution is a separate step
An installed capability is not a blanket permission to change systems. Build and deployment actions require the applicable inputs, environment bindings and authority. A learner, read-only user and authorized developer may see different actionable options.

PL should make the next supported action clear without requiring every user to understand its internal services.`},
{id:3,group:'Understand PL',title:'I am new to this platform. How should I get started?',related:[0,4,19],answer:`Start with a problem you understand, not a technical specification. If you are unsure what to type, choose a guided example or a suggested question and read the draft before sending it.

### A simple first session
1. **Learn the purpose:** ask what PL can help you accomplish and look at one relatable example.
2. **Explore a sample:** follow an internal request app from a problem to a proposed workflow and screens. Sample training must be labeled as such.
3. **Describe your own need:** explain who is doing the work, how they do it now and what should improve.
4. **Review the first proposal:** correct the goal, users or scope before adding more detail.
5. **Answer the next important question:** let PL gather details progressively rather than filling out a long questionnaire.

### A starting sentence
“Today, our employees request equipment by email. We lose track of availability and returns. I want a clear way to submit requests and manage loans.”

### What to look for in the response
PL should reflect your problem, suggest a useful first version, distinguish decisions from assumptions and ask a focused next question. You should be able to say “I don’t know—show an example,” “recommend an option,” or “leave that for later.”

**Do not confuse learning with execution:** completing an example does not mean a real application was built or deployed.`},
{id:4,group:'Build an application',title:'How can I use this platform to build a software application?',related:[5,18,20],answer:`Use PL to progressively turn your intended outcome into an implementation contract, then authorize the supported build when its prerequisites are ready.

### From request to build
**Describe the need.** Identify the people, current difficulty and desired improvement. PL proposes a direction and discovers missing requirements.

**Agree on a first release.** Decide which journeys, rules and screens are essential. Keep optional improvements outside the first increment.

**Review the design and build plan.** The design connects UI, operations, data, access and integrations. The build plan identifies what will change, permitted tools/files, verification and rollback considerations.

**Prepare the environment.** Confirm the relevant delivery profile, workspace, database and target bindings. An unavailable connector or deployment target should appear as a blocker rather than an assumed success.

**Start the authorized build.** PL performs the admitted actions, records results and runs the checks included in the plan. Review the actual output before the applicable release step.

### Example
For a small request application, the first increment might deliver a submission form, employee list, manager queue and status updates. A later increment could add escalation or a new integration.

The platform is not a promise that any arbitrary app can be produced from one sentence. The supported stack, completeness of the requirements and environment readiness determine what can actually execute.`},
{id:5,group:'Build an application',title:'Walk me through the typical application development process using this platform.',related:[7,32,33],diagram:'lifecycle',answer:`A typical journey moves through discovery, requirements, design, build planning, implementation, verification, review and release. The same project connects the artifacts and decisions across those stages.

| Stage | Main question | Typical result |
|---|---|---|
| Discovery | What problem are we solving, for whom? | Blueprint, assumptions and open questions |
| Requirements | What must the application do? | Behaviors, rules, constraints and acceptance criteria |
| Solution design | How should it work? | Screens, components, contracts and data design |
| Build planning | What exactly will change and how will we check it? | Bounded implementation plan |
| Build and verify | Does the produced implementation satisfy the plan? | Artifacts and actual check results |
| Business review | Does it solve the intended user problem? | Review findings and decisions |
| Release and operation | Which version can run where, with what evidence? | Release identity, deployment outcome and operational handoff |

This is not a rigid questionnaire. A detailed brief can accelerate discovery. A failed check or requirement change can return work to an earlier stage. PL should preserve what is already known and revise the affected dependencies rather than restart the entire project.

Production and operational steps require configured services and customer-specific qualification; the diagram is the lifecycle model, not proof that every target is connected.`},
{id:6,group:'Build an application',title:'How does the platform take an idea or business requirement and turn it into a working application?',related:[4,17,34],answer:`The transformation happens through successive, inspectable representations. PL should not jump directly from vague text to an unreviewed deployment.

### Example transformation
- **Idea:** “Employees cannot track the equipment they borrow.”
- **Outcome:** a visible loan request, owner and return status.
- **Discovery:** employees request loans; a coordinator allocates equipment; overdue returns need attention.
- **Requirements:** specify who can create, view, approve and close each record, including validation and exceptions.
- **Design:** connect screens, application operations, logical data and integration boundaries.
- **Build plan:** define exact artifacts, execution bounds and checks for the first increment.
- **Implementation:** supported generators and tools produce or change application artifacts.
- **Verification:** inspect actual build/test results and business behavior before release.

### Why the intermediate artifacts matter
They make assumptions visible and give corrections a defined effect. If you change “all employees see all loans” to “employees see only their own,” the permission design, queries, screens and access tests may all need revision.

### What establishes a working application
Generated code alone is insufficient. The result needs a viable runtime configuration, successful applicable checks and evidence that the intended version runs in the chosen environment. Missing evidence must remain explicit.`},
{id:7,group:'Build an application',title:'What are the major stages involved in developing an application from discovery through production?',related:[5,22,37],answer:`The lifecycle spans more than code generation. Each stage has a different completion condition.

1. **Discover the outcome:** understand the current problem, users and main process.
2. **Define requirements:** agree on scope, rules, exceptions and acceptance criteria.
3. **Design the solution:** specify the user experience, architecture, data and external contracts.
4. **Plan implementation:** identify changes, dependencies, verification and rollback.
5. **Build the increment:** execute only the admitted implementation actions.
6. **Qualify the result:** run the applicable technical, security, integration and business checks.
7. **Review and release:** decide whether the exact candidate meets the required gates.
8. **Deploy and verify:** place that version in the intended environment and check its actual outcome.
9. **Operate and improve:** observe use, handle incidents and feed qualified improvements into the next increment.

### Readiness is stage-specific
Discovery can be sufficient for design while production infrastructure is still unresolved. Conversely, a design can be approved while a build remains blocked by an unverified database or missing integration contract.

**Current deployment distinction:** the PL project-creation UI inspected for this work offers Local Development and Development. Testing, staging and production should be treated as customer-configured lifecycle targets whose availability requires verification, not as universally ready environments.`},
{id:8,group:'Platform components',title:'What are the main components of this platform, and what is the purpose of each component?',related:[9,38,39],answer:`The Intelligent Platform separates application delivery, operational execution, knowledge, integrations and governance. A customer deployment may enable only some of these components.

| Component | Purpose |
|---|---|
| **PL / Platform Loops** | Understand and coordinate application delivery; retain project state, work products and delivery decisions |
| **Agent runtime** | Reason, plan and request permitted tools; replaceable behind platform contracts |
| **Brain** | Retrieve and connect authorized enterprise/application knowledge with evidence and freshness context |
| **EKG** | Represent IT landscape entities, environments and relationships that can inform placement and design |
| **Integration layer** | Expose governed connections and contracts to business systems |
| **EAL** | Support qualified operational use and business execution over delivered applications |
| **Eval** | Evaluate outputs and behavior against versioned criteria and actual evidence |
| **UME / identity** | Resolve users, identities and access authority |
| **Audit** | Retain attributable operational and governance evidence according to the deployed integration |
| **UI/floorplan services** | Supply reusable presentation patterns where installed and qualified |
| **Platform Training** | Supply versioned lessons, examples, prompts and learner progress |
| **MCP/tool gateways** | Expose bounded capabilities, route requests and enforce relevant access checks |

These are responsibility boundaries, not a requirement that every user interact with every service. The ordinary user sees a coherent application-delivery experience. The platform must still verify the actual connections; module names alone do not prove end-to-end integration.`},
{id:9,group:'Platform components',title:'How do the different platform components work together during application development?',related:[8,30,38],diagram:'overview',answer:`PL coordinates the delivery case while specialized components supply knowledge, execution capabilities and evidence. The agent proposes and requests work; the owning services enforce their contracts.

### One example: adding a request approval flow
1. **PL** captures the goal and the current application/change scope.
2. **Brain** can return authorized requirements, prior designs and relevant application knowledge.
3. **EKG** can supply verified landscape and placement facts where connected.
4. **Identity and policy** establish which user is acting and what actions are allowed.
5. **Delivery and integration tools** perform approved implementation or connection work within the selected environment.
6. **Verification/Eval** return actual check results for the candidate's version and scope.
7. **PL** records the review and release outcome; **EAL** may receive a qualified operational handoff when configured.
8. **Knowledge and audit flows** retain the resulting evidence for later decisions.

### Important separation
Brain is a knowledge source, not a requirement that every application transaction pass through it. Business systems and application databases remain authoritative for their own records. Likewise, a model's statement that a build passed does not replace the actual tool result.

This collaboration should be driven by versioned contracts and explicit bindings. Missing connections should appear as gaps, not invisible assumptions.`},
{id:10,group:'Environments and runtime',title:'Where does application development actually happen?',related:[11,12,14],diagram:'environments',answer:`The chat is the control surface. Development happens in the workspace and execution environment selected by the delivery configuration, not inside the visible chat window.

### In the local development composition
PL's backend coordinates delivery operations and uses project-scoped workspace boundaries. Generated files and build tools run where those execution services are configured. The repository includes workspace guards, project execution context and environment contracts intended to prevent unrelated projects from being modified.

### In a customer installation
The supported execution location could be a customer-controlled host, isolated worker/container or another qualified execution environment. That location must be explicitly bound and accessible to the relevant tools. A diagram or prompt saying “use our cloud” does not provision it.

### Model location is a separate question
An AI model may run remotely while files and tools remain in a customer environment. Conversely, a managed agent service may operate the harness remotely. These choices do not change the need to control credentials, source access and execution authority.

**What PL should show:** project workspace, target environment, permitted tools, current operation and resulting artifacts. Never infer the execution location solely from the browser address.`},
{id:11,group:'Environments and runtime',title:'Where are applications built by this platform deployed?',related:[12,13,22],answer:`Applications are deployed to the target admitted by the project's delivery profile and environment bindings. There is no single universal destination for every generated application.

### Common target categories
- **Local Development:** a bounded setup on the development machine, suitable for supported local application work and test data.
- **Development:** a configured development target used by the team.
- **Customer QA, staging or production:** possible lifecycle destinations only after the required infrastructure, credentials, integration and release controls are implemented and qualified for that customer.

The inspected PL project-creation interface offers Local Development and Development. That is narrower than saying production deployment is ready everywhere.

### What must be known before deployment
The application version, runtime profile, target environment, database/migration plan, secret references, networking and verification requirements should be explicit. PL should identify missing bindings or unsupported targets before attempting execution.

### What the result should contain
A successful deployment needs an attributable outcome: which version went where, when, through which authorized action, with which health or acceptance checks. A prepared URL, generated manifest or tutorial completion does not establish that deployment actually occurred.`},
{id:12,group:'Environments and runtime',title:'Where do the deployed applications run?',related:[10,11,35],answer:`A deployed application runs in its application runtime: the host, process, container or managed service selected for that version and environment. It does not automatically run inside PL or inside the model that helped create it.

### Separate the layers
| Layer | What it does |
|---|---|
| User interface | Runs in the user's browser or another supported client |
| Application API | Executes application operations in the configured backend runtime |
| Application data store | Holds the application's business records under its ownership and access rules |
| PL | Coordinates delivery and retains delivery state/evidence |
| EAL, when integrated | Provides operational interaction or workflow execution over qualified capabilities |

### An EAL launch is not hosting by itself
EAL may open an application or invoke its registered operations. The underlying application still needs an available runtime, correct version binding and authorized identity. Registering an app in a catalog does not prove its service is healthy.

### What to inspect
Ask for the deployment manifest, environment identity, endpoint, version and recent runtime observation. If those are missing, the platform should report that it knows the intended runtime but cannot establish where the application is currently running.`},
{id:13,group:'Environments and runtime',title:'What development, testing, staging, and production environments does the platform support?',related:[11,14,22],answer:`Distinguish environments represented in the lifecycle from deployment targets actually configured in your workspace.

| Environment | Typical purpose | Evidence needed |
|---|---|---|
| Local Development | Small, isolated development work and test data | Local runtime, workspace and database bindings |
| Development | Team implementation and integration work | Admitted development profile and accessible dependencies |
| Test / QA | Repeatable qualification against defined criteria | Test environment, fixtures, identities and actual results |
| Staging | Production-like release rehearsal | Representative configuration and dependency behavior |
| Production | Real business operation | Release authority, operational controls and verified target |

**Observed interface:** Local Development and Development are offered when creating a PL project. Do not interpret the table as proof that QA, staging or production provisioning and promotion are universally implemented.

### Environments should not share authority accidentally
Keep target identity, secret references, data classification and permitted operations explicit. Training/sample data should not silently become production data. A staging test should not be attributed to production, and passing one environment's checks does not prove another environment is ready.

Before committing to a delivery path, ask PL to identify which targets are configured, which are supported but unbound, and which need additional implementation.`},
{id:14,group:'Environments and runtime',title:'How does the platform handle application configuration, infrastructure, deployment, and runtime management?',related:[10,13,23],answer:`These concerns should be treated as versioned delivery inputs and observable operations, rather than hidden details inside a prompt.

### Configuration
Separate ordinary settings from secrets. Record application version, environment, runtime/dependency requirements and references to protected credentials. Do not put credentials in generated explanations or browser-visible training material.

### Infrastructure and placement
Use the customer's admitted environment profiles and verified landscape bindings. EKG can inform placement where integrated, but a selected component in a diagram is not provisioned infrastructure.

### Deployment
The applicable plan should identify artifacts, migrations, startup commands or deployment adapters, and verification/rollback requirements. Supported tools execute under policy; actual results become delivery evidence.

### Runtime management
Health checks, logs, restart policies, backups and incident handling belong to configured runtime/operations services. PL can retain their observations and coordinate approved changes when the necessary integrations exist. We should not claim automatic production monitoring merely because an application was generated.

### What to ask for
“Show the runtime configuration and target for this release. Which values are confirmed, which bindings are unverified, and what evidence will establish a successful deployment?”`},
{id:15,group:'Enhance existing applications',title:'After an application has already been deployed, how can I use this platform to enhance or modify it?',related:[16,17,34],answer:`Start a bounded change against the existing application's baseline. Identify the application, relevant version and environment, then describe the desired outcome.

### Example
“For the Service Request Hub, add manager approval for high-priority requests. Preserve the current employee submission and tracking behavior.”

### A safe enhancement workflow
1. Retrieve the authorized requirements, design, release and implementation evidence that is available.
2. Confirm the baseline: what is documented versus what is currently deployed.
3. Describe the proposed difference and identify affected users, rules, screens, APIs, data and tests.
4. Revise the relevant work products and their dependencies.
5. Prepare a bounded implementation and migration plan.
6. Build and verify the change through supported tools; include regression checks for behavior that must remain.
7. Release the qualified increment with its own version and outcome evidence.

### Why this differs from regeneration
An enhancement should not silently discard existing behavior or treat the app as an unrelated greenfield project. If source, runtime or migration evidence is unavailable, PL should identify that gap before claiming a safe change can execute.

You can begin with analysis only and defer implementation until the impact is understood.`},
{id:16,group:'Enhance existing applications',title:'Can the platform understand an existing application and help me add new features to it?',related:[15,17,36],answer:`It can help build an evidence-based understanding from the information it is authorized to access. That may include application records, source artifacts, requirements, designs, API descriptions, tests, release history and runtime observations. It should not claim complete understanding from a name or a screenshot alone.

### What it should establish first
- The application's purpose, users and main process.
- The implementation and deployed version being discussed.
- Existing contracts, data ownership and important integrations.
- Access rules and non-negotiable behavior.
- The quality and freshness of the available evidence.

### Adding a feature
For example, adding a new approval role can change identity mappings, query filters, screens, business rules and test coverage. PL should produce an impact analysis before implementation and explain which conclusions come from evidence versus assumptions.

### Limits
Understanding a design is not proof that the platform can safely modify any technology stack. Repository access, a supported execution profile, integration contracts and a verified environment still matter. Custom or unsupported technologies may require developer work or a new qualified adapter.

**Useful request:** “Explain what you know about this app, what evidence supports it, and what you need before planning the new feature.”`},
{id:17,group:'Enhance existing applications',title:"How does the platform handle changes to an existing application's requirements, design, code, testing, and deployment?",related:[15,20,33],answer:`A change should create a traceable revision, not silently overwrite the previous agreement. PL's work-product and dependency mechanisms provide a place to connect the change across stages.

| Change | Likely affected work |
|---|---|
| New user role | Requirements, permission matrix, identity binding, UI access and tests |
| New field | Validation, screen design, API serialization, database/migration and checks |
| New integration | External contract, failure handling, credentials, environment and integration tests |
| Changed business rule | Workflow decisions, operation behavior and regression coverage |

### Revision sequence
Record the changed goal and baseline. Supersede or revise affected requirements. Reassess downstream designs and build inputs. Produce the bounded code/data change and verify both new and preserved behavior. Release a distinct candidate rather than attributing old tests to new code.

### Deployment implications
A data migration may make rollback more complicated than switching application binaries. The plan should identify backward compatibility, transitional states and recovery evidence. Independent components may need coordinated contract migration.

The platform should preserve earlier artifacts and decision history. Unaffected decisions should not require another interview. Automatic impact propagation and execution must be evaluated for the particular installed capability, not assumed from the existence of a dependency diagram.`},
{id:18,group:'People, control and quality',title:'How does the platform determine which development activities can be automated and which ones require human approval?',related:[19,21,33],answer:`The boundary should be determined by capability policy, the project's approved inputs, the requested effects, environment constraints and the user's delegated authority. It should not be decided solely by the model's confidence.

### Work that can often proceed within an existing delegation
Reading authorized project knowledge, explaining a design, drafting requirements, proposing a process or running specifically authorized checks can be automated when the relevant policies permit them.

### Work that needs explicit authority or a decision
Changing business scope, selecting a consequential design trade-off, writing application files, applying a migration or deploying a release may require a concrete review or authorization under the applicable delivery profile. Production changes should identify the exact target and intended effect.

### PL's role
The repository contains capability policies, tool allowlists, budgets, delivery-stage gates and governed execution. The host evaluates those controls before acting. A prompt, training lesson or external document cannot grant additional permissions.

### Avoid approval fatigue
Do not ask users to approve every reversible drafting step when that work is already authorized. Ask at meaningful boundaries, show the actual work being approved and explain its effect. If authority is missing, continue independent analysis where possible and report the blocked action precisely.`},
{id:19,group:'People, control and quality',title:'What roles do AI agents, developers, architects, testers, product owners, and business users play during application delivery?',related:[18,20,33],answer:`PL should let AI perform useful work while keeping responsibilities and authority explicit. A label such as “tester agent” is not, by itself, independent verification or a permission boundary.

| Role | Main contribution |
|---|---|
| Business user | Explains real work, pain points and whether the result is useful |
| Product owner | Prioritizes scope and acceptance outcomes |
| Architect | Reviews component boundaries, contracts, data, integration and operational trade-offs |
| Developer | Implements or reviews the technical change and resolves unsupported/custom work |
| Tester/evaluator | Checks behavior against defined criteria and reports actual evidence and gaps |
| AI agent | Interprets requests, proposes solutions and performs permitted tasks through tools |
| Supervisor/release authority | Sets delegation and makes decisions outside it, including applicable release approval |

### How they cooperate
For an approval application, the business user explains the rule, PL proposes a workflow, the architect reviews its boundaries, the developer/build capability implements it, and testing checks both approval behavior and unauthorized access. The product owner evaluates business fitness.

One person can perform several roles in a small pilot. For higher-risk work, use distinct identities, independent evidence and separation of duties. An agent should not establish its own release readiness merely by saying its work is correct.`}
];
