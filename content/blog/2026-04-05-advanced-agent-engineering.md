+++
title = "What Running a Multi-Agent Software Project Actually Looks Like"
slug = "run-multi-agent-software-project"
date = "2026-04-05"

[extra]
card_image = "/card-images/blog/run-multi-agent-software-project.webp"
card_image_alt = "Airplane wing above a snowy runway"
+++

<img width="1600" height="900" src="https://d3bphourhbt2ew.cloudfront.net/images/airport-snow.jpeg" alt="Airplane wing above a snowy runway" />

## The Problem with "Just Ask the AI"

Most teams start using AI agents the same way: one agent, one task, one chat window. Ask it to implement a feature. Ask it to fix a bug. Paste the error, get a suggestion. This works well for isolated tasks, but it breaks down fast when you have a real software project — parallel workstreams, shared contracts, sprint commitments, and a codebase that ten people (or agents) are touching at once.

I have been building a compiler and infrastructure tool called Stratum using a team of specialized AI agents coordinated by an orchestrator. After months of running this system, the patterns that work — and the ones that don't — have become obvious. This post distills those patterns into a framework you can apply to any serious agentic software project.

## The Orchestrator Pattern

The most important design decision in agentic development is separating the coordinator from the executors. The **orchestrator** is a meta-agent that never writes production code directly. Its job is:

- Break down work into parallel, independently deliverable tasks
- Enforce shared contracts before any implementation begins
- Track integration risks across workstreams
- Collect evidence of completed work (branch names, commit SHAs, test results)

Worker agents — specialized for frontend, backend, testing, infrastructure — receive narrowly scoped tasks from the orchestrator and report back structured output. This mirrors how a well-run engineering team works: a tech lead coordinates, engineers execute.

The orchestrator's system prompt enforces discipline that would otherwise erode:

```
Mission:
- Break down work into parallel tasks.
- Enforce contract-first handoffs across workstreams.
- Detect integration risks early and propose mitigations.

Working style:
- Do not make code changes directly.
- Delegate coding/research tasks to specialized worker agents.
- Enforce Git tracking on every worker task.
- Enforce PROBLEMS.md lookup before implementation.
- Query Linear for open issues before selecting the next execution slice.
- Enforce Red/Green TDD: require worker agents to commit a failing test
  before implementation code, and require green test run evidence before
  accepting task completion.
```

The key insight: an orchestrator that can also write code will always take the shortcut of writing code. The constraint is the feature.

### Choosing the right model for each tier

Not every step in this system needs the same intelligence — and pretending it does wastes both money and context window.

Sprint planning is where the reasoning burden is highest: reading issue trackers, identifying dependency chains, spotting integration risks before any code is written. This is where I use Claude. The nuance of "this task is blocked by that contract not being finalized" requires genuine reasoning depth that cheaper models miss.

Execution is a different story. Once a task is scoped and handed off, the worker agent needs high token throughput and parallel capacity more than it needs deep reasoning. Running five worker agents simultaneously on OpenCode with GPT-5 costs a fraction of running them on Claude — and the output quality for well-scoped implementation tasks is indistinguishable.

The rule of thumb: **use expensive models to think, use cheap models to execute.**

<img width="900" height="580" src="/orchestrator-pattern.svg" alt="Orchestrator pattern diagram showing coordinator delegating to specialized worker agents" />

## The Problem Repository

The most underrated pattern in agentic development is a centralized problem/solution log. Call it `PROBLEMS.md`, a shared database, or a memory file — the format matters less than the discipline.

Every agent, before starting work, scans the problem repository for matching symptoms. Every agent, after resolving a novel issue, appends an entry. This prevents the most expensive failure mode in multi-agent systems: each agent independently discovering and solving the same problem.

An entry looks like this:

```markdown
## PRB-0042: State lock not released after failed apply

- Date: 2026-03-15
- Area: state
- Status: resolved
- Symptoms:
  - Subsequent `apply` commands hang indefinitely after a failed run.
- Root cause:
  - SQLite advisory lock was acquired but the cleanup path was not
    triggered on provider errors.
- Resolution:
  - Wrapped apply execution in a finally-equivalent block; lock release
    is now guaranteed regardless of error path.
- Verification:
  - `cargo test -p stratum-state`
- Prevention:
  - Any code acquiring a resource lock must have a guaranteed release path.
```

The structure is intentional. Symptoms first — so the next agent can pattern-match on what it observes. Root cause and resolution — so the fix is reproducible. Prevention — so the guardrail gets built into the system. Verification commands — so the fix can be confirmed without re-reading prose.

