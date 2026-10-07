# AI Business Command Centre

## Purpose
An accessible command centre for a portfolio of autonomous businesses.

The UI should answer, without forcing the user to parse dense dashboards:
- What is earning?
- What is costing money?
- What changed?
- Why did an agent act?
- What should be killed?
- What should receive more capital?
- What needs human approval?
- What did the system learn?

## Core architecture
- Next.js / React / TypeScript
- Postgres/Supabase event store
- queue/event bus
- isolated agent workers
- business engine
- experiment engine
- decision engine
- Wolfram service
- policy engine
- treasury adapter
- append-only `business_events`

## Event primitive
Every material action records:
`cause → evidence → decision → action → cost → result → learning → next policy`

## Kill rule
A hard £100/$100 rule is useful only if time-bounded and opportunity-aware. Record a venture's runway and experiment window explicitly so the system does not kill something before its falsification test can resolve.

## Accessibility
Optimise for rapid comprehension:
- progressive disclosure;
- one dominant decision per view;
- plain-language reason codes;
- strong state/status distinction;
- consistent placement;
- short scan paths;
- minimal simultaneous metrics;
- "what changed since last view" first;
- visual grouping by business → experiment → action.

## Treasury
Use policy-limited agent permissions rather than giving workers a master private key. Track budgets, recipients, assets, velocity and approval boundaries.
