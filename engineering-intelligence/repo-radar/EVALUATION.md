# Repository Evaluation Protocol

Score every serious candidate on 0–5 for:

| Dimension | Question |
|---|---|
| Capability leverage | Does it give us a difficult primitive cheaply? |
| Evidence | Is there working code, tests, users and real deployment evidence? |
| Activity | Is it actively maintained? |
| Architecture | Can we understand and isolate the useful parts? |
| Composability | Can it plug into our stack without taking over everything? |
| Licence | Is intended reuse legally workable? |
| Reliability | Does it have tests, clear failure modes and recovery paths? |
| Security | Are permissions, secrets and execution boundaries handled sensibly? |
| Cost | Can we run it near £0 for experiments? |
| Replaceability | Can we swap it out later? |
| Learning value | Will studying it improve our own technology? |
| Economic relevance | Does it materially improve speed, cost, revenue or defensibility? |

## Status
- **FOUNDATION** — mature enough to build around.
- **COMPONENT** — use a bounded primitive/module.
- **FRONTIER** — promising; inspect/test before relying on it.
- **WATCH** — interesting but insufficient evidence.
- **REJECT** — low leverage, stale, unsafe, incompatible, redundant or too costly.

## Promotion rule
No repo moves from FRONTIER/WATCH to FOUNDATION merely because stars increase. Require architecture inspection plus at least one concrete integration experiment.

## Required note for every promoted repo
1. Exact capability.
2. Exact files/modules/API surface we need.
3. What we would not use.
4. Licence.
5. Maintenance signal.
6. Integration seam.
7. Failure/security risks.
8. Build-vs-borrow decision.
9. Which of our projects it changes.