Over time, this file becomes institutional knowledge that survives across agent sessions, model upgrades, and team changes.

## Red/Green TDD as an Agent Constraint

Agents left to their own devices will write implementation code first and tests after — or skip tests entirely when the task description doesn't explicitly demand them. Red/Green TDD fixes this by making the test a precondition of the implementation, enforced at the commit level.

The discipline works like this: before any implementation code is written, the QA agent authors a failing test that precisely defines the acceptance criterion for the task. It commits that test, confirms it fails, and records the commit SHA. Only then does the implementation agent start work. The task is not considered complete until the orchestrator holds both commit SHAs — the red commit and the green commit — and the test suite is passing.

```
[QA agent]
1. Write test for the new behavior
2. Confirm: cargo test → FAILED  ← commit this (RED)
3. Report commit SHA to orchestrator

[Implementation agent]
4. Implement feature until: cargo test → PASSED  ← commit this (GREEN)
5. Report commit SHA to orchestrator

[Orchestrator]
6. Accept task only when both SHAs are present and tests are green
```

This matters more for agents than for humans. A human developer feels the feedback loop of a failing test and has an incentive to stay disciplined. An agent does not feel pressure — it will declare work done the moment the code looks plausible. The Red/Green commit sequence turns "the test passes" from a claim into evidence.

It also catches scope creep early. A failing test written before implementation forces the agent to be precise about what the feature is before building it. Vague tasks produce vague implementations; a specific failing test forces specificity.

## Git as the Source of Truth

Agents produce a lot of output. Code, explanations, plans, suggestions. Without discipline, none of it is traceable. The solution is to treat Git exactly as you would in a human team — except stricter, because agents will not feel embarrassed about breaking the rules.

The conventions I enforce:

- Every task runs on a short-lived branch. No work lands on `main` directly.
- Branch names encode the workstream and topic: `ws5/aws-provider-retry-hardening`
- Commit messages reference the workstream and the contract: `feat(ws4): add deterministic plan IR with delete reconciliation`
- Every worker agent report includes the branch name and commit SHAs. No SHA, no credit.
- PRs are never merged without a passing integration gate (smoke tests, snapshot validation).

This gives the orchestrator a ground truth it can verify. It also makes it easy to spot when an agent is making claims about completed work that are not backed by committed code.

The commit SHA is the receipt. If there is no receipt, the work does not count.

## Linear as the Sprint Mirror

Linear (or any issue tracker with an MCP server) becomes far more powerful when agents can read and write to it directly. The pattern I use:

1. The orchestrator opens each cycle by querying Linear for open issues and dependency blockers.
2. Worker task prompts include the Linear issue ID they are implementing.
3. When a worker opens a PR, it moves the Linear issue to `In Review` and posts a comment linking the PR.
4. After merge, the issue moves to `Done` with a brief evidence summary.

This is not automation for automation's sake. It closes the feedback loop between what was planned, what was implemented, and what was shipped — without requiring a human to manually update tickets after every commit.

With the Linear MCP server configured, the orchestrator's query at the start of a sprint looks like:

```text
@orchestrator Review open Linear issues in the current sprint.
Identify blocked items, dependency chains, and the next highest-priority
unblocked task for each workstream. Include issue IDs in all task prompts.
```

The result is sprint planning that takes seconds instead of an hour, with full traceability from issue to branch to merge.

## Greptile for AI-Powered Code Review

Code review is the integration point where agentic development most often breaks down. Agents write code that works in isolation but violates patterns elsewhere in the codebase — naming conventions, abstraction layers, error handling idioms. A human reviewer catching this in a PR is expensive. Missing it is more expensive.

Greptile solves this by indexing the entire codebase and running semantic code review on PRs automatically. Unlike linters that check syntax, Greptile understands context: it can flag that a new function duplicates existing logic three files away, or that an error type is handled inconsistently with the rest of the codebase.

In an agentic workflow, Greptile review becomes a gate in the PR pipeline. No PR merges without Greptile sign-off. This keeps agent-generated code consistent with patterns humans established and maintains codebase coherence even when no human is actively reviewing every line.

One detail that makes this practical rather than ceremonial: Greptile attaches a **confidence score** to each review. A score of 4/5 or 5/5 means the review found no significant issues and the change is consistent with existing patterns — a human can merge with a quick glance rather than a deep read. Lower scores flag PRs that need genuine human attention. This turns code review from an all-or-nothing bottleneck into a triage system: most agent PRs get fast-tracked, the ones that need eyes get them.

The practical setup:

1. Install the Greptile GitHub App on the repository.
2. Add a branch protection rule: require Greptile review before merge.
3. Agents open PRs. Greptile reviews them. Agents address comments. Orchestrator tracks.
4. Confidence 4/5 or 5/5 → human merges quickly. Lower → human reads carefully.

## Putting It Together: A Full Development Cycle

<img width="900" height="560" src="/dev-cycle.svg" alt="Full development cycle connecting Linear, Orchestrator, Problem Repository, Git, and Greptile" />

Here is what a single feature cycle looks like with all four patterns in place:

**1. Sprint planning (orchestrator + Linear)**

The orchestrator queries Linear for the current sprint. It identifies the highest-priority unblocked item — say, "Add retry logic to the AWS provider for transient failures" — and prepares a task prompt for the `aws-provider` worker agent, including the Linear issue ID.

**2. Problem lookup (worker + problem repository)**

Before writing a line of code, the `aws-provider` agent scans `PROBLEMS.md` for entries tagged with `retry`, `transient`, or `provider`. It finds a previous entry about exponential backoff that includes a working implementation pattern from an earlier fix. It applies the pattern rather than reinventing it.

**3. Implementation (worker + Git)**

The agent creates branch `ws5/retry-hardening`, implements the feature in small commits, and reports back: branch name, commit SHAs, tests run, tests passing, known limitations, recommended next task.

**4. Code review (Greptile)**

The agent opens a PR. Greptile reviews it, flags one inconsistency — the new retry wrapper uses a different error type than the rest of the provider module. The agent fixes it in a follow-up commit.

**5. Tracking (Linear)**

After the PR is approved and merged, the orchestrator moves the Linear issue to `Done` and posts the commit SHA as evidence. The sprint board reflects reality.

**6. Problem recording (worker + problem repository)**

If the retry implementation surfaced a new issue — say, the AWS SDK returns a non-retriable error code that looks retriable — the agent appends a new entry to `PROBLEMS.md` before closing the task.

<img width="900" height="480" src="/wave-execution.svg" alt="Wave execution timeline showing parallel workstreams with integration gates" />

## What This Pattern Assumes

This paradigm works best when a few conditions are met:

- **Contracts before code.** Define the interfaces between components before any agent starts implementing. Breaking interface changes mid-wave create cascade failures that are hard to recover from.
- **Deterministic test gates.** Snapshot tests, smoke tests, and integration suites that produce deterministic output are what make the orchestrator's evidence-based tracking possible. Flaky tests undermine the whole model.
- **Narrow agent scope.** A worker agent with a 20-file mandate produces worse results than one with a 3-file mandate. Scope creep in agent tasks is as harmful as scope creep in human sprints.
- **Human oversight at integration points.** The orchestrator coordinates agents, but a human should review wave integration gates — the moments when multiple workstreams' output merges for the first time. These are the highest-risk moments in any software project.

## The Shift

The mental model shift required for this pattern is not "AI writes my code." It is "I run an engineering organization where some of the engineers are AI agents." The practices that make human engineering teams work — sprint planning, code review, commit discipline, shared knowledge repositories, integration testing — apply here too. The difference is that AI agents are cheaper to run in parallel, never get distracted, and have no ego about being corrected by the problem repository.

The tools are here. The patterns are learnable. The bottleneck, as always, is discipline in the process.

---

<img src="/stratum-logo.png" width="80" height="80" style="display:block;margin-bottom:12px;" alt="Stratum logo" />

*The examples and agent configurations in this post are drawn from real work on **Stratum** — a statically-typed, declarative infrastructure language I am building for the post-AI era. Stratum treats program correctness as its core quality, using an advanced type system with refinement types, effect tracking, and compile-time phase separation. The CLI (`stratc`) commands referenced throughout — `check`, `plan`, `apply`, `verify` — are part of Stratum's toolchain. The project is not yet public. If you are curious, have questions, or are working on something in a similar space, feel free to reach out: [naren.yellavula@gmail.com](mailto:naren.yellavula@gmail.com)*

---

## References

- [OpenCode — AI coding agent framework](https://opencode.ai)
- [Linear MCP Server](https://mcp.linear.app)
- [Greptile — AI code review](https://greptile.com)
- [Claude Code — Agentic CLI for Claude](https://claude.ai/claude-code)
- [The Pragmatic Programmer — Andy Hunt & Dave Thomas](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/)
